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
    .select('title, winner_id, event_id, ends_at, current_price, min_increment, auction_events(start_at)')
    .eq('id', auctionId)
    .single()

  if (!auction) throw new Error('Auction not found')

  const now = new Date()
  const eventData = Array.isArray(auction.auction_events) ? auction.auction_events[0] : auction.auction_events
  const startAt = eventData?.start_at ? new Date(eventData.start_at) : null
  const endsAt = new Date(auction.ends_at)

  if (startAt && now < startAt) {
    throw new Error('Bidding has not started yet for this event.')
  }

  if (now > endsAt) {
    throw new Error('This auction has already ended.')
  }

  // RULE 2: Auto-Proxy Logic
  // If user enters more than the minimum required bid, treat the excess as a proxy bid
  let finalAmount = amount;
  let finalMaxBid = maxBidAmount;
  const minRequiredBid = Number(auction.current_price) + Number(auction.min_increment);

  if (amount > minRequiredBid) {
    finalAmount = minRequiredBid;
    finalMaxBid = amount; // The high amount becomes the ceiling
  }

  let previousWinnerProfile = null
  let previousWinnerEmail = null

  // FETCH PREVIOUS WINNER INFO (Admin Bypass for RLS)
  if (auction?.winner_id && auction.winner_id !== user.id) {
    const adminSupabase = createAdminClient()
    
    // 1. Try to get profile info (name)
    const { data: profile } = await adminSupabase
        .from('profiles')
        .select('full_name, email, id')
        .eq('id', auction.winner_id)
        .single()
    
    if (profile) {
        previousWinnerProfile = profile
        previousWinnerEmail = profile.email
    }

    // 2. Fallback to Auth User if profile email is missing
    if (!previousWinnerEmail) {
        const { data: { user: authUser }, error: authError } = await adminSupabase.auth.admin.getUserById(auction.winner_id)
        
        if (authUser?.email) {
            previousWinnerEmail = authUser.email
            console.log(`[BID_PROTOCOL] Recovered email from Auth (Admin): ${previousWinnerEmail}`)
        } else {
            console.error(`[BID_PROTOCOL] Failed to recover email from Auth:`, authError)
        }
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

  // 3b. Fetch settings for full authorization amount calculation
  const { data: settings } = await supabase.from('site_settings').select('buyers_premium, tax_rate').eq('id', 'global').single()
  const bpRate = settings?.buyers_premium || 15
  const taxRate = settings?.tax_rate || 0

  const bpAmount = finalAmount * (bpRate / 100)
  const taxAmount = (finalAmount + bpAmount) * (taxRate / 100)
  const totalAuthAmount = finalAmount + bpAmount + taxAmount

  try {
    // 4. Create Stripe PaymentIntent with Manual Capture (Full Amount)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAuthAmount * 100),
      currency: 'usd',
      customer: profile?.stripe_customer_id,
      payment_method: finalPaymentMethodId,
      capture_method: 'manual',
      confirm: true,
      off_session: true,
      description: `Bid on auction ${auctionId} (Incl. Premium & Tax)`,
      metadata: { 
        auction_id: auctionId, 
        user_id: user.id,
        hammer_price: finalAmount.toString(),
        total_auth: totalAuthAmount.toString()
      },
    }, {
      idempotencyKey: `bid_${user.id}_${auctionId}_${finalAmount}_${Date.now()}`,
    })

    // 5. Call Supabase RPC with Max Bid support
    const { error: rpcError } = await supabase.rpc('place_bid_secure', {
      p_auction_id: auctionId,
      p_user_id: user.id,
      p_amount: finalAmount,
      p_stripe_pi_id: paymentIntent.id,
      p_max_amount: finalMaxBid || null
    })

    if (rpcError) {
      console.error("[BID_ERROR] RPC Failed:", rpcError.message);
      await stripe.paymentIntents.cancel(paymentIntent.id)
      throw new Error(rpcError.message)
    }

    // 6. Check if winner changed to send Outbid Email
    const { data: updatedAuction } = await supabase
        .from('auctions')
        .select('winner_id, current_price')
        .eq('id', auctionId)
        .single();

    console.log(`[BID_PROTOCOL] Previous Winner ID: ${auction.winner_id}`);
    console.log(`[BID_PROTOCOL] Updated Winner ID: ${updatedAuction?.winner_id}`);
    console.log(`[BID_PROTOCOL] Previous Winner Email: ${previousWinnerEmail}`);

    if (previousWinnerEmail && updatedAuction?.winner_id !== previousWinnerProfile?.id) {
        console.log(`[EMAIL_SERVICE] Winner changed! Sending outbid email to ${previousWinnerEmail}`);
        try {
            await sendOutbidEmail({
                to: previousWinnerEmail,
                bidderName: previousWinnerProfile?.full_name || 'Bidder',
                auctionTitle: auction?.title || 'Industrial Item',
                newAmount: updatedAuction?.current_price || finalAmount,
                auctionUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auctions/${auctionId}`
            });
            console.log(`[EMAIL_SERVICE] Outbid email dispatched to ${previousWinnerEmail}`);
        } catch (emailErr) {
            console.error(`[EMAIL_SERVICE] SMTP/API Error:`, emailErr);
        }
    } else {
        if (!previousWinnerProfile) {
            console.log(`[EMAIL_SERVICE] No outbid email: First bid on this lot (No previous winner).`);
        } else if (!previousWinnerEmail) {
            console.log(`[EMAIL_SERVICE] No outbid email: Previous winner profile has no email (Fallback failed).`);
        } else if (updatedAuction?.winner_id === previousWinnerProfile.id) {
            console.log(`[EMAIL_SERVICE] No outbid email: Previous winner was NOT displaced (Proxy Bid kept them lead).`);
        } else {
            console.log(`[EMAIL_SERVICE] No outbid email: Unknown condition.`);
        }
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
