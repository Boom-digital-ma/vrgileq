import { Package, Zap, Home, ShoppingBag, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function InventoryPage() {
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
      <section className="bg-white border-b border-zinc-100 pt-24 pb-20 relative overflow-hidden italic">
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <div className="flex items-center justify-center gap-3 mb-8">
                <div className="h-[1px] w-10 bg-primary" />
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">Sourcing & Supply</span>
                <div className="h-[1px] w-10 bg-primary" />
            </div>
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-secondary leading-[0.85] font-display uppercase mb-8">
                Inventory <br/> <span className="text-primary">Sources</span>.
            </h1>
            <p className="max-w-2xl mx-auto text-zinc-400 text-lg md:text-xl font-medium leading-relaxed uppercase">
                We specialize in individual inspected items from the nation's largest retailers.
            </p>
        </div>
        <div className="absolute -top-24 -left-24 h-96 w-96 bg-primary/5 blur-[120px] rounded-full" />
      </section>

      {/* Sources Grid */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
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

      {/* Why Individual Section */}
      <section className="py-24 px-6 bg-secondary text-white relative overflow-hidden italic">
        <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-20">
                <div className="max-w-xl">
                    <h2 className="text-4xl md:text-6xl font-bold tracking-tight uppercase font-display leading-[0.85] mb-10">
                        Why We Don't <br/> Sell <span className="text-primary">Pallets</span>.
                    </h2>
                    <p className="text-xl text-white/60 font-medium mb-12 uppercase leading-relaxed">
                        Most liquidation companies sell "mystery pallets" with hidden junk. We break everything down, inspect each item, and list them individually.
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
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-4xl font-black uppercase italic tracking-tighter text-white/10 rotate-[-15deg] select-none">No Pallets</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 px-6 bg-white border-t border-zinc-100">
        <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-secondary font-display uppercase italic mb-8">View our current inspected inventory</h2>
            <Link href="/auctions" className="bg-primary text-white px-12 py-6 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-secondary transition-all shadow-2xl shadow-primary/20 flex items-center justify-center gap-3 mx-auto w-fit group">
                Browse Auctions <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
        </div>
      </section>
    </div>
  );
}
