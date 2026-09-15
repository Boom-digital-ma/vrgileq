'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendInvoiceEmail } from '@/lib/emails'

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
  revalidatePath(`/invoices/${saleId}`)
  revalidatePath(`/gate-pass/${saleId}`)
  revalidatePath(`/gate-pass/${saleId}/verify`)
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

    // 1. Atomically claim the sale for refund (prevents double-refund)
    const { data: sale, error: claimError } = await supabase
        .from('sales')
        .update({ status: 'refunding', updated_at: new Date().toISOString() })
        .eq('id', saleId)
        .eq('status', 'paid')
        .select('stripe_payment_intent_id, total_amount')
        .single()

    if (claimError || !sale) throw new Error("Sale not found or not in paid status")
    if (!sale.stripe_payment_intent_id) {
      await supabase.from('sales').update({ status: 'paid' }).eq('id', saleId)
      throw new Error("No Stripe transaction linked to this sale")
    }

    // 2. Initialize Stripe
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: '2026-01-28.clover',
    })

    // 3. Create Refund on Stripe
    try {
      await stripe.refunds.create({
          payment_intent: sale.stripe_payment_intent_id,
      })
    } catch (stripeErr: any) {
      // Stripe failed — revert status
      await supabase.from('sales').update({ status: 'paid' }).eq('id', saleId)
      throw stripeErr
    }

    // 4. Finalize in Database
    await supabase
        .from('sales')
        .update({ status: 'refunded', updated_at: new Date().toISOString() })
        .eq('id', saleId)

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

    // 1. Atomically claim the item for refund (prevents double-refund race condition)
    const { data: claimed, error: claimError } = await supabase
        .from('sale_items')
        .update({ status: 'refunding' })
        .eq('id', saleItemId)
        .neq('status', 'refunded')
        .neq('status', 'refunding')
        .select('*, sales(*)')
        .single()

    if (claimError || !claimed) throw new Error("Item already refunded or not found")

    const sale = claimed.sales
    if (sale.status !== 'paid') {
      // Revert claim
      await supabase.from('sale_items').update({ status: 'active' }).eq('id', saleItemId)
      throw new Error("Parent sale must be paid to refund items")
    }
    if (!sale.stripe_payment_intent_id) {
      await supabase.from('sale_items').update({ status: 'active' }).eq('id', saleItemId)
      throw new Error("No Stripe transaction linked to this sale")
    }

    // 2. Calculate refund amount (Hammer + its proportional Buyer's Premium)
    const hammer = Number(claimed.hammer_price)
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
    try {
      await stripe.refunds.create({
          payment_intent: sale.stripe_payment_intent_id,
          amount: totalRefundCents,
          reason: 'requested_by_customer',
          metadata: { sale_item_id: saleItemId, invoice: sale.invoice_number }
      })
    } catch (stripeErr: any) {
      // Stripe failed — revert the claim
      await supabase.from('sale_items').update({ status: 'active' }).eq('id', saleItemId)
      throw stripeErr
    }

    // 5. Finalize in Database
    await supabase.from('sale_items').update({ status: 'refunded' }).eq('id', saleItemId)

    const newRefundTotal = Number(sale.refunded_amount || 0) + (totalRefundCents / 100)
    await supabase.from('sales').update({ refunded_amount: newRefundTotal }).eq('id', sale.id)

    revalidatePath(`/admin/sales/${sale.id}`)
    return { success: true, amount: totalRefundCents / 100 }

  } catch (err: any) {
    console.error("Partial refund error:", err.message)
    return { error: err.message }
  }
}

export async function sendInvoiceEmailAction(saleId: string) {
  try {
    const supabase = await createClient()
    const adminSupabase = createAdminClient()

    // Verify admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') throw new Error('Admin only')

    // Get sale with items and winner
    const { data: sale, error } = await adminSupabase
      .from('sales')
      .select('*, sale_items(*, auction:auctions(title, lot_number)), winner:profiles(full_name, email)')
      .eq('id', saleId)
      .single()

    if (error || !sale) throw new Error('Sale not found')

    let recipientEmail = sale.winner?.email
    if (!recipientEmail) {
      const { data: { user: authUser } } = await adminSupabase.auth.admin.getUserById(sale.winner_id)
      recipientEmail = authUser?.email
    }
    if (!recipientEmail) throw new Error('No email found for this customer')

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://virginialiquidation.vercel.app'

    const items = (sale.sale_items || [])
      .filter((i: any) => i.status !== 'refunded')
      .map((i: any) => ({
        title: i.auction?.title || 'Item',
        lotNumber: i.auction?.lot_number,
        price: Number(i.hammer_price),
      }))

    await sendInvoiceEmail({
      to: recipientEmail,
      customerName: sale.winner?.full_name || 'Customer',
      invoiceNumber: sale.invoice_number,
      items,
      hammerTotal: Number(sale.hammer_price),
      buyersPremium: Number(sale.buyers_premium_amount),
      tax: Number(sale.tax_amount),
      totalAmount: Number(sale.total_amount),
      invoiceUrl: `${siteUrl}/invoices/${saleId}`,
    })

    return { success: true, email: recipientEmail }
  } catch (err: any) {
    console.error('Send invoice email error:', err.message)
    return { error: err.message }
  }
}
