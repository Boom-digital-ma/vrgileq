'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleEventReminder(eventId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized', status: 401 }
  }

  // Check if reminder already exists
  const { data: existing } = await supabase
    .from('event_reminders')
    .select('id')
    .eq('user_id', user.id)
    .eq('event_id', eventId)
    .maybeSingle()

  if (existing) {
    // If exists, remove it (toggle off)
    const { error } = await supabase
        .from('event_reminders')
        .delete()
        .eq('id', existing.id)

    if (error) return { error: error.message }
    revalidatePath('/auctions')
    revalidatePath(`/events/${eventId}`)
    return { success: 'Reminder removed', removed: true }
  } else {
    // If not, create it (toggle on)
    const { error } = await supabase
        .from('event_reminders')
        .insert({ 
            user_id: user.id, 
            event_id: eventId 
        })

    if (error) return { error: error.message }
    revalidatePath('/auctions')
    revalidatePath(`/events/${eventId}`)
    return { success: 'Reminder set successfully', added: true }
  }
}

export async function checkEventReminder(eventId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return { isSet: false }

    const { data } = await supabase
        .from('event_reminders')
        .select('id')
        .eq('user_id', user.id)
        .eq('event_id', eventId)
        .maybeSingle()

    return { isSet: !!data }
}
