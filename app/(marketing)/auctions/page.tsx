import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Calendar, Gavel, MapPin, ArrowRight, Package } from 'lucide-react'
import { cn } from '@/lib/utils'
import SearchBar from '@/components/layout/SearchBar'
import AuctionCard from '@/components/auction/AuctionCard'

export default async function AuctionsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const supabase = await createClient()
  const { q } = await searchParams
  
  if (q) {
    // 1. Search Logic for Lots (Auctions)
    const { data: lots } = await supabase
      .from('auctions')
      .select(`
        *,
        categories(name),
        auction_images(url)
      `)
      .or(`title.ilike.%${q}%,description.ilike.%${q}%`)
      .eq('status', 'live')
      .order('created_at', { ascending: false })

    return (
      <div className="min-h-screen bg-light/30 pb-20">
        <div className="bg-primary text-white py-16 border-b-4 border-secondary">
          <div className="max-w-7xl mx-auto px-6">
            <h1 className="text-4xl font-black uppercase tracking-tighter mb-4 italic">Search Results</h1>
            <p className="text-white/70 font-bold uppercase tracking-widest text-xs">
              Showing results for: <span className="text-secondary">"{q}"</span>
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 -mt-8">
          <div className="max-w-4xl mb-12">
            <SearchBar />
          </div>

          {!lots || lots.length === 0 ? (
            <div className="bg-white border-4 border-primary p-20 text-center shadow-[12px_12px_0px_0px_rgba(11,43,83,1)]">
              <Package className="h-16 w-16 text-neutral/20 mx-auto mb-6" />
              <h2 className="text-3xl font-black uppercase italic text-primary mb-4">No lots found</h2>
              <p className="text-neutral/60 font-medium italic mb-8">We couldn't find any industrial assets matching your search criteria.</p>
              <Link href="/auctions" className="bg-primary text-white px-8 py-4 font-black uppercase text-xs tracking-widest hover:bg-secondary transition-colors italic shadow-[4px_4px_0px_0px_rgba(11,43,83,0.2)]">
                Browse All Events
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {lots.map((lot) => (
                <AuctionCard 
                  key={lot.id} 
                  product={{
                    id: lot.id,
                    title: lot.title,
                    supplier: lot.categories?.name || 'General Industrial',
                    price: Number(lot.current_price),
                    endsAt: new Date(lot.ends_at).toLocaleDateString(),
                    image: lot.image_url || lot.auction_images?.[0]?.url || "/images/placeholder.jpg",
                    bidCount: 0, // In a real app, we'd count bids
                    description: lot.description,
                    minIncrement: Number(lot.min_increment)
                  }} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // 2. Default View: List Events
  const { data: events } = await supabase
    .from('auction_events')
    .select('*')
    .neq('status', 'draft')
    .order('start_at', { ascending: true })

  return (
    <div className="min-h-screen bg-light/30 pb-20">
      <div className="bg-secondary text-white py-20 border-b-4 border-primary">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-6xl font-black uppercase tracking-tighter mb-4 italic">Upcoming Events</h1>
          <p className="text-primary font-bold uppercase tracking-widest text-sm">Industrial & Commercial Liquidations</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-10">
        <div className="max-w-4xl mb-12">
          <SearchBar />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events?.map((event) => (
            <Link 
              href={`/events/${event.id}`} 
              key={event.id}
              className="group flex flex-col border-2 border-primary transition-all hover:shadow-[12px_12px_0px_0px_rgba(11,43,83,1)] bg-white h-full"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden border-b-2 border-primary">
                {event.image_url ? (
                  <img src={event.image_url} alt={event.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-50">
                    <Package className="h-12 w-12 text-zinc-200" />
                  </div>
                )}
                <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 font-black uppercase text-[10px] tracking-widest z-10">
                  {event.status}
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1">
                <h2 className="text-2xl font-black uppercase tracking-tighter mb-4 group-hover:text-primary transition-colors leading-none h-12 line-clamp-2 italic">
                  {event.title}
                </h2>
                
                <p className="text-neutral/60 text-xs font-medium mb-6 line-clamp-2 italic">
                  {event.description}
                </p>
                
                <div className="mt-auto space-y-4 pt-6 border-t border-light">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Calendar className="text-primary" size={16} />
                      <span className="text-[10px] font-black uppercase text-secondary">Ends {new Date(event.ends_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Gavel className="text-primary" size={16} />
                      <span className="text-[10px] font-black uppercase text-secondary">${Number(event.deposit_amount).toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="bg-secondary group-hover:bg-primary py-3 text-center text-white font-black uppercase text-[10px] tracking-[0.2em] transition-colors">
                    View Full Catalog →
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
