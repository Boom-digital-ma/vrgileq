import { createClient } from "https://esm.sh/@supabase/supabase-js@2.40.0"
import Stripe from "https://esm.sh/stripe@14.16.0?target=deno"

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") || ""
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || ""
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || ""
const SITE_URL = Deno.env.get("SITE_URL") || "https://virginialiquidation.vercel.app"
const FROM_EMAIL = "Virginia Liquidation <noreplay@virginialiquidation.com>"

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

      // 3. Send "You Won" email to the winner
      try {
        const { data: winnerProfile } = await supabaseAdmin
          .from("profiles")
          .select("full_name, email")
          .eq("id", winningBid.user_id)
          .single()

        let winnerEmail = winnerProfile?.email
        if (!winnerEmail) {
          const { data: { user: authUser } } = await supabaseAdmin.auth.admin.getUserById(winningBid.user_id)
          winnerEmail = authUser?.email
        }

        if (winnerEmail) {
          const amount = Number(auction.current_price || 0)
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
            body: JSON.stringify({
              from: FROM_EMAIL,
              to: winnerEmail,
              subject: `You Won: ${auction.title}`,
              html: generateWonEmail({
                userName: winnerProfile?.full_name || 'Bidder',
                auctionTitle: auction.title,
                amount,
                auctionUrl: `${SITE_URL}/auctions/${auction_id}`,
                imageUrl: auction.image_url
              })
            }),
          })
          console.log(`[EMAIL] Won email sent to ${winnerEmail}`)
        }
      } catch (emailErr: any) {
        console.error(`[EMAIL] Failed to send won email:`, emailErr.message)
      }

      console.log(`Auction ${auction_id} marked as sold to ${winningBid.user_id}.`)

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

function generateWonEmail(params: {
  userName: string,
  auctionTitle: string,
  amount: number,
  auctionUrl: string,
  imageUrl?: string
}) {
  return `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Plus Jakarta Sans', Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #F9FAFB; color: #464646; }
    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #E5E7EB; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); }
    .header { background-color: #fff; padding: 40px; text-align: center; }
    .content { padding: 40px; }
    .footer { padding: 30px; text-align: center; font-size: 12px; color: #9CA3AF; border-top: 1px solid #F3F4F6; }
    .h1 { color: #049A9E; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: -0.02em; margin-bottom: 16px; font-style: italic; }
    .price-box { background-color: #F0FDFA; border: 1px solid #CCFBF1; border-radius: 16px; padding: 24px; margin: 24px 0; text-align: center; }
    .price-label { font-size: 10px; font-weight: 800; color: #049A9E; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px; }
    .price-value { font-size: 32px; font-weight: 800; color: #0B2B53; margin: 0; }
    .button { display: inline-block; background-color: #0B2B53; color: #ffffff; padding: 18px 36px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; box-shadow: 4px 4px 0px 0px #049A9E; }
    .lot-title { color: #0B2B53; font-weight: 700; }
    .product-image { width: 100%; max-height: 300px; object-fit: cover; border-radius: 16px; margin-bottom: 24px; border: 1px solid #E5E7EB; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://xiqvzoedklamiwpgizfy.supabase.co/storage/v1/object/public/auction-images/images/logo-virginia-white.png" alt="Virginia Liquidation" width="180" style="display: block; margin: 0 auto;">
    </div>
    <div class="content">
      <h1 class="h1">You Won!</h1>
      <p>Congratulations <strong>${params.userName}</strong>,</p>

      ${params.imageUrl ? `<img src="${params.imageUrl}" alt="${params.auctionTitle}" class="product-image">` : ''}

      <p>You are the winning bidder on:</p>

      <p class="lot-title" style="margin-top: 24px; font-size: 18px;">${params.auctionTitle}</p>

      <div class="price-box">
        <div class="price-label">Winning Price</div>
        <div class="price-value">$${(params.amount || 0).toLocaleString()}</div>
      </div>

      <p style="font-size: 14px; line-height: 1.6; margin-bottom: 32px;">View your invoice and schedule your pickup from your account.</p>

      <div style="text-align: center;">
        <a href="${params.auctionUrl}" class="button">View My Invoice</a>
      </div>
    </div>
    <div class="footer">
      <p>&copy; 2026 Virginialiquidation.com All rights reserved.</p>
    </div>
  </div>
</body>
</html>`
}
