import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { stripe, calculatePlatformFee } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Fetch product with seller info
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*, seller:users(*)')
      .eq('id', productId)
      .eq('status', 'active')
      .single();

    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Prevent buying own product
    if (product.seller_id === user.id) {
      return NextResponse.json({ error: 'You cannot purchase your own product' }, { status: 400 });
    }

    // Check if seller has Stripe Connect
    if (!product.seller?.stripe_account_id) {
      return NextResponse.json(
        { error: 'This seller has not set up payments yet' },
        { status: 400 }
      );
    }

    const platformFee = calculatePlatformFee(product.price_cents);

    const origin = req.headers.get('origin') || '';

    // Create Stripe Checkout Session with Connect
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.title,
              description: product.description?.slice(0, 500) || undefined,
              images: product.preview_images?.slice(0, 1) || [],
            },
            unit_amount: product.price_cents,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: platformFee,
        transfer_data: {
          destination: product.seller.stripe_account_id,
        },
        metadata: {
          product_id: product.id,
          buyer_id: user.id,
          seller_id: product.seller_id,
        },
      },
      customer_email: user.email,
      success_url: `${origin}/buyer?success=true`,
      cancel_url: `${origin}/product/${product.id}`,
      metadata: {
        product_id: product.id,
        buyer_id: user.id,
        seller_id: product.seller_id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Checkout error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
