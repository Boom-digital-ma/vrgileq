'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { addMinutes, isBefore, parseISO, format } from 'date-fns'

export async function generateEventPickupSlots({
    eventId,
    date,
    startTime,
    endTime,
    intervalMinutes,
    maxCapacity
}: {
    eventId: string
    date: string
    startTime: string
    endTime: string
    intervalMinutes: number
    maxCapacity: number
}) {
    const supabase = await createClient()

    // 1. Construct start and end datetimes
    const start = parseISO(`${date}T${startTime}:00`)
    const end = parseISO(`${date}T${endTime}:00`)

    if (isBefore(end, start)) {
        return { error: 'End time must be after start time' }
    }

    const slots = []
    let current = start

    while (isBefore(current, end)) {
        const slotEnd = addMinutes(current, intervalMinutes)
        slots.push({
            event_id: eventId,
            start_at: current.toISOString(),
            end_at: slotEnd.toISOString(),
            max_capacity: maxCapacity
        })
        current = slotEnd
    }

    // 2. Insert into DB
    const { error } = await supabase.from('pickup_slots').insert(slots)

    if (error) {
        console.error('Error generating slots:', error)
        return { error: error.message }
    }

    revalidatePath(`/admin/events/${eventId}`)
    return { success: true, count: slots.length }
}

export async function deleteEventPickupSlots(eventId: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('pickup_slots').delete().eq('event_id', eventId)
    
    if (error) return { error: error.message }
    
    revalidatePath(`/admin/events/${eventId}`)
    return { success: true }
}
