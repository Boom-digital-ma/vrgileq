'use server'

import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
})

export async function savePaymentMethod(paymentMethodId: string) {
  const supabase = await createClient()
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
    await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id)
  }

  // Attacher la nouvelle carte
  await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId })

  // Optionnel : Définir comme défaut si c'est la première
  const methods = await stripe.paymentMethods.list({ customer: customerId, type: 'card' })
  if (methods.data.length === 1) {
    await stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    })
  }

  await supabase.from('profiles').update({ is_verified: true }).eq('id', user.id)
  
  revalidatePath('/profile')
  return { success: true }
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
