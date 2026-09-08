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
    <div className="bg-zinc-50 font-sans antialiased text-secondary">
      {/* SaaS Premium Header */}
      <section className="relative overflow-hidden border-b border-zinc-100 bg-white pb-8 pt-10 italic">
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <div className="mb-5 flex items-center justify-center gap-3">
                <div className="h-[1px] w-10 bg-primary" />
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">Liquidation Strategy</span>
                <div className="h-[1px] w-10 bg-primary" />
            </div>
            <h1 className="mb-5 text-5xl font-bold leading-[0.85] tracking-tight text-secondary font-display uppercase md:text-7xl">
                Seller's <br/> <span className="text-primary">Console</span>.
            </h1>
            <p className="max-w-2xl mx-auto text-zinc-400 text-lg md:text-xl font-medium leading-relaxed uppercase">
                A 12-step professional process to maximize the value of your industrial surplus assets.
            </p>
        </div>
        <div className="absolute -top-24 -right-24 h-96 w-96 bg-primary/5 blur-[120px] rounded-full" />
      </section>

      {/* The 12-Step Process Grid */}
      <section className="px-6 py-12">
        <div className="max-w-7xl mx-auto">
            <div className="mb-8 flex items-center gap-4 border-b border-zinc-200 pb-5">
                <div className="bg-primary/10 p-2.5 rounded-2xl text-primary">
                    <BarChart3 size={24} />
                </div>
                <div>
                    <h2 className="mb-2 text-3xl font-bold leading-none tracking-tight text-secondary font-display uppercase italic">The 12-Step Process</h2>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">End-to-end management workflow</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
                {steps.map((step, i) => (
                    <div key={i} className="group flex h-full flex-col rounded-[28px] border border-zinc-100 bg-white p-6 italic transition-all duration-500 hover:border-primary/20 hover:shadow-[0_20px_40px_rgba(11,43,83,0.05)]">
                        <div className="mb-5 flex items-start justify-between">
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
      <section className="px-6 pb-12">
        <div className="max-w-7xl mx-auto">
            <div className="relative overflow-hidden rounded-[40px] bg-secondary p-7 text-white italic shadow-2xl shadow-secondary/20 md:p-9">
                <div className="relative z-10 flex flex-col items-center justify-between gap-8 lg:flex-row">
                    <div className="max-w-2xl">
                        <div className="mb-5 flex items-center gap-3">
                            <span className="h-[1px] w-10 bg-primary" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">Strategic Partnership</span>
                        </div>
                        <h2 className="mb-5 text-3xl font-bold leading-[0.85] tracking-tight font-display uppercase md:text-5xl">
                            Ready to <span className="text-primary">Liquidate</span>? <br/> Partner with us.
                        </h2>
                        <p className="mb-7 max-w-xl text-base font-medium uppercase tracking-tight text-white/50">
                            Leverage our network of nationwide industrial buyers and our technical cataloging expertise to secure maximum market value.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Link href="/contact" className="group flex items-center gap-3 rounded-2xl bg-primary px-7 py-3 text-xs font-bold uppercase tracking-widest text-white shadow-2xl shadow-primary/30 transition-all hover:bg-white hover:text-secondary">
                                Start Assessment <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                    
                    <div className="grid w-full grid-cols-2 gap-3 lg:w-[360px]">
                        {[
                            { label: "Market Reach", val: "Global", icon: Globe },
                            { label: "Financials", val: "Secure", icon: ShieldCheck },
                            { label: "Cataloging", val: "Tech-Led", icon: BarChart3 },
                            { label: "Settlement", val: "Fast", icon: DollarSign },
                        ].map((item, i) => (
                            <div key={i} className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
                                <item.icon className="mb-3 text-primary" size={22} />
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
