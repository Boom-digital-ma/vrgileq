import { ClipboardCheck, FileSignature, Tags, Globe, MousePointer2, Megaphone, Search, Timer, CreditCard, Truck, FileSpreadsheet, DollarSign, ArrowRight, ChevronRight, BarChart3, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function SellersPage() {
  const steps = [
    { title: "Evaluation", icon: ClipboardCheck, desc: "Technical interview regarding your assets to prepare a tailored sales solution." },
    { title: "Engagement", icon: FileSignature, desc: "A formal agreement outlining the sale details and project scope is executed." },
    { title: "Identification", icon: Tags, desc: "Detailed inventory preparation, completed by our specialists or your team." },
    { title: "Web Posting", icon: Globe, desc: "Inventory is cataloged and posted to the marketplace within 1-3 days." },
    { title: "Online Preview", icon: MousePointer2, desc: "Searchable inventory available for immediate bidding and preview." },
    { title: "Marketing", icon: Megaphone, desc: "Global outreach via newsletters, social media, and industry networks." },
    { title: "Inspection", icon: Search, desc: "On-site open house conducted prior to event closing for physical verification." },
    { title: "Event Closing", icon: Timer, desc: "Dynamic closing with automatic time extensions on last-minute offers." },
    { title: "Processing", icon: CreditCard, desc: "Automated transaction processing and instant receipt distribution." },
    { title: "Removal", icon: Truck, desc: "Supervised asset extraction and coordination during flexible windows." },
    { title: "Reconciliation", icon: FileSpreadsheet, desc: "Complete report including bidding history, revenue, and disbursement." },
    { title: "Settlement", icon: DollarSign, desc: "Final proceeds disbursement and closing interview for total satisfaction." }
  ];

  return (
    <div className="min-h-screen bg-zinc-50 font-sans antialiased text-secondary">
      {/* SaaS Premium Header */}
      <section className="bg-white border-b border-zinc-100 pt-24 pb-20 relative overflow-hidden italic">
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <div className="flex items-center justify-center gap-3 mb-8">
                <div className="h-[1px] w-10 bg-primary" />
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">Liquidation Strategy</span>
                <div className="h-[1px] w-10 bg-primary" />
            </div>
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-secondary leading-[0.85] font-display uppercase mb-8">
                Seller's <br/> <span className="text-primary">Console</span>.
            </h1>
            <p className="max-w-2xl mx-auto text-zinc-400 text-lg md:text-xl font-medium leading-relaxed uppercase">
                A 12-step professional protocol to maximize the value of your industrial surplus assets.
            </p>
        </div>
        <div className="absolute -top-24 -right-24 h-96 w-96 bg-primary/5 blur-[120px] rounded-full" />
      </section>

      {/* The 12-Step Protocol Grid */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-16 border-b border-zinc-200 pb-8">
                <div className="bg-primary/10 p-2.5 rounded-2xl text-primary">
                    <BarChart3 size={24} />
                </div>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-secondary font-display uppercase italic leading-none mb-2">The 12-Step Protocol</h2>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">End-to-end management workflow</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {steps.map((step, i) => (
                    <div key={i} className="group bg-white p-8 rounded-[32px] border border-zinc-100 transition-all duration-500 hover:shadow-[0_20px_40px_rgba(11,43,83,0.05)] hover:border-primary/20 flex flex-col italic h-full">
                        <div className="flex justify-between items-start mb-8">
                            <div className="h-12 w-12 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-400 group-hover:bg-primary/10 group-hover:text-primary transition-all border border-zinc-100 group-hover:border-primary/20">
                                <step.icon size={22} strokeWidth={1.5} />
                            </div>
                            <span className="text-[9px] font-bold text-zinc-200 tabular-nums">STEP 0{i+1 > 9 ? '' : '0'}{i+1}</span>
                        </div>
                        <h3 className="text-lg font-bold text-secondary font-display uppercase mb-3 leading-tight">{step.title}</h3>
                        <p className="text-zinc-400 text-[11px] font-medium leading-relaxed uppercase">
                            {step.desc}
                        </p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Corporate Reach - Modern SaaS Banner */}
      <section className="px-6 pb-24">
        <div className="max-w-7xl mx-auto">
            <div className="bg-secondary rounded-[48px] p-12 md:p-20 text-white relative overflow-hidden italic shadow-2xl shadow-secondary/20">
                <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-3 mb-8">
                            <span className="h-[1px] w-10 bg-primary" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">Strategic Partnership</span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-bold tracking-tight uppercase font-display leading-[0.85] mb-8">
                            Ready to <span className="text-primary">Liquidate</span>? <br/> Partner with us.
                        </h2>
                        <p className="text-lg text-white/50 font-medium mb-12 max-w-xl uppercase tracking-tight">
                            Leverage our network of nationwide industrial buyers and our technical cataloging expertise to secure maximum market value.
                        </p>
                        <div className="flex flex-wrap gap-6">
                            <Link href="/contact" className="bg-primary text-white px-12 py-6 rounded-3xl font-bold text-sm uppercase tracking-widest transition-all hover:bg-white hover:text-secondary shadow-2xl shadow-primary/30 flex items-center gap-3 group">
                                Start Assessment <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 w-full lg:w-[400px]">
                        {[
                            { label: "Market Reach", val: "Global", icon: Globe },
                            { label: "Financials", val: "Secure", icon: ShieldCheck },
                            { label: "Cataloging", val: "Tech-Led", icon: BarChart3 },
                            { label: "Settlement", val: "Fast", icon: DollarSign },
                        ].map((item, i) => (
                            <div key={i} className="p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10">
                                <item.icon className="text-primary mb-4" size={24} />
                                <div className="text-[8px] font-bold text-white/40 uppercase mb-1">{item.label}</div>
                                <div className="text-sm font-bold text-white uppercase">{item.val}</div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
            </div>
        </div>
      </section>
    </div>
  );
}
