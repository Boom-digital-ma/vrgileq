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
      auction_events(id, title, location, ends_at, start_at),
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

  // JSON-LD Structured Data for Product
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": lot.title,
    "image": [lot.image_url, ...(lot.auction_images?.map((img: any) => img.url) || [])].filter(Boolean),
    "description": lot.description,
    "sku": lot.id,
    "mpn": lot.model || lot.lot_number,
    "brand": {
      "@type": "Brand",
      "name": lot.manufacturer || "Industrial"
    },
    "offers": {
      "@type": "Offer",
      "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://virginialiquidation.vercel.app'}/auctions/${lot.id}`,
      "priceCurrency": "USD",
      "price": lot.current_price,
      "availability": lot.status === 'live' ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "priceValidUntil": lot.ends_at,
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans antialiased text-secondary">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AuctionDetailsRealtime initialLot={lot} initialBids={bids || []} />
    </div>
  )
}
