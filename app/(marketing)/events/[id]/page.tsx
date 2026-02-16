import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import AuctionCard from '@/components/auction/AuctionCard'
import { ShieldCheck, Info, Timer, LayoutGrid } from 'lucide-react'
import RegistrationButton from '@/components/auction/RegistrationButton'

export default async function EventPage({ params }: { params: { id: string } }) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Fetch event details
  const { data: event } = await supabase
    .from('auction_events')
    .select('*')
    .eq('id', id)
    .single()

  if (!event) notFound()

  // 2. Fetch lots for this event
  const { data: lots } = await supabase
    .from('auctions')
    .select('*, categories(name)')
    .eq('event_id', id)
    .order('created_at', { ascending: true })

  // 3. Mapper les données Supabase vers le format attendu par AuctionCard
  const mappedLots = lots?.map(lot => ({
    id: lot.id,
    title: lot.title,
    supplier: lot.categories?.name || "Industrial Liquidation",
    price: Number(lot.current_price),
    endsAt: new Date(lot.ends_at).toLocaleDateString(),
    // PRIORITÉ ABSOLUE À image_url défini dans l'admin
    image: lot.image_url || "/images/placeholder.jpg",
    bidCount: 0,
    description: lot.description,
    minIncrement: Number(lot.min_increment)
  })) || []

  return (
    <div className="min-h-screen bg-light/20 pb-20">
      {/* Event Banner */}
      <div className="bg-white border-b-4 border-secondary pt-20 pb-12">
        <div className="container mx-auto px-6">
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
                  <div className="font-sans">
                    <p className="text-[10px] font-black uppercase text-neutral/40 leading-none">Ending Date</p>
                    <p className="font-bold text-secondary">{new Date(event.ends_at).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-zinc-100 p-2"><ShieldCheck className="text-primary" size={24} /></div>
                  <div className="font-sans">
                    <p className="text-[10px] font-black uppercase text-neutral/40 leading-none">Bidding Deposit</p>
                    <p className="font-bold text-secondary">${Number(event.deposit_amount).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Registration Card */}
            <div className="w-full lg:w-[380px] bg-secondary p-8 border-4 border-primary shadow-[12px_12px_0px_0px_rgba(4,154,158,0.2)] text-white font-sans italic">
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

      {/* Catalog Grid */}
      <div className="container mx-auto px-6 py-16 font-sans">
        <div className="flex items-center gap-4 mb-12 border-b-2 border-light pb-6">
          <LayoutGrid className="text-primary" size={24} />
          <h2 className="text-3xl font-black uppercase tracking-tighter italic">Active Catalog <span className="text-primary opacity-50">/ {mappedLots.length} Lots</span></h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {mappedLots.map((product) => (
            <AuctionCard key={product.id} product={product} />
          ))}
        </div>

        {mappedLots.length === 0 && (
          <div className="py-20 text-center border-4 border-dashed border-light rounded-xl italic">
            <p className="text-neutral/20 font-black uppercase text-4xl leading-none">Catalog is currently empty</p>
          </div>
        )}
      </div>
    </div>
  )
}
