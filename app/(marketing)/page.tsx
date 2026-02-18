import Link from "next/link";
import Image from "next/image";
import { Building2, ArrowRight, Package, MapPin, TrendingUp, Calendar, Gavel, ShieldCheck, Zap, ChevronRight, BarChart3, Globe2 } from "lucide-react";
import HeroSlider from "@/components/layout/HeroSlider";
import SearchBar from "@/components/layout/SearchBar";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export default async function HomePage() {
  const supabase = await createClient();

  const { data: events } = await supabase
    .from('auction_events')
    .select('*')
    .neq('status', 'draft')
    .order('created_at', { ascending: false })
    .limit(3);

  return (
    <div className="bg-zinc-50 font-sans tracking-tight text-neutral antialiased">
      <HeroSlider />

      {/* Featured Events Section */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-2xl">
                <div className="flex items-center gap-2 mb-4">
                    <div className="h-1 w-8 bg-primary rounded-full" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Active Auctions</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-secondary italic font-display uppercase leading-none">
                    Current <span className="text-primary">Live</span> Events
                </h2>
            </div>
            <Link href="/auctions" className="group flex items-center gap-3 bg-white border border-zinc-200 px-6 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:border-primary/30 transition-all shadow-sm">
                View All Catalog <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform text-primary" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          {events?.map((event) => (
            <div key={event.id} className="group flex flex-col bg-white rounded-[32px] border border-zinc-100 overflow-hidden transition-all duration-500 hover:shadow-[0_30px_60px_rgba(11,43,83,0.08)] hover:-translate-y-2">
              <Link href={`/events/${event.id}`} className="block relative aspect-[4/3] w-full overflow-hidden bg-zinc-50">
                {event.image_url ? (
                    <Image
                        src={event.image_url}
                        alt={event.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, 400px"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-200 text-[10px] font-bold uppercase italic p-12 text-center">
                        Image Pending
                    </div>
                )}
                <div className="absolute top-6 left-6 flex gap-2 items-center z-10">
                  {event.status === 'live' ? (
                    <div className="bg-rose-500 text-white px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-rose-500/20 animate-in fade-in zoom-in duration-500">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                        </span>
                        Live
                    </div>
                  ) : (
                    <div className="bg-white/90 backdrop-blur-md text-secondary px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border border-white/20 shadow-sm">
                      {event.status}
                    </div>
                  )}
                </div>
              </Link>
              
              <div className="p-8 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-4 text-zinc-400">
                  <Calendar size={14} className="text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Ends {new Date(event.ends_at).toLocaleDateString()}</span>
                </div>
                
                <h3 className="text-2xl font-bold text-secondary mb-4 group-hover:text-primary transition-colors italic font-display uppercase leading-tight line-clamp-2 h-14">
                    {event.title}
                </h3>

                <p className="text-[11px] font-medium text-zinc-400 leading-relaxed uppercase mb-8 line-clamp-3 italic">
                    {event.description || "Industrial assets and surplus equipment liquidation event. Preview open for registered bidders."}
                </p>
                
                <div className="mt-auto pt-6 border-t border-zinc-50 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-zinc-900 uppercase tracking-widest italic">Open for Bidding</span>
                    </div>
                    <Link 
                        href={`/events/${event.id}`} 
                        className="bg-zinc-50 group-hover:bg-primary p-4 rounded-2xl transition-all border border-zinc-100 group-hover:border-primary group-hover:text-white"
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

      {/* WHY PARTNER WITH US - SaaS UX */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-7xl">
            <div className="bg-secondary rounded-[48px] p-12 md:p-20 relative overflow-hidden italic text-white">
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-16 items-center">
                    <div>
                        <div className="flex items-center gap-3 mb-8">
                            <span className="h-[1px] w-10 bg-primary" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">Strategic Advantage</span>
                        </div>
                        <h2 className="text-5xl md:text-7xl font-bold tracking-tight mb-10 leading-[0.85] font-display uppercase">
                            Modern <br/>Liquidation.
                        </h2>
                        <p className="text-white/50 text-lg font-medium leading-relaxed max-w-lg mb-12">
                            Virginia Liquidation provides a professional secondary market for industrial assets with a focus on speed and transparency.
                        </p>
                        <Link href="/sellers" className="inline-flex items-center gap-4 text-xs font-bold uppercase tracking-widest border-b border-primary pb-2 hover:text-primary transition-all group">
                            Explore Seller Services <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { title: "Cataloging", icon: BarChart3, desc: "Professional lotting & verification." },
                            { title: "Logistics", icon: MapPin, desc: "Full-service removal & shipping." },
                            { title: "Security", icon: ShieldCheck, desc: "Stripe-backed financial protection." },
                            { title: "Network", icon: Globe2, desc: "Nationwide industrial buyers reach." },
                        ].map((item, i) => (
                            <div key={i} className="p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-[32px] hover:bg-white/10 transition-all">
                                <div className="h-10 w-10 bg-primary/20 rounded-2xl flex items-center justify-center text-primary mb-4">
                                    <item.icon size={20} />
                                </div>
                                <h4 className="text-sm font-bold text-white mb-1 uppercase italic">{item.title}</h4>
                                <p className="text-[10px] text-white/30 font-medium leading-relaxed uppercase">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 h-96 w-96 bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
            </div>
        </div>
      </section>

      {/* BIG STATS / INVENTORY BLOC */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white border border-zinc-100 rounded-[40px] p-10 flex flex-col justify-between group hover:border-primary/20 transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-secondary/5">
                    <div>
                        <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:scale-110 transition-transform">
                            <ShieldCheck size={24} />
                        </div>
                        <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-2">Verified Inventory</h4>
                        <p className="text-[11px] font-medium text-zinc-500 leading-relaxed uppercase italic">Every asset is physically cataloged by our technical team.</p>
                    </div>
                    <div className="mt-12">
                        <span className="text-7xl font-bold text-secondary font-display italic leading-none tracking-tighter group-hover:text-primary transition-colors">100%</span>
                    </div>
                </div>

                <div className="bg-white border border-zinc-100 rounded-[40px] p-10 flex flex-col justify-between group hover:border-primary/20 transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-secondary/5">
                    <div>
                        <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:scale-110 transition-transform">
                            <Zap size={24} />
                        </div>
                        <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-2">Execution Speed</h4>
                        <p className="text-[11px] font-medium text-zinc-500 leading-relaxed uppercase italic">Rapid removal protocols and instant payment processing.</p>
                    </div>
                    <div className="mt-12">
                        <span className="text-7xl font-bold text-secondary font-display italic leading-none tracking-tighter group-hover:text-primary transition-colors">FAST</span>
                    </div>
                </div>

                <Link href="/auctions" className="bg-primary rounded-[40px] p-10 flex flex-col justify-between group hover:bg-secondary transition-all duration-500 shadow-2xl shadow-primary/20 hover:shadow-secondary/20">
                    <div className="flex justify-end">
                        <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center text-white group-hover:rotate-45 transition-transform duration-500">
                            <ArrowRight size={24} />
                        </div>
                    </div>
                    <div>
                        <h4 className="text-3xl font-bold text-white font-display uppercase italic leading-tight mb-4">Start <br/>Exploring <br/>Events</h4>
                        <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest flex items-center gap-2 italic">
                            Live Auctions Now <span className="h-1 w-1 bg-white rounded-full animate-pulse" />
                        </p>
                    </div>
                </Link>
            </div>
        </div>
      </section>
    </div>
  );
}
