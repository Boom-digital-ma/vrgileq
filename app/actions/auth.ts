'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function login(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: error.message }
  }

  // Vérifier le rôle pour informer le client de la destination
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single()

  revalidatePath('/', 'layout')

  return { 
    success: true, 
    role: profile?.role || 'client' 
  }
}

export async function signup(formData: FormData, paymentMethodId?: string) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const phone = formData.get('phone') as string
  const address = formData.get('address') as string
  const city = formData.get('city') as string
  const state = formData.get('state') as string
  const zip = formData.get('zip') as string
  const country = formData.get('country') as string

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone,
        address_line: address,
        city,
        state,
        zip_code: zip,
        country
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  // If a payment method was provided during signup, attach it now
  if (paymentMethodId && data.user) {
    try {
        const Stripe = (await import('stripe')).default
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
            apiVersion: '2026-01-28.clover',
        })

        const customer = await stripe.customers.create({
            email: email,
            name: fullName,
            metadata: { user_id: data.user.id }
        })

        await stripe.paymentMethods.attach(paymentMethodId, { customer: customer.id })
        await stripe.customers.update(customer.id, {
            invoice_settings: { default_payment_method: paymentMethodId },
        })

        // Small delay to ensure DB trigger has finished creating the profile
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Use UPSERT to be absolutely sure the record exists with the customer ID
        const adminSupabase = createAdminClient()
        
        const { error: updateError } = await adminSupabase
            .from('profiles')
            .upsert({ 
                id: data.user.id,
                stripe_customer_id: customer.id,
                is_verified: true,
                email: email,
                full_name: fullName,
                phone: phone,
                address_line: address,
                city: city,
                state: state,
                zip_code: zip,
                country: country
            }, { onConflict: 'id' })

        if (updateError) {
            console.error("Profile Upsert Failed:", updateError.message)
        } 

    } catch (stripeErr: any) {
        console.error("Non-critical Stripe error during signup:", stripeErr.message)
    }
  }

  return { success: "Check your email to confirm your account!" }
}

export async function requestPasswordReset(email: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email)
  if (error) return { error: error.message }
  return { success: "OTP code sent to your email." }
}

export async function verifyOTP(email: string, token: string, type: 'signup' | 'recovery') {
  const supabase = await createClient()
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type
  })
  if (error) return { error: error.message }
  
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function updatePassword(password: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { error: error.message }
  return { success: true }
}

export async function changeEmail(newEmail: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ email: newEmail })
  if (error) return { error: error.message }
  return { success: "Check both your old and new emails for the confirmation codes." }
}

export async function adminInviteUser(email: string, fullName: string, role: string) {
  const adminClient = await createAdminClient()
  
  const { data, error } = await adminClient.auth.admin.inviteUserByEmail(email, {
    data: { full_name: fullName, role: role }
  })

  if (error) return { error: error.message }
  return { success: `Invitation sent to ${email}` }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}
