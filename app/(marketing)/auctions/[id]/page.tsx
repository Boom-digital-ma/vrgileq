import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import AuctionDetailsRealtime from '@/components/auction/AuctionDetailsRealtime'
import { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data: lot } = await supabase.from('auctions').select('title, description').eq('id', id).single()
  
  return {
    title: lot?.title || "Lot Detail",
    description: lot?.description?.slice(0, 160) || "Bid on this industrial asset at Virginia Liquidation.",
  }
}

export default async function AuctionDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: lot } = await supabase
    .from('auctions')
    .select(`
      *,
      auction_events(id, title, location, ends_at),
      categories(name),
      auction_images(*)
    `)
    .eq('id', id)
    .single()

  if (!lot) notFound()

  const { data: bids } = await supabase
    .from('bids')
    .select('*')
    .eq('auction_id', id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-white font-sans antialiased text-secondary">
      <AuctionDetailsRealtime initialLot={lot} initialBids={bids || []} />
    </div>
  )
}
