import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
)

serve(async (req) => {
  try {
    // 1. Get auctions closing in the next 1 hour that haven't been notified yet
    // We look for auctions where ends_at is between NOW and NOW + 1 hour
    const { data: watchlistItems, error: fetchError } = await supabaseAdmin
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

    if (fetchError) throw fetchError

    console.log(`Found ${watchlistItems?.length || 0} items to notify.`)

    const results = []

    for (const item of (watchlistItems || [])) {
      const { profiles: user, auctions: auction } = item as any
      
      if (!user.email) continue

      // Calculate time left for display
      const diffMs = new Date(auction.ends_at).getTime() - Date.now()
      const diffMins = Math.round(diffMs / (1000 * 60))
      const timeLeft = `${diffMins} minutes`

      // 2. Send Email via Resend
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
        },
        body: JSON.stringify({
          from: "Virginia Liquidation <notifications@virginialiquidation.com>",
          to: user.email,
          subject: `Closing Soon: ${auction.title}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-top: 4px solid #049A9E;">
              <h1 style="color: #0B2B53; text-transform: uppercase; letter-spacing: -0.05em; font-style: italic;">Auction Closing Soon!</h1>
              <p>Hello ${user.full_name || 'Bidder'},</p>
              <p>An item in your watchlist is about to close. Don't miss your chance to place a final bid!</p>
              
              <div style="background-color: #f9f9f9; padding: 20px; border: 1px solid #eee; margin: 20px 0;">
                <h2 style="margin: 0 0 10px 0; font-size: 18px; color: #049A9E;">${auction.title}</h2>
                <p style="margin: 0; font-size: 14px;"><strong>Current Price:</strong> $${Number(auction.current_price).toLocaleString()}</p>
                <p style="margin: 5px 0 0 0; font-size: 14px; color: #ff4d4f;"><strong>Time Left:</strong> ${timeLeft}</p>
              </div>

              <div style="margin: 30px 0; text-align: center;">
                <a href="${Deno.env.get("SITE_URL") || 'http://localhost:3000'}/auctions/${item.auction_id}" style="background-color: #049A9E; color: white; padding: 15px 30px; text-decoration: none; font-weight: bold; text-transform: uppercase; font-size: 14px; box-shadow: 4px 4px 0px 0px #0B2B53;">View Auction Now</a>
              </div>

              <p style="color: #666; font-size: 12px; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
                Virginia Liquidation • Industrial Auctions<br/>
                You are receiving this email because this item is in your watchlist.
              </p>
            </div>
          `,
        }),
      })

      if (res.ok) {
        // 3. Mark as notified
        await supabaseAdmin
          .from("watchlist")
          .update({ notified_closing_soon: true })
          .eq("id", item.id)
        
        results.push({ id: item.id, status: 'sent' })
      } else {
        const err = await res.text()
        console.error(`Failed to send email for item ${item.id}:`, err)
        results.push({ id: item.id, status: 'failed', error: err })
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { "Content-Type": "application/json" },
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }
})
