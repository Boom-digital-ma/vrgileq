'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Unauthorized' }

  const data = {
    full_name: formData.get('fullName') as string,
    phone: formData.get('phone') as string,
    address_line: formData.get('address') as string,
    city: formData.get('city') as string,
    state: formData.get('state') as string,
    zip_code: formData.get('zip') as string,
    country: formData.get('country') as string,
    updated_at: new Date().toISOString()
  }

  const { error } = await supabase
    .from('profiles')
    .update(data)
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/profile')
  return { success: 'Profile updated successfully' }
}

export async function adminCreateUser(data: { email: string, password?: string, full_name: string, role: string }) {
  const adminClient = await createAdminClient()
  
  // 1. Create Auth User
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email: data.email,
    password: data.password || Math.random().toString(36).slice(-12), // Auto-gen if missing
    email_confirm: true,
    user_metadata: { full_name: data.full_name }
  })

  if (authError) return { error: authError.message }

  // 2. Profile is auto-created by DB trigger, but we update role
  const { error: profileError } = await adminClient
    .from('profiles')
    .update({ role: data.role as any })
    .eq('id', authData.user.id)

  if (profileError) return { error: profileError.message }

  revalidatePath('/admin/users')
  return { success: true }
}

export async function deleteAccount() {
  const supabase = await createClient()
  const adminClient = await createAdminClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // 1. Delete user from Supabase Auth (this will cascade delete the profile due to FK)
  const { error } = await adminClient.auth.admin.deleteUser(user.id)

  if (error) return { error: error.message }

  // 2. Sign out on server side (clear cookies)
  await supabase.auth.signOut()

  return { success: true }
}
