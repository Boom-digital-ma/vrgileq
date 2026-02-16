'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
})

export async function registerForEvent(eventId: string, paymentMethodId?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'You must be logged in to register.' }

  // 1. Récupérer l'événement et le profil
  const [eventRes, profileRes] = await Promise.all([
    supabase.from('auction_events').select('*').eq('id', eventId).single(),
    supabase.from('profiles').select('*').eq('id', user.id).single()
  ])

  if (eventRes.error || !eventRes.data) return { error: 'Event not found.' }
  const event = eventRes.data
  const profile = profileRes.data

  // 2. Vérifier si déjà inscrit
  const { data: existing } = await supabase
    .from('event_registrations')
    .select('id')
    .eq('event_id', eventId)
    .eq('user_id', user.id)
    .single()

  if (existing) return { success: true }

  // 3. Vérifier si une carte est enregistrée
  if (!profile?.stripe_customer_id) {
    return { needsCard: true }
  }

  // Si on n'a pas passé de PM ID, on tente de récupérer celui par défaut
  let pmToUse = paymentMethodId
  if (!pmToUse) {
    const customer = await stripe.customers.retrieve(profile.stripe_customer_id) as Stripe.Customer
    pmToUse = customer.invoice_settings.default_payment_method as string
  }

  if (!pmToUse && Number(event.deposit_amount) > 0) {
    return { needsCard: true }
  }

  try {
    // 4. Si un dépôt est requis (> 0), effectuer le hold Stripe
    let paymentIntentId = null
    if (Number(event.deposit_amount) > 0) {
      console.log(`DEBUG: [REGISTRATION] Starting ${event.deposit_amount}$ hold for event ${eventId}`)
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(Number(event.deposit_amount) * 100),
        currency: 'usd',
        customer: profile.stripe_customer_id,
        payment_method: pmToUse,
        payment_method_types: ['card'],
        capture_method: 'manual',
        confirm: true,
        off_session: true,
        metadata: {
          event_id: eventId,
          user_id: user.id,
          type: 'event_deposit'
        }
      }, {
        // Prevents double hold if clicked twice
        idempotencyKey: `reg_${user.id}_${eventId}`
      })
      
      paymentIntentId = paymentIntent.id
      console.log("DEBUG: [REGISTRATION] Hold created ->", paymentIntentId)
    }

    // 5. Créer l'inscription dans Supabase
    const { error: regError } = await supabase
      .from('event_registrations')
      .insert({
        event_id: eventId,
        user_id: user.id,
        stripe_payment_intent_id: paymentIntentId,
        status: 'authorized'
      })

    if (regError) {
        // If DB fails, try to void the Stripe hold to avoid leaving money frozen
        if (paymentIntentId) await stripe.paymentIntents.cancel(paymentIntentId)
        throw regError
    }

    console.log("DEBUG: [REGISTRATION] Success for user", user.id)
    revalidatePath(`/events/${eventId}`)
    return { success: true }
  } catch (err: any) {
    console.error('Registration error:', err.message)
    return { error: err.message || 'Failed to authorize bidding deposit.' }
  }
}

export async function checkRegistration(eventId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { registered: false }

  const { data } = await supabase
    .from('event_registrations')
    .select('status')
    .eq('event_id', eventId)
    .eq('user_id', user.id)
    .single()

  return { registered: !!data, status: data?.status }
}
