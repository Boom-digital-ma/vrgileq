import { UserPlus, LayoutGrid, Gavel, MapPin, ShieldCheck, Zap, Home, ShoppingBag, Package, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function HowItWorksPage() {
  const steps = [
    {
      title: "Create an Account",
      desc: "Register free to access current auctions and secure your bidding capacity.",
      icon: UserPlus,
      details: "Quick signup process with secure Stripe-backed identity verification."
    },
    {
      title: "Browse Categories",
      desc: "Shop inspected Home Depot returns, appliances, and Target overstock.",
      icon: LayoutGrid,
      details: "Detailed listings with high-resolution photos and technical condition reports."
    },
    {
      title: "Place Your Bid",
      desc: "Bid online during live auction windows with real-time price updates.",
      icon: Gavel,
      details: "Use manual bidding or set a Max Bid (Proxy) to let the system bid for you."
    },
    {
      title: "Pick Up in Beltsville",
      desc: "Winning bidders schedule pickup during designated times at our warehouse.",
      icon: MapPin,
      details: "Organized, fast pickup process with QR-code gate pass verification."
    }
  ];

  const sources = [
    {
      title: "Home Depot Returns",
      desc: "High-quality tools, home improvement items, and seasonal products directly from major retailers.",
      icon: Home,
      tags: ["Power Tools", "Hardware", "Outdoor Living"]
    },
    {
      title: "Appliances",
      desc: "Refrigerators, washers, dryers, and small kitchen appliances. Inspected and ready for resale or use.",
      icon: Zap,
      tags: ["Kitchen", "Laundry", "Compact Units"]
    },
    {
      title: "Target Overstock",
      desc: "Brand new home goods, furniture, electronics, and decor from shelf-pulls and surplus inventory.",
      icon: ShoppingBag,
      tags: ["Furniture", "Electronics", "Decor"]
    }
  ];

  return (
    <div className="bg-zinc-50 font-sans antialiased text-secondary">
      {/* Page Header */}
      <section className="relative overflow-hidden border-b border-zinc-100 bg-white px-6 py-10 italic md:py-12">
        <div className="relative z-10 mx-auto max-w-7xl text-center">
            <div className="mb-4 flex items-center justify-center gap-2">
                <div className="h-[1px] w-6 bg-primary" />
                <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary">Simple process</span>
                <div className="h-[1px] w-6 bg-primary" />
            </div>
            <h1 className="mb-4 text-4xl font-black leading-none tracking-tighter text-secondary font-display uppercase md:text-5xl">
                How It <br/> <span className="text-primary">Works</span>.
            </h1>
            <p className="max-w-xl mx-auto text-zinc-400 text-base md:text-lg font-medium leading-relaxed uppercase">
                A simple 4-step process to secure high-quality liquidation inventory in Maryland.
            </p>
        </div>
        <div className="absolute -bottom-24 -left-24 h-64 w-64 bg-primary/5 blur-[100px] rounded-full" />
      </section>

      {/* Steps Section - Refined UI */}
      <section className="relative overflow-hidden bg-white px-6 py-10 md:py-12">
        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {steps.map((step, i) => (
                    <div key={i} className="group relative flex flex-col italic">
                        {/* Connection Line (Desktop) */}
                        {i < steps.length - 1 && (
                            <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-[1px] bg-zinc-100 group-hover:bg-primary/30 transition-colors z-0" />
                        )}
                        
                        <div className="relative z-10 flex h-full flex-col rounded-[32px] border border-zinc-100 bg-zinc-50/50 p-6 transition-all duration-700 group/card hover:border-primary/20 hover:bg-white hover:shadow-[0_40px_80px_rgba(11,43,83,0.08)] md:p-7">
                            {/* Step Indicator & Icon */}
                            <div className="mb-6 flex items-center justify-between">
                                <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center text-zinc-400 group-hover/card:bg-primary group-hover/card:text-white transition-all duration-500 shadow-sm border border-zinc-100 group-hover/card:border-primary group-hover/card:rotate-6">
                                    <step.icon size={28} strokeWidth={1.5} />
                                </div>
                                <span className="text-[10px] font-black text-primary/40 group-hover/card:text-primary tracking-[0.3em] uppercase transition-colors">
                                    Step 0{i+1}
                                </span>
                            </div>

                            {/* Content */}
                            <h2 className="mb-4 min-h-[50px] text-2xl font-black leading-[1.1] text-secondary font-display uppercase transition-colors group-hover/card:text-primary">
                                {step.title}
                            </h2>
                            <p className="mb-5 flex-1 text-[13px] font-bold leading-relaxed text-zinc-500 uppercase">
                                {step.desc}
                            </p>
                            
                            {/* Feature Badge */}
                            <div className="border-t border-zinc-100 pt-5 group-hover/card:border-primary/10">
                                <div className="rounded-2xl border border-zinc-100 bg-white/80 p-3 shadow-sm backdrop-blur-sm group-hover/card:border-primary/5">
                                    <p className="text-zinc-400 text-[9px] font-black uppercase tracking-widest leading-relaxed">
                                        {step.details}
                                    </p>
                                </div>
                            </div>

                            {/* Hover Decorative Number */}
                            <span className="absolute -top-4 -right-4 text-7xl font-black text-primary/5 opacity-0 group-hover/card:opacity-100 transition-all duration-700 pointer-events-none">
                                {i+1}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
        
        {/* Background Accents */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-[1px] bg-zinc-50/50 pointer-events-none" />
      </section>

      {/* Inventory Sources Section (Merged from inventory/page.tsx) */}
      <section className="border-b border-zinc-100 bg-zinc-50 px-6 py-12 md:py-16">
        <div className="max-w-7xl mx-auto">
            <div className="mb-10 text-center">
                <div className="mb-4 flex items-center justify-center gap-3">
                    <div className="h-1 w-8 bg-primary rounded-full" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Sourcing & Supply</span>
                    <div className="h-1 w-8 bg-primary rounded-full" />
                </div>
                <h2 className="text-3xl font-black tracking-tighter text-secondary font-display uppercase italic md:text-4xl">Inventory <span className="text-primary">Sources.</span></h2>
                <p className="mx-auto mt-3 max-w-2xl text-sm font-bold uppercase tracking-widest text-zinc-400">Direct from major retailers. Inspected. Verified.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {sources.map((source, i) => (
                    <div key={i} className="group flex flex-col rounded-[32px] border border-zinc-100 bg-white p-7 italic transition-all duration-500 hover:border-primary/20 hover:shadow-[0_30px_60px_rgba(11,43,83,0.05)]">
                        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-100 bg-zinc-50 text-zinc-400 transition-all group-hover:border-primary/20 group-hover:bg-primary/10 group-hover:text-primary">
                            <source.icon size={32} strokeWidth={1.5} />
                        </div>
                        <h2 className="mb-4 text-2xl font-bold leading-none text-secondary font-display uppercase">{source.title}</h2>
                        <p className="mb-5 flex-1 text-sm font-medium leading-relaxed text-zinc-500 uppercase">
                            {source.desc}
                        </p>
                        <div className="flex flex-wrap gap-2 border-t border-zinc-50 pt-5">
                            {source.tags.map((tag, tIdx) => (
                                <span key={tIdx} className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-zinc-50 text-zinc-400 rounded-full border border-zinc-100">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Why Individual Section (Merged from inventory/page.tsx) */}
      <section className="relative overflow-hidden bg-secondary px-6 py-12 text-white italic md:py-16">
        <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col items-center justify-between gap-10 lg:flex-row">
                <div className="max-w-xl">
                    <h2 className="mb-5 text-4xl font-bold leading-[0.85] tracking-tight font-display uppercase md:text-5xl">
                        Maryland&apos;s No-Pallet <br/> <span className="text-primary">Promise.</span>
                    </h2>
                    <p className="mb-6 text-lg font-medium leading-relaxed text-white/60 uppercase">
                        We break everything down, inspect each item, and list them individually. No &quot;mystery pallets&quot; or hidden junk.
                    </p>
                    <div className="space-y-3">
                        {[
                            "Transparent Condition Reports",
                            "High-Resolution Item Photos",
                            "Verified Product Authenticity",
                            "No Mystery Inventory Junk"
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <CheckCircle2 className="text-primary" size={20} />
                                <span className="text-sm font-bold uppercase tracking-widest">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="relative group">
                    <div className="flex h-56 w-56 items-center justify-center rounded-[48px] border border-white/10 bg-primary/10 p-8 transition-all duration-700 group-hover:scale-105 md:h-64 md:w-64">
                        <Package size={120} className="text-primary opacity-20" />
                    </div>
                    {/* Floating Tech Badges */}
                    <div className="absolute -right-3 -top-3 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md animate-bounce duration-[3s]">
                        <ShieldCheck className="text-primary" size={24} />
                    </div>
                </div>
            </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
      </section>

      {/* CTA Section */}
      <section className="border-t border-zinc-100 bg-white px-6 py-10 md:py-12">
        <div className="max-w-2xl mx-auto text-center italic">
            <h2 className="mb-4 text-2xl font-bold text-secondary font-display uppercase italic">
                Ready to secure <span className="text-primary">your items?</span>
            </h2>
            <Link href="/auth/signup" className="inline-block rounded-xl bg-primary px-8 py-4 text-[11px] font-bold uppercase tracking-widest text-white italic shadow-xl shadow-primary/10 transition-all hover:bg-secondary">
                Create Free Account
            </Link>
        </div>
      </section>
    </div>
  );
}
