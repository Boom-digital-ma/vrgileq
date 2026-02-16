'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleWatchlist(auctionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // Vérifier si déjà présent
  const { data: existing } = await supabase
    .from('watchlist')
    .select('id')
    .eq('user_id', user.id)
    .eq('auction_id', auctionId)
    .single()

  if (existing) {
    await supabase.from('watchlist').delete().eq('id', existing.id)
  } else {
    await supabase.from('watchlist').insert({
      user_id: user.id,
      auction_id: auctionId
    })
  }

  revalidatePath('/auctions')
  revalidatePath(`/auctions/${auctionId}`)
  revalidatePath('/profile')
}
