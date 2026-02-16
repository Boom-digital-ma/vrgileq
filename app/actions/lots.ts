'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function adminUpsertLot(data: any, lotId?: string) {
  try {
    const supabase = await createClient()
    const { images, ...lotData } = data

    // 1. Préparation du payload
    const mainImageUrl = images && images.length > 0 ? images[0] : null
    
    const lotPayload: any = {
      title: lotData.title,
      image_url: mainImageUrl,
      category_id: lotData.category_id || null,
      event_id: lotData.event_id || null,
    }

    // Gestion sécurisée des nombres
    if (lotData.start_price !== undefined) lotPayload.start_price = Number(lotData.start_price)
    if (lotData.current_price !== undefined) lotPayload.current_price = Number(lotData.current_price)
    if (lotData.min_increment !== undefined) lotPayload.min_increment = Number(lotData.min_increment)

    let finalLotId = lotId

    if (lotId) {
      // UPDATE
      const { error: updateError } = await supabase
        .from('auctions')
        .update(lotPayload)
        .eq('id', lotId)
      
      if (updateError) throw updateError
    } else {
      // CREATE
      // Si c'est un nouveau lot, on lui donne une date de fin par défaut (ex: +7 jours) 
      // si elle n'est pas fournie, pour éviter l'erreur NOT NULL
      if (!lotPayload.ends_at) {
          lotPayload.ends_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }

      const { data: newLot, error: insertError } = await supabase
        .from('auctions')
        .insert(lotPayload)
        .select()
        .single()
      
      if (insertError) throw insertError
      finalLotId = newLot.id
    }

    // 2. Gérer la galerie d'images
    if (finalLotId && images) {
      await supabase.from('auction_images').delete().eq('auction_id', finalLotId)
      
      const imagesToInsert = images.map((url: string, index: number) => ({
        auction_id: finalLotId,
        url: url,
        is_main: index === 0
      }))

      if (imagesToInsert.length > 0) {
        const { error: imgError } = await supabase.from('auction_images').insert(imagesToInsert)
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
