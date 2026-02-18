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

      // 3b. Fetch the generated sale ID (created by DB trigger)
      const { data: sale } = await supabaseAdmin
        .from("sales")
        .select("id")
        .eq("auction_id", auction_id)
        .single()

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

      // 5. Send Winning Email
      const { data: winnerProfile } = await supabaseAdmin
        .from('profiles')
        .select('full_name, email')
        .eq('id', winningBid.user_id)
        .single()

      if (winnerProfile?.email) {
        const invoiceUrl = `${Deno.env.get("SITE_URL") || 'http://localhost:3000'}/invoices/${sale?.id || ''}`
        
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
          },
          body: JSON.stringify({
            from: "Virginia Liquidation <notifications@virginialiquidation.com>",
            to: winnerProfile.email,
            subject: `CONGRATULATIONS! You won: ${auction.title}`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee;">
                <h1 style="color: #049A9E; text-transform: uppercase; letter-spacing: -0.05em;">You won the auction!</h1>
                <p>Congratulations ${winnerProfile.full_name || 'Bidder'},</p>
                <p>You are the winning bidder for <strong>"${auction.title}"</strong> with a final bid of <strong>$${Number(auction.current_price).toLocaleString()}</strong>.</p>
                <p>Your invoice is now available. Please review it and finalize your purchase.</p>
                <div style="margin: 30px 0;">
                  <a href="${invoiceUrl}" style="background-color: #0B2B53; color: white; padding: 15px 25px; text-decoration: none; font-weight: bold; text-transform: uppercase; font-size: 14px;">View My Invoice</a>
                </div>
                <p style="color: #666; font-size: 12px; margin-top: 40px;">Virginia Liquidation • Industrial Auctions</p>
              </div>
            `,
          }),
        })
      }
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
