import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL('/login?redirect=/seller', req.url));
    }

    // Check if user already has a Stripe account
    const { data: profile } = await supabase
      .from('users')
      .select('stripe_account_id')
      .eq('id', user.id)
      .single();

    let accountId = profile?.stripe_account_id;

    if (!accountId) {
      // Create a new Stripe Connect Express account
      const account = await stripe.accounts.create({
        type: 'express',
        email: user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata: {
          user_id: user.id,
        },
      });

      accountId = account.id;

      // Save the account ID
      await supabase
        .from('users')
        .update({ stripe_account_id: accountId })
        .eq('id', user.id);
    }

    const origin = req.headers.get('origin') || new URL(req.url).origin;

    // Create an account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/api/seller/connect`,
      return_url: `${origin}/seller?stripe=connected`,
      type: 'account_onboarding',
    });

    return NextResponse.redirect(accountLink.url);
  } catch (err: any) {
    console.error('Stripe Connect error:', err);
    return NextResponse.redirect(
      new URL('/seller?stripe=error', req.url)
    );
  }
}
