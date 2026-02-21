import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import AuctionCard from '@/components/auction/AuctionCard'
import { ShieldCheck, Info, Timer, LayoutGrid, Calendar, Gavel, ArrowRight, ChevronRight, SlidersHorizontal, MapPin, Package, Clock, Lock } from 'lucide-react'
import RegistrationButton from '@/components/auction/RegistrationButton'
import EventStatusBadge from '@/components/auction/EventStatusBadge'
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
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
            
            {/* MAIN CONTENT AREA (Left) */}
            <div className="flex-1 min-w-0 space-y-16">
                
                {/* Event Header Sub-Section */}
                <div className="space-y-10">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        {/* Thumbnail */}
                        {event.image_url && (
                            <div className="relative h-32 w-32 md:h-40 md:w-40 rounded-3xl overflow-hidden border border-zinc-200 shadow-xl shrink-0">
                                <Image src={event.image_url} alt={event.title} fill className="object-cover" />
                            </div>
                        )}
                        
                        <div className="flex-1 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-1 w-6 bg-primary rounded-full" />
                                <EventStatusBadge 
                                    eventId={event.id}
                                    initialStatus={event.status}
                                    startAt={event.start_at}
                                    endsAt={event.ends_at}
                                />
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-secondary leading-tight font-display uppercase">
                                {event.title}
                            </h1>
                        </div>
                    </div>

                    {/* Description below title/image */}
                    <div className="bg-white rounded-[32px] p-8 md:p-10 border border-zinc-100 shadow-sm italic">
                        <p className="text-zinc-500 font-medium text-base md:text-lg leading-relaxed first-letter:text-4xl first-letter:font-black first-letter:text-primary first-letter:mr-1">
                            {event.description}
                        </p>
                    </div>
                </div>

                {/* Catalog Grid Section */}
                <div className="space-y-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-200 pb-8">
                        <div className="flex items-center gap-4">
                            <div className="bg-primary/10 p-2.5 rounded-2xl text-primary">
                                <LayoutGrid size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight text-secondary font-display uppercase">Event Catalog</h2>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
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

            {/* SIDEBAR AREA (Right) */}
            <aside className="lg:w-[380px] shrink-0 space-y-8">
                <div className="sticky top-32 space-y-8">
                    
                    {/* Bidding Passport Card */}
                    {!isEnded && (
                        <div className={cn(
                            "rounded-[40px] p-10 relative overflow-hidden shadow-2xl transition-all duration-500",
                            isUpcoming ? "bg-zinc-100 text-zinc-400 border border-zinc-200" : "bg-secondary text-white shadow-secondary/20 hover:-translate-y-1"
                        )}>
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-2xl font-bold uppercase tracking-tight font-display">Bidding <span className={isUpcoming ? "text-zinc-500" : "text-primary"}>Passport</span></h3>
                                    <Lock size={20} className={isUpcoming ? "text-zinc-300" : "text-primary/40"} />
                                </div>
                                
                                <p className={cn("text-sm font-medium mb-10 leading-relaxed", isUpcoming ? "text-zinc-400" : "text-white/50")}>
                                    {isUpcoming 
                                        ? "Registration protocols are currently locked. Bidding authorization will open once the event transition to 'Live' status."
                                        : `A security deposit of $${Number(event.deposit_amount).toLocaleString()} is required to enable bidding protocols for this event.`
                                    }
                                </p>
                                
                                <RegistrationButton eventId={event.id} depositAmount={Number(event.deposit_amount)} isUpcoming={isUpcoming} />
                                
                                <div className="mt-8 flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.2em] opacity-40">
                                    <ShieldCheck size={14} /> Global Identity Verification
                                </div>
                            </div>
                            {!isUpcoming && <div className="absolute -bottom-12 -right-12 h-40 w-40 bg-primary/20 blur-[60px] rounded-full" />}
                        </div>
                    )}

                    {/* Stats Block (Moved from Header) */}
                    <div className="bg-zinc-900 rounded-[32px] p-8 text-white italic relative overflow-hidden border border-white/5 shadow-xl">
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-white/10 rounded-xl text-primary"><Timer size={20} /></div>
                                <div>
                                    <p className="text-[8px] font-black uppercase text-white/40 tracking-widest mb-0.5">Ending On</p>
                                    <p className="font-bold text-white uppercase text-xs">{new Date(event.ends_at).toLocaleDateString()} @ {new Date(event.ends_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-white/10 rounded-xl text-primary"><ShieldCheck size={20} /></div>
                                <div>
                                    <p className="text-[8px] font-black uppercase text-white/40 tracking-widest mb-0.5">Bidding Hold</p>
                                    <p className="font-bold text-white uppercase text-xs">${Number(event.deposit_amount).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -bottom-10 -right-10 h-32 w-32 bg-primary/10 blur-3xl rounded-full" />
                    </div>

                    {/* Inspection Block */}
                    <div className="bg-white border border-zinc-200 rounded-[32px] p-8 italic shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-primary/10 rounded-xl text-primary"><MapPin size={18} /></div>
                            <h4 className="font-black uppercase text-xs text-secondary tracking-widest">Site Inspection</h4>
                        </div>
                        <p className="text-sm text-zinc-400 font-medium leading-relaxed mb-6 uppercase">
                            Assets are located at our {event.location || "Regional Hub"}. Physical inspection is mandated for high-value acquisitions.
                        </p>
                        <Link href="/contact" className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2 hover:underline">
                            Request Access Protocol <ChevronRight size={14} />
                        </Link>
                    </div>
                </div>
            </aside>

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
        <div className="flex justify-center items-center gap-3 italic">
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
