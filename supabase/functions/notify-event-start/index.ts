// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { eventStartingTemplate } from '../../../lib/emails/templates/event-starting.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const FROM_EMAIL = 'Virginia Liquidation <no-reply@boom-digital.ma>'

Deno.serve(async (req) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Find upcoming events starting in the next 30 minutes
    const now = new Date()
    const thirtyMinutesLater = new Date(now.getTime() + 30 * 60000)

    const { data: upcomingEvents, error: eventError } = await supabaseClient
      .from('auction_events')
      .select('id, title, start_at')
      .gt('start_at', now.toISOString())
      .lt('start_at', thirtyMinutesLater.toISOString())

    if (eventError) throw eventError

    if (!upcomingEvents || upcomingEvents.length === 0) {
      return new Response(JSON.stringify({ message: 'No upcoming events found.' }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    let totalNotifications = 0
    const batchEmails = []
    const reminderIds = []

    // 2. Collect all reminders that need to be sent
    for (const event of upcomingEvents) {
      const { data: reminders } = await supabaseClient
        .from('event_reminders')
        .select('id, user:profiles(full_name, email)')
        .eq('event_id', event.id)
        .eq('notified', false)

      if (reminders && reminders.length > 0) {
        for (const r of reminders) {
          if (r.user?.email) {
            batchEmails.push({
              from: FROM_EMAIL,
              to: r.user.email,
              subject: `Starting Soon: ${event.title}`,
              html: eventStartingTemplate(
                r.user.full_name || 'Valued Member',
                event.title,
                `https://virginialiquidation.com/events/${event.id}`,
                event.start_at
              )
            })
            reminderIds.push(r.id)
          }
        }
      }
    }

    if (batchEmails.length > 0) {
      // 3. Send in batches of 100 (Resend limit)
      for (let i = 0; i < batchEmails.length; i += 100) {
        const chunk = batchEmails.slice(i, i + 100)
        const idsChunk = reminderIds.slice(i, i + 100)

        const res = await fetch('https://api.resend.com/emails/batch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify(chunk),
        })

        if (res.ok) {
          // 4. Mark these specific reminders as notified
          await supabaseClient
            .from('event_reminders')
            .update({ notified: true })
            .in('id', idsChunk)
          
          totalNotifications += chunk.length
        } else {
          console.error(`Resend Batch Error:`, await res.text())
        }
      }
    }

    return new Response(JSON.stringify({ message: `Processed ${totalNotifications} notifications.` }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
