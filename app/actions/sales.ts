'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function bookPickupSlot(saleId: string, slotId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase.rpc('book_pickup_slot', {
    p_sale_id: saleId,
    p_slot_id: slotId
  })

  if (error) {
    console.error('Booking error:', error)
    return { error: error.message }
  }

  revalidatePath(`/invoices/${saleId}`)
  revalidatePath('/profile')
  return { success: true }
}

export async function updateSaleStatus(saleId: string, status: 'pending' | 'paid' | 'cancelled' | 'refunded') {
  const supabase = await createClient()
  const { error } = await supabase.from('sales').update({ status }).eq('id', saleId)
  
  if (error) return { error: error.message }
  
  revalidatePath(`/admin/sales/${saleId}`)
  revalidatePath('/admin/sales')
  return { success: true }
}

export async function markAsCollected(saleId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('sales').update({ 
    status: 'paid', // Must be paid to be collected
    collected_at: new Date().toISOString(),
    updated_at: new Date().toISOString() 
  }).eq('id', saleId)

  if (error) return { error: error.message }
  
  revalidatePath(`/admin/sales/${saleId}`)
  revalidatePath('/admin/logistics')
  return { success: true }
}

