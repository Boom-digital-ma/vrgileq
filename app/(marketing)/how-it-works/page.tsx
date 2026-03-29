import { UserPlus, LayoutGrid, Gavel, MapPin, ArrowRight, ChevronRight, ShieldCheck, Zap, Home, ShoppingBag, Package, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

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
    <div className="min-h-screen bg-zinc-50 font-sans antialiased text-secondary">
      {/* Page Header */}
      <section className="bg-white border-b border-zinc-100 pt-20 pb-16 relative overflow-hidden italic">
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
                <div className="h-[1px] w-6 bg-primary" />
                <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary">Simple process</span>
                <div className="h-[1px] w-6 bg-primary" />
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-secondary leading-none font-display uppercase mb-6">
                How It <br/> <span className="text-primary">Works</span>.
            </h1>
            <p className="max-w-xl mx-auto text-zinc-400 text-base md:text-lg font-medium leading-relaxed uppercase">
                A simple 4-step process to secure high-quality liquidation inventory in Maryland.
            </p>
        </div>
        <div className="absolute -bottom-24 -left-24 h-64 w-64 bg-primary/5 blur-[100px] rounded-full" />
      </section>

      {/* Steps Section - Refined UI */}
      <section className="py-20 px-6 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {steps.map((step, i) => (
                    <div key={i} className="group relative flex flex-col italic">
                        {/* Connection Line (Desktop) */}
                        {i < steps.length - 1 && (
                            <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-[1px] bg-zinc-100 group-hover:bg-primary/30 transition-colors z-0" />
                        )}
                        
                        <div className="relative z-10 bg-zinc-50/50 p-10 rounded-[48px] border border-zinc-100 transition-all duration-700 hover:bg-white hover:shadow-[0_40px_80px_rgba(11,43,83,0.08)] hover:border-primary/20 flex flex-col h-full group/card">
                            {/* Step Indicator & Icon */}
                            <div className="flex items-center justify-between mb-10">
                                <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center text-zinc-400 group-hover/card:bg-primary group-hover/card:text-white transition-all duration-500 shadow-sm border border-zinc-100 group-hover/card:border-primary group-hover/card:rotate-6">
                                    <step.icon size={28} strokeWidth={1.5} />
                                </div>
                                <span className="text-[10px] font-black text-primary/40 group-hover/card:text-primary tracking-[0.3em] uppercase transition-colors">
                                    Step 0{i+1}
                                </span>
                            </div>

                            {/* Content */}
                            <h2 className="text-2xl font-black text-secondary uppercase font-display leading-[1.1] mb-6 min-h-[50px] group-hover/card:text-primary transition-colors">
                                {step.title}
                            </h2>
                            <p className="text-zinc-500 text-[13px] font-bold leading-relaxed uppercase mb-8 flex-1">
                                {step.desc}
                            </p>
                            
                            {/* Feature Badge */}
                            <div className="pt-8 border-t border-zinc-100 group-hover/card:border-primary/10">
                                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-zinc-100 group-hover/card:border-primary/5 shadow-sm">
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
      <section className="py-24 px-6 bg-zinc-50 border-b border-zinc-100">
        <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
                <div className="flex items-center justify-center gap-3 mb-6">
                    <div className="h-1 w-8 bg-primary rounded-full" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Sourcing & Supply</span>
                    <div className="h-1 w-8 bg-primary rounded-full" />
                </div>
                <h2 className="text-4xl md:text-6xl font-black text-secondary uppercase font-display italic tracking-tighter">Inventory <span className="text-primary">Sources.</span></h2>
                <p className="max-w-2xl mx-auto text-zinc-400 text-sm font-bold uppercase tracking-widest mt-4">Direct from major retailers. Inspected. Verified.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {sources.map((source, i) => (
                    <div key={i} className="group bg-white p-10 rounded-[48px] border border-zinc-100 transition-all duration-500 hover:shadow-[0_30px_60px_rgba(11,43,83,0.05)] hover:border-primary/20 flex flex-col italic">
                        <div className="h-16 w-16 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-400 group-hover:bg-primary/10 group-hover:text-primary transition-all mb-10 border border-zinc-100 group-hover:border-primary/20">
                            <source.icon size={32} strokeWidth={1.5} />
                        </div>
                        <h2 className="text-3xl font-bold text-secondary font-display uppercase mb-6 leading-none">{source.title}</h2>
                        <p className="text-zinc-500 text-sm font-medium leading-relaxed uppercase mb-8 flex-1">
                            {source.desc}
                        </p>
                        <div className="flex flex-wrap gap-2 pt-8 border-t border-zinc-50">
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
      <section className="py-24 px-6 bg-secondary text-white relative overflow-hidden italic">
        <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-20">
                <div className="max-w-xl">
                    <h2 className="text-4xl md:text-6xl font-bold tracking-tight uppercase font-display leading-[0.85] mb-10">
                        Maryland's No-Pallet <br/> <span className="text-primary">Promise.</span>
                    </h2>
                    <p className="text-xl text-white/60 font-medium mb-12 uppercase leading-relaxed">
                        We break everything down, inspect each item, and list them individually. No "mystery pallets" or hidden junk.
                    </p>
                    <div className="space-y-4">
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
                    <div className="h-80 w-80 bg-primary/10 rounded-[60px] border border-white/10 flex items-center justify-center p-12 transition-all group-hover:scale-105 duration-700">
                        <Package size={120} className="text-primary opacity-20" />
                    </div>
                    {/* Floating Tech Badges */}
                    <div className="absolute -top-4 -right-4 bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl animate-bounce duration-[3s]">
                        <ShieldCheck className="text-primary" size={24} />
                    </div>
                </div>
            </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
      </section>

      {/* Video Guides Section */}
      <section className="py-24 px-6 bg-zinc-50 border-b border-zinc-100 italic">
        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* How to Register */}
                <div className="space-y-8">
                    <div className="flex items-center gap-3">
                        <div className="h-1 w-8 bg-primary rounded-full" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Guide 01</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-secondary uppercase font-display italic tracking-tighter leading-none">
                        How to <span className="text-primary">Register.</span>
                    </h2>
                    <div className="aspect-video bg-secondary rounded-[40px] border border-zinc-200 shadow-2xl overflow-hidden relative group">
                        <video 
                            className="absolute inset-0 w-full h-full object-cover"
                            controls
                            preload="metadata"
                        >
                            <source src="https://buybest4less.com/assets/video/BB4LWebVideo.mp4" type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                        <div className="absolute inset-0 bg-secondary/10 pointer-events-none group-hover:bg-transparent transition-colors duration-500 z-10" />
                    </div>
                    <div className="flex items-center gap-4 bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm w-fit">
                        <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                            <ShieldCheck size={20} />
                        </div>
                        <span className="text-xs font-black text-secondary uppercase tracking-widest leading-tight">Identity Verification Powered by Stripe</span>
                    </div>
                </div>

                {/* How to Bid */}
                <div className="space-y-8">
                    <div className="flex items-center gap-3">
                        <div className="h-1 w-8 bg-primary rounded-full" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Guide 02</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-secondary uppercase font-display italic tracking-tighter leading-none">
                        How to <span className="text-primary">Place Bids.</span>
                    </h2>
                    <div className="aspect-video bg-secondary rounded-[40px] border border-zinc-200 shadow-2xl overflow-hidden relative group">
                        <video 
                            className="absolute inset-0 w-full h-full object-cover"
                            controls
                            preload="metadata"
                        >
                            <source src="https://buybest4less.com/assets/video/BB4LWebVideo.mp4" type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                        <div className="absolute inset-0 bg-secondary/10 pointer-events-none group-hover:bg-transparent transition-colors duration-500 z-10" />
                    </div>
                    <div className="flex items-center gap-4 bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm w-fit">
                        <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                            <Zap size={20} />
                        </div>
                        <span className="text-xs font-black text-secondary uppercase tracking-widest leading-tight">Real-Time Bidding Protocol</span>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-white border-t border-zinc-100">
        <div className="max-w-2xl mx-auto text-center italic">
            <h2 className="text-2xl font-bold text-secondary font-display uppercase italic mb-6">
                Ready to secure <span className="text-primary">your items?</span>
            </h2>
            <Link href="/auth/signup" className="inline-block bg-primary text-white px-10 py-5 rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-secondary transition-all shadow-xl shadow-primary/10 italic">
                Create Free Account
            </Link>
        </div>
      </section>
    </div>
  );
}
