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

    let notificationsSent = 0

    // 2. For each event, find reminders that haven't been sent yet
    for (const event of upcomingEvents) {
      const { data: reminders, error: reminderError } = await supabaseClient
        .from('event_reminders')
        .select('id, user_id, user:profiles(full_name, email)')
        .eq('event_id', event.id)
        .eq('notified', false)

      if (reminderError) {
        console.error(`Error fetching reminders for event ${event.id}:`, reminderError)
        continue
      }

      if (!reminders || reminders.length === 0) continue

      // 3. Send emails
      for (const reminder of reminders) {
        const userEmail = reminder.user?.email
        const userName = reminder.user?.full_name || 'Valued Member'

        if (!userEmail) continue

        // Send Email via Resend API (Direct Fetch)
        try {
            const res = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${RESEND_API_KEY}`,
                },
                body: JSON.stringify({
                    from: FROM_EMAIL,
                    to: userEmail,
                    subject: `Starting Soon: ${event.title}`,
                    html: eventStartingTemplate(
                        userName, 
                        event.title, 
                        `https://virginialiquidation.com/events/${event.id}`, 
                        event.start_at
                    ),
                }),
            })

            if (res.ok) {
                // 4. Mark as notified
                await supabaseClient
                    .from('event_reminders')
                    .update({ notified: true })
                    .eq('id', reminder.id)
                
                notificationsSent++
            } else {
                console.error(`Resend API Error for ${userEmail}:`, await res.text())
            }
        } catch (emailErr) {
            console.error(`Failed to send email to ${userEmail}:`, emailErr)
        }
      }
    }

    return new Response(JSON.stringify({ message: `Sent ${notificationsSent} notifications.` }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
