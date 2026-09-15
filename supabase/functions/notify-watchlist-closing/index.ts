import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
)

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")
const SITE_URL = Deno.env.get("SITE_URL") || "https://virginialiquidation.vercel.app"
const FROM_EMAIL = "Virginia Liquidation <noreplay@virginialiquidation.com>"

serve(async (req) => {
  try {
    const results = { live_notifications: 0, closing_notifications: 0, errors: [] as string[] }
    const batchEmails: any[] = []
    const updateTasks: any[] = []

    // --- 1. LIVE NOTIFICATIONS ---
    // Step 1a: Get watchlist items that haven't been notified
    const { data: pendingLive } = await supabaseAdmin
      .from("watchlist")
      .select("id, auction_id, user_id")
      .eq("notified_live", false)

    if (pendingLive && pendingLive.length > 0) {
      // Step 1b: Get auction details separately (no !inner join)
      const auctionIds = [...new Set(pendingLive.map(w => w.auction_id))]
      const { data: liveAuctions } = await supabaseAdmin
        .from("auctions")
        .select("id, title, current_price, status, event_id, auction_events(start_at)")
        .in("id", auctionIds)
        .eq("status", "live")

      const liveAuctionMap = new Map((liveAuctions || []).map((a: any) => [a.id, a]))
      const now = new Date()

      // Step 1c: Get user profiles separately
      const userIds = [...new Set(pendingLive.map(w => w.user_id))]
      const { data: userProfiles } = await supabaseAdmin
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds)

      const profileMap = new Map((userProfiles || []).map((p: any) => [p.id, p]))

      for (const item of pendingLive) {
        const auction = liveAuctionMap.get(item.auction_id)
        if (!auction) continue
        const eventData = Array.isArray(auction.auction_events) ? auction.auction_events[0] : auction.auction_events
        if (eventData?.start_at && new Date(eventData.start_at) > now) continue

        const user = profileMap.get(item.user_id)
        if (!user?.email) continue

        batchEmails.push({
          from: FROM_EMAIL,
          to: user.email,
          subject: `NOW LIVE: ${auction.title}`,
          html: generateHtml({
            title: "Bidding is Now Open!",
            message: "An item you're watching is now open for bidding.",
            auctionTitle: auction.title,
            currentPrice: Number(auction.current_price || 0),
            buttonText: "Bid Now",
            auctionUrl: `${SITE_URL}/auctions/${item.auction_id}`
          })
        })
        updateTasks.push({ id: item.id, table: 'watchlist', field: 'notified_live' })
      }
    }

    // --- 2. CLOSING SOON NOTIFICATIONS ---
    const { data: pendingClosing } = await supabaseAdmin
      .from("watchlist")
      .select("id, auction_id, user_id")
      .eq("notified_closing_soon", false)

    if (pendingClosing && pendingClosing.length > 0) {
      const auctionIds = [...new Set(pendingClosing.map(w => w.auction_id))]
      const now = new Date()
      const oneHourLater = new Date(Date.now() + 60 * 60 * 1000)

      const { data: closingAuctions } = await supabaseAdmin
        .from("auctions")
        .select("id, title, current_price, ends_at, status")
        .in("id", auctionIds)
        .eq("status", "live")
        .lt("ends_at", oneHourLater.toISOString())
        .gt("ends_at", now.toISOString())

      const closingMap = new Map((closingAuctions || []).map((a: any) => [a.id, a]))

      const userIds = [...new Set(pendingClosing.map(w => w.user_id))]
      const { data: userProfiles } = await supabaseAdmin
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds)

      const profileMap = new Map((userProfiles || []).map((p: any) => [p.id, p]))

      for (const item of pendingClosing) {
        const auction = closingMap.get(item.auction_id)
        if (!auction) continue

        const user = profileMap.get(item.user_id)
        if (!user?.email) continue

        const diffMins = Math.round((new Date(auction.ends_at).getTime() - Date.now()) / (1000 * 60))
        batchEmails.push({
          from: FROM_EMAIL,
          to: user.email,
          subject: `CLOSING SOON: ${auction.title}`,
          html: generateHtml({
            title: "Ending Soon!",
            message: `An item you're watching closes in about ${diffMins} minutes.`,
            auctionTitle: auction.title,
            currentPrice: Number(auction.current_price || 0),
            buttonText: "Bid Now",
            auctionUrl: `${SITE_URL}/auctions/${item.auction_id}`,
            isUrgent: true
          })
        })
        updateTasks.push({ id: item.id, table: 'watchlist', field: 'notified_closing_soon' })
      }
    }

    // --- 3. SEND BATCH ---
    if (batchEmails.length > 0) {
      for (let i = 0; i < batchEmails.length; i += 100) {
        const chunk = batchEmails.slice(i, i + 100)
        const taskChunk = updateTasks.slice(i, i + 100)

        const res = await fetch("https://api.resend.com/emails/batch", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
          body: JSON.stringify(chunk),
        })

        if (res.ok) {
          for (const task of taskChunk) {
            await supabaseAdmin.from(task.table).update({ [task.field]: true }).eq("id", task.id)
            if (task.field === 'notified_live') results.live_notifications++
            else results.closing_notifications++
          }
        } else {
          results.errors.push(`Batch error: ${await res.text()}`)
        }
      }
    }

    return new Response(JSON.stringify({ success: true, ...results }), {
      headers: { "Content-Type": "application/json" },
    })

  } catch (error: any) {
    console.error("ERROR in notify-watchlist-closing:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }
})

function generateHtml(params: {
  title: string,
  message: string,
  auctionTitle: string,
  currentPrice: number,
  buttonText: string,
  auctionUrl: string,
  isUrgent?: boolean
}) {
  return `<!DOCTYPE html>
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
      <img src="https://xiqvzoedklamiwpgizfy.supabase.co/storage/v1/object/public/auction-images/images/logo-virginia-white.png" alt="Virginia Liquidation" width="180">
    </div>
    <div class="content">
      <h1 class="h1">${params.title}</h1>
      <p>${params.message}</p>

      <div class="info-box">
        <h2 style="margin: 0 0 10px 0; font-size: 18px; color: #049A9E; text-transform: uppercase;">${params.auctionTitle}</h2>
        <p style="margin: 0; font-size: 14px;"><strong>Current Price:</strong> $${(params.currentPrice || 0).toLocaleString()}</p>
      </div>

      <div style="margin: 32px 0; text-align: center;">
        <a href="${params.auctionUrl}" class="button">${params.buttonText}</a>
      </div>
    </div>
    <div class="footer">
      <p>&copy; 2026 Virginialiquidation.com All rights reserved.</p>
    </div>
  </div>
</body>
</html>`
}
