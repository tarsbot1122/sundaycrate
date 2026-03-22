import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata;

      if (metadata?.product_id && metadata?.buyer_id && metadata?.seller_id) {
        // Fetch product for price info
        const { data: product } = await supabase
          .from('products')
          .select('price_cents')
          .eq('id', metadata.product_id)
          .single();

        if (product) {
          const platformFee = Math.round(product.price_cents * 0.15);

          // Create order record
          await supabase.from('orders').insert({
            buyer_id: metadata.buyer_id,
            product_id: metadata.product_id,
            seller_id: metadata.seller_id,
            amount_cents: product.price_cents,
            platform_fee_cents: platformFee,
            stripe_payment_intent_id: session.payment_intent as string,
            status: 'completed',
          });

          // Increment download count
          await supabase.rpc('increment_download_count', {
            p_product_id: metadata.product_id,
          });
        }
      }
      break;
    }

    case 'account.updated': {
      const account = event.data.object as Stripe.Account;

      if (account.charges_enabled && account.details_submitted) {
        // Update user's stripe status
        await supabase
          .from('users')
          .update({ stripe_account_id: account.id })
          .eq('stripe_account_id', account.id);
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
