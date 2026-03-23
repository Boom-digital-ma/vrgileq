'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { addMinutes, isBefore, parseISO, format } from 'date-fns'

export async function duplicateEvent(eventId: string) {
    try {
        const adminSupabase = createAdminClient()

        // 1. Fetch original event
        const { data: original, error: fetchError } = await adminSupabase
            .from('auction_events')
            .select('*')
            .eq('id', eventId)
            .single()

        if (fetchError) throw fetchError

        // 2. Prepare new event payload
        const { id: _, created_at: __, updated_at: ___, ...clonedData } = original
        const newEventPayload = {
            ...clonedData,
            title: `${original.title} (COPY)`,
            status: 'draft',
            start_at: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
            ends_at: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days from now
        }

        // 3. Insert new event
        const { data: newEvent, error: insertError } = await adminSupabase
            .from('auction_events')
            .insert(newEventPayload)
            .select()
            .single()

        if (insertError) throw insertError

        // 4. Optionally clone lots (Auctions) associated with this event
        const { data: originalLots } = await adminSupabase
            .from('auctions')
            .select('*, auction_images(url, is_main)')
            .eq('event_id', eventId)

        if (originalLots && originalLots.length > 0) {
            for (const lot of originalLots) {
                const { 
                    id: lot_id, 
                    created_at: l_ca, 
                    updated_at: l_ua, 
                    winner_id: l_wi, 
                    winning_notified: l_wn, 
                    status: l_s,
                    auction_images: l_images,
                    ...clonedLotData 
                } = lot

                const newLotPayload = {
                    ...clonedLotData,
                    event_id: newEvent.id,
                    status: 'draft',
                    current_price: lot.start_price || 0,
                    ends_at: newEvent.ends_at // Match new event end date
                }

                const { data: newLot, error: lotInsertError } = await adminSupabase
                    .from('auctions')
                    .insert(newLotPayload)
                    .select()
                    .single()

                if (!lotInsertError && l_images && l_images.length > 0) {
                    const imagesToInsert = l_images.map((img: any) => ({
                        auction_id: newLot.id,
                        url: img.url,
                        is_main: img.is_main
                    }))
                    await adminSupabase.from('auction_images').insert(imagesToInsert)
                }
            }
        }

        revalidatePath('/admin/events')
        return { success: true, id: newEvent.id }
    } catch (err: any) {
        console.error("EVENT DUPLICATION ERROR:", err)
        return { error: err.message || "Failed to duplicate event" }
    }
}

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
