'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function adminCreateUser(formData: { 
  email: string, 
  password?: string, 
  full_name: string, 
  role: string 
}) {
  const supabase = createAdminClient()

  // 1. Créer l'utilisateur dans Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: formData.email,
    password: formData.password || Math.random().toString(36).slice(-12), // Mot de passe aléatoire si non fourni
    email_confirm: true,
    user_metadata: { full_name: formData.full_name }
  })

  if (authError) {
    return { error: authError.message }
  }

  // 2. Mettre à jour le profil (le trigger SQL s'en occupe normalement, mais on force le rôle ici)
  if (authData.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        full_name: formData.full_name,
        role: formData.role
      })
      .eq('id', authData.user.id)

    if (profileError) {
      return { error: profileError.message }
    }
  }

  revalidatePath('/admin/users')
  return { success: true }
}
