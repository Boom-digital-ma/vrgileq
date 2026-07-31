import { createClient, createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Gavel, MapPin, ArrowRight, Package, LayoutGrid, SlidersHorizontal, ChevronRight, Globe2, BarChart3, History, ShieldCheck, Zap, Truck, TrendingUp, Eye } from 'lucide-react'
import { cn, formatEventDate } from '@/lib/utils'
import SearchBar from '@/components/layout/SearchBar'
import AuctionGrid from '@/components/auction/AuctionGrid'
import EventStatusBadge from '@/components/auction/EventStatusBadge'
import EventCardStatus from '@/components/auction/EventCardStatus'
import EventReminderButton from '@/components/auction/EventReminderButton'
import HeroSlider from "@/components/layout/HeroSlider"
import FAQAccordion from "@/components/layout/FAQAccordion"
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Maryland’s Trusted Online Liquidation Auction | Local Pickup in Beltsville",
  description: "Bid on inspected Home Depot returns, appliances, and overstock inventory. No pallets. No mystery. Serving Maryland, DC & Virginia with simple local pickup in Beltsville.",
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string, category?: string, page?: string, filter?: 'live' | 'upcoming' | 'past' | 'draft' }>
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
  
  // Fetch user and profile for role check
  const { data: { user } } = await supabase.auth.getUser()
  let userRole = 'client'
  let userProfile = null

  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role, full_name').eq('id', user.id).single()
    if (profile) {
        userRole = profile.role
        userProfile = profile
    }
  }

  const isAdmin = userRole === 'admin'
  const fetchClient = isAdmin ? createAdminClient() : supabase

  // 1. If searching or filtering by category, show Lots (Search Mode)
  if (q || category) {
    let query = fetchClient
        .from('auctions')
        .select(`
            *,
            lot_number,
            categories(name),
            auction_images(url),
            auction_events(id, location, ends_at, start_at),
            bids(count)
        `, { count: 'exact' })
    
    // Admin sees everything, others see only live
    if (!isAdmin) {
        query = query.eq('status', 'live')
    }

    if (q) {
        const trimmedQ = q.trim()
        const isNumeric = /^\d+$/.test(trimmedQ)
        const lotNumberCondition = isNumeric ? `,lot_number.eq.${trimmedQ}` : ''
        query = query.or(`title.ilike.%${trimmedQ}%,description.ilike.%${trimmedQ}%${lotNumberCondition}`)
    }
    if (category) query = query.eq('category_id', category)

    const from = (currentPage - 1) * PAGE_SIZE_LOTS
    const to = from + PAGE_SIZE_LOTS - 1

    const { data: lots, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to)

    // 1b. Fetch User Bids for these lots (for Proxy Indicators)
    let userBidsMap = new Map();
    if (user && lots && lots.length > 0) {
        const lotIds = lots.map(l => l.id);
        const { data: userBids } = await supabase
            .from('bids')
            .select('auction_id, max_amount, amount')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .in('auction_id', lotIds);
        
        userBids?.forEach((b: any) => userBidsMap.set(b.auction_id, b));
    }

    // 1c. Fetch Archives (Sold/Ended) for the same query
    let archiveQuery = supabase
        .from('auctions')
        .select(`
            *,
            lot_number,
            categories(name),
            auction_images(url),
            auction_events(id, location, ends_at, start_at),
            bids(count)
        `)
        .in('status', ['sold', 'ended'])

    if (q) {
        const trimmedQ = q.trim()
        const isNumeric = /^\d+$/.test(trimmedQ)
        const lotNumberCondition = isNumeric ? `,lot_number.eq.${trimmedQ}` : ''
        archiveQuery = archiveQuery.or(`title.ilike.%${trimmedQ}%,description.ilike.%${trimmedQ}%${lotNumberCondition}`)
    }
    if (category) archiveQuery = archiveQuery.eq('category_id', category)

    const { data: archives, count: archiveCount } = await archiveQuery
        .order('ends_at', { ascending: false })
        .range(0, 11) // First 12

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
                                {isAdmin && (
                                    <span className="bg-secondary text-white px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">Admin View</span>
                                )}
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-secondary italic font-display uppercase leading-none mb-4">
                                {q ? `Results for "${q}"` : 'Filtered Assets'}
                            </h1>
                            <Link href="/" className="text-zinc-400 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 hover:text-primary transition-colors group">
                                <ArrowRight className="rotate-180 h-3 w-3 group-hover:-translate-x-1 transition-transform" /> Back to Home
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
                                            href={`/?category=${cat.id}${q ? `&q=${q}` : ''}`}
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
                                    <span className="text-[11px] font-bold text-zinc-900 uppercase tracking-widest">
                                        {isAdmin ? "Total Inventory" : "Active Bidding"} • {count} results
                                    </span>
                                </div>

                                <AuctionGrid 
                                    products={lots?.map(lot => {
                                        const userBid = userBidsMap.get(lot.id);
                                        const sortedGallery = (lot.auction_images?.map((i: any) => i.url) || [])
                                            .sort((a: string, b: string) => a.localeCompare(b, undefined, { numeric: true }));
                                        const allImages = [
                                            ...(lot.image_url ? [lot.image_url] : []),
                                            ...sortedGallery
                                        ].filter((v, i, a) => a.indexOf(v) === i);

                                        return {
                                            id: lot.id,
                                            event_id: lot.auction_events?.id,
                                            lotNumber: lot.lot_number,
                                            title: lot.title,
                                            supplier: lot.categories?.name || 'General Industrial',
                                            price: Number(lot.current_price),
                                            endsAt: lot.ends_at || lot.auction_events?.ends_at,
                                            startAt: lot.auction_events?.start_at,
                                            image: allImages[0] || "/images/placeholder.jpg",
                                            images: allImages,
                                            bidCount: lot.bids?.[0]?.count || 0,
                                            pickupLocation: lot.auction_events?.location,
                                            description: lot.description,
                                            minIncrement: Number(lot.min_increment),
                                            userMaxBid: userBid?.max_amount,
                                            userCurrentBid: userBid?.amount,
                                            winner_id: lot.winner_id,
                                            manufacturer: lot.manufacturer,
                                            model: lot.model,
                                            status: lot.status
                                        }
                                    }) || []} 
                                    user={userProfile ? { ...user, ...userProfile } : user}
                                    searchQuery={q}
                                    categoryId={category}
                                    initialTotalCount={count || 0}
                                    status={isAdmin ? ['live', 'draft', 'scheduled'] : 'live'}
                                />
                            </>
                        ) : (
                            <div className="py-24 text-center bg-white rounded-[48px] border border-zinc-100 shadow-sm italic mb-16 px-10">
                                <Package size={48} className="mx-auto text-zinc-100 mb-6" />
                                <p className="text-zinc-300 font-bold uppercase text-xl tracking-tighter max-w-sm mx-auto">No active assets matching your criteria in the current live inventory.</p>
                            </div>
                        )}

                        {/* ARCHIVE SECTION */}
                        {archives && archives.length > 0 && (
                            <div className="mt-20">
                                <div className="flex items-center gap-3 mb-10 border-b border-zinc-100 pb-6">
                                    <History size={18} className="text-zinc-300" />
                                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest italic">Sold / Ended Archives</span>
                                </div>

                                <div className="opacity-60 grayscale-[0.5] hover:grayscale-0 transition-all">
                                    <AuctionGrid 
                                        products={archives.map((lot) => {
                                            const sortedGallery = (lot.auction_images?.map((i: any) => i.url) || [])
                                                .sort((a: string, b: string) => a.localeCompare(b, undefined, { numeric: true }));
                                            const allImages = [
                                                ...(lot.image_url ? [lot.image_url] : []),
                                                ...sortedGallery
                                            ].filter((v, i, a) => a.indexOf(v) === i);

                                            return {
                                                id: lot.id,
                                                event_id: lot.auction_events?.id,
                                                lotNumber: lot.lot_number,
                                                title: lot.title,
                                                supplier: lot.categories?.name || 'General Industrial',
                                                price: Number(lot.current_price),
                                                endsAt: lot.ends_at || lot.auction_events?.ends_at,
                                                startAt: lot.auction_events?.start_at,
                                                image: allImages[0] || "/images/placeholder.jpg",
                                                images: allImages,
                                            bidCount: lot.bids?.[0]?.count || 0,
                                            pickupLocation: lot.auction_events?.location,
                                            description: lot.description,
                                            minIncrement: Number(lot.min_increment),
                                            winner_id: lot.winner_id,
                                            manufacturer: lot.manufacturer,
                                            model: lot.model,
                                                status: lot.status
                                            };
                                        })}
                                        user={userProfile ? { ...user, ...userProfile } : user}
                                        searchQuery={q}
                                        categoryId={category}
                                        status={['sold', 'ended']}
                                        initialTotalCount={archiveCount || 0}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
  }

  // 2. DEFAULT VIEW: Home Page with Hero & Events Catalog
  const now = new Date().toISOString()

  // Pre-fetch counts to determine default tab if none or if current is empty
  const { count: liveCount } = await fetchClient.from('auction_events').select('*', { count: 'exact', head: true }).eq('status', 'live')
  const { count: upcomingCount } = await fetchClient.from('auction_events').select('*', { count: 'exact', head: true }).or(`status.eq.scheduled,and(status.eq.live,start_at.gt.${now})`)
  const { count: draftCount } = isAdmin 
    ? await fetchClient.from('auction_events').select('*', { count: 'exact', head: true }).eq('status', 'draft')
    : { count: 0 }
  
  // Auto-fallback logic
  if (!filter || (filter === 'live' && !liveCount)) {
    if (liveCount) filter = 'live'
    else if (upcomingCount) filter = 'upcoming'
    else if (draftCount && isAdmin) filter = 'draft'
    else filter = 'past'
  }

  const from = (currentPage - 1) * PAGE_SIZE_EVENTS
  const to = from + PAGE_SIZE_EVENTS - 1

  let eventQuery = fetchClient
    .from('auction_events')
    .select('*', { count: 'exact' })
  
  if (!isAdmin) {
    eventQuery = eventQuery.neq('status', 'draft')
  }

  if (filter === 'live') {
    eventQuery = eventQuery.eq('status', 'live')
  } else if (filter === 'upcoming') {
    eventQuery = eventQuery.or(`status.eq.scheduled,and(status.eq.live,start_at.gt.${now})`)
  } else if (filter === 'past') {
    eventQuery = eventQuery.eq('status', 'closed')
  } else if (filter === 'draft' && isAdmin) {
    eventQuery = eventQuery.eq('status', 'draft')
  }

  const { data: events, count: eventCount } = await eventQuery
    .order(filter === 'past' ? 'ends_at' : (filter === 'draft' ? 'created_at' : 'start_at'), { ascending: filter === 'past' || filter === 'draft' ? false : true })
    .range(from, to)

  const totalEventPages = Math.ceil((eventCount || 0) / PAGE_SIZE_EVENTS)

  const tabs = [
    { id: 'live', label: 'Live Now', available: !!liveCount },
    { id: 'upcoming', label: 'Upcoming', available: !!upcomingCount },
    ...(isAdmin ? [{ id: 'draft', label: 'Drafts (Admin)', available: !!draftCount }] : []),
    { id: 'past', label: 'Recent Archives', available: true }
  ]

  return (
    <div className="bg-zinc-50 font-sans tracking-tight text-neutral antialiased">
      <HeroSlider />

      {/* Trust Bar - Premium Secondary Light */}
      <div className="bg-secondary/5 py-6 overflow-hidden border-y border-secondary/10">
        <div className="flex whitespace-nowrap animate-[marquee_30s_linear_infinite] gap-20">
            {[1,2,3,4].map(i => (
                <div key={i} className="flex items-center gap-20 text-[10px] font-black uppercase tracking-[0.5em] text-secondary/30 italic">
                    <span>Home Depot Returns</span>
                    <span className="text-primary">•</span>
                    <span>Appliance Liquidation</span>
                    <span className="text-primary">•</span>
                    <span>Target Overstock</span>
                    <span className="text-primary">•</span>
                    <span>Beltsville Pickup</span>
                    <span className="text-primary">•</span>
                </div>
            ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-24">
        {/* Tab Selection & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16 border-b border-zinc-200 pb-12">
            <div>
                <div className="flex items-center gap-3 mb-4">
                    <span className="h-[1px] w-10 bg-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">Market Registry</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-secondary font-display uppercase italic leading-none">Market <span className="text-primary">Events</span>.</h2>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-4">{eventCount} Events currently active</p>
            </div>

            <div className="flex flex-col gap-6 items-end">
                <div className="w-full md:w-[400px]">
                    <SearchBar />
                </div>
                <nav className="flex items-center bg-white p-1.5 rounded-2xl border border-zinc-100 shadow-sm">
                    {tabs.map((tab) => (
                        <Link
                            key={tab.id}
                            href={`/?filter=${tab.id}`}
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-20">
          {events?.map((event) => {
            const now = new Date();
            const isEnded = event.status === 'closed' || (event.status !== 'live' && event.status !== 'draft' && new Date(event.ends_at) <= now);
            const isUpcoming = event.status === 'scheduled' || (event.status === 'live' && new Date(event.start_at) > now);
            
            let displayStatus = isEnded ? 'closed' : (isUpcoming ? 'upcoming' : 'live');
            if (event.status === 'draft') displayStatus = 'draft';

            return (
              <Link 
                href={`/events/${event.id}`} 
                key={event.id}
                className={cn(
                  "group flex flex-col bg-white border border-zinc-100 rounded-[40px] overflow-hidden transition-all duration-250 hover:shadow-[0_40px_80px_rgba(11,43,83,0.1)] hover:-translate-y-2 h-full",
                  filter === 'past' && "grayscale-[0.5] opacity-80 hover:grayscale-0 hover:opacity-100"
                )}
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-50 border-b border-zinc-100">
                  {event.image_url ? (
                    <Image src={event.image_url} alt={event.title} fill className="object-cover transition-transform duration-300 group-hover:scale-110" sizes="(max-width: 768px) 100vw, 400px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center italic font-bold text-zinc-200 text-xs p-10 text-center uppercase">
                      Inventory Preview Pending
                    </div>
                  )}
                  <div className="absolute top-8 left-8 flex flex-col gap-2 items-start z-10">
                    <EventStatusBadge 
                        eventId={event.id}
                        initialStatus={event.status}
                        startAt={event.start_at}
                        endsAt={event.ends_at}
                    />
                    {isUpcoming && (
                        <EventReminderButton eventId={event.id} startAt={event.start_at} isUpcoming={isUpcoming} />
                    )}
                  </div>
                </div>

                <div className="p-10 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-6 text-zinc-400">
                        <Calendar size={14} className="text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest italic">
                            {isEnded 
                            ? '' 
                            : (isUpcoming 
                                ? `Opening ${formatEventDate(event.start_at)}` 
                                : `Ends ${formatEventDate(event.ends_at)}`)
                            }
                        </span>
                    </div>
                  <h3 className="text-2xl font-black text-secondary mb-6 group-hover:text-primary transition-colors italic font-display uppercase leading-tight line-clamp-2 h-16">
                    {event.title}
                  </h3>
                  
                  <div className="mt-auto pt-8 border-t border-zinc-50 flex justify-between items-center">
                      <EventCardStatus startAt={event.start_at} endsAt={event.ends_at} status={event.status} />
                      <div className="bg-primary/10 text-primary p-4 rounded-2xl transition-all group-hover:bg-primary group-hover:text-white shadow-sm">
                          <ArrowRight size={20} strokeWidth={3} />
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
                baseUrl="/" 
                queryParams={{ filter }}
            />
        )}

        {(!events || events.length === 0) && (
            <div className="py-32 text-center bg-white rounded-[48px] border border-zinc-100 shadow-sm italic px-10">
                <Package size={48} className="mx-auto text-zinc-100 mb-6" />
                <p className="text-zinc-300 font-bold uppercase text-2xl tracking-tighter max-w-sm mx-auto">No events found matching this timeframe.</p>
                <Link href="/?filter=live" className="mt-8 inline-flex items-center gap-2 bg-secondary text-white px-8 py-4 rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-primary transition-all">
                    Reset Filters <ArrowRight size={14} />
                </Link>
            </div>
        )}
      </div>

      {/* WHY BUYERS CHOOSE US - Value Prop */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="bg-primary/5 rounded-[48px] p-12 md:p-16 text-secondary italic relative overflow-hidden flex flex-col justify-between border border-primary/10">
                    <div className="relative z-10">
                        <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center text-primary mb-8 border border-primary/10 shadow-sm">
                            <ShieldCheck size={28} />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black uppercase font-display leading-none mb-8 tracking-tighter italic">
                            Maryland's No-Pallet <br/> <span className="text-primary">Promise.</span>
                        </h2>
                        <p className="text-lg text-zinc-500 font-medium leading-relaxed mb-12 uppercase">
                            We’re not a warehouse of mystery pallets. Every item is sold individually and most inventory is inspected before listing.
                        </p>
                    </div>
                    <div className="flex gap-4 relative z-10">
                        <Link href="/how-it-works" className="text-xs font-black uppercase tracking-widest border-b-2 border-primary pb-1 hover:text-primary transition-all">
                            Explore Our Sources →
                        </Link>
                    </div>
                    <div className="absolute top-0 right-0 p-8 opacity-5 text-primary">
                        <Package size={300} />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {[
                        { title: "Individual Items", icon: Package, desc: "Never forced to buy a full pallet of junk." },
                        { title: "Inspected Stock", icon: Zap, desc: "Functional verification on major appliances." },
                        { title: "Local Beltsville", icon: MapPin, desc: "Fast, organized local pickup in Maryland." },
                        { title: "Simple Bidding", icon: Gavel, desc: "Modern real-time bidding for everyone." },
                    ].map((item, i) => (
                        <div key={i} className="bg-white border border-zinc-100 p-8 rounded-[40px] flex flex-col italic hover:border-primary/20 transition-all shadow-sm hover:shadow-xl hover:shadow-secondary/5 group">
                            <div className="h-12 w-12 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-400 group-hover:bg-primary/10 group-hover:text-primary transition-all mb-6 border border-zinc-100">
                                <item.icon size={22} />
                            </div>
                            <h4 className="text-lg font-black text-secondary mb-2 uppercase italic leading-none">{item.title}</h4>
                            <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-tight leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </section>

      {/* HOW IT WORKS MINI - Rebranded */}
      <section className="px-6 py-24 bg-white border-y border-zinc-100">
        <div className="mx-auto max-w-7xl">
            <div className="text-center mb-20">
                <div className="flex items-center justify-center gap-3 mb-6">
                    <div className="h-1 w-8 bg-primary rounded-full" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Simple process</span>
                    <div className="h-1 w-8 bg-primary rounded-full" />
                </div>
                <h2 className="text-4xl md:text-6xl font-black text-secondary uppercase font-display italic tracking-tighter">Fast-Track <span className="text-primary text-glow">Success.</span></h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {[
                    { step: "01", title: "Register Free", desc: "Create your bidder account in seconds with secure verification." },
                    { step: "02", title: "Place Bids", desc: "Bid from anywhere in Maryland, DC, or Virginia in real-time." },
                    { step: "03", title: "Pick Up Local", desc: "Fast collection in Beltsville — organized and efficient." },
                ].map((item, i) => (
                    <div key={i} className="text-center italic relative group">
                        <span className="text-[100px] font-black text-zinc-50 absolute -top-16 left-1/2 -translate-x-1/2 select-none group-hover:text-primary/5 transition-colors">{item.step}</span>
                        <div className="relative z-10">
                            <h4 className="text-2xl font-black text-secondary mb-4 uppercase">{item.title}</h4>
                            <p className="text-sm text-zinc-400 font-bold uppercase leading-relaxed max-w-[200px] mx-auto">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="mt-20 text-center">
                <Link href="/auth/signup" className="bg-primary text-white px-12 py-6 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-2xl shadow-primary/30 inline-flex items-center gap-3 active:scale-95 italic">
                    Start Bidding Today <ArrowRight size={18} />
                </Link>
            </div>
        </div>
      </section>

      {/* FINAL FAQ / TRUST MINI - Premium SaaS UI */}
      <section className="px-6 py-24 bg-white border-t border-zinc-100">
        <div className="mx-auto max-w-5xl">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-20 items-start">
                <div className="lg:sticky lg:top-32 italic">
                    <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-8 border border-primary/20 shadow-sm">
                        <Globe2 size={28} />
                    </div>
                    <h2 className="text-4xl font-black text-secondary uppercase font-display leading-[0.9] mb-6 tracking-tighter">
                        Frequent <br/> <span className="text-primary">Questions.</span>
                    </h2>
                    <p className="text-sm text-zinc-400 font-bold uppercase tracking-widest leading-relaxed mb-8">
                        Important information for Maryland, DC, and Virginia bidders.
                    </p>
                    <Link href="/contact" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-primary border-b-2 border-primary pb-1 hover:text-secondary hover:border-secondary transition-all">
                        Access Support Center →
                    </Link>
                </div>
                
                <div className="flex-1">
                    <FAQAccordion items={[
                        { 
                            q: "How do I participate in an auction?", 
                            a: "Signing up is easy:\n- Register online using your email\n- Confirm your email to activate your account\n- Start browsing and bidding on items\nAll auctions feature live online bidding, so you can participate from anywhere in the DMV area.\n\n👉 Sign up now and join the next auction!",
                            iconName: "Zap"
                        },
                        { 
                            q: "What types of items are sold?", 
                            a: "We sell a wide variety of items including:\n- Home improvement & flooring\n- Tools & hardware\n- Decor, kitchen & bath items\n- Outdoor & garden supplies\n- Safes, water heaters, and more\nAll items are from major U.S. brands sold at top retailers, giving you high-quality inventory you can trust.",
                            iconName: "Package"
                        },
                        { 
                            q: "What payment methods are accepted?", 
                            a: "- We accept all major credit cards.\n- Payment is finalized at the end of the auction\n- Ensure your card is valid and ready for payment to secure your items\n\n👉 Prepare your account and credit card to win your next item.",
                            iconName: "ShieldCheck"
                        },
                        {
                            q: "Can I inspect items before bidding?",
                            a: "- Items are sold as shown in photos with detailed descriptions.\n- No in-person inspection is available\n- All photos accurately reflect the condition of the item\n- This ensures a smooth, fast bidding process",
                            iconName: "Eye"
                        },
                        { 
                            q: "Where are you located?", 
                            a: "We operate a centralized facility in Beltsville, Maryland, strategically positioned to serve the entire DMV metropolitan area.",
                            iconName: "MapPin"
                        },
                        {
                            q: "How do I pick up my items?",
                            a: "All items must be picked up within the timeframe specified in your invoice.\n- Schedule your pickup in advance\n- Bring your ID and the credit card used for payment\n- If someone else picks up for you, they must present copies of the same documents\n- Pickups are local at Beltsville, MD",
                            iconName: "Truck"
                        },
                        {
                            q: "What is your return or refund policy?",
                            a: "We aim for accurate descriptions and photos, but if an item is misdescribed or damaged not shown in photos:\n- You may request a refund of the purchase price\n- Returns must be submitted within 48 hours of pickup\n- This policy ensures buyer confidence and fairness.",
                            iconName: "History"
                        },
                        {
                            q: "Do you provide guidance for first-time bidders?",
                            a: "Yes! First-time bidders can:\n- Check our FAQ page\n- Watch how-to videos under the “How It Works” section\n- This helps you navigate auctions confidently and win with ease.",
                            iconName: "TrendingUp"
                        }
                    ]} />
                </div>
            </div>
        </div>
      </section>
    </div>
  );
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
