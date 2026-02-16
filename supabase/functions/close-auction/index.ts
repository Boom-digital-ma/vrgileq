import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"
import Stripe from "https://esm.sh/stripe@14.16.0?target=deno"

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2026-01-28.clover",
  httpClient: Stripe.createFetchHttpClient(),
})

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
)

serve(async (req) => {
  try {
    const { auction_id } = await req.json()

    // 1. Get the auction and the winning bid
    const { data: auction, error: auctionError } = await supabaseAdmin
      .from("auctions")
      .select("*, bids(id, stripe_payment_intent_id, user_id)")
      .eq("id", auction_id)
      .eq("bids.status", "active")
      .order("amount", { foreignTable: "bids", ascending: false })
      .limit(1, { foreignTable: "bids" })
      .single()

    if (auctionError || !auction) {
      throw new Error("Auction not found or no bids")
    }

    const winningBid = auction.bids[0]

    if (winningBid) {
      // 2. Capture the winner's payment
      await stripe.paymentIntents.capture(winningBid.stripe_payment_intent_id)

      // 3. Update auction and bid status
      await supabaseAdmin
        .from("auctions")
        .update({ status: "sold", winner_id: winningBid.user_id })
        .eq("id", auction_id)

      await supabaseAdmin
        .from("bids")
        .update({ status: "won" })
        .eq("id", winningBid.id)

      // 4. Create Notification for winner
      await supabaseAdmin
        .from("notifications")
        .insert({
          user_id: winningBid.user_id,
          type: 'won',
          auction_id: auction_id,
          title: 'Congratulations!',
          message: `You won the auction for "${auction.title}" with a bid of $${auction.current_price}.`
        })
    } else {
      // No winner, just end it
      await supabaseAdmin
        .from("auctions")
        .update({ status: "ended" })
        .eq("id", auction_id)
    }

    // 4. Cancel all other active holds for this auction (if any were not cancelled during bidding)
    const { data: otherBids } = await supabaseAdmin
      .from("bids")
      .select("stripe_payment_intent_id")
      .eq("auction_id", auction_id)
      .eq("status", "outbid")
      .not("stripe_payment_intent_id", "is", null)

    if (otherBids) {
      for (const bid of otherBids) {
        try {
          await stripe.paymentIntents.cancel(bid.stripe_payment_intent_id)
        } catch (e) {
          console.error(`Failed to cancel PI ${bid.stripe_payment_intent_id}`, e)
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }
})
