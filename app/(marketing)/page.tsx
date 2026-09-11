import { createClient, createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Gavel, MapPin, ArrowRight, Package, Globe2, ShieldCheck, Zap, Truck, TrendingUp, Eye } from 'lucide-react'
import { cn, formatEventDate } from '@/lib/utils'
import SearchBar from '@/components/layout/SearchBar'
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
  const [supabase, params] = await Promise.all([createClient(), searchParams])
  const { q, page } = params
  let filter = params.filter
  const currentPage = parseInt(page || '1')
  const PAGE_SIZE_LOTS = 12
  const PAGE_SIZE_EVENTS = 9

  // Categories and the current session are independent requests.
  const [{ data: categories }, { data: { user } }] = await Promise.all([
    supabase.from('categories').select('*').order('name'),
    supabase.auth.getUser(),
  ])

  // Fetch user and profile for role check
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

  // 1. If searching, show matching auctions grouped by event
  if (q) {
    const trimmedQ = q.trim()

    // Search auctions matching the query
    let auctionQuery = fetchClient
      .from('auctions')
      .select(`
        id, title, image_url, current_price, lot_number, ends_at, status, winner_id,
        auction_images(url),
        auction_events!inner(id, title, image_url, status, start_at, ends_at)
      `)

    if (!isAdmin) {
      auctionQuery = auctionQuery.eq('status', 'live')
    }

    if (trimmedQ) {
      const isNumeric = /^\d+$/.test(trimmedQ)
      const lotNumberCondition = isNumeric ? `,lot_number.eq.${trimmedQ}` : ''
      auctionQuery = auctionQuery.or(`title.ilike.%${trimmedQ}%,description.ilike.%${trimmedQ}%${lotNumberCondition}`)
    }

    const { data: matchingAuctions } = await auctionQuery
      .order('lot_number', { ascending: true })
      .limit(60)

    // Group auctions by event
    const eventGroups = new Map<string, { event: any, auctions: any[] }>()
    ;(matchingAuctions || []).forEach((auction: any) => {
      const event = auction.auction_events
      if (!event) return
      if (!eventGroups.has(event.id)) {
        eventGroups.set(event.id, { event, auctions: [] })
      }
      eventGroups.get(event.id)!.auctions.push(auction)
    })

    const groupedResults = Array.from(eventGroups.values())
    const totalAuctions = matchingAuctions?.length || 0

    return (
        <div className="min-h-screen bg-zinc-50 pb-20">
            <div className="bg-white border-b border-zinc-100 pt-16 pb-12">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="h-1 w-8 bg-primary rounded-full" />
                                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Search Results</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-secondary italic font-display uppercase leading-none mb-4">
                                Results for &ldquo;{q}&rdquo;
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
                {groupedResults.length > 0 ? (
                    <>
                        <div className="flex items-center gap-3 mb-10 border-b border-zinc-100 pb-6">
                            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                            <span className="text-[11px] font-bold text-zinc-900 uppercase tracking-widest">
                                {totalAuctions} {totalAuctions === 1 ? 'item' : 'items'} in {groupedResults.length} {groupedResults.length === 1 ? 'event' : 'events'}
                            </span>
                        </div>

                        <div className="space-y-12">
                            {groupedResults.map(({ event, auctions }) => (
                                <div key={event.id}>
                                    {/* Event Header */}
                                    <Link
                                        href={`/events/${event.id}`}
                                        className="flex items-center gap-4 mb-6 p-4 bg-white rounded-2xl border border-zinc-100 hover:border-primary/20 transition-all group"
                                    >
                                        {event.image_url && (
                                            <div className="relative h-14 w-14 rounded-xl overflow-hidden border border-zinc-100 shrink-0">
                                                <Image src={event.image_url} alt={event.title} fill className="object-cover" sizes="56px" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h2 className="text-lg font-black text-secondary uppercase italic tracking-tight group-hover:text-primary transition-colors truncate font-display">
                                                {event.title}
                                            </h2>
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                                                {auctions.length} {auctions.length === 1 ? 'match' : 'matches'}
                                            </span>
                                        </div>
                                        <div className="rounded-xl p-3 bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all shrink-0">
                                            <ArrowRight size={16} strokeWidth={3} />
                                        </div>
                                    </Link>

                                    {/* Auction Items Grid — 3 columns */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {auctions.map((auction: any) => {
                                            const galleryImages = (auction.auction_images?.map((i: any) => i.url) || [])
                                                .sort((a: string, b: string) => a.localeCompare(b, undefined, { numeric: true }))
                                            const mainImage = auction.image_url || galleryImages[0] || '/images/placeholder.jpg'

                                            return (
                                                <Link
                                                    key={auction.id}
                                                    href={`/auctions/${auction.id}`}
                                                    className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-zinc-100 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all group"
                                                >
                                                    <div className="relative h-20 w-20 rounded-xl overflow-hidden border border-zinc-100 shrink-0 bg-zinc-50">
                                                        <Image src={mainImage} alt={auction.title} fill className="object-contain" sizes="80px" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-black text-secondary uppercase italic leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                                                            {auction.title}
                                                        </p>
                                                        {auction.lot_number && (
                                                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Lot #{auction.lot_number}</span>
                                                        )}
                                                        <p className="text-sm font-black text-primary mt-1">${Number(auction.current_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                                    </div>
                                                </Link>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="py-24 text-center bg-white rounded-[48px] border border-zinc-100 shadow-sm italic px-10">
                        <Package size={48} className="mx-auto text-zinc-100 mb-6" />
                        <p className="text-zinc-300 font-bold uppercase text-xl tracking-tighter max-w-sm mx-auto">No results for &ldquo;{q}&rdquo;</p>
                        <Link href="/" className="mt-8 inline-flex items-center gap-2 bg-secondary text-white px-8 py-4 rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-primary transition-all">
                            Back to Home <ArrowRight size={14} />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
  }

  // 2. DEFAULT VIEW: Home Page with Hero & Events Catalog
  const now = new Date().toISOString()

  // Pre-fetch counts concurrently to determine the default tab.
  const [liveCountResult, upcomingCountResult, draftCountResult] = await Promise.all([
    fetchClient
      .from('auction_events')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'live')
      .lte('start_at', now)
      .gt('ends_at', now),
    fetchClient.from('auction_events').select('*', { count: 'exact', head: true }).or(`status.eq.scheduled,and(status.eq.live,start_at.gt.${now})`),
    isAdmin
      ? fetchClient.from('auction_events').select('*', { count: 'exact', head: true }).eq('status', 'draft')
      : Promise.resolve({ count: 0 }),
  ])
  const liveCount = liveCountResult.count
  const upcomingCount = upcomingCountResult.count
  const draftCount = draftCountResult.count
  
  // Auto-fallback logic
  // "upcoming" filter is now merged into "live" — redirect legacy upcoming links
  if (filter === 'upcoming') filter = 'live'
  if (!filter || (filter === 'live' && !liveCount && !upcomingCount)) {
    if (liveCount || upcomingCount) filter = 'live'
    else if (draftCount && isAdmin) filter = 'draft'
    else filter = 'past'
  }

  const from = (currentPage - 1) * PAGE_SIZE_EVENTS
  const to = from + PAGE_SIZE_EVENTS - 1

  let eventQuery = fetchClient
    .from('auction_events')
    .select('*, auctions(count)', { count: 'exact' })
  
  if (!isAdmin) {
    eventQuery = eventQuery.neq('status', 'draft')
  }

  if (filter === 'live') {
    // Show both live AND upcoming events together
    eventQuery = eventQuery.or(`and(status.eq.live,start_at.lte.${now},ends_at.gt.${now}),status.eq.scheduled,and(status.eq.live,start_at.gt.${now})`)
  } else if (filter === 'past') {
    eventQuery = eventQuery.eq('status', 'closed')
  } else if (filter === 'draft' && isAdmin) {
    eventQuery = eventQuery.eq('status', 'draft')
  }

  const { data: events, count: eventCount } = await eventQuery
    .order('start_at', { ascending: filter === 'past' || filter === 'draft' ? false : true })
    .range(from, to)

  const totalEventPages = Math.ceil((eventCount || 0) / PAGE_SIZE_EVENTS)

  const tabs = [
    { id: 'live', label: 'Active', available: !!(liveCount || upcomingCount) },
    ...(isAdmin ? [{ id: 'draft', label: 'Drafts (Admin)', available: !!draftCount }] : []),
    { id: 'past', label: 'Closed Events', available: true }
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

      <div className="max-w-7xl mx-auto px-6 pt-8 pb-1 md:pt-10 md:pb-1">
        {/* Tab Selection & Header */}
        <div className="mb-10 pb-1">
            <div className="flex w-full flex-col items-end gap-1 lg:flex-row lg:items-center">
                <div className="w-full rounded-[24px] border border-zinc-200 bg-white p-1.5 shadow-xl shadow-secondary/5 lg:flex lg:items-center">
                    <div className="w-full lg:flex-1">
                        <SearchBar className="border-0 p-0 shadow-none focus-within:ring-0" />
                    </div>
                    <nav className="mt-1 flex items-center rounded-2xl bg-zinc-50 p-1 lg:mt-0 lg:ml-2 lg:border-l lg:border-zinc-100 lg:bg-transparent lg:pl-2">
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
        </div>

        <div className="grid grid-cols-1 gap-6 mb-10 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
          {events?.map((event) => {
            const now = new Date();
            const isEnded = event.status === 'closed' || (event.status !== 'live' && event.status !== 'draft' && new Date(event.ends_at) <= now);
            const isUpcoming = event.status === 'scheduled' || (event.status === 'live' && new Date(event.start_at) > now);
            const isInventoryPending = (event.auctions?.[0]?.count ?? 0) === 0;
            
            let displayStatus = isEnded ? 'closed' : (isUpcoming ? 'upcoming' : 'live');
            if (event.status === 'draft') displayStatus = 'draft';

            const cardClassName = cn(
              "group flex h-full flex-col overflow-hidden rounded-[40px] border border-zinc-100 bg-white transition-all duration-250",
              isInventoryPending
                ? "cursor-not-allowed opacity-70"
                : "hover:-translate-y-2 hover:shadow-[0_40px_80px_rgba(11,43,83,0.1)]",
              filter === 'past' && !isInventoryPending && "grayscale-[0.5] opacity-80 hover:grayscale-0 hover:opacity-100"
            );

            const cardContent = (
              <>
                <div className="relative aspect-square w-full overflow-hidden border-b border-zinc-100 bg-white">
                  {event.image_url ? (
                    <Image src={event.image_url} alt={event.title} fill className="object-contain" sizes="(max-width: 768px) 100vw, 400px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center italic font-bold text-zinc-200 text-xs p-10 text-center uppercase">
                      Inventory Preview Pending
                    </div>
                  )}
                  <div className="absolute top-6 left-6 z-10 flex flex-col items-start gap-2">
                    {isInventoryPending ? (
                      <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-amber-700 italic">
                        Coming Soon
                      </span>
                    ) : (
                      <EventStatusBadge
                          eventId={event.id}
                          initialStatus={event.status}
                          startAt={event.start_at}
                          endsAt={event.ends_at}
                      />
                    )}
                    {isUpcoming && !isInventoryPending && (
                        <EventReminderButton eventId={event.id} startAt={event.start_at} isUpcoming={isUpcoming} />
                    )}
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-7 md:p-8">
                    <div className="mb-4 flex items-center gap-2 text-zinc-400">
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
                  <h3 className="mb-4 h-16 text-2xl font-black leading-tight text-secondary font-display uppercase italic transition-colors line-clamp-2 group-hover:text-primary">
                    {event.title}
                  </h3>
                  
                  <div className="mt-auto flex items-center justify-between border-t border-zinc-50 pt-6">
                      {isInventoryPending ? (
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-amber-400" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700 italic">Inventory Coming Soon</span>
                        </div>
                      ) : (
                        <EventCardStatus startAt={event.start_at} endsAt={event.ends_at} status={event.status} />
                      )}
                      <div className={cn(
                        "rounded-2xl p-4 shadow-sm transition-all",
                        isInventoryPending
                          ? "bg-zinc-100 text-zinc-300"
                          : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white"
                      )}>
                          {isInventoryPending ? <Package size={20} strokeWidth={3} /> : <ArrowRight size={20} strokeWidth={3} />}
                      </div>
                  </div>
                </div>
              </>
            );

            return isInventoryPending ? (
              <div key={event.id} className={cardClassName} aria-label={`${event.title}: inventory coming soon`}>
                {cardContent}
              </div>
            ) : (
              <Link key={event.id} href={`/events/${event.id}`} className={cardClassName}>
                {cardContent}
              </Link>
            );
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
      <section className="px-6 py-8 md:py-10">
        <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <div className="relative flex flex-col justify-between overflow-hidden rounded-[48px] border border-primary/10 bg-primary/5 p-8 text-secondary italic md:p-10">
                    <div className="relative z-10">
                        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/10 bg-white text-primary shadow-sm">
                            <ShieldCheck size={28} />
                        </div>
                        <h2 className="mb-5 text-4xl font-black leading-none tracking-tighter font-display uppercase italic md:text-5xl">
                            Maryland's No-Pallet <br/> <span className="text-primary">Promise.</span>
                        </h2>
                        <p className="mb-6 text-lg font-medium leading-relaxed text-zinc-500 uppercase">
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

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    {[
                        { title: "Individual Items", icon: Package, desc: "Buy only what you need." },
                        { title: "Inspected Stock", icon: Zap, desc: "Checked before listing." },
                        { title: "Local Beltsville", icon: MapPin, desc: "Easy local pickup." },
                        { title: "Simple Bidding", icon: Gavel, desc: "Bid in real time." },
                    ].map((item, i) => (
                        <div key={i} className="group flex flex-col rounded-[40px] border border-zinc-100 bg-white p-6 italic shadow-sm transition-all hover:border-primary/20 hover:shadow-xl hover:shadow-secondary/5 md:p-8">
                            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-100 bg-zinc-50 text-zinc-400 transition-all group-hover:bg-primary/10 group-hover:text-primary">
                                <item.icon size={26} />
                            </div>
                            <h4 className="text-xl md:text-2xl font-black text-secondary mb-3 uppercase italic leading-none">{item.title}</h4>
                            <p className="text-xs text-zinc-400 font-bold uppercase tracking-tight leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </section>

      {/* HOW IT WORKS MINI - Rebranded */}
      <section className="px-6 py-16 md:py-20 bg-white border-y border-zinc-100">
        <div className="mx-auto max-w-7xl">
            <div className="mb-12 text-center">
                <div className="mb-4 flex items-center justify-center gap-3">
                    <div className="h-1 w-8 bg-primary rounded-full" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Simple process</span>
                    <div className="h-1 w-8 bg-primary rounded-full" />
                </div>
                <h2 className="text-4xl md:text-6xl font-black text-secondary uppercase font-display italic tracking-tighter">Fast-Track <span className="text-primary text-glow">Success.</span></h2>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
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
            
            <div className="mt-12 text-center">
                <Link href="/auth/signup" className="bg-primary text-white px-12 py-6 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-2xl shadow-primary/30 inline-flex items-center gap-3 active:scale-95 italic">
                    Start Bidding Today <ArrowRight size={18} />
                </Link>
            </div>
        </div>
      </section>

      {/* FINAL FAQ / TRUST MINI - Premium SaaS UI */}
      <section className="px-6 pt-10 pb-1 md:pt-12 md:pb-1 bg-white border-t border-zinc-100">
        <div className="mx-auto max-w-5xl">
            <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1fr_2fr]">
                <div className="lg:sticky lg:top-32 italic">
                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-sm">
                        <Globe2 size={28} />
                    </div>
                    <h2 className="mb-5 text-4xl font-black leading-[0.9] tracking-tighter text-secondary font-display uppercase">
                        Frequent <br/> <span className="text-primary">Questions.</span>
                    </h2>
                    <p className="mb-5 text-sm font-bold leading-relaxed tracking-widest text-zinc-400 uppercase">
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
