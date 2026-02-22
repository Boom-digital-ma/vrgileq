import { createClient } from "https://esm.sh/@supabase/supabase-js@2.40.0"
import Stripe from "https://esm.sh/stripe@14.16.0?target=deno"

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") || ""
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || ""
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || ""
const SITE_URL = Deno.env.get("SITE_URL") || "http://localhost:3000"

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2026-01-28.clover",
  httpClient: Stripe.createFetchHttpClient(),
})

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*" } })
  }

  try {
    const { auction_id } = await req.json()
    console.log(`Closing auction: ${auction_id}`)

    // 1. Get the auction and the winning bid
    const { data: auction, error: auctionError } = await supabaseAdmin
      .from("auctions")
      .select("*, bids(id, stripe_payment_intent_id, user_id, amount)")
      .eq('id', auction_id)
      .eq('bids.status', 'active')
      .order('amount', { foreignTable: 'bids', ascending: false })
      .limit(1, { foreignTable: 'bids' })
      .maybeSingle()

    if (auctionError || !auction) {
      return new Response(JSON.stringify({ error: "Auction not found" }), { status: 404 })
    }

    const winningBid = auction.bids && auction.bids.length > 0 ? auction.bids[0] : null

      // 3. Calculate Total (Hammer + Premium + Tax)
      const bpRate = settings?.buyers_premium || 15
      const taxRate = settings?.tax_rate || 0
      const hammer = Number(winningBid.amount)
      const bpAmount = hammer * (bpRate / 100)
      const taxAmount = (hammer + bpAmount) * (taxRate / 100)
      let totalToChargeCents = Math.round((hammer + bpAmount + taxAmount) * 100)

      // 4. CHECK AND DEDUCT REGISTRATION DEPOSIT (Caution)
      const { data: registration } = await supabaseAdmin
        .from('event_registrations')
        .select('id, stripe_payment_intent_id, deposit_captured')
        .eq('event_id', auction.event_id)
        .eq('user_id', winningBid.user_id)
        .single()

      let amountDeductedCents = 0
      if (registration?.stripe_payment_intent_id && !registration.deposit_captured) {
          try {
              // Capture the deposit first
              const depositIntent = await stripe.paymentIntents.capture(registration.stripe_payment_intent_id)
              if (depositIntent.status === 'succeeded') {
                  amountDeductedCents = depositIntent.amount_received
                  totalToChargeCents -= amountDeductedCents
                  
                  // Mark deposit as used so it's not deducted from next winning lot in same event
                  await supabaseAdmin
                    .from('event_registrations')
                    .update({ deposit_captured: true })
                    .eq('id', registration.id)
                  
                  console.log(`Deposit of ${amountDeductedCents/100}$ captured and deducted.`)
              }
          } catch (captureErr) {
              console.warn("Could not capture deposit (already captured or expired):", captureErr.message)
          }
      }

      // 5. Create and Capture Payment for the REMAINING balance (if any)
      let isPaid = false
      let finalChargeId = null
      
      if (totalToChargeCents > 0) {
          try {
              const paymentIntent = await stripe.paymentIntents.create({
                  amount: totalToChargeCents,
                  currency: 'usd',
                  customer: winnerProfile.stripe_customer_id,
                  payment_method: winnerProfile.default_payment_method_id,
                  off_session: true,
                  confirm: true,
                  description: `Final balance for Auction: ${auction.title} (Deposit of ${amountDeductedCents/100}$ deducted)`,
                  metadata: { auction_id, user_id: winningBid.user_id }
              })
              
              if (paymentIntent.status === 'succeeded') {
                  isPaid = true
                  finalChargeId = paymentIntent.id
                  console.log(`Remaining balance of ${totalToChargeCents/100}$ charged: ${finalChargeId}`)
              }
          } catch (stripeErr) {
              console.error("Balance Debit Error:", stripeErr.message)
          }
      } else {
          // Hammer price was fully covered by the deposit (unlikely but possible)
          isPaid = true
          finalChargeId = registration?.stripe_payment_intent_id
          console.log("Invoice fully covered by registration deposit.")
      }

      // 6. Update Auction & Bid status
      await supabaseAdmin.from("auctions").update({ status: "sold", winner_id: winningBid.user_id }).eq("id", auction_id)
      await supabaseAdmin.from("bids").update({ status: "won" }).eq("id", winningBid.id)

      // 7. Update Sale record
      if (isPaid) {
        await new Promise(resolve => setTimeout(resolve, 1000)) // Wait for trigger
        await supabaseAdmin.from("sales").update({ 
            status: 'paid', 
            stripe_payment_intent_id: finalChargeId 
        }).eq("auction_id", auction_id)
      }

      // 8. In-app notification
      await supabaseAdmin.from("notifications").insert({
        user_id: winningBid.user_id,
        type: 'won',
        auction_id: auction_id,
        title: 'Congratulations!',
        message: `You won "${auction.title}" for $${auction.current_price}.`
      })

    } else {
      console.log("No bids found for this auction. Closing as ended.")
      await supabaseAdmin.from("auctions").update({ status: "ended" }).eq("id", auction_id)
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    })

  } catch (error: any) {
    console.error("Critical Error:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 200, // Still return 200 to prevent Supabase retries
      headers: { "Content-Type": "application/json" },
    })
  }
})
