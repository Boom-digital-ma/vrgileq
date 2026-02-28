import { createClient } from "https://esm.sh/@supabase/supabase-js@2.40.0"
import Stripe from "https://esm.sh/stripe@14.16.0?target=deno"

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") || ""
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || ""
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || ""
const SITE_URL = Deno.env.get("SITE_URL") || "https://virginialiquidation.vercel.app"

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
      
      // 1. Update Auction & Bid status
      await supabaseAdmin.from("auctions").update({ status: "sold", winner_id: winningBid.user_id }).eq("id", auction_id)
      await supabaseAdmin.from("bids").update({ status: "won" }).eq("id", winningBid.id)

      // 2. In-app notification
      await supabaseAdmin.from("notifications").insert({
        user_id: winningBid.user_id,
        type: 'won',
        auction_id: auction_id,
        title: 'Congratulations!',
        message: `You won "${auction.title}" for $${auction.current_price}.`
      })

      console.log(`Auction ${auction_id} marked as sold to ${winningBid.user_id}. Consolidated invoicing will be handled by Admin.`)

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
