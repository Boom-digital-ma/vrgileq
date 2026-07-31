import { createClient, createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import AuctionGrid from '@/components/auction/AuctionGrid'
import { ShieldCheck, Info, Timer, LayoutGrid, Calendar, Gavel, ArrowRight, ChevronRight, SlidersHorizontal, MapPin, Package, Clock, Lock } from 'lucide-react'
import RegistrationButton from '@/components/auction/RegistrationButton'
import EventStatusBadge from '@/components/auction/EventStatusBadge'
import EventReminderButton from '@/components/auction/EventReminderButton'
import EventWatchlistDrawer from '@/components/auction/EventWatchlistDrawer'
import ProtocolCards from '@/components/auction/ProtocolCards'
import ImageGallery from '@/components/auction/ImageGallery'
import ResetFiltersButton from '@/components/auction/ResetFiltersButton'
import Link from 'next/link'
import Image from 'next/image'
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

  // 1. Fetch event details
  const { data: event } = await fetchClient
    .from('auction_events')
    .select('*')
    .eq('id', id)
    .single()

  if (!event) notFound()

  // 2. Fetch categories present in THIS event
  const { data: eventCategories } = await fetchClient
    .from('auctions')
    .select('categories(id, name)')
    .eq('event_id', id)
    .not('category_id', 'is', null)

  const uniqueCategories = Array.from(new Set(eventCategories?.map(c => JSON.stringify(c.categories))))
    .map(s => JSON.parse(s))
    .sort((a, b) => a.name.localeCompare(b.name))

  // 3. Fetch lots
  let query = fetchClient
    .from('auctions')
    .select('*, categories(name), bids(count), auction_images(url), auction_events(location, start_at), lot_number', { count: 'exact' })
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

  // 4. Fetch User Bids for these lots (for Proxy Indicators)
  let userBidsMap = new Map();
  if (user && lots && lots.length > 0) {
      const lotIds = lots.map(l => l.id);
      const { data: userBids } = await supabase
        .from('bids')
        .select('auction_id, max_amount, amount')
        .eq('user_id', user.id)
        .in('auction_id', lotIds)
        .order('amount', { ascending: false });
      
      userBids?.forEach((b: any) => {
        if (!userBidsMap.has(b.auction_id)) {
            userBidsMap.set(b.auction_id, b);
        }
      });
  }

  const mappedLots = lots?.map(lot => {
    const userBid = userBidsMap.get(lot.id);
    
    // Extract and sort gallery images, but always keep the explicitly chosen image_url (main image) first!
    const sortedGallery = (lot.auction_images?.map((i: any) => i.url) || [])
        .sort((a: string, b: string) => a.localeCompare(b, undefined, { numeric: true }));

    const allImages = [
        ...(lot.image_url ? [lot.image_url] : []),
        ...sortedGallery
    ].filter((v, i, a) => a.indexOf(v) === i);

    return {
        id: lot.id,
        event_id: lot.event_id,
        lotNumber: lot.lot_number,
        title: lot.title,
        supplier: lot.categories?.name || "Industrial Liquidation",
        price: Number(lot.current_price),
        endsAt: lot.ends_at,
        startAt: (lot.auction_events as any)?.start_at,
        image: allImages[0] || "/images/placeholder.jpg",
        images: allImages,
        bidCount: lot.bids?.[0]?.count || 0,
        pickupLocation: (lot.auction_events as any)?.location,
        description: lot.description,
        minIncrement: Number(lot.min_increment),
        userMaxBid: userBid?.max_amount,
        userCurrentBid: userBid?.amount,
        winner_id: lot.winner_id,
        manufacturer: lot.manufacturer,
        model: lot.model
    };
  }) || []

  const isUpcoming = new Date(event.start_at) > new Date();
  const isEnded = new Date(event.ends_at) <= new Date();

  // JSON-LD Structured Data for Event
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": event.title,
    "startDate": event.start_at,
    "endDate": event.ends_at,
    "eventStatus": isEnded ? "https://schema.org/EventScheduled" : "https://schema.org/EventMovedOnline",
    "eventAttendanceMode": "https://schema.org/OnlineEventAttendanceMode",
    "location": {
      "@type": "VirtualLocation",
      "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://virginialiquidation.vercel.app'}/events/${event.id}`
    },
    "image": [event.image_url].filter(Boolean),
    "description": event.description,
    "organizer": {
      "@type": "Organization",
      "name": "Virginia Liquidation",
      "url": "https://virginialiquidation.com"
    },
    "offers": {
      "@type": "Offer",
      "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://virginialiquidation.vercel.app'}/events/${event.id}`,
      "price": event.deposit_amount || "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 pb-20 font-sans antialiased text-secondary italic">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* ADMIN PREVIEW INDICATOR */}
      {isAdmin && event.status === 'draft' && (
          <div className="bg-secondary text-white py-2 text-center text-[10px] font-black uppercase tracking-[0.3em] border-b border-teal-500/30">
              <span className="text-teal-400">Preview Mode:</span> This event is a draft and not visible to the public.
          </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-10 md:py-14">
        
        {/* REFINED HEADER SECTION */}
        <div className="space-y-10 mb-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Thumbnail */}
                {event.image_url && (
                    <div className="relative h-48 w-48 md:h-72 md:w-72 rounded-[32px] overflow-hidden border border-zinc-200 shadow-2xl shrink-0 group">
                        <Image src={event.image_url} alt={event.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                        <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-[32px]" />
                    </div>
                )}
                
                <div className="flex-1 space-y-5">
                    <div className="flex items-center gap-2">
                        <div className="h-[1px] w-6 bg-primary" />
                        <EventStatusBadge 
                            eventId={event.id}
                            initialStatus={event.status}
                            startAt={event.start_at}
                            endsAt={event.ends_at}
                        />
                        {!isEnded && (
                            <EventReminderButton eventId={event.id} startAt={event.start_at} isUpcoming={isUpcoming} variant="page" />
                        )}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-secondary leading-[1.1] font-display uppercase italic">
                        {event.title}
                    </h1>
                    <p className="text-zinc-500 font-bold text-sm md:text-base leading-relaxed max-w-2xl uppercase tracking-tight">
                        {event.description}
                    </p>
                    <div className="flex flex-wrap gap-4 pt-4">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-white px-4 py-2 rounded-xl border border-zinc-100 italic">
                            <MapPin size={14} className="text-primary" />
                            {event.location}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-white px-4 py-2 rounded-xl border border-zinc-100 italic">
                            <Clock size={14} className="text-primary" />
                            Official Protocol
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* PROTOCOL CARDS GRID (Reactive) */}
        <ProtocolCards event={{
            id: event.id,
            start_at: event.start_at,
            ends_at: event.ends_at,
            deposit_amount: Number(event.deposit_amount),
            status: event.status
        }} />

        {/* FULL WIDTH CATALOG SECTION */}
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-200 pb-5">
                <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-2.5 rounded-2xl text-primary">
                        <LayoutGrid size={24} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-secondary font-display uppercase">Catalogue</h2>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest italic">
                           {count === 0 ? "Awaiting Catalog Deployment" : `${count} Assets currently in protocol`}
                        </p>
                    </div>                </div>

                <nav className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                    <ResetFiltersButton id={id} isActive={!category} />
                    {uniqueCategories.map((cat: any) => {
                        const isActive = category === cat.id;
                        return (
                            <Link 
                                key={cat.id}
                                href={isActive ? `/events/${id}` : `/events/${id}?category=${cat.id}`}
                                className={cn(
                                    "px-5 py-2 text-[10px] font-black uppercase tracking-widest border rounded-xl transition-all whitespace-nowrap",
                                    isActive ? "bg-zinc-900 text-white border-zinc-900 shadow-lg" : "bg-white text-zinc-400 border-zinc-100 hover:border-zinc-300"
                                )}
                            >
                                {cat.name}
                            </Link>
                        )
                    })}
                </nav>
            </div>

            <AuctionGrid 
                products={mappedLots} 
                user={user} 
                eventId={id} 
                categoryId={category}
                initialTotalCount={count || 0}
            />
        </div>

      </div>

      {/* Floating Watchlist Drawer */}
      <EventWatchlistDrawer eventId={id} user={user} />
    </div>
  )
}
