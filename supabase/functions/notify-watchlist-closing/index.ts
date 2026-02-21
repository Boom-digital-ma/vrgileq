import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
)

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")
const SITE_URL = Deno.env.get("SITE_URL") || "https://virginialiquidation.com"

serve(async (req) => {
  try {
    const results = {
      live_notifications: 0,
      closing_notifications: 0,
      errors: [] as string[]
    }

    // --- 1. NOTIFICATIONS FOR AUCTIONS GOING LIVE ---
    const { data: liveItems, error: liveError } = await supabaseAdmin
      .from("watchlist")
      .select(`
        id,
        user_id,
        auction_id,
        auctions!inner(
          title, 
          current_price, 
          status, 
          auction_events!inner(start_at)
        ),
        profiles!inner(full_name, email)
      `)
      .eq("notified_live", false)
      .eq("auctions.status", "live")
      .lte("auctions.auction_events.start_at", new Date().toISOString())

    if (liveError) throw liveError

    for (const item of (liveItems || [])) {
      const { profiles: user, auctions: auction } = item as any
      if (!user.email) continue

      try {
        const res = await sendEmail({
          to: user.email,
          subject: `NOW LIVE: ${auction.title}`,
          title: "Bidding is Now Open!",
          message: `The industrial asset you are watching is now officially open for bidding. Don't miss your chance to secure this lot.`,
          auctionTitle: auction.title,
          currentPrice: auction.current_price,
          buttonText: "Go to Bidding Room",
          auctionUrl: `${SITE_URL}/auctions/${item.auction_id}`
        })

        if (res.ok) {
          await supabaseAdmin.from("watchlist").update({ notified_live: true }).eq("id", item.id)
          results.live_notifications++
        }
      } catch (e: any) {
        results.errors.push(`Live email error for ${item.id}: ${e.message}`)
      }
    }

    // --- 2. NOTIFICATIONS FOR AUCTIONS CLOSING SOON (1 HOUR) ---
    const { data: closingItems, error: closingError } = await supabaseAdmin
      .from("watchlist")
      .select(`
        id,
        user_id,
        auction_id,
        auctions!inner(title, current_price, ends_at, status),
        profiles!inner(full_name, email)
      `)
      .eq("notified_closing_soon", false)
      .eq("auctions.status", "live")
      .lt("auctions.ends_at", new Date(Date.now() + 60 * 60 * 1000).toISOString())
      .gt("auctions.ends_at", new Date().toISOString())

    if (closingError) throw closingError

    for (const item of (closingItems || [])) {
      const { profiles: user, auctions: auction } = item as any
      if (!user.email) continue

      try {
        const diffMs = new Date(auction.ends_at).getTime() - Date.now()
        const diffMins = Math.round(diffMs / (1000 * 60))

        const res = await sendEmail({
          to: user.email,
          subject: `CLOSING SOON: ${auction.title}`,
          title: "Final Authorization Alert",
          message: `An item in your watchlist is approaching its final minutes. Current protocol closing in approximately ${diffMins} minutes.`,
          auctionTitle: auction.title,
          currentPrice: auction.current_price,
          buttonText: "Place Final Bid",
          auctionUrl: `${SITE_URL}/auctions/${item.auction_id}`,
          isUrgent: true
        })

        if (res.ok) {
          await supabaseAdmin.from("watchlist").update({ notified_closing_soon: true }).eq("id", item.id)
          results.closing_notifications++
        }
      } catch (e: any) {
        results.errors.push(`Closing email error for ${item.id}: ${e.message}`)
      }
    }

    return new Response(JSON.stringify({ success: true, ...results }), {
      headers: { "Content-Type": "application/json" },
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }
})

async function sendEmail(params: {
  to: string,
  subject: string,
  title: string,
  message: string,
  auctionTitle: string,
  currentPrice: number,
  buttonText: string,
  auctionUrl: string,
  isUrgent?: boolean
}) {
  return fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "Virginia Liquidation <notifications@virginialiquidation.com>",
      to: params.to,
      subject: params.subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: sans-serif; margin: 0; padding: 0; background-color: #F9FAFB; color: #464646; }
            .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #E5E7EB; }
            .header { background-color: #0B2B53; padding: 40px; text-align: center; }
            .content { padding: 40px; }
            .h1 { color: ${params.isUrgent ? '#E11D48' : '#0B2B53'}; font-size: 24px; font-weight: 800; text-transform: uppercase; margin-bottom: 16px; font-style: italic; }
            .info-box { background-color: #f9f9f9; padding: 24px; border: 1px solid #eee; border-radius: 16px; margin: 24px 0; }
            .button { display: inline-block; background-color: #049A9E; color: #ffffff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; text-transform: uppercase; font-size: 14px; box-shadow: 4px 4px 0px 0px #0B2B53; }
            .footer { padding: 30px; text-align: center; font-size: 12px; color: #9CA3AF; border-top: 1px solid #F3F4F6; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="https://xiqvzoedklamiwpgizfy.supabase.co/storage/v1/object/public/public_assets/logo-virginia-white.png" alt="Virginia Liquidation" width="180">
            </div>
            <div class="content">
              <h1 class="h1">${params.title}</h1>
              <p>${params.message}</p>
              
              <div class="info-box">
                <h2 style="margin: 0 0 10px 0; font-size: 18px; color: #049A9E; text-transform: uppercase;">${params.auctionTitle}</h2>
                <p style="margin: 0; font-size: 14px;"><strong>Current Price:</strong> $${params.currentPrice.toLocaleString()}</p>
              </div>

              <div style="margin: 32px 0; text-align: center;">
                <a href="${params.auctionUrl}" class="button">${params.buttonText}</a>
              </div>
            </div>
            <div className="footer">
              <p>© 2026 Virginia Liquidation. All rights reserved.</p>
              <p>Industrial B2B Auction Solutions • Richmond, VA</p>
            </div>
          </div>
        </body>
        </html>
      `,
    }),
  })
}
