import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import AuctionCard from '@/components/auction/AuctionCard'
import { ShieldCheck, Info, Timer, LayoutGrid, Calendar, Gavel } from 'lucide-react'
import RegistrationButton from '@/components/auction/RegistrationButton'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default async function EventPage({ 
    params,
    searchParams
}: { 
    params: { id: string },
    searchParams: Promise<{ category?: string, page?: string }>
}) {
  const { id } = await params
  const { category, page } = await searchParams
  const currentPage = parseInt(page || '1')
  const PAGE_SIZE = 12
  const supabase = await createClient()

  // 1. Fetch event details
  const { data: event } = await supabase
    .from('auction_events')
    .select('*')
    .eq('id', id)
    .single()

  if (!event) notFound()

  // 2. Fetch all categories present in THIS event for the sidebar
  const { data: eventCategories } = await supabase
    .from('auctions')
    .select('categories(id, name)')
    .eq('event_id', id)
    .not('category_id', 'is', null)

  // Deduplicate categories
  const uniqueCategories = Array.from(new Set(eventCategories?.map(c => JSON.stringify(c.categories))))
    .map(s => JSON.parse(s))
    .sort((a, b) => a.name.localeCompare(b.name))

  // 3. Fetch lots for this event (filtered by category if selected)
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

  // 4. Mapper les données Supabase vers le format attendu par AuctionCard
  const mappedLots = lots?.map(lot => ({
    id: lot.id,
    lotNumber: lot.lot_number,
    title: lot.title,
    supplier: lot.categories?.name || "Industrial Liquidation",
    price: Number(lot.current_price),
    endsAt: lot.ends_at,
    // PRIORITÉ ABSOLUE À image_url défini dans l'admin
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
    <div className="min-h-screen bg-light/20 pb-20 font-sans">
      {/* Event Banner */}
      <div className="bg-white border-b-4 border-secondary pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-10">
            <div className="max-w-3xl">
              <span className="bg-primary text-white px-4 py-1 font-black uppercase text-[10px] tracking-[0.2em] mb-4 inline-block italic">
                Auction Event: {event.status}
              </span>
              <h1 className="text-5xl font-black uppercase tracking-tighter mb-6 leading-none italic">{event.title}</h1>
              <p className="text-neutral/60 font-medium italic text-lg leading-relaxed mb-8">{event.description}</p>
              
              <div className="flex flex-wrap gap-8">
                <div className="flex items-center gap-3">
                  <div className="bg-zinc-100 p-2"><Timer className="text-primary" size={24} /></div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-neutral/40 leading-none">Ending Date</p>
                    <p className="font-bold text-secondary">{new Date(event.ends_at).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-zinc-100 p-2"><ShieldCheck className="text-primary" size={24} /></div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-neutral/40 leading-none">Bidding Deposit</p>
                    <p className="font-bold text-secondary">${Number(event.deposit_amount).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Registration Card */}
            <div className="w-full lg:w-[380px] bg-secondary p-8 border-4 border-primary shadow-[12px_12px_0px_0px_rgba(4,154,158,0.2)] text-white italic">
              <h3 className="text-xl font-black uppercase tracking-tighter mb-4">Bidding Authorization</h3>
              <p className="text-xs font-medium text-white/60 mb-6 leading-relaxed">
                To participate in this auction, a fully refundable deposit of ${Number(event.deposit_amount).toLocaleString()} is required to verify your bidding capacity.
              </p>
              
              <RegistrationButton eventId={event.id} depositAmount={Number(event.deposit_amount)} />
              
              <div className="mt-4 flex items-center gap-2 text-[10px] text-white/40 font-bold uppercase tracking-wider">
                <Info size={14} /> Identity and credit verification active
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex flex-col lg:flex-row gap-12">
            {/* Sidebar: Categories */}
            <aside className="lg:w-64 shrink-0 space-y-8">
                <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary mb-6 border-b-2 border-primary pb-2 italic">Filter Items</h3>
                    <nav className="flex flex-col gap-2">
                        <Link 
                            href={`/events/${id}`}
                            className={cn(
                                "px-4 py-3 text-[10px] font-black uppercase tracking-widest border-2 transition-all",
                                !category ? "bg-primary text-white border-primary shadow-[4px_4px_0px_0px_rgba(11,43,83,1)] italic" : "text-neutral border-transparent hover:border-light hover:bg-white"
                            )}
                        >
                            Complete Catalog
                        </Link>
                        {uniqueCategories.map((cat: any) => (
                            <Link 
                                key={cat.id}
                                href={`/events/${id}?category=${cat.id}`}
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

                <div className="p-6 bg-primary text-white border-2 border-primary shadow-[8px_8px_0px_0px_rgba(11,43,83,1)]">
                    <h4 className="font-black uppercase text-[10px] mb-2 tracking-widest">Inspection Info</h4>
                    <p className="text-[9px] font-bold opacity-80 uppercase leading-relaxed">Most items available for on-site inspection by appointment. Contact support for details.</p>
                </div>
            </aside>

            {/* Catalog Grid */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-4 mb-12 border-b-2 border-light pb-6">
                    <LayoutGrid className="text-primary" size={24} />
                    <h2 className="text-3xl font-black uppercase tracking-tighter italic">
                        {category ? 'Filtered Results' : 'Active Catalog'} 
                        <span className="text-primary opacity-50 ml-2">/ {count} Lots</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-16">
                    {mappedLots.map((product) => (
                        <AuctionCard key={product.id} product={product} />
                    ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <Pagination 
                        currentPage={currentPage} 
                        totalPages={totalPages} 
                        baseUrl={`/events/${id}`} 
                        queryParams={{ category }}
                    />
                )}

                {mappedLots.length === 0 && (
                    <div className="py-20 text-center border-4 border-dashed border-light rounded-xl italic bg-white/50">
                        <p className="text-neutral/20 font-black uppercase text-4xl leading-none">No items found in this category</p>
                        <Link href={`/events/${id}`} className="mt-6 inline-block bg-primary text-white px-6 py-3 font-black uppercase text-[10px] tracking-widest">View All Items</Link>
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
