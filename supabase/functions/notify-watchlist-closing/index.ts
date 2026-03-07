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
    const results = {
      live_notifications: 0,
      closing_notifications: 0,
      errors: [] as string[]
    }

    const batchEmails: any[] = []
    const updateTasks: any[] = []

    // --- 1. PREPARE WINNING NOTIFICATIONS (NEW) ---
    const { data: pendingSales } = await supabaseAdmin
      .from("sales")
      .select(`
        id, hammer_price,
        auction:auctions(title, image_url),
        winner:profiles(full_name, email)
      `)
      .eq("winning_notified", false)
      .limit(50) // Limit to avoid too large payload

    for (const sale of (pendingSales || [])) {
      const { winner, auction } = sale as any
      if (winner?.email) {
        batchEmails.push({
          from: FROM_EMAIL,
          to: winner.email,
          subject: `CONGRATULATIONS! You won: ${auction.title}`,
          html: generateWinningHtml({
            userName: winner.full_name || 'Valued Bidder',
            auctionTitle: auction.title,
            amount: sale.hammer_price,
            invoiceUrl: `${SITE_URL}/invoices/${sale.id}`,
            imageUrl: auction.image_url
          })
        })
        updateTasks.push({ id: sale.id, table: 'sales', field: 'winning_notified' })
      }
    }

    // --- 2. PREPARE LIVE NOTIFICATIONS ---
    const { data: liveItems } = await supabaseAdmin
      .from("watchlist")
      .select(`
        id, auction_id,
        auctions!inner(title, current_price, status, auction_events!inner(start_at)),
        profiles!inner(full_name, email)
      `)
      .eq("notified_live", false)
      .eq("auctions.status", "live")
      .lte("auctions.auction_events.start_at", new Date().toISOString())

    for (const item of (liveItems || [])) {
      const { profiles: user, auctions: auction } = item as any
      if (user.email) {
        batchEmails.push({
          from: FROM_EMAIL,
          to: user.email,
          subject: `NOW LIVE: ${auction.title}`,
          html: generateHtml({
            title: "Bidding is Now Open!",
            message: `The industrial asset you are watching is now officially open for bidding.`,
            auctionTitle: auction.title,
            currentPrice: auction.current_price,
            buttonText: "Go to Bidding Room",
            auctionUrl: `${SITE_URL}/auctions/${item.auction_id}`
          })
        })
        updateTasks.push({ id: item.id, table: 'watchlist', field: 'notified_live' })
      }
    }

    // --- 3. PREPARE CLOSING NOTIFICATIONS ---
    const { data: closingItems } = await supabaseAdmin
      .from("watchlist")
      .select(`
        id, auction_id,
        auctions!inner(title, current_price, ends_at, status),
        profiles!inner(full_name, email)
      `)
      .eq("notified_closing_soon", false)
      .eq("auctions.status", "live")
      .lt("auctions.ends_at", new Date(Date.now() + 60 * 60 * 1000).toISOString())
      .gt("auctions.ends_at", new Date().toISOString())

    for (const item of (closingItems || [])) {
      const { profiles: user, auctions: auction } = item as any
      if (user.email) {
        const diffMins = Math.round((new Date(auction.ends_at).getTime() - Date.now()) / (1000 * 60))
        batchEmails.push({
          from: FROM_EMAIL,
          to: user.email,
          subject: `CLOSING SOON: ${auction.title}`,
          html: generateHtml({
            title: "Final Authorization Alert",
            message: `Current protocol closing in approximately ${diffMins} minutes.`,
            auctionTitle: auction.title,
            currentPrice: auction.current_price,
            buttonText: "Place Final Bid",
            auctionUrl: `${SITE_URL}/auctions/${item.auction_id}`,
            isUrgent: true
          })
        })
        updateTasks.push({ id: item.id, table: 'watchlist', field: 'notified_closing_soon' })
      }
    }

    // --- 4. EXECUTE BATCH SENDING ---
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
          // Update notified flags in DB
          for (const task of taskChunk) {
            await supabaseAdmin.from(task.table).update({ [task.field]: true }).eq("id", task.id)
            if (task.table === 'sales') results.winning_notifications = (results.winning_notifications || 0) + 1
            else if (task.field === 'notified_live') results.live_notifications++
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
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }
})

function generateWinningHtml(params: {
  userName: string,
  auctionTitle: string,
  amount: number,
  invoiceUrl: string,
  imageUrl?: string
}) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: sans-serif; margin: 0; padding: 0; background-color: #F9FAFB; color: #464646; }
        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #E5E7EB; }
        .header { background-color: #0B2B53; padding: 40px; text-align: center; }
        .content { padding: 40px; }
        .h1 { color: #049A9E; font-size: 28px; font-weight: 800; text-transform: uppercase; margin-bottom: 16px; font-style: italic; }
        .info-box { background-color: #f9f9f9; padding: 24px; border: 1px solid #eee; border-radius: 16px; margin: 24px 0; }
        .button { display: inline-block; background-color: #049A9E; color: #ffffff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; text-transform: uppercase; font-size: 14px; box-shadow: 4px 4px 0px 0px #0B2B53; }
        .footer { padding: 30px; text-align: center; font-size: 12px; color: #9CA3AF; border-top: 1px solid #F3F4F6; }
        .product-image { width: 100%; max-height: 300px; object-fit: cover; border-radius: 16px; margin-bottom: 24px; border: 1px solid #E5E7EB; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://xiqvzoedklamiwpgizfy.supabase.co/storage/v1/object/public/auction-images/images/logo-virginia-white.png" alt="Virginia Liquidation" width="180">
        </div>
        <div class="content">
          <h1 class="h1">YOU WON!</h1>
          <p>Hello ${params.userName},</p>
          <p>Congratulations! You are the official winner of the following industrial asset:</p>
          
          ${params.imageUrl ? `<img src="${params.imageUrl}" alt="${params.auctionTitle}" class="product-image">` : ''}

          <div class="info-box">
            <h2 style="margin: 0 0 10px 0; font-size: 18px; color: #0B2B53; text-transform: uppercase;">${params.auctionTitle}</h2>
            <p style="margin: 0; font-size: 16px;"><strong>Final Hammer Price:</strong> $${params.amount.toLocaleString()}</p>
          </div>

          <p>Please review your invoice and prepare for pickup scheduling.</p>

          <div style="margin: 32px 0; text-align: center;">
            <a href="${params.invoiceUrl}" class="button">View My Invoice</a>
          </div>
        </div>
        <div className="footer">
          <p>© 2026 Virginia Liquidation. All rights reserved.</p>
          <p>Industrial B2B Auction Solutions • Richmond, VA</p>
        </div>
      </div>
    </body>
    </html>
  `
}

function generateHtml(params: {
  title: string,
  message: string,
  auctionTitle: string,
  currentPrice: number,
  buttonText: string,
  auctionUrl: string,
  isUrgent?: boolean
}) {
  return `
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
          <img src="https://xiqvzoedklamiwpgizfy.supabase.co/storage/v1/object/public/auction-images/images/logo-virginia-white.png" alt="Virginia Liquidation" width="180">
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
  `
}
