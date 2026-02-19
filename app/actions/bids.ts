'use server'

import Stripe from 'stripe'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendOutbidEmail } from '@/lib/emails'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
})

export async function placeBid({
  auctionId,
  amount,
  maxBidAmount,
  paymentMethodId, // Optionnel si déjà enregistré
}: {
  auctionId: string
  amount: number
  maxBidAmount?: number
  paymentMethodId?: string
}) {
  const supabase = await createClient()

  // ... (previous logic for user and auction details)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: auction } = await supabase
    .from('auctions')
    .select('title, winner_id')
    .eq('id', auctionId)
    .single()

  let previousWinnerProfile = null
  if (auction?.winner_id && auction.winner_id !== user.id) {
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email, id')
        .eq('id', auction.winner_id)
        .single()
    
    if (profile?.email) {
        previousWinnerProfile = profile
    }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id, default_payment_method_id')
    .eq('id', user.id)
    .single()

  let finalPaymentMethodId = paymentMethodId || profile?.default_payment_method_id

  // FALLBACK: If missing in profile but we have a stripe customer, fetch from Stripe
  if (!finalPaymentMethodId && profile?.stripe_customer_id) {
    try {
        const customer = await stripe.customers.retrieve(profile.stripe_customer_id) as Stripe.Customer
        finalPaymentMethodId = customer.invoice_settings.default_payment_method as string
        
        // Auto-fix the profile for next time
        if (finalPaymentMethodId) {
            const adminSupabase = createAdminClient()
            await adminSupabase.from('profiles').update({ default_payment_method_id: finalPaymentMethodId }).eq('id', user.id)
        }
    } catch (e) {
        console.error("Failed to fetch fallback PM from Stripe", e)
    }
  }

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
    // 4. Create Stripe PaymentIntent with Manual Capture
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      customer: profile?.stripe_customer_id,
      payment_method: finalPaymentMethodId,
      capture_method: 'manual',
      confirm: true,
      off_session: true,
      description: `Bid on auction ${auctionId}`,
      metadata: { auction_id: auctionId, user_id: user.id },
    }, {
      idempotencyKey: `bid_${user.id}_${auctionId}_${amount}_${Date.now()}`,
    })

    // 5. Call Supabase RPC with Max Bid support
    const { error: rpcError } = await supabase.rpc('place_bid_secure', {
      p_auction_id: auctionId,
      p_user_id: user.id,
      p_amount: amount,
      p_stripe_pi_id: paymentIntent.id,
      p_max_amount: maxBidAmount || null
    })

    if (rpcError) {
      await stripe.paymentIntents.cancel(paymentIntent.id)
      throw new Error(rpcError.message)
    }

    // 6. Send Outbid Email if applicable
    if (previousWinnerProfile?.email) {
        await sendOutbidEmail({
            to: previousWinnerProfile.email,
            bidderName: previousWinnerProfile.full_name || 'Bidder',
            auctionTitle: auction?.title || 'Industrial Item',
            newAmount: amount,
            auctionUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auctions/${auctionId}`
        })
    }

    // 7. If successful, cancel the PREVIOUS hold
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
