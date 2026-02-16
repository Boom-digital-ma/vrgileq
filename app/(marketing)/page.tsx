import Link from "next/link";
import Image from "next/image";
import { Building2, ArrowRight, Package, MapPin, TrendingUp, Calendar, Gavel } from "lucide-react";
import HeroSlider from "@/components/layout/HeroSlider";
import SearchBar from "@/components/layout/SearchBar";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch actual events from Supabase
  const { data: events } = await supabase
    .from('auction_events')
    .select('*')
    .neq('status', 'draft')
    .order('created_at', { ascending: false })
    .limit(3);

  return (
    <div className="bg-white font-sans tracking-tight text-neutral antialiased">
      <HeroSlider />

      {/* Search Bar */}
      <div className="mx-auto -mt-10 max-w-5xl px-6 relative z-10 font-sans">
        <SearchBar />
      </div>

      {/* Hero Featured Events Section */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
                <div className="mb-2 text-xs font-black uppercase tracking-[0.3em] text-secondary">Trusted Liquidation Source</div>
                <h2 className="text-5xl font-black uppercase tracking-tighter text-primary italic leading-none">Live Auction Events</h2>
            </div>
            <Link href="/auctions" className="text-xs font-black uppercase tracking-[0.2em] text-primary border-b-4 border-primary pb-1 hover:text-secondary hover:border-secondary transition-all">
                View All Events →
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          {events?.map((event) => (
            <div key={event.id} className="group flex flex-col h-full border-4 border-transparent hover:border-primary/10 transition-all p-4">
              <Link href={`/events/${event.id}`} className="block relative aspect-[16/10] w-full overflow-hidden border-2 border-primary mb-6 transition-all group-hover:shadow-[12px_12px_0px_0px_rgba(11,43,83,1)]">
                {event.image_url ? (
                    <Image
                        src={event.image_url}
                        alt={event.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full bg-zinc-50 flex items-center justify-center text-zinc-200 text-xs font-black uppercase italic p-8 text-center leading-tight">
                        {event.title}
                    </div>
                )}
                <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                  {event.status}
                </div>
              </Link>
              
              <div className="flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-3 w-3 text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-neutral/40">Closes {new Date(event.ends_at).toLocaleDateString()}</span>
                </div>
                <h3 className="text-2xl font-black uppercase leading-none mb-4 group-hover:text-primary transition-colors text-primary italic h-14 line-clamp-2">
                    {event.title}
                </h3>
                
                <div className="mt-auto pt-6 border-t-2 border-light flex justify-between items-center">
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black uppercase text-neutral/30 leading-none">Security Deposit</span>
                        <span className="text-lg font-black text-secondary tabular-nums">${Number(event.deposit_amount).toLocaleString()}</span>
                    </div>
                    <Link 
                        href={`/events/${event.id}`} 
                        className="bg-primary text-white p-3 hover:bg-secondary transition-all shadow-[4px_4px_0px_0px_rgba(11,43,83,0.2)]"
                    >
                        <ArrowRight size={20} />
                    </Link>
                </div>
              </div>
            </div>
          ))}
          </div>
        </div>
      </section>

      {/* Seller CTA */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-7xl bg-white border-4 border-primary p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-[16px_16px_0px_0px_rgba(4,154,158,0.1)]">
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter leading-tight max-w-xl text-center md:text-left text-primary italic">
            Become a VirginiaLiquidation.com Seller today
          </h2>
          <Link 
            href="/sell" 
            className="bg-primary text-white px-10 py-5 text-sm font-black uppercase tracking-widest transition-all hover:bg-secondary shadow-[4px_4px_0px_0px_rgba(11,43,83,0.2)] whitespace-nowrap italic"
          >
            List Your Assets
          </Link>
        </div>
      </section>

      {/* Why Section */}
      <section className="bg-light/10 py-24 border-y-4 border-primary/10">
        <div className="px-6">
          <div className="mx-auto max-w-7xl">
            <div className="mb-20 grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-16 items-center">
              <div>
                <div className="text-secondary font-black uppercase tracking-[0.3em] text-xs mb-4">PLATFORM BENEFITS</div>
                <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-primary mb-8 leading-none italic">
                  Industrial Scale • <br/>Direct Liquidation
                </h2>
                <p className="text-neutral/60 font-medium italic leading-relaxed max-w-xl">
                  Virginia Liquidation provides a professional secondary market for industrial assets, commercial equipment, and surplus inventory across the United States.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-4 p-8 bg-white border-4 border-primary shadow-[8px_8px_0px_0px_rgba(11,43,83,1)]">
                  <div className="h-12 w-12 bg-primary text-white flex items-center justify-center">
                    <Package className="h-6 w-6" />
                  </div>
                  <h4 className="text-lg font-black uppercase text-primary leading-tight">Lot Cataloging</h4>
                  <p className="text-neutral/60 text-[10px] font-black uppercase tracking-tight leading-relaxed">Rigorous inspection and verification for every listed item.</p>
                </div>
                <div className="space-y-4 p-8 bg-white border-4 border-primary shadow-[8px_8px_0px_0px_rgba(11,43,83,1)]">
                  <div className="h-12 w-12 bg-primary text-white flex items-center justify-center">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <h4 className="text-lg font-black uppercase text-primary leading-tight">National Reach</h4>
                  <p className="text-neutral/60 text-[10px] font-black uppercase tracking-tight leading-relaxed">Warehousing and logistics partners across the tri-state area.</p>
                </div>
                <div className="space-y-4 p-8 bg-white border-4 border-primary shadow-[8px_8px_0px_0px_rgba(11,43,83,1)]">
                  <div className="h-12 w-12 bg-primary text-white flex items-center justify-center">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <h4 className="text-lg font-black uppercase text-primary leading-tight">Secure Bidding</h4>
                  <p className="text-neutral/60 text-[10px] font-black uppercase tracking-tight leading-relaxed">Integrated Stripe manual capture for guaranteed payment security.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Global Stats */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12 border-4 border-primary p-12 shadow-[16px_16px_0px_0px_rgba(4,154,158,0.2)] bg-white italic">
          <div className="text-center md:text-left">
            <div className="text-7xl font-black tabular-nums leading-none mb-2 text-primary tracking-tighter">100%</div>
            <div className="text-xs font-black uppercase tracking-widest text-neutral/40">Verified Inventory</div>
          </div>
          <div className="h-[4px] w-12 bg-primary md:h-16 md:w-[4px]"></div>
          <div className="text-center md:text-left">
            <div className="text-7xl font-black tabular-nums leading-none mb-2 text-primary tracking-tighter">FAST</div>
            <div className="text-xs font-black uppercase tracking-widest text-neutral/40">Removal & Shipping</div>
          </div>
          <div className="h-[4px] w-12 bg-primary md:h-16 md:w-[4px]"></div>
          <Link 
            href="/auctions" 
            className="bg-primary text-white px-12 py-6 text-sm font-black uppercase tracking-widest transition-all hover:bg-secondary shadow-[8px_8px_0px_0px_rgba(11,43,83,1)]"
          >
            Explore Events
          </Link>
        </div>
      </div>
    </section>
  </div>
  );
}
