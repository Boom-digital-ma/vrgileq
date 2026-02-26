import { UserPlus, LayoutGrid, Gavel, MapPin, ArrowRight, ChevronRight, ShieldCheck, Zap } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-zinc-50 font-sans antialiased text-secondary">
      {/* Page Header */}
      <section className="bg-white border-b border-zinc-100 pt-24 pb-20 relative overflow-hidden italic">
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <div className="flex items-center justify-center gap-3 mb-8">
                <div className="h-[1px] w-10 bg-primary" />
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">Auction Protocol</span>
                <div className="h-[1px] w-10 bg-primary" />
            </div>
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-secondary leading-[0.85] font-display uppercase mb-8">
                How It <br/> <span className="text-primary">Works</span>.
            </h1>
            <p className="max-w-2xl mx-auto text-zinc-400 text-lg md:text-xl font-medium leading-relaxed uppercase">
                A simple 4-step process to secure high-quality liquidation inventory in Maryland.
            </p>
        </div>
        <div className="absolute -bottom-24 -left-24 h-96 w-96 bg-primary/5 blur-[120px] rounded-full" />
      </section>

      {/* Steps Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {steps.map((step, i) => (
                    <div key={i} className="group bg-white p-10 md:p-16 rounded-[48px] border border-zinc-100 transition-all duration-500 hover:shadow-[0_30px_60px_rgba(11,43,83,0.05)] flex flex-col italic relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="h-16 w-16 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-400 group-hover:bg-primary/10 group-hover:text-primary transition-all mb-10 border border-zinc-100 group-hover:border-primary/20">
                                <step.icon size={32} strokeWidth={1.5} />
                            </div>
                            <div className="flex items-center gap-4 mb-6">
                                <span className="text-xs font-black text-primary tabular-nums tracking-widest">STEP 0{i+1}</span>
                                <h2 className="text-3xl font-bold text-secondary font-display uppercase leading-none">{step.title}</h2>
                            </div>
                            <p className="text-zinc-500 text-lg font-medium leading-relaxed uppercase mb-8">
                                {step.desc}
                            </p>
                            <div className="pt-8 border-t border-zinc-50">
                                <p className="text-zinc-400 text-[11px] font-bold uppercase tracking-widest leading-relaxed">
                                    {step.details}
                                </p>
                            </div>
                        </div>
                        {/* Background Step Number */}
                        <span className="absolute bottom-[-20px] right-[-10px] text-[180px] font-black text-zinc-50/50 leading-none select-none -rotate-12 pointer-events-none group-hover:text-primary/5 transition-colors">
                            {i+1}
                        </span>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Trust & Technology Section */}
      <section className="py-24 px-6 bg-secondary text-white overflow-hidden relative italic">
        <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                <div>
                    <h2 className="text-4xl md:text-6xl font-bold tracking-tight uppercase font-display leading-[0.85] mb-10">
                        Transparent <br/> <span className="text-primary">Bidding</span> Technology.
                    </h2>
                    <p className="text-xl text-white/60 font-medium mb-12 uppercase leading-relaxed">
                        Our platform ensures fair market value through real-time updates, anti-sniping protection, and secure transaction processing.
                    </p>
                    <div className="space-y-6">
                        {[
                            { title: "No Pallets / No Mystery", icon: ShieldCheck },
                            { title: "Individually Inspected Lots", icon: Zap },
                            { title: "Secure Stripe Integration", icon: ShieldCheck },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center text-primary">
                                    <item.icon size={20} />
                                </div>
                                <span className="text-sm font-bold uppercase tracking-widest">{item.title}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="relative">
                    <div className="aspect-square bg-gradient-to-br from-primary/20 to-transparent rounded-[60px] border border-white/10 p-12 flex items-center justify-center relative">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                        <div className="text-center">
                            <div className="text-[120px] font-black text-primary leading-none mb-4 italic tracking-tighter">99.9%</div>
                            <div className="text-xs font-black uppercase tracking-[0.4em] text-white/40">Uptime Protocol Active</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 px-6 bg-white border-t border-zinc-100">
        <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-secondary font-display uppercase italic mb-8">Ready to secure your next deal?</h2>
            <Link href="/auth/signup" className="bg-primary text-white px-12 py-6 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-secondary transition-all shadow-2xl shadow-primary/20 flex items-center justify-center gap-3 mx-auto w-fit group">
                Register Free <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
        </div>
      </section>
    </div>
  );
}
