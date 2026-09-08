import { ShieldCheck, Users, Globe2, Building2, Zap } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="bg-zinc-50 font-sans antialiased text-secondary">
      {/* SaaS Premium Header */}
      <section className="relative overflow-hidden border-b border-zinc-100 bg-white px-6 py-10 italic md:py-12">
        <div className="relative z-10 mx-auto max-w-7xl text-center">
            <div className="mb-4 flex items-center justify-center gap-2">
                <div className="h-[1px] w-6 bg-primary" />
                <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary">Trusted Local Partner</span>
                <div className="h-[1px] w-6 bg-primary" />
            </div>
            <h1 className="mb-4 text-4xl font-black leading-none tracking-tighter text-secondary font-display uppercase md:text-5xl">
                Serving the <br/> <span className="text-primary">DMV</span>.
            </h1>
            <p className="max-w-xl mx-auto text-zinc-400 text-base md:text-lg font-medium leading-relaxed uppercase">
                Virginia Liquidation was built to serve the Maryland–DC–Virginia community with a better liquidation buying experience.
            </p>
        </div>
        <div className="absolute -bottom-24 -left-24 h-64 w-64 bg-primary/5 blur-[100px] rounded-full" />
      </section>

      {/* Refined Content UI */}
      <section className="relative overflow-hidden bg-white px-6 py-10 md:py-12">
        <div className="max-w-6xl mx-auto">
            <div className="flex flex-col gap-6 font-sans antialiased italic">
                {/* Our Mission - Compact Layout */}
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-secondary/5 rounded-[40px] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative flex flex-col items-start gap-6 rounded-[32px] border border-zinc-100 bg-white p-7 shadow-sm md:p-9 lg:flex-row lg:items-center">
                        <div className="lg:w-1/3">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/10 rotate-3">
                                <ShieldCheck size={28} />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black text-secondary uppercase font-display leading-tight tracking-tighter">
                                Our <br/><span className="text-primary italic">Mission.</span>
                            </h2>
                        </div>
                        <div className="space-y-4 lg:w-2/3">
                            <div className="space-y-3 text-base font-bold leading-relaxed text-zinc-500 uppercase md:text-lg">
                                <p className="text-secondary">Our mission is simple: to make liquidation buying easier, more transparent, and more affordable for everyone.</p>
                                <p>We help homeowners, resellers, and contractors save significantly compared to retail prices while giving high-quality products a second life—reducing waste and supporting a more sustainable, environmentally responsible marketplace.</p>
                                <p>Transparency is the backbone of everything we do. Every item is clearly listed, accurately described, and fully visible before you bid, so you can buy with confidence.</p>
                                <p>With organized local pickup and a streamlined auction process, we make it easy to find value, reduce costs, and shop smarter.</p>
                                <div className="border-t border-zinc-50 pt-4">
                                    <Link href="/auctions" className="text-xl font-black tracking-tighter text-primary transition-colors hover:text-secondary">
                                        👉 Start bidding today and discover better deals with zero surprises.
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Team & Advantage - Compact Split Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-sans">
                    {/* The Advantage */}
                    <div className="group relative flex h-full flex-col overflow-hidden rounded-[32px] bg-secondary p-7 text-white md:p-9">
                        <div className="relative z-10">
                            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-primary backdrop-blur-md transition-transform duration-500 group-hover:rotate-6">
                                <Zap size={24} />
                            </div>
                            <h3 className="mb-4 text-2xl font-black tracking-tight font-display uppercase italic">The Advantage</h3>
                            <p className="mb-5 text-base font-medium leading-relaxed text-white/60 uppercase">
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
                    <div className="group flex h-full flex-col rounded-[32px] border border-zinc-100 bg-zinc-50 p-7 transition-all duration-700 hover:bg-white hover:shadow-xl hover:shadow-secondary/5 md:p-9">
                        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary transition-transform duration-500 group-hover:-rotate-3">
                            <Users size={24} />
                        </div>
                        <h3 className="mb-4 text-2xl font-black leading-tight tracking-tight text-secondary font-display uppercase italic">Our Team, Supporting You Every Step</h3>
                        
                        <div className="space-y-4 text-[11px] font-bold text-zinc-400 uppercase leading-relaxed mb-auto">
                            <p className="text-secondary/70">Our team of specialists is dedicated to supporting you before, during, and after every auction.</p>
                            <div className="grid grid-cols-1 gap-2">
                                {[
                                    { label: "Before", desc: "We carefully identify, inspect, and list every item with clear descriptions." },
                                    { label: "During", desc: "We ensure a smooth, transparent bidding experience with real-time support." },
                                    { label: "After", desc: "We guide you through payment and a fast, organized pickup process." },
                                    { label: "Post-pickup", desc: "If there are any issues, our team is here to ensure a fair resolution." },
                                ].map((item, idx) => (
                                    <div key={idx} className="flex gap-3 rounded-xl border border-zinc-100 bg-white p-2.5 shadow-sm transition-all group/item hover:border-primary/20">
                                        <div className="text-primary font-black min-w-[65px]">{item.label}:</div>
                                        <div className="group-hover/item:text-secondary transition-colors line-clamp-2">{item.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <Link href="/auctions" className="mt-5 w-fit text-base font-black tracking-tighter text-primary italic transition-colors hover:text-secondary">
                            Bid with confidence.
                        </Link>
                    </div>
                </div>
                
                {/* Visual Accent */}
                <div className="flex flex-col items-center justify-center gap-5 border-y border-zinc-50 py-5 md:flex-row">
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
      <section className="border-t border-zinc-100 bg-zinc-50 px-6 py-10 md:py-12">
        <div className="max-w-2xl mx-auto text-center">
            <h2 className="mb-4 text-2xl font-bold text-secondary font-display uppercase italic">Ready to Start Bidding?</h2>
            <Link href="/auctions" className="inline-block rounded-xl bg-primary px-8 py-4 text-[11px] font-bold uppercase tracking-widest text-white italic shadow-xl shadow-primary/10 transition-all hover:bg-secondary">
                Browse Auctions
            </Link>
        </div>
      </section>
    </div>
  );
}
