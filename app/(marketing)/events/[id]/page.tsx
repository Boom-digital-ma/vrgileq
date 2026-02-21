import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import AuctionCard from '@/components/auction/AuctionCard'
import { ShieldCheck, Info, Timer, LayoutGrid, Calendar, Gavel, ArrowRight, ChevronRight, SlidersHorizontal, MapPin, Package, Clock, Lock } from 'lucide-react'
import RegistrationButton from '@/components/auction/RegistrationButton'
import EventStatusBadge from '@/components/auction/EventStatusBadge'
import ProtocolCards from '@/components/auction/ProtocolCards'
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

  const mappedLots = lots?.map(lot => ({
    id: lot.id,
    event_id: lot.event_id,
    lotNumber: lot.lot_number,
    title: lot.title,
    supplier: lot.categories?.name || "Industrial Liquidation",
    price: Number(lot.current_price),
    endsAt: lot.ends_at,
    startAt: (lot.auction_events as any)?.start_at,
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

  const isUpcoming = new Date(event.start_at) > new Date();
  const isEnded = new Date(event.ends_at) <= new Date();

  return (
    <div className="min-h-screen bg-zinc-50 pb-20 font-sans antialiased text-secondary italic">
      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20">
        
        {/* REFINED HEADER SECTION */}
        <div className="space-y-12 mb-16">
            <div className="flex flex-col md:flex-row gap-10 items-start">
                {/* Thumbnail */}
                {event.image_url && (
                    <div className="relative h-32 w-32 md:h-48 md:w-48 rounded-[40px] overflow-hidden border border-zinc-200 shadow-2xl shrink-0">
                        <Image src={event.image_url} alt={event.title} fill className="object-cover" />
                    </div>
                )}
                
                <div className="flex-1 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="h-1 w-8 bg-primary rounded-full" />
                        <EventStatusBadge 
                            eventId={event.id}
                            initialStatus={event.status}
                            startAt={event.start_at}
                            endsAt={event.ends_at}
                        />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-secondary leading-tight font-display uppercase">
                        {event.title}
                    </h1>
                    <p className="text-zinc-500 font-medium text-lg leading-relaxed max-w-4xl">
                        {event.description}
                    </p>
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
        <div className="space-y-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-200 pb-8">
                <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-2.5 rounded-2xl text-primary">
                        <LayoutGrid size={24} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-secondary font-display uppercase">Event Catalog</h2>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{count} Assets available</p>
                    </div>
                </div>

                <nav className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                    <Link 
                        href={`/events/${id}`}
                        className={cn(
                            "px-5 py-2 text-[10px] font-black uppercase tracking-widest border rounded-xl transition-all whitespace-nowrap",
                            !category ? "bg-zinc-900 text-white border-zinc-900 shadow-lg" : "bg-white text-zinc-400 border-zinc-100 hover:border-zinc-300"
                        )}
                    >
                        All Assets
                    </Link>
                    {uniqueCategories.map((cat: any) => (
                        <Link 
                            key={cat.id}
                            href={`/events/${id}?category=${cat.id}`}
                            className={cn(
                                "px-5 py-2 text-[10px] font-black uppercase tracking-widest border rounded-xl transition-all whitespace-nowrap",
                                category === cat.id ? "bg-zinc-900 text-white border-zinc-900 shadow-lg" : "bg-white text-zinc-400 border-zinc-100 hover:border-zinc-300"
                            )}
                        >
                            {cat.name}
                        </Link>
                    ))}
                </nav>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {mappedLots.map((product) => (
                    <AuctionCard key={product.id} product={product} user={user} />
                ))}
            </div>

            {totalPages > 1 && (
                <div className="pt-12 border-t border-zinc-100">
                    <Pagination currentPage={currentPage} totalPages={totalPages} baseUrl={`/events/${id}`} queryParams={{ category }} />
                </div>
            )}
        </div>

      </div>
    </div>
  )
}

function Pagination({ currentPage, totalPages, baseUrl, queryParams = {} }: { currentPage: number, totalPages: number, baseUrl: string, queryParams?: Record<string, any> }) {
    const buildUrl = (p: number) => {
        const params = new URLSearchParams()
        Object.entries(queryParams).forEach(([k, v]) => { if (v) params.set(k, v) })
        params.set('page', p.toString())
        return `${baseUrl}?${params.toString()}`
    }
    return (
        <div className="flex justify-center items-center gap-3">
            <Link href={currentPage > 1 ? buildUrl(currentPage - 1) : '#'} className={cn("px-6 py-3 text-[10px] font-bold uppercase tracking-widest border border-zinc-200 rounded-2xl transition-all", currentPage === 1 ? "opacity-30 cursor-not-allowed" : "bg-white text-zinc-500 hover:border-primary hover:text-primary active:scale-95")}>Prev</Link>
            <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                    <Link key={i} href={buildUrl(i + 1)} className={cn("w-10 h-10 flex items-center justify-center text-[10px] font-bold border rounded-xl transition-all", currentPage === i + 1 ? "bg-secondary text-white border-secondary shadow-lg shadow-secondary/10 scale-110" : "bg-white text-zinc-400 border-zinc-100 hover:border-zinc-200")}>{i + 1}</Link>
                ))}
            </div>
            <Link href={currentPage < totalPages ? buildUrl(currentPage + 1) : '#'} className={cn("px-6 py-3 text-[10px] font-bold uppercase tracking-widest border border-zinc-200 rounded-2xl transition-all", currentPage === totalPages ? "opacity-30 cursor-not-allowed" : "bg-white text-zinc-500 hover:border-primary hover:text-primary active:scale-95")}>Next</Link>
        </div>
    )
}
