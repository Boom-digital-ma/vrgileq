import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import AuctionCard from '@/components/auction/AuctionCard'
import { ShieldCheck, Info, Timer, LayoutGrid, Calendar, Gavel, ArrowRight, ChevronRight, SlidersHorizontal, MapPin, Package } from 'lucide-react'
import RegistrationButton from '@/components/auction/RegistrationButton'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data: event } = await supabase.from('auction_events').select('title, description').eq('id', id).single()
  
  return {
    title: event?.title || "Auction Event",
    description: event?.description?.slice(0, 160) || "Participate in this industrial auction event at Virginia Liquidation.",
  }
}

export default async function EventPage({ 
    params,
    searchParams
}: { 
    params: Promise<{ id: string }>,
    searchParams: Promise<{ category?: string, page?: string }>
}) {
  const { id } = await params
  const { category, page } = await searchParams
  const currentPage = parseInt(page || '1')
  const PAGE_SIZE = 12
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // 1. Fetch event details
  const { data: event } = await supabase
    .from('auction_events')
    .select('*')
    .eq('id', id)
    .single()

  if (!event) notFound()

  // 2. Fetch categories present in THIS event
  const { data: eventCategories } = await supabase
    .from('auctions')
    .select('categories(id, name)')
    .eq('event_id', id)
    .not('category_id', 'is', null)

  const uniqueCategories = Array.from(new Set(eventCategories?.map(c => JSON.stringify(c.categories))))
    .map(s => JSON.parse(s))
    .sort((a, b) => a.name.localeCompare(b.name))

  // 3. Fetch lots
  let query = supabase
    .from('auctions')
    .select('*, categories(name), bids(count), auction_images(url), auction_events(location), lot_number', { count: 'exact' })
    .eq('event_id', id)

  if (category) {
    query = query.eq('category_id', category)
  }

  const from = (currentPage - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const { data: lots, count } = await query
    .order('lot_number', { ascending: true })
    .range(from, to)

  const totalPages = Math.ceil((count || 0) / PAGE_SIZE)

  const mappedLots = lots?.map(lot => ({
    id: lot.id,
    event_id: lot.event_id,
    lotNumber: lot.lot_number,
    title: lot.title,
    supplier: lot.categories?.name || "Industrial Liquidation",
    price: Number(lot.current_price),
    endsAt: lot.ends_at,
    startAt: event.start_at,
    image: lot.image_url || "/images/placeholder.jpg",
    images: [
        ...(lot.image_url ? [lot.image_url] : []),
        ...(lot.auction_images?.map((i: any) => i.url) || [])
    ].filter((v, i, a) => a.indexOf(v) === i),
    bidCount: lot.bids?.[0]?.count || 0,
    pickupLocation: (lot.auction_events as any)?.location,
    description: lot.description,
    minIncrement: Number(lot.min_increment)
  })) || []

  return (
    <div className="min-h-screen bg-zinc-50 pb-20 font-sans antialiased text-secondary">
      {/* SaaS Premium Event Header */}
      <div className="bg-white border-b border-zinc-100 pt-20 pb-16 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-12">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-1 w-8 bg-primary rounded-full" />
                {(() => {
                  const isEnded = new Date(event.ends_at) <= new Date();
                  const displayStatus = isEnded && event.status === 'live' ? 'closed' : event.status;
                  return (
                    <span className={cn(
                      "px-3 py-1 rounded-full font-bold uppercase text-[10px] tracking-widest border italic transition-all",
                      displayStatus === 'live' ? "bg-primary/5 text-primary border-primary/10" : 
                      displayStatus === 'closed' ? "bg-zinc-900 text-white border-zinc-900" :
                      "bg-zinc-50 text-zinc-400 border-zinc-100"
                    )}>
                        {displayStatus} Event
                    </span>
                  );
                })()}
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-[0.9] italic font-display uppercase">
                {event.title}
              </h1>
              
              <p className="text-zinc-400 font-medium italic text-lg md:text-xl leading-relaxed mb-10 uppercase">
                {event.description}
              </p>
              
              <div className="flex flex-wrap gap-10 border-t border-zinc-50 pt-10">
                <div className="flex items-center gap-4 group">
                  <div className="bg-zinc-50 p-3 rounded-2xl border border-zinc-100 group-hover:bg-primary/10 transition-colors">
                    <Timer className="text-primary" size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-zinc-300 tracking-widest leading-none mb-1">Ending On</p>
                    <p className="font-bold text-secondary italic uppercase">{new Date(event.ends_at).toLocaleDateString()} @ {new Date(event.ends_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="bg-zinc-50 p-3 rounded-2xl border border-zinc-100 group-hover:bg-primary/10 transition-colors">
                    <ShieldCheck className="text-primary" size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-zinc-300 tracking-widest leading-none mb-1">Bidding Hold</p>
                    <p className="font-bold text-secondary italic uppercase">${Number(event.deposit_amount).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Registration Card */}
            <div className="w-full lg:w-[400px] bg-secondary rounded-[40px] p-10 relative overflow-hidden shadow-2xl shadow-secondary/20 italic text-white group hover:-translate-y-1 transition-all duration-500">
              <div className="relative z-10">
                <h3 className="text-2xl font-bold uppercase tracking-tight mb-4 font-display">Bidding <span className="text-primary">Passport</span></h3>
                <p className="text-sm font-medium text-white/50 mb-8 leading-relaxed">
                    A security deposit of ${Number(event.deposit_amount).toLocaleString()} is required to enable bidding protocols for this event. 
                </p>
                
                <RegistrationButton eventId={event.id} depositAmount={Number(event.deposit_amount)} />
                
                <div className="mt-6 flex items-center gap-2 text-[10px] text-white/30 font-bold uppercase tracking-widest">
                    <Info size={14} className="text-primary" /> Verified members only
                </div>
              </div>
              {/* Background Glow */}
              <div className="absolute -bottom-12 -right-12 h-40 w-40 bg-primary/20 blur-[60px] rounded-full group-hover:scale-150 transition-transform duration-700" />
            </div>
          </div>
        </div>
        {/* Subtle texture background */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent opacity-50" />
      </div>

      {/* Grid Content Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex flex-col lg:flex-row gap-12">
            {/* SaaS Refined Sidebar */}
            <aside className="lg:w-64 shrink-0">
                <div className="sticky top-32 space-y-10">
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <SlidersHorizontal size={14} className="text-primary" />
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-secondary italic">Inventory Categories</h3>
                        </div>
                        <nav className="flex flex-col gap-1.5">
                            <Link 
                                href={`/events/${id}`}
                                className={cn(
                                    "px-4 py-3 text-[11px] font-bold uppercase tracking-tight border flex items-center justify-between rounded-xl transition-all",
                                    !category 
                                        ? "bg-secondary text-white border-secondary shadow-lg shadow-secondary/10" 
                                        : "bg-white text-zinc-500 border-zinc-100 hover:border-zinc-300"
                                )}
                            >
                                All Lots
                                {!category && <ChevronRight size={14} className="text-primary" />}
                            </Link>
                            {uniqueCategories.map((cat: any) => (
                                <Link 
                                    key={cat.id}
                                    href={`/events/${id}?category=${cat.id}`}
                                    className={cn(
                                        "px-4 py-3 text-[11px] font-bold uppercase tracking-tight border flex items-center justify-between rounded-xl transition-all",
                                        category === cat.id 
                                            ? "bg-secondary text-white border-secondary shadow-lg shadow-secondary/10" 
                                            : "bg-white text-zinc-500 border-zinc-100 hover:border-zinc-300"
                                    )}
                                >
                                    {cat.name}
                                    {category === cat.id && <ChevronRight size={14} className="text-primary" />}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div className="bg-primary/10 rounded-3xl p-6 border border-primary/20 italic">
                        <h4 className="font-bold uppercase text-[10px] text-primary mb-3 tracking-widest flex items-center gap-2">
                            <MapPin size={12} /> Inspection
                        </h4>
                        <p className="text-[10px] font-medium text-primary/70 uppercase leading-relaxed leading-relaxed">Most items available for on-site inspection. Contact support to schedule.</p>
                    </div>
                </div>
            </aside>

            {/* Lot Catalog Grid */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-12 border-b border-zinc-200 pb-8">
                    <div className="flex items-center gap-4">
                        <div className="bg-primary/10 p-2.5 rounded-2xl text-primary">
                            <LayoutGrid size={24} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight text-secondary font-display uppercase italic">
                                {category ? 'Filtered Selection' : 'Event Catalog'}
                            </h2>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{count} Assets available</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {mappedLots.map((product) => (
                        <AuctionCard key={product.id} product={product} user={user} />
                    ))}
                </div>

                {/* SaaS Pagination */}
                {totalPages > 1 && (
                    <div className="mt-16 pt-12 border-t border-zinc-100">
                        <Pagination 
                            currentPage={currentPage} 
                            totalPages={totalPages} 
                            baseUrl={`/events/${id}`} 
                            queryParams={{ category }}
                        />
                    </div>
                )}

                {mappedLots.length === 0 && (
                    <div className="py-32 text-center bg-white rounded-[48px] border border-zinc-100 shadow-sm italic">
                        <Package size={48} className="mx-auto text-zinc-100 mb-6" />
                        <p className="text-zinc-300 font-bold uppercase text-2xl tracking-tighter">No assets found in this category</p>
                        <Link href={`/events/${id}`} className="mt-8 inline-flex items-center gap-2 bg-secondary text-white px-8 py-4 rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-primary transition-all">
                            View Full Catalog <ArrowRight size={14} />
                        </Link>
                    </div>
                )}
            </div>
        </div>
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
        <div className="flex justify-center items-center gap-3">
            <Link 
                href={currentPage > 1 ? buildUrl(currentPage - 1) : '#'}
                className={cn(
                    "px-6 py-3 text-[10px] font-bold uppercase tracking-widest border border-zinc-200 rounded-2xl transition-all",
                    currentPage === 1 ? "opacity-30 cursor-not-allowed" : "bg-white text-zinc-500 hover:border-primary hover:text-primary active:scale-95"
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
                            "w-10 h-10 flex items-center justify-center text-[10px] font-bold border rounded-xl transition-all",
                            currentPage === i + 1 
                                ? "bg-secondary text-white border-secondary shadow-lg shadow-secondary/10 italic scale-110" 
                                : "bg-white text-zinc-400 border-zinc-100 hover:border-zinc-200"
                        )}
                    >
                        {i + 1}
                    </Link>
                ))}
            </div>
            <Link 
                href={currentPage < totalPages ? buildUrl(currentPage + 1) : '#'}
                className={cn(
                    "px-6 py-3 text-[10px] font-bold uppercase tracking-widest border border-zinc-200 rounded-2xl transition-all",
                    currentPage === totalPages ? "opacity-30 cursor-not-allowed" : "bg-white text-zinc-500 hover:border-primary hover:text-primary active:scale-95"
                )}
            >
                Next
            </Link>
        </div>
    )
}
