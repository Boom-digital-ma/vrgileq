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

    if (winningBid) {
      console.log(`Winning bid found: ${winningBid.amount} by ${winningBid.user_id}`)
      
      // 2. Capture Stripe Payment
      let isPaid = false
      if (winningBid.stripe_payment_intent_id) {
        try {
          const intent = await stripe.paymentIntents.capture(winningBid.stripe_payment_intent_id)
          if (intent.status === 'succeeded') {
            isPaid = true
            console.log(`Stripe payment captured: ${winningBid.stripe_payment_intent_id}`)
          }
        } catch (stripeErr) {
          console.error("Stripe Capture Error:", stripeErr.message)
        }
      }

      // 3. Update Auction status (This triggers the creation of the Sale record)
      await supabaseAdmin.from("auctions").update({ status: "sold", winner_id: winningBid.user_id }).eq("id", auction_id)
      await supabaseAdmin.from("bids").update({ status: "won" }).eq("id", winningBid.id)

      // 4. Update Sale record status if payment was successful
      if (isPaid) {
        // We wait a tiny bit to ensure the DB trigger has finished creating the sale
        await new Promise(resolve => setTimeout(resolve, 500))
        await supabaseAdmin.from("sales").update({ status: 'paid' }).eq("auction_id", auction_id)
      }

      // 5. Fetch Sale Record for email
      const { data: sale } = await supabaseAdmin.from("sales").select("id").eq("auction_id", auction_id).maybeSingle()

      // 5. Notify Winner
      await supabaseAdmin.from("notifications").insert({
        user_id: winningBid.user_id,
        type: 'won',
        auction_id: auction_id,
        title: 'Congratulations!',
        message: `You won "${auction.title}" for $${auction.current_price}.`
      })

      // 6. Send Email via Resend API (Direct Fetch to avoid library issues)
      if (RESEND_API_KEY && sale) {
        const { data: winnerProfile } = await supabaseAdmin.from('profiles').select('full_name, email').eq('id', winningBid.user_id).single()
        
        if (winnerProfile?.email) {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: "Virginia Liquidation <notifications@virginialiquidation.com>",
              to: winnerProfile.email,
              subject: `CONGRATULATIONS! You won: ${auction.title}`,
              html: `<h1>You won!</h1><p>Congratulations, you are the winner of <b>${auction.title}</b>.</p><p><a href="${SITE_URL}/invoices/${sale.id}">View Invoice</a></p>`,
            }),
          })
        }
      }
    } else {
      console.log("No bids found for this auction. Closing as ended.")
      await supabaseAdmin.from("auctions").update({ status: "ended" }).eq("id", auction_id)
    }

    // 7. Cleanup other holds
    const { data: otherBids } = await supabaseAdmin.from("bids")
      .select("stripe_payment_intent_id")
      .eq("auction_id", auction_id)
      .eq("status", "outbid")
      .not("stripe_payment_intent_id", "is", null)

    if (otherBids && otherBids.length > 0) {
      for (const bid of otherBids) {
        try {
          await stripe.paymentIntents.cancel(bid.stripe_payment_intent_id)
        } catch (e) { /* ignore */ }
      }
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
