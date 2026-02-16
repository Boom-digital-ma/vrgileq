'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function adminUpsertLot(data: any, lotId?: string) {
  try {
    const adminSupabase = createAdminClient()
    const { images, ...lotData } = data

    // 1. Préparation du payload
    const mainImageUrl = images && images.length > 0 ? images[0] : null
    
    const lotPayload: any = {
      title: lotData.title,
      description: lotData.description || '',
      image_url: mainImageUrl,
      category_id: lotData.category_id && lotData.category_id !== "" ? lotData.category_id : null,
      event_id: lotData.event_id || null,
      lot_number: lotData.lot_number ? Number(lotData.lot_number) : null,
    }

    // Gestion sécurisée des nombres
    if (lotData.start_price !== undefined) lotPayload.start_price = Number(lotData.start_price)
    if (lotData.current_price !== undefined) lotPayload.current_price = Number(lotData.current_price)
    if (lotData.min_increment !== undefined) lotPayload.min_increment = Number(lotData.min_increment)

    let finalLotId = lotId

    if (lotId) {
      // UPDATE
      const { error: updateError } = await adminSupabase
        .from('auctions')
        .update(lotPayload)
        .eq('id', lotId)
      
      if (updateError) throw updateError
    } else {
      // CREATE
      if (!lotPayload.ends_at) {
          lotPayload.ends_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }

      const { data: newLot, error: insertError } = await adminSupabase
        .from('auctions')
        .insert(lotPayload)
        .select()
        .single()
      
      if (insertError) throw insertError
      finalLotId = newLot.id
    }

    // 2. Gérer la galerie d'images
    if (finalLotId && images) {
      await adminSupabase.from('auction_images').delete().eq('auction_id', finalLotId)
      
      const imagesToInsert = images.map((url: string, index: number) => ({
        auction_id: finalLotId,
        url: url,
        is_main: index === 0
      }))

      if (imagesToInsert.length > 0) {
        const { error: imgError } = await adminSupabase.from('auction_images').insert(imagesToInsert)
        if (imgError) throw imgError
      }
    }

    revalidatePath('/admin/events')
    return { success: true, id: finalLotId }

  } catch (err: any) {
    console.error("CRITICAL UPSERT ERROR:", err)
    return { error: err.message || "Unknown server error during lot upsert" }
  }
}

export async function importLots(eventId: string, lots: any[]) {
  try {
    const adminSupabase = createAdminClient()
    
    // Fetch event ends_at to use as default for lots
    const { data: event } = await adminSupabase.from('auction_events').select('ends_at').eq('id', eventId).single()

    const formattedLots = lots.map(lot => ({
      event_id: eventId,
      lot_number: lot.lot_number ? Number(lot.lot_number) : null,
      title: lot.title || 'Untitled Lot',
      description: lot.description || '',
      start_price: Number(lot.start_price) || 0,
      current_price: Number(lot.start_price) || 0,
      min_increment: Number(lot.min_increment) || 5,
      status: 'live',
      image_url: lot.image_url || null,
      manufacturer: lot.manufacturer || null,
      model: lot.model || null,
      metadata: lot.metadata || {},
      ends_at: lot.ends_at || event?.ends_at || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    }))

    const { data: createdLots, error } = await adminSupabase
      .from('auctions')
      .upsert(formattedLots, { onConflict: 'event_id, lot_number' })
      .select()

    if (error) throw error

    // 2. Insert Images for each lot
    if (createdLots) {
        const imagesToInsert: any[] = []
        
        createdLots.forEach(newLot => {
            // Find corresponding images from the original import data using lot_number
            const originalLot = lots.find(l => l.lot_number === newLot.lot_number)
            if (originalLot && originalLot.all_images) {
                originalLot.all_images.forEach((url: string, index: number) => {
                    imagesToInsert.push({
                        auction_id: newLot.id,
                        url: url,
                        is_main: index === 0
                    })
                })
            }
        })

        if (imagesToInsert.length > 0) {
            const { error: imgError } = await adminSupabase.from('auction_images').insert(imagesToInsert)
            if (imgError) console.error("Error inserting imported images:", imgError.message)
        }
    }

    revalidatePath(`/admin/events/${eventId}`)
    return { success: true, count: createdLots?.length || 0 }
  } catch (error: any) {
    console.error("IMPORT ERROR:", error.message)
    return { success: false, error: error.message }
  }
}
