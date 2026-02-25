import ClientProfile from '../ClientProfile'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface AdminProfileViewProps {
  params: Promise<{ id: string }>
}

export default async function AdminProfileView({ params }: AdminProfileViewProps) {
  const { id } = await params
  const supabase = await createClient()
  
  // Security check: Only admins can view specific profiles via this route
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/signin')
  }

  const isAdmin = user.user_metadata?.role === 'admin'
  
  // If not admin and trying to view someone else, redirect to own profile
  if (!isAdmin && user.id !== id) {
    redirect('/profile')
  }

  return <ClientProfile targetUserId={id} />
}
