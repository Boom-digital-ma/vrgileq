import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Calendar, Gavel, MapPin, ArrowRight, Package } from 'lucide-react'
import { cn } from '@/lib/utils'
import SearchBar from '@/components/layout/SearchBar'
import AuctionCard from '@/components/auction/AuctionCard'

export default async function AuctionsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string, category?: string, page?: string }>
}) {
  const supabase = await createClient()
  const { q, category, page } = await searchParams
  const currentPage = parseInt(page || '1')
  const PAGE_SIZE_LOTS = 12
  const PAGE_SIZE_EVENTS = 9

  // Fetch all categories for the sidebar
  const { data: categories } = await supabase.from('categories').select('*').order('name')

  // 1. If searching or filtering by category, show Lots (Search Mode)
  if (q || category) {
    let query = supabase
        .from('auctions')
        .select(`
            *,
            lot_number,
            categories(name),
            auction_images(url),
            auction_events(location, ends_at),
            bids(count)
        `, { count: 'exact' })
        .eq('status', 'live')

    if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`)
    if (category) query = query.eq('category_id', category)

    const from = (currentPage - 1) * PAGE_SIZE_LOTS
    const to = from + PAGE_SIZE_LOTS - 1

    const { data: lots, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to)

    const totalPages = Math.ceil((count || 0) / PAGE_SIZE_LOTS)

    return (
        <div className="min-h-screen bg-light/30 pb-20">
            <div className="bg-secondary text-white py-16 border-b-4 border-primary">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-2 italic leading-none">
                                {q ? 'Search Results' : 'Filtered Catalog'}
                            </h1>
                            <Link href="/auctions" className="text-primary font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 hover:underline">
                                <ArrowRight className="rotate-180 h-3 w-3" /> Back to All Events
                            </Link>
                        </div>
                        <div className="w-full md:w-96">
                            <SearchBar />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex flex-col lg:flex-row gap-12">
                    <aside className="lg:w-64 shrink-0 space-y-10">
                        <div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary mb-6 border-b-2 border-primary pb-2 italic">Refine Search</h3>
                            <nav className="flex flex-col gap-2">
                                {categories?.map((cat) => (
                                    <Link 
                                        key={cat.id}
                                        href={`/auctions?category=${cat.id}${q ? `&q=${q}` : ''}`}
                                        className={cn(
                                            "px-4 py-3 text-[10px] font-black uppercase tracking-widest border-2 transition-all",
                                            category === cat.id ? "bg-primary text-white border-primary shadow-[4px_4px_0px_0px_rgba(11,43,83,1)] italic" : "text-neutral border-transparent hover:border-light hover:bg-white"
                                        )}
                                    >
                                        {cat.name}
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    </aside>

                    <div className="flex-1 min-w-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-16">
                            {lots?.map((lot) => (
                                <AuctionCard 
                                    key={lot.id} 
                                    product={{
                                        id: lot.id,
                                        lotNumber: lot.lot_number,
                                        title: lot.title,
                                        supplier: lot.categories?.name || 'General Industrial',
                                        price: Number(lot.current_price),
                                        endsAt: lot.ends_at || lot.auction_events?.ends_at,
                                        image: lot.image_url || lot.auction_images?.[0]?.url || "/images/placeholder.jpg",
                                        images: [
                                            ...(lot.image_url ? [lot.image_url] : []),
                                            ...(lot.auction_images?.map((i: any) => i.url) || [])
                                        ].filter((v, i, a) => a.indexOf(v) === i),
                                        bidCount: lot.bids?.[0]?.count || 0,
                                        pickupLocation: lot.auction_events?.location,
                                        description: lot.description,
                                        minIncrement: Number(lot.min_increment)
                                    }} 
                                />
                            ))}
                        </div>

                        {/* Pagination Lots */}
                        {totalPages > 1 && (
                            <Pagination 
                                currentPage={currentPage} 
                                totalPages={totalPages} 
                                baseUrl="/auctions" 
                                queryParams={{ q, category }} 
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
  }

  // 2. DEFAULT VIEW: Show Events Grid
  const from = (currentPage - 1) * PAGE_SIZE_EVENTS
  const to = from + PAGE_SIZE_EVENTS - 1

  const { data: events, count: eventCount } = await supabase
    .from('auction_events')
    .select('*', { count: 'exact' })
    .neq('status', 'draft')
    .order('start_at', { ascending: true })
    .range(from, to)

  const totalEventPages = Math.ceil((eventCount || 0) / PAGE_SIZE_EVENTS)

  return (
    <div className="min-h-screen bg-light/30 pb-20">
      <div className="bg-secondary text-white py-24 border-b-4 border-primary">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-6 italic leading-none">Auction Events</h1>
          <p className="text-primary font-black uppercase tracking-[0.3em] text-sm">Industrial & Commercial Liquidations</p>
          
          <div className="max-w-2xl mx-auto mt-12">
            <SearchBar />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex items-center gap-4 mb-12 border-b-2 border-primary pb-4">
            <Calendar className="text-primary" size={24} />
            <h2 className="text-2xl font-black uppercase tracking-tighter italic">Currently Open for Bidding</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-16">
          {events?.map((event) => (
            <Link 
              href={`/events/${event.id}`} 
              key={event.id}
              className="group flex flex-col border-2 border-primary transition-all hover:shadow-[16px_16px_0px_0px_rgba(11,43,83,1)] bg-white h-full"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden border-b-2 border-primary">
                {event.image_url ? (
                  <img src={event.image_url} alt={event.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-50 italic font-black text-zinc-200 text-xs p-10 text-center uppercase">
                    {event.title}
                  </div>
                )}
                <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 font-black uppercase text-[10px] tracking-widest z-10 shadow-[4px_4px_0px_0px_rgba(11,43,83,1)]">
                  {event.status}
                </div>
              </div>

              <div className="p-8 flex flex-col flex-1">
                <h2 className="text-2xl font-black uppercase tracking-tighter mb-4 group-hover:text-primary transition-colors leading-tight h-14 line-clamp-2 italic">
                  {event.title}
                </h2>
                
                <p className="text-neutral/60 text-xs font-medium mb-8 line-clamp-3 italic leading-relaxed">
                  {event.description}
                </p>
                
                <div className="mt-auto space-y-6 pt-6 border-t border-light">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="bg-light/30 p-1.5"><Calendar className="text-primary" size={16} /></div>
                      <span className="text-[10px] font-black uppercase text-secondary">Ends {new Date(event.ends_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="bg-light/30 p-1.5"><Gavel className="text-primary" size={16} /></div>
                      <span className="text-[10px] font-black uppercase text-secondary">${Number(event.deposit_amount).toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="bg-secondary group-hover:bg-primary py-4 text-center text-white font-black uppercase text-[10px] tracking-[0.3em] transition-all shadow-[4px_4px_0px_0px_rgba(4,154,158,0.2)] group-hover:shadow-none italic">
                    Open Catalog →
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination Events */}
        {totalEventPages > 1 && (
            <Pagination 
                currentPage={currentPage} 
                totalPages={totalEventPages} 
                baseUrl="/auctions" 
            />
        )}
      </div>
    </div>
  )
}

function Pagination({ 
    currentPage, 
    totalPages, 
    baseUrl, 
    queryParams = {} 
}: { 
    currentPage: number, 
    totalPages: number, 
    baseUrl: string,
    queryParams?: Record<string, any>
}) {
    const buildUrl = (p: number) => {
        const params = new URLSearchParams()
        Object.entries(queryParams).forEach(([k, v]) => {
            if (v) params.set(k, v)
        })
        params.set('page', p.toString())
        return `${baseUrl}?${params.toString()}`
    }

    return (
        <div className="flex justify-center items-center gap-4">
            <Link 
                href={currentPage > 1 ? buildUrl(currentPage - 1) : '#'}
                className={cn(
                    "px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] border-2 border-primary transition-all shadow-[4px_4px_0px_0px_rgba(11,43,83,1)]",
                    currentPage === 1 ? "opacity-30 cursor-not-allowed" : "bg-white text-primary hover:bg-primary hover:text-white active:translate-y-1 active:shadow-none"
                )}
            >
                Prev
            </Link>
            
            <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                    <Link 
                        key={i}
                        href={buildUrl(i + 1)}
                        className={cn(
                            "w-10 h-10 flex items-center justify-center text-[10px] font-black border-2 transition-all",
                            currentPage === i + 1 
                                ? "bg-primary text-white border-primary shadow-[4px_4px_0px_0px_rgba(11,43,83,1)] scale-110 italic" 
                                : "bg-white text-neutral border-light hover:border-primary"
                        )}
                    >
                        {i + 1}
                    </Link>
                ))}
            </div>

            <Link 
                href={currentPage < totalPages ? buildUrl(currentPage + 1) : '#'}
                className={cn(
                    "px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] border-2 border-primary transition-all shadow-[4px_4px_0px_0px_rgba(11,43,83,1)]",
                    currentPage === totalPages ? "opacity-30 cursor-not-allowed" : "bg-white text-primary hover:bg-primary hover:text-white active:translate-y-1 active:shadow-none"
                )}
            >
                Next
            </Link>
        </div>
    )
}
