import Link from "next/link";
import Image from "next/image";
import { Building2, ArrowRight, Package, MapPin, TrendingUp, Calendar, Gavel, ShieldCheck, Zap, ChevronRight, BarChart3, Globe2, Truck } from "lucide-react";
import HeroSlider from "@/components/layout/HeroSlider";
import SearchBar from "@/components/layout/SearchBar";
import EventStatusBadge from "@/components/auction/EventStatusBadge";
import EventCardStatus from "@/components/auction/EventCardStatus";
import { createClient } from "@/lib/supabase/server";
import { cn, formatEventDate } from "@/lib/utils";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Maryland’s Trusted Online Liquidation Auction | Local Pickup in Beltsville",
  description: "Bid on inspected Home Depot returns, appliances, and overstock inventory. No pallets. No mystery. Serving Maryland, DC & Virginia with simple local pickup in Beltsville.",
};

export default async function HomePage() {
  const supabase = await createClient();
  const now = new Date().toISOString();

  // Priority 1: Live Events
  let { data: events } = await supabase
    .from('auction_events')
    .select('*')
    .eq('status', 'live')
    .order('ends_at', { ascending: true })
    .limit(3);

  // Priority 2: Upcoming Events (if no live)
  if (!events || events.length === 0) {
    const { data: upcoming } = await supabase
        .from('auction_events')
        .select('*')
        .or(`status.eq.scheduled,and(status.eq.live,start_at.gt.${now})`)
        .order('start_at', { ascending: true })
        .limit(3);
    events = upcoming;
  }

  // Priority 3: Closed Events (if no live and no upcoming)
  if (!events || events.length === 0) {
    const { data: past } = await supabase
        .from('auction_events')
        .select('*')
        .eq('status', 'closed')
        .neq('status', 'draft')
        .order('ends_at', { ascending: false })
        .limit(3);
    events = past;
  }

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

      {/* Featured Events Section */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-2xl">
                <div className="flex items-center gap-2 mb-4">
                    <div className="h-1 w-8 bg-primary rounded-full" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Live Inventory Protocol</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-secondary italic font-display uppercase leading-none">
                    Current <span className="text-primary">Events</span>
                </h2>
            </div>
            <Link href="/auctions" className="group flex items-center gap-3 bg-white border border-zinc-200 px-8 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:border-primary/30 transition-all shadow-sm">
                Access Global Catalog <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform text-primary" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          {events?.map((event) => {
            const now = new Date();
            const isEnded = event.status === 'closed' || (event.status !== 'live' && new Date(event.ends_at) <= now);
            const isUpcoming = event.status === 'scheduled' || (event.status === 'live' && new Date(event.start_at) > now);
            const displayStatus = isEnded ? 'closed' : (isUpcoming ? 'upcoming' : 'live');

            return (
              <div key={event.id} className="group flex flex-col bg-white rounded-[40px] border border-zinc-100 overflow-hidden transition-all duration-500 hover:shadow-[0_40px_80px_rgba(11,43,83,0.1)] hover:-translate-y-2">
                <Link href={`/events/${event.id}`} className="block relative aspect-[4/3] w-full overflow-hidden bg-zinc-50 border-b border-zinc-100">
                  {event.image_url ? (
                      <Image
                          src={event.image_url}
                          alt={event.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                          sizes="(max-width: 768px) 100vw, 400px"
                          suppressHydrationWarning
                      />
                  ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-200 text-[10px] font-bold uppercase italic p-12 text-center" suppressHydrationWarning>
                          Inventory Preview Pending
                      </div>
                  )}
                  <div className="absolute top-8 left-8 flex flex-col gap-2 items-start z-10" suppressHydrationWarning>
                    <EventStatusBadge 
                        eventId={event.id}
                        initialStatus={event.status}
                        startAt={event.start_at}
                        endsAt={event.ends_at}
                    />
                  </div>
                </Link>
                
                <div className="p-10 flex flex-col flex-1" suppressHydrationWarning>
                  <div className="flex items-center gap-2 mb-6 text-zinc-400" suppressHydrationWarning>
                    <Calendar size={14} className="text-primary" suppressHydrationWarning />
                    <span className="text-[10px] font-black uppercase tracking-widest italic">
                        {isEnded 
                          ? 'Registry Closed' 
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
                      <Link 
                          href={`/events/${event.id}`} 
                          className="bg-primary/10 text-primary p-4 rounded-2xl transition-all hover:bg-primary hover:text-white shadow-sm active:scale-95"
                      >
                          <ArrowRight size={20} strokeWidth={3} />
                      </Link>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        </div>
      </section>

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
                        <Link href="/inventory" className="text-xs font-black uppercase tracking-widest border-b-2 border-primary pb-1 hover:text-primary transition-all">
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
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Execution Protocol</span>
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
                        Common <br/> <span className="text-primary">Protocols.</span>
                    </h2>
                    <p className="text-sm text-zinc-400 font-bold uppercase tracking-widest leading-relaxed mb-8">
                        Essential registry information for Maryland, DC, and Virginia bidders.
                    </p>
                    <Link href="/contact" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-primary border-b-2 border-primary pb-1 hover:text-secondary hover:border-secondary transition-all">
                        Access Support Center →
                    </Link>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                    {[
                        { 
                            q: "Where are you located?", 
                            a: "We operate a centralized facility in Beltsville, Maryland, strategically positioned to serve the entire DMV metropolitan area.",
                            icon: MapPin
                        },
                        { 
                            q: "Do you sell mystery pallets?", 
                            a: "Negative. We specialize in individual asset liquidation. Every item is unboxed, inspected, and listed with high-resolution documentation.",
                            icon: Package
                        },
                        { 
                            q: "Are these auctions open to resellers?", 
                            a: "Affirmative. Our platform is a primary sourcing hub for local resellers, contractors, and DIY homeowners across Maryland.",
                            icon: TrendingUp
                        },
                        { 
                            q: "Is nationwide shipping available?", 
                            a: "Our protocol is strictly local pickup at the Beltsville facility. This ensures zero shipping friction and immediate inventory acquisition.",
                            icon: Truck
                        }
                    ].map((item, i) => (
                        <div key={i} className="group bg-zinc-50/50 border border-zinc-100 p-8 rounded-[32px] italic transition-all duration-500 hover:bg-white hover:shadow-xl hover:shadow-secondary/5 hover:border-primary/20">
                            <div className="flex items-start gap-6">
                                <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-zinc-300 group-hover:text-primary border border-zinc-100 transition-colors shrink-0">
                                    <item.icon size={20} />
                                </div>
                                <div>
                                    <h4 className="text-base font-black text-secondary uppercase mb-3 tracking-tight group-hover:text-primary transition-colors">
                                        {item.q}
                                    </h4>
                                    <p className="text-[13px] text-zinc-500 font-medium uppercase leading-relaxed">
                                        {item.a}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </section>
    </div>
  );
}
