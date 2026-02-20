import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Calendar, Gavel, MapPin, ArrowRight, Package, LayoutGrid, SlidersHorizontal, ChevronRight, Globe2, BarChart3, History } from 'lucide-react'
import { cn } from '@/lib/utils'
import SearchBar from '@/components/layout/SearchBar'
import AuctionCard from '@/components/auction/AuctionCard'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Live Auctions Catalog",
  description: "Explore our comprehensive catalog of upcoming and live industrial auctions. Find machinery, commercial furniture, and surplus tech equipment.",
}

export default async function AuctionsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string, category?: string, page?: string, filter?: 'live' | 'upcoming' | 'past' }>
}) {
  const supabase = await createClient()
  const params = await searchParams
  const { q, category, page } = params
  let filter = params.filter
  const currentPage = parseInt(page || '1')
  const PAGE_SIZE_LOTS = 12
  const PAGE_SIZE_EVENTS = 9

  // Fetch all categories for the sidebar
  const { data: categories } = await supabase.from('categories').select('*').order('name')
  
  // Fetch user once for the whole page
  const { data: { user } } = await supabase.auth.getUser()

  // 1. If searching or filtering by category, show Lots (Search Mode)
  if (q || category) {
    let query = supabase
        .from('auctions')
        .select(`
            *,
            lot_number,
            categories(name),
            auction_images(url),
            auction_events(id, location, ends_at),
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

    // 1b. Fetch Archives (Sold/Ended) for the same query
    let archiveQuery = supabase
        .from('auctions')
        .select(`
            *,
            lot_number,
            categories(name),
            auction_images(url),
            auction_events(id, location, ends_at),
            bids(count)
        `)
        .in('status', ['sold', 'ended'])

    if (q) archiveQuery = archiveQuery.or(`title.ilike.%${q}%,description.ilike.%${q}%`)
    if (category) archiveQuery = archiveQuery.eq('category_id', category)

    const { data: archives } = await archiveQuery
        .order('ends_at', { ascending: false })
        .limit(6)

    const totalPages = Math.ceil((count || 0) / PAGE_SIZE_LOTS)

    return (
        <div className="min-h-screen bg-zinc-50 pb-20">
            {/* SaaS Header Section */}
            <div className="bg-white border-b border-zinc-100 pt-16 pb-12">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="h-1 w-8 bg-primary rounded-full" />
                                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Search Catalog</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-secondary italic font-display uppercase leading-none mb-4">
                                {q ? `Results for "${q}"` : 'Filtered Assets'}
                            </h1>
                            <Link href="/auctions" className="text-zinc-400 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 hover:text-primary transition-colors group">
                                <ArrowRight className="rotate-180 h-3 w-3 group-hover:-translate-x-1 transition-transform" /> Back to All Events
                            </Link>
                        </div>
                        <div className="w-full md:w-[450px]">
                            <SearchBar />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex flex-col lg:flex-row gap-12">
                    <aside className="lg:w-64 shrink-0">
                        <div className="sticky top-32 space-y-10">
                            <div>
                                <div className="flex items-center gap-2 mb-6">
                                    <SlidersHorizontal size={14} className="text-primary" />
                                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-secondary italic">Refine Search</h3>
                                </div>
                                <nav className="flex flex-col gap-1.5">
                                    {categories?.map((cat) => (
                                        <Link 
                                            key={cat.id}
                                            href={`/auctions?category=${cat.id}${q ? `&q=${q}` : ''}`}
                                            className={cn(
                                                "px-4 py-2.5 text-[11px] font-bold uppercase tracking-tight transition-all rounded-xl border flex items-center justify-between group",
                                                category === cat.id 
                                                    ? "bg-secondary text-white border-secondary shadow-lg shadow-secondary/10" 
                                                    : "bg-white text-zinc-500 border-zinc-100 hover:border-zinc-200 hover:text-secondary"
                                            )}
                                        >
                                            {cat.name}
                                            {category === cat.id && <ChevronRight size={14} className="text-primary" />}
                                        </Link>
                                    ))}
                                </nav>
                            </div>

                            <div className="p-6 bg-zinc-900 rounded-3xl text-white relative overflow-hidden italic shadow-xl shadow-black/5">
                                <div className="relative z-10">
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Pro Tip</h4>
                                    <p className="text-[11px] font-medium opacity-60 leading-relaxed uppercase">Use proxy bidding to secure assets automatically at the best price.</p>
                                </div>
                                <div className="absolute -bottom-4 -right-4 h-20 w-20 bg-primary/10 blur-2xl rounded-full"></div>
                            </div>
                        </div>
                    </aside>

                    <div className="flex-1 min-w-0">
                        {lots && lots.length > 0 ? (
                            <>
                                <div className="flex items-center gap-3 mb-10 border-b border-zinc-100 pb-6">
                                    <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                                    <span className="text-[11px] font-bold text-zinc-900 uppercase tracking-widest">Active Bidding • {count} results</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-16">
                                    {lots?.map((lot) => (
                                        <AuctionCard 
                                            key={lot.id} 
                                            user={user}
                                            product={{
                                                id: lot.id,
                                                event_id: lot.auction_events?.id,
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
                            </>
                        ) : (
                            <div className="py-24 text-center bg-white rounded-[48px] border border-zinc-100 shadow-sm italic mb-16 px-10">
                                <Package size={48} className="mx-auto text-zinc-100 mb-6" />
                                <p className="text-zinc-300 font-bold uppercase text-xl tracking-tighter max-w-sm mx-auto">No active assets matching your protocol in the current live inventory.</p>
                            </div>
                        )}

                        {/* ARCHIVE SECTION */}
                        {archives && archives.length > 0 && (
                            <div className="mt-20">
                                <div className="flex items-center gap-3 mb-10 border-b border-zinc-100 pb-6">
                                    <History size={18} className="text-zinc-300" />
                                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest italic">Sold / Ended Archives</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 opacity-60 grayscale-[0.5] hover:grayscale-0 transition-all">
                                    {archives.map((lot) => (
                                        <AuctionCard 
                                            key={lot.id} 
                                            user={user}
                                            product={{
                                                id: lot.id,
                                                event_id: lot.auction_events?.id,
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
                            </div>
                        )}

                        {totalPages > 1 && (
                            <div className="mt-16">
                                <Pagination 
                                    currentPage={currentPage} 
                                    totalPages={totalPages} 
                                    baseUrl="/auctions" 
                                    queryParams={{ q, category }} 
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )

  }

  // 2. DEFAULT VIEW: Show Events Grid with Tabs & Auto-Fallback
  const now = new Date().toISOString()

  // Pre-fetch counts to determine default tab if none or if current is empty
  const { count: liveCount } = await supabase.from('auction_events').select('*', { count: 'exact', head: true }).eq('status', 'live').lte('start_at', now).gt('ends_at', now)
  const { count: upcomingCount } = await supabase.from('auction_events').select('*', { count: 'exact', head: true }).or(`status.eq.scheduled,and(status.eq.live,start_at.gt.${now})`)
  
  // Auto-fallback logic
  if (!filter || (filter === 'live' && !liveCount)) {
    if (liveCount) filter = 'live'
    else if (upcomingCount) filter = 'upcoming'
    else filter = 'past'
  }

  const from = (currentPage - 1) * PAGE_SIZE_EVENTS
  const to = from + PAGE_SIZE_EVENTS - 1

  let eventQuery = supabase
    .from('auction_events')
    .select('*', { count: 'exact' })
    .neq('status', 'draft')

  if (filter === 'live') {
    eventQuery = eventQuery.eq('status', 'live').lte('start_at', now).gt('ends_at', now)
  } else if (filter === 'upcoming') {
    eventQuery = eventQuery.or(`status.eq.scheduled,and(status.eq.live,start_at.gt.${now})`)
  } else if (filter === 'past') {
    eventQuery = eventQuery.or(`status.eq.closed,ends_at.lte.${now}`)
  }

  const { data: events, count: eventCount } = await eventQuery
    .order(filter === 'past' ? 'ends_at' : 'start_at', { ascending: filter === 'past' ? false : true })
    .range(from, to)

  const totalEventPages = Math.ceil((eventCount || 0) / PAGE_SIZE_EVENTS)

  const tabs = [
    { id: 'live', label: 'Live Now', available: !!liveCount },
    { id: 'upcoming', label: 'Upcoming', available: !!upcomingCount },
    { id: 'past', label: 'Recent Archives', available: true }
  ]

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      {/* REDESIGNED INDUSTRIAL MARKETPLACE BANNER */}
      <div className="bg-secondary pt-32 pb-24 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-16 items-center">
                <div className="text-left italic">
                    <div className="flex items-center gap-3 mb-8">
                        <span className="h-[1px] w-10 bg-primary" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">The New Player</span>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-white mb-8 leading-[0.85] font-display uppercase">
                        Industrial <br/> <span className="text-primary">Marketplace</span>.
                    </h1>
                    <p className="text-white/40 text-lg md:text-xl font-medium leading-relaxed max-w-xl mb-10">
                        Professional B2B liquidation engine for Northern Virginia's premier enterprises.
                    </p>
                    <div className="flex flex-wrap gap-10 border-t border-white/5 pt-10">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20">
                                <Globe2 size={20} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-white uppercase tracking-widest leading-none mb-1">Global</span>
                                <span className="text-[9px] font-medium text-white/30 uppercase">Logistics Network</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20">
                                <BarChart3 size={20} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-white uppercase tracking-widest leading-none mb-1">Verified</span>
                                <span className="text-[9px] font-medium text-white/30 uppercase">Industrial Assets</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-6">
                    <div className="bg-white/5 backdrop-blur-xl p-8 md:p-12 rounded-[48px] border border-white/10 shadow-2xl relative">
                        <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-8 text-center italic opacity-80">Discover Opportunities</h3>
                        <SearchBar />
                        
                        {/* Tags / Quick Filters */}
                        <div className="mt-8 flex flex-wrap justify-center gap-2">
                            {['Machinery', 'Furniture', 'Tech', 'Medical'].map((tag) => (
                                <span key={tag} className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-bold text-white/40 uppercase tracking-tighter border border-white/5">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        {/* Abstract background depth */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 bg-primary/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-20">
        {/* Tab Selection */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 border-b border-zinc-200 pb-8">
            <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-2.5 rounded-2xl text-primary">
                    <Calendar size={24} />
                </div>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-secondary font-display uppercase italic">Market Events</h2>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{eventCount} Events in this protocol</p>
                </div>
            </div>

            <nav className="flex items-center bg-white p-1.5 rounded-2xl border border-zinc-100 shadow-sm">
                {tabs.map((tab) => (
                    <Link
                        key={tab.id}
                        href={`/auctions?filter=${tab.id}`}
                        className={cn(
                            "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative",
                            filter === tab.id 
                                ? "bg-secondary text-white shadow-lg shadow-secondary/20 italic" 
                                : "text-zinc-400 hover:text-secondary hover:bg-zinc-50"
                        )}
                    >
                        {tab.label}
                        {tab.id === 'live' && tab.available && (
                            <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                        )}
                    </Link>
                ))}
            </nav>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-16">
          {events?.map((event) => {
            const isEnded = new Date(event.ends_at) <= new Date();
            const isUpcoming = new Date(event.start_at) > new Date();
            const displayStatus = isEnded ? 'closed' : (isUpcoming ? 'upcoming' : event.status);

            return (
              <Link 
                href={`/events/${event.id}`} 
                key={event.id}
                className={cn(
                  "group flex flex-col bg-white border border-zinc-100 rounded-[32px] overflow-hidden transition-all duration-500 hover:shadow-[0_30px_60px_rgba(11,43,83,0.08)] hover:-translate-y-2 h-full",
                  filter === 'past' && "grayscale-[0.5] opacity-80 hover:grayscale-0 hover:opacity-100"
                )}
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-50 border-b border-zinc-100">
                  {event.image_url ? (
                    <img src={event.image_url} alt={event.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center italic font-bold text-zinc-200 text-xs p-10 text-center uppercase">
                      {event.title}
                    </div>
                  )}
                  <div className="absolute top-6 left-6 flex gap-2 items-center z-10">
                    {displayStatus === 'live' ? (
                      <div className="bg-rose-500 text-white px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-rose-500/20 animate-in fade-in zoom-in duration-500">
                          <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                          </span>
                          Live
                      </div>
                    ) : (
                      <div className={cn(
                        "px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm transition-all",
                        displayStatus === 'closed' ? "bg-zinc-900 text-white border-zinc-900" : 
                        displayStatus === 'upcoming' ? "bg-blue-500 text-white border-blue-500" :
                        "bg-white/90 backdrop-blur-md text-secondary border-white/20"
                      )}>
                        {displayStatus}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-8 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-4 text-zinc-400">
                      <Calendar size={14} className="text-primary" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                          {isEnded ? 'Event Ended' : (isUpcoming ? `Starts ${new Date(event.start_at).toLocaleDateString()}` : `Ends ${new Date(event.ends_at).toLocaleDateString()}`)}
                      </span>
                  </div>

                  <h2 className="text-2xl font-bold text-secondary mb-4 group-hover:text-primary transition-colors italic font-display uppercase leading-tight h-14 line-clamp-2">
                    {event.title}
                  </h2>
                  
                  <p className="text-zinc-400 text-[11px] font-medium mb-8 line-clamp-3 uppercase leading-relaxed italic">
                    {event.description}
                  </p>
                  
                  <div className="mt-auto pt-6 border-t border-zinc-50 flex justify-between items-center">
                      {isEnded ? (
                          <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-zinc-300" />
                              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest italic">Auction Closed</span>
                          </div>
                      ) : (
                          <div className="flex items-center gap-2">
                              <div className={cn(
                                "h-2 w-2 rounded-full animate-pulse",
                                isUpcoming ? "bg-blue-500" : "bg-emerald-500"
                              )} />
                              <span className="text-[10px] font-bold text-zinc-900 uppercase tracking-widest italic">
                                  {isUpcoming ? 'Opening Soon' : 'Open for Bidding'}
                              </span>
                          </div>
                      )}
                      <div className="bg-zinc-50 group-hover:bg-primary p-4 rounded-2xl transition-all border border-zinc-100 group-hover:border-primary group-hover:text-white">
                          <ArrowRight size={20} />
                      </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {totalEventPages > 1 && (
            <Pagination 
                currentPage={currentPage} 
                totalPages={totalEventPages} 
                baseUrl="/auctions" 
                queryParams={{ filter }}
            />
        )}

        {(!events || events.length === 0) && (
            <div className="py-32 text-center bg-white rounded-[48px] border border-zinc-100 shadow-sm italic px-10">
                <Package size={48} className="mx-auto text-zinc-100 mb-6" />
                <p className="text-zinc-300 font-bold uppercase text-2xl tracking-tighter max-w-sm mx-auto">No events found matching this protocol window.</p>
                <Link href="/auctions?filter=live" className="mt-8 inline-flex items-center gap-2 bg-secondary text-white px-8 py-4 rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-primary transition-all">
                    Reset Protocol <ArrowRight size={14} />
                </Link>
            </div>
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
                    currentPage === totalPages ? "opacity-30 soul-not-allowed" : "bg-white text-zinc-500 hover:border-primary hover:text-primary active:scale-95"
                )}
            >
                Next
            </Link>
        </div>
    )
}
