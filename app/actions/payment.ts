'use server'

import Stripe from 'stripe'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
})

export async function savePaymentMethod(paymentMethodId: string) {
  try {
    const supabase = await createClient()
    const adminSupabase = createAdminClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    let customerId = profile?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        name: profile?.full_name || user.email,
      })
      customerId = customer.id
      await adminSupabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id)
    }

    // 1. Attach
    await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId })

    // 2. Hold 1$ to verify
    const intent = await stripe.paymentIntents.create({
      amount: 100,
      currency: 'usd',
      customer: customerId,
      payment_method: paymentMethodId,
      confirm: true,
      off_session: true,
      capture_method: 'manual',
      payment_method_types: ['card'],
    })
    await stripe.paymentIntents.cancel(intent.id)

    // 3. Set Default in Stripe and Supabase
    await stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    })

    await adminSupabase.from('profiles').update({ 
        is_verified: true,
        default_payment_method_id: paymentMethodId 
    }).eq('id', user.id)
    
    revalidatePath('/profile')
    return { success: true }

  } catch (error: any) {
    console.error("Payment method error:", error.message)
    return { success: false, error: error.message }
  }
}

export async function deletePaymentMethod(paymentMethodId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // Detach the payment method from the customer in Stripe
    await stripe.paymentMethods.detach(paymentMethodId)
    
    revalidatePath('/profile')
    return { success: true }
  } catch (error: any) {
    console.error("Delete card error:", error.message)
    return { success: false, error: error.message }
  }
}

export async function setDefaultPaymentMethod(paymentMethodId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: profile } = await supabase.from('profiles').select('stripe_customer_id').eq('id', user.id).single()
    if (!profile?.stripe_customer_id) throw new Error('No Stripe customer found')

    // 1. Update Stripe Customer default
    await stripe.customers.update(profile.stripe_customer_id, {
      invoice_settings: { default_payment_method: paymentMethodId },
    })

    // 2. Update Supabase Profile for quick access
    const adminSupabase = createAdminClient()
    await adminSupabase
        .from('profiles')
        .update({ default_payment_method_id: paymentMethodId })
        .eq('id', user.id)

    revalidatePath('/profile')
    return { success: true }
  } catch (error: any) {
    console.error("Set default card error:", error.message)
    return { success: false, error: error.message }
  }
}

export async function releaseEventDeposits(eventId: string) {
  try {
    const adminSupabase = createAdminClient()
    
    // 1. Get all registrations for this event that are authorized but not captured
    const { data: registrations, error } = await adminSupabase
        .from('event_registrations')
        .select('*')
        .eq('event_id', eventId)
        .eq('status', 'authorized')
        .not('stripe_payment_intent_id', 'is', null)
        .eq('deposit_captured', false)

    if (error) throw error
    if (!registrations || registrations.length === 0) {
        return { success: true, count: 0, message: "No deposits to release" }
    }

    let releaseCount = 0
    let errorCount = 0

    // 2. Cancel each PaymentIntent in Stripe
    for (const reg of registrations) {
        try {
            await stripe.paymentIntents.cancel(reg.stripe_payment_intent_id!)
            
            // 3. Update registration status in DB
            await adminSupabase
                .from('event_registrations')
                .update({ status: 'released', updated_at: new Date().toISOString() })
                .eq('id', reg.id)
            
            releaseCount++
        } catch (stripeErr: any) {
            console.error(`Failed to release deposit for reg ${reg.id}:`, stripeErr.message)
            errorCount++
        }
    }

    revalidatePath(`/admin/events/${eventId}`)
    return { 
        success: true, 
        count: releaseCount, 
        errors: errorCount,
        message: `Successfully released ${releaseCount} deposits. Errors: ${errorCount}`
    }

  } catch (error: any) {
    console.error("Release deposits error:", error.message)
    return { success: false, error: error.message }
  }
}

export async function getPaymentMethods() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await supabase.from('profiles').select('stripe_customer_id').eq('id', user.id).single()
  if (!profile?.stripe_customer_id) return []

  const methods = await stripe.paymentMethods.list({
    customer: profile.stripe_customer_id,
    type: 'card',
  })

  return methods.data.map(m => ({
    id: m.id,
    brand: m.card?.brand,
    last4: m.card?.last4,
    exp_month: m.card?.exp_month,
    exp_year: m.card?.exp_year,
  }))
}
