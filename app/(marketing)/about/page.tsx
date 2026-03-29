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
      <section className="bg-white border-b border-zinc-100 pt-20 pb-16 relative overflow-hidden italic">
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
                <div className="h-[1px] w-6 bg-primary" />
                <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary">Trusted Local Partner</span>
                <div className="h-[1px] w-6 bg-primary" />
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-secondary leading-none font-display uppercase mb-6">
                Serving the <br/> <span className="text-primary">DMV</span>.
            </h1>
            <p className="max-w-xl mx-auto text-zinc-400 text-base md:text-lg font-medium leading-relaxed uppercase">
                Virginia Liquidation was built to serve the Maryland–DC–Virginia community with a better liquidation buying experience.
            </p>
        </div>
        <div className="absolute -bottom-24 -left-24 h-64 w-64 bg-primary/5 blur-[100px] rounded-full" />
      </section>

      {/* Refined Content UI */}
      <section className="py-16 px-6 bg-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto">
            <div className="flex flex-col gap-12 font-sans antialiased italic">
                {/* Our Mission - Compact Layout */}
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-secondary/5 rounded-[40px] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative bg-white p-10 md:p-14 rounded-[32px] border border-zinc-100 shadow-sm flex flex-col lg:flex-row gap-12 items-start">
                        <div className="lg:w-1/3">
                            <div className="h-12 w-12 bg-primary text-white rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-primary/10 rotate-3">
                                <ShieldCheck size={28} />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black text-secondary uppercase font-display leading-tight tracking-tighter">
                                Our <br/><span className="text-primary italic">Mission.</span>
                            </h2>
                        </div>
                        <div className="lg:w-2/3 space-y-6">
                            <div className="text-zinc-500 text-base md:text-lg font-bold leading-relaxed uppercase space-y-4">
                                <p className="text-secondary">Our mission is simple: to make liquidation buying easier, more transparent, and more affordable for everyone.</p>
                                <p>We help homeowners, resellers, and contractors save significantly compared to retail prices while giving high-quality products a second life—reducing waste and supporting a more sustainable, environmentally responsible marketplace.</p>
                                <p>Transparency is the backbone of everything we do. Every item is clearly listed, accurately described, and fully visible before you bid, so you can buy with confidence.</p>
                                <p>With organized local pickup and a streamlined auction process, we make it easy to find value, reduce costs, and shop smarter.</p>
                                <div className="pt-6 border-t border-zinc-50">
                                    <p className="text-primary font-black text-xl tracking-tighter">👉 Start bidding today and discover better deals with zero surprises.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Team & Advantage - Compact Split Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-sans">
                    {/* The Advantage */}
                    <div className="bg-secondary p-10 md:p-12 rounded-[32px] text-white flex flex-col h-full relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="h-12 w-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-primary mb-8 border border-white/10 group-hover:rotate-6 transition-transform duration-500">
                                <Zap size={24} />
                            </div>
                            <h3 className="text-2xl font-black uppercase font-display mb-6 italic tracking-tight">The Advantage</h3>
                            <p className="text-base text-white/60 font-medium leading-relaxed uppercase mb-8">
                                Our platform leverages modern SaaS architecture to provide instant bidding, real-time tracking, and secure Stripe-backed transactions.
                            </p>
                            <div className="flex items-center gap-3 text-primary text-[9px] font-black uppercase tracking-[0.2em]">
                                <div className="h-[1px] w-6 bg-primary rounded-full" />
                                <span>Technology Powered</span>
                            </div>
                        </div>
                        <div className="absolute -bottom-24 -right-24 h-48 w-48 bg-primary/10 blur-[80px] rounded-full group-hover:bg-primary/20 transition-all duration-700" />
                    </div>

                    {/* Dedicated Team */}
                    <div className="bg-zinc-50 p-10 md:p-12 rounded-[32px] border border-zinc-100 flex flex-col h-full group hover:bg-white hover:shadow-xl hover:shadow-secondary/5 transition-all duration-700">
                        <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-8 border border-primary/20 group-hover:-rotate-3 transition-transform duration-500">
                            <Users size={24} />
                        </div>
                        <h3 className="text-2xl font-black uppercase font-display text-secondary mb-6 italic tracking-tight leading-tight">Our Team, Supporting You Every Step</h3>
                        
                        <div className="space-y-4 text-[11px] font-bold text-zinc-400 uppercase leading-relaxed mb-auto">
                            <p className="text-secondary/70">Our team of specialists is dedicated to supporting you before, during, and after every auction.</p>
                            <div className="grid grid-cols-1 gap-3">
                                {[
                                    { label: "Before", desc: "We carefully identify, inspect, and list every item with clear descriptions." },
                                    { label: "During", desc: "We ensure a smooth, transparent bidding experience with real-time support." },
                                    { label: "After", desc: "We guide you through payment and a fast, organized pickup process." },
                                    { label: "Post-pickup", desc: "If there are any issues, our team is here to ensure a fair resolution." },
                                ].map((item, idx) => (
                                    <div key={idx} className="flex gap-3 p-3 bg-white rounded-xl border border-zinc-100 shadow-sm group/item hover:border-primary/20 transition-all">
                                        <div className="text-primary font-black min-w-[65px]">{item.label}:</div>
                                        <div className="group-hover/item:text-secondary transition-colors line-clamp-2">{item.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <p className="mt-8 text-primary font-black text-base tracking-tighter italic">👉 Bid with confidence.</p>
                    </div>
                </div>
                
                {/* Visual Accent */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-8 border-y border-zinc-50">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-zinc-50 rounded-xl border border-zinc-100 flex items-center justify-center text-zinc-300">
                            <Globe2 size={20} />
                        </div>
                        <div>
                            <div className="text-[9px] font-black uppercase tracking-widest text-zinc-300">Location</div>
                            <div className="text-xs font-bold uppercase text-secondary italic">Beltsville, MD</div>
                        </div>
                    </div>
                    <div className="h-[1px] w-16 bg-zinc-100 hidden md:block" />
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-zinc-50 rounded-xl border border-zinc-100 flex items-center justify-center text-zinc-300">
                            <Building2 size={20} />
                        </div>
                        <div>
                            <div className="text-[9px] font-black uppercase tracking-widest text-zinc-300">Region</div>
                            <div className="text-xs font-bold uppercase text-secondary italic">Greater DMV Area</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 px-6 bg-zinc-50 border-t border-zinc-100">
        <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-secondary font-display uppercase italic mb-6">Ready to Engage Our Services?</h2>
            <Link href="/engage" className="inline-block bg-primary text-white px-10 py-5 rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-secondary transition-all shadow-xl shadow-primary/10 italic">
                Get Strategic Consultation
            </Link>
        </div>
      </section>
    </div>
  );
}
