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

export async function generateEventInvoicesAction(eventId: string) {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase.rpc('generate_event_invoices', {
            p_event_id: eventId
        })

        if (error) throw error

        revalidatePath(`/admin/events/${eventId}`)
        revalidatePath('/admin/sales')
        
        const count = Array.isArray(data) ? data.length : 0;
        return { success: true, count }
    } catch (err: any) {
        console.error("Invoicing Error:", err.message)
        return { error: err.message }
    }
}

export async function refundSale(saleId: string) {
  try {
    const supabase = await createClient()
    
    // 1. Get the sale details including Stripe PI
    const { data: sale, error: fetchError } = await supabase
        .from('sales')
        .select('stripe_payment_intent_id, total_amount, status')
        .eq('id', saleId)
        .single()

    if (fetchError || !sale) throw new Error("Sale not found")
    if (sale.status !== 'paid') throw new Error("Only paid sales can be refunded")
    if (!sale.stripe_payment_intent_id) throw new Error("No Stripe transaction linked to this sale")

    // 2. Initialize Stripe
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: '2026-01-28.clover',
    })

    // 3. Create Refund on Stripe
    await stripe.refunds.create({
        payment_intent: sale.stripe_payment_intent_id,
    })

    // 4. Update Database
    const { error: updateError } = await supabase
        .from('sales')
        .update({ status: 'refunded', updated_at: new Date().toISOString() })
        .eq('id', saleId)

    if (updateError) throw updateError

    revalidatePath(`/admin/sales/${saleId}`)
    revalidatePath('/admin/sales')
    return { success: true }

  } catch (err: any) {
    console.error("Refund error:", err.message)
    return { error: err.message }
  }
}

export async function refundSaleItem(saleItemId: string) {
  try {
    const supabase = await createClient()
    
    // 1. Get the sale item and its parent sale details
    const { data: item, error: itemError } = await supabase
        .from('sale_items')
        .select('*, sales(*)')
        .eq('id', saleItemId)
        .single()

    if (itemError || !item) throw new Error("Sale item not found")
    if (item.status === 'refunded') throw new Error("Item already refunded")
    
    const sale = item.sales
    if (sale.status !== 'paid') throw new Error("Parent sale must be paid to refund items")
    if (!sale.stripe_payment_intent_id) throw new Error("No Stripe transaction linked to this sale")

    // 2. Calculate refund amount (Hammer + its proportional Buyer's Premium)
    const hammer = Number(item.hammer_price)
    const bpRate = Number(sale.buyers_premium_rate) / 100
    const taxRate = Number(sale.tax_rate) / 100
    
    const bpAmount = hammer * bpRate
    const taxAmount = (hammer + bpAmount) * taxRate
    const totalRefundCents = Math.round((hammer + bpAmount + taxAmount) * 100)

    // 3. Initialize Stripe
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: '2026-01-28.clover',
    })

    // 4. Create Partial Refund on Stripe
    await stripe.refunds.create({
        payment_intent: sale.stripe_payment_intent_id,
        amount: totalRefundCents,
        reason: 'requested_by_customer',
        metadata: { sale_item_id: saleItemId, invoice: sale.invoice_number }
    })

    // 5. Update Database
    // Mark item as refunded
    await supabase.from('sale_items').update({ status: 'refunded' }).eq('id', saleItemId)
    
    // Increment total refunded on parent sale
    const newRefundTotal = Number(sale.refunded_amount || 0) + (totalRefundCents / 100)
    await supabase.from('sales').update({ refunded_amount: newRefundTotal }).eq('id', sale.id)

    revalidatePath(`/admin/sales/${sale.id}`)
    return { success: true, amount: totalRefundCents / 100 }

  } catch (err: any) {
    console.error("Partial refund error:", err.message)
    return { error: err.message }
  }
}

