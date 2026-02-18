import { ShieldCheck, History, Users, Globe2, Building2, ChevronRight, BarChart3, Zap } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function AboutPage() {
  const corporateEntities = [
    { name: "ABC Liquidation", specialty: "Commercial Surplus", location: "Alexandria, VA" },
    { name: "Virginia Asset Recovery", specialty: "Industrial Rigging", location: "Richmond, VA" },
    { name: "NoVA Logistics", specialty: "Nationwide Shipping", location: "Washington DC" },
    { name: "Capital Appraisals", specialty: "Technical Valuation", location: "Falls Church, VA" }
  ];

  return (
    <div className="min-h-screen bg-zinc-50 font-sans antialiased text-secondary">
      {/* SaaS Premium Header */}
      <section className="bg-white border-b border-zinc-100 pt-24 pb-20 relative overflow-hidden italic">
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <div className="flex items-center justify-center gap-3 mb-8">
                <div className="h-[1px] w-10 bg-primary" />
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">Our Legacy since 1981</span>
                <div className="h-[1px] w-10 bg-primary" />
            </div>
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-secondary leading-[0.85] font-display uppercase mb-8">
                The New <br/> <span className="text-primary">Player</span>.
            </h1>
            <p className="max-w-2xl mx-auto text-zinc-400 text-lg md:text-xl font-medium leading-relaxed uppercase">
                Bridging the gap between industrial tradition and modern liquidation technology for over 40 years.
            </p>
        </div>
        <div className="absolute -bottom-24 -left-24 h-96 w-96 bg-primary/5 blur-[120px] rounded-full" />
      </section>

      {/* Philosophy Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-20 items-start">
                <div className="sticky top-32">
                    <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-8 border border-primary/20">
                        <ShieldCheck size={24} />
                    </div>
                    <h2 className="text-4xl font-bold tracking-tight text-secondary font-display uppercase italic leading-none mb-6">Un-eBay <br/>Philosophy.</h2>
                    <p className="text-zinc-400 font-medium text-sm leading-relaxed uppercase mb-8">
                        We don't just host listings. We Physically catalog, verify, and manage every asset that passes through our marketplace.
                    </p>
                    <div className="flex flex-col gap-4">
                        {[
                            { label: "Founded", val: "1981" },
                            { label: "HQ", val: "Alexandria, VA" },
                            { label: "Status", val: "Licensed & Bonded" },
                        ].map((stat, i) => (
                            <div key={i} className="flex justify-between items-center py-3 border-b border-zinc-100">
                                <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">{stat.label}</span>
                                <span className="text-xs font-bold text-secondary uppercase italic">{stat.val}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-16">
                    <div className="p-10 md:p-16 bg-white rounded-[48px] border border-zinc-100 shadow-sm italic group hover:shadow-xl hover:shadow-secondary/5 transition-all duration-500">
                        <h3 className="text-2xl font-bold text-secondary font-display uppercase mb-8">Professional Technical Assessment</h3>
                        <p className="text-zinc-500 text-lg leading-relaxed uppercase font-medium">
                            Virginia Liquidation specializes in industrial auctions, large lots of bulk items, and overstocked inventory from manufacturers. Unlike generic marketplaces, we provide high-resolution technical documentation and physically verified reports for every asset.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="p-10 bg-white border border-zinc-100 rounded-[40px] italic group hover:border-primary/20 transition-all shadow-sm">
                            <Zap className="text-primary mb-6" size={32} />
                            <h4 className="text-xl font-bold font-display uppercase text-secondary mb-4">The Advantage</h4>
                            <p className="text-sm text-zinc-400 leading-relaxed uppercase">
                                Our platform leverages modern SaaS architecture to provide instant bidding, real-time surenchére, and secure Stripe-backed transactions.
                            </p>
                        </div>
                        <div className="p-10 bg-white border border-zinc-100 rounded-[40px] italic group hover:border-primary/20 transition-all shadow-sm">
                            <Users className="text-primary mb-6" size={32} />
                            <h4 className="text-xl font-bold font-display uppercase text-secondary mb-4">Dedicated Team</h4>
                            <p className="text-sm text-zinc-400 leading-relaxed uppercase">
                                Our team of specialists handles everything from lot identification to rigging supervision and logistics coordination.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Corporate Family - Clean SaaS Light Grid */}
      <section className="py-24 px-6 bg-white border-t border-zinc-100 italic">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-1 w-8 bg-primary rounded-full" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Institutional Strength</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-secondary font-display uppercase italic leading-none">The Corporate <span className="text-primary">Family</span>.</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {corporateEntities.map((entity, i) => (
                    <div key={i} className="p-8 bg-zinc-50 border border-zinc-100 rounded-[32px] hover:bg-white hover:border-primary/20 hover:shadow-xl hover:shadow-secondary/5 transition-all duration-500 group">
                        <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center border border-zinc-100 mb-6 group-hover:bg-primary/5 transition-all">
                            <Building2 className="text-zinc-300 group-hover:text-primary transition-colors" size={24} />
                        </div>
                        <h4 className="text-lg font-bold text-secondary mb-2 uppercase italic leading-none">{entity.name}</h4>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-8">{entity.specialty}</p>
                        <div className="pt-6 border-t border-zinc-100 flex items-center justify-between">
                            <span className="text-[9px] font-bold text-zinc-300 uppercase">{entity.location}</span>
                            <ChevronRight size={14} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 px-6 bg-zinc-50 border-t border-zinc-100">
        <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-secondary font-display uppercase italic mb-8">Ready to Engage Our Services?</h2>
            <Link href="/engage" className="bg-primary text-white px-12 py-6 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-secondary transition-all shadow-2xl shadow-primary/20 italic">
                Get Strategic Consultation
            </Link>
        </div>
      </section>
    </div>
  );
}
