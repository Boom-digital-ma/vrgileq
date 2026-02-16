'use server'

import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
})

export async function placeBid({
  auctionId,
  amount,
  paymentMethodId, // Optionnel si déjà enregistré
}: {
  auctionId: string
  amount: number
  paymentMethodId?: string
}) {
  const supabase = await createClient()

  // 1. Get User
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // 2. Get Profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id, default_payment_method_id')
    .eq('id', user.id)
    .single()

  const finalPaymentMethodId = paymentMethodId || profile?.default_payment_method_id

  if (!finalPaymentMethodId) {
    throw new Error('No payment method found. Please add a card to your profile.')
  }

  const { data: previousBid } = await supabase
    .from('bids')
    .select('stripe_payment_intent_id')
    .eq('auction_id', auctionId)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  try {
    // 3. Create Stripe PaymentIntent with Manual Capture
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      customer: profile?.stripe_customer_id,
      payment_method: finalPaymentMethodId,
      capture_method: 'manual',
      confirm: true,
      off_session: !!profile?.default_payment_method_id, // Autorise le débit sans interaction si déjà enregistré
      setup_future_usage: 'off_session',
      description: `Bid on auction ${auctionId}`,
      metadata: { auction_id: auctionId, user_id: user.id },
    }, {
      idempotencyKey: `bid_${user.id}_${auctionId}_${amount}`,
    })

    // 4. Call Supabase RPC
    const { error: rpcError } = await supabase.rpc('place_bid_secure', {
      p_auction_id: auctionId,
      p_user_id: user.id,
      p_amount: amount,
      p_stripe_pi_id: paymentIntent.id,
    })

    if (rpcError) {
      await stripe.paymentIntents.cancel(paymentIntent.id)
      throw new Error(rpcError.message)
    }

    // 5. If successful, cancel the PREVIOUS hold
    if (previousBid?.stripe_payment_intent_id) {
      try {
        await stripe.paymentIntents.cancel(previousBid.stripe_payment_intent_id)
      } catch (e) {
        console.error("Non-critical: Failed to cancel previous hold", e)
      }
    }

    revalidatePath(`/auctions/${auctionId}`)
    revalidatePath('/profile')
    return { success: true }

  } catch (error: any) {
    console.error('Bid error:', error)
    return { success: false, error: error.message }
  }
}
