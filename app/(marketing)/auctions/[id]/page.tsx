import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ImageGallery from '@/components/auction/ImageGallery'
import BiddingWidget from '@/components/auction/BiddingWidget'
import { Timer, Gavel, ArrowLeft, Building2, Package } from 'lucide-react'
import Link from 'next/link'

export default async function AuctionDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Fetch auction lot with event, category and all associated images
  const { data: lot } = await supabase
    .from('auctions')
    .select(`
      *,
      auction_events(title),
      categories(name),
      auction_images(*)
    `)
    .eq('id', id)
    .single()

  if (!lot) notFound()

  // 2. Fetch bids for the sidebar
  const { data: bids } = await supabase
    .from('bids')
    .select('*')
    .eq('auction_id', id)
    .order('created_at', { ascending: false })

  // 3. Construction de la galerie d'images
  // On récupère les URLs de la table secondaire
  const secondaryImages = lot.auction_images?.map((img: any) => img.url) || []
  
  // On crée la liste finale : Image principale (Admin image_url) en PREMIER, puis les autres
  const finalGallery = [
    ...(lot.image_url ? [lot.image_url] : []),
    ...secondaryImages
  ].filter((url, index, self) => url && self.indexOf(url) === index) // Suppression des doublons et des chaînes vides

  return (
    <div className="min-h-screen bg-light/20 pb-20 font-sans antialiased text-zinc-900">
      {/* Navigation / Breadcrumbs */}
      <div className="bg-white border-b-2 border-light py-4">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link href={`/events/${lot.event_id}`} className="flex items-center gap-2 text-[10px] font-black uppercase text-neutral/40 hover:text-primary transition-colors italic font-sans">
            <ArrowLeft size={14} /> Back to Event Catalog
          </Link>
          <span className="text-[10px] font-bold text-neutral/30 uppercase tracking-widest italic font-sans">
            {lot.auction_events?.title} / Lot #{lot.id.slice(0,8)}
          </span>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 font-sans">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 font-sans">
          
          {/* Media & Details Column */}
          <div className="lg:col-span-7 space-y-12">
            <div className="bg-white border-4 border-primary p-2 shadow-[12px_12px_0px_0px_rgba(11,43,83,1)]">
                {/* La galerie affiche maintenant l'image de couverture en premier */}
                <ImageGallery images={finalGallery.length > 0 ? finalGallery : ["/images/placeholder.jpg"]} />
            </div>

            <div className="bg-white border-4 border-primary p-10 shadow-[12px_12px_0px_0px_rgba(4,154,158,0.1)]">
                <div className="flex items-center gap-2 text-primary mb-4">
                    <Building2 size={18} />
                    <span className="text-xs font-black uppercase tracking-widest">{lot.categories?.name}</span>
                </div>
                <h1 className="text-4xl font-black uppercase tracking-tighter italic text-secondary leading-none mb-8">
                    {lot.title}
                </h1>
                
                <div className="prose prose-zinc max-w-none">
                    <h3 className="text-sm font-black uppercase tracking-widest border-b-2 border-light pb-2 mb-4 italic">Technical Assessment</h3>
                    <p className="text-neutral/60 italic font-medium leading-relaxed">
                        {lot.description || "Comprehensive technical documentation pending for this specific industrial asset. Please contact Virginia Liquidation for full inspection reports."}
                    </p>
                </div>

                <div className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-8 pt-8 border-t-2 border-light font-sans">
                    <div>
                        <p className="text-[10px] font-black uppercase text-neutral/30 italic">Availability</p>
                        <p className="font-bold uppercase text-primary italic leading-none mt-1">● {lot.status}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-neutral/30 italic">Bid Increment</p>
                        <p className="font-bold uppercase text-secondary italic leading-none mt-1">${lot.min_increment}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-neutral/30 italic">Buyer's Premium</p>
                        <p className="font-bold uppercase text-secondary italic leading-none mt-1">20%</p>
                    </div>
                </div>
            </div>
          </div>

          {/* Bidding Column */}
          <div className="lg:col-span-5 font-sans">
            <BiddingWidget 
              auctionId={lot.id}
              initialPrice={Number(lot.current_price)}
              endsAt={new Date(lot.ends_at)}
              bids={bids || []}
              minIncrement={Number(lot.min_increment)}
            />
          </div>

        </div>
      </div>
    </div>
  )
}
