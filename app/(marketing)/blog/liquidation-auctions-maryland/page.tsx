import { ArrowLeft, Clock, Calendar, User, Share2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function BlogPostPage() {
  return (
    <div className="min-h-screen bg-white font-sans antialiased text-secondary">
      {/* Article Header */}
      <section className="pt-24 pb-16 px-6 border-b border-zinc-100">
        <div className="max-w-4xl mx-auto">
            <Link href="/blog" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-primary transition-all group mb-12">
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                Back to Journal
            </Link>
            
            <div className="flex items-center gap-4 mb-8">
                <span className="px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/10">
                    Industry Guide
                </span>
                <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest italic">
                    <div className="flex items-center gap-1.5"><Calendar size={12} /> Feb 25, 2026</div>
                    <div className="h-1 w-1 bg-zinc-200 rounded-full" />
                    <div className="flex items-center gap-1.5"><Clock size={12} /> 12 Min Read</div>
                </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-secondary leading-[1.1] font-display uppercase italic mb-10">
                Liquidation Auctions in <br/> <span className="text-primary text-glow">Maryland</span>: The Complete 2026 Guide.
            </h1>

            <div className="flex items-center justify-between py-8 border-y border-zinc-100 italic">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-zinc-100 border border-zinc-200 overflow-hidden">
                        <div className="w-full h-full bg-secondary flex items-center justify-center text-primary font-black text-xs italic">VL</div>
                    </div>
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest leading-none mb-1">Registry Editorial Team</p>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase">Industrial Analysis Unit</p>
                    </div>
                </div>
                <button className="p-3 bg-zinc-50 border border-zinc-100 rounded-2xl text-zinc-400 hover:text-primary hover:border-primary transition-all">
                    <Share2 size={18} />
                </button>
            </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-20 px-6 italic">
        <div className="max-w-3xl mx-auto prose prose-zinc prose-invert lg:prose-xl">
            <div className="aspect-[16/9] bg-zinc-100 rounded-[40px] overflow-hidden border border-zinc-100 mb-16 shadow-2xl">
                <img 
                    src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=1200" 
                    className="w-full h-full object-cover" 
                    alt="Liquidation Warehouse"
                />
            </div>

            <div className="space-y-12">
                <p className="text-xl text-zinc-500 leading-relaxed font-medium uppercase tracking-tight">
                    The liquidation market in the Maryland, DC, and Virginia (DMV) region has transformed. Gone are the days of mystery pallets and blind buying. Today, savvy homeowners and resellers are turning to local, individual-item auctions to secure high-value assets at a fraction of retail prices.
                </p>

                <h2 className="text-3xl font-bold text-secondary uppercase font-display border-l-4 border-primary pl-6">What are Liquidation Auctions?</h2>
                <p className="text-zinc-500 leading-relaxed uppercase font-medium">
                    Liquidation auctions occur when major retailers like Home Depot, Target, or Amazon need to move surplus inventory, seasonal overstock, or customer returns quickly. Instead of selling these to specialized brokers who hide junk in "mystery pallets," Virginia Liquidation brings these items directly to you, the end-user.
                </p>

                <div className="p-10 bg-zinc-50 border border-zinc-100 rounded-[40px] italic">
                    <h3 className="text-xl font-bold text-secondary uppercase mb-6 leading-tight">Why Maryland Buyers Choose Local Pickup</h3>
                    <ul className="space-y-4">
                        {[
                            "Zero Shipping Costs on Heavy Appliances",
                            "Physical Verification Opportunities",
                            "Fast, Same-Day Inventory Acquisition",
                            "Supporting the Local Maryland Circular Economy"
                        ].map((item, i) => (
                            <li key={i} className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-zinc-600">
                                <CheckCircle2 className="text-primary" size={18} />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                <h2 className="text-3xl font-bold text-secondary uppercase font-display border-l-4 border-primary pl-6">The Difference Between Pallets and Individual Items</h2>
                <p className="text-zinc-500 leading-relaxed uppercase font-medium">
                    Most national competitors focus on "Pallet Flipping." This is a high-risk gamble where you buy a wrapped pallet without knowing what's inside. At Virginia Liquidation, we break down every pallet we receive in our Beltsville facility. We inspect the items, photograph them individually, and list them with transparent condition reports.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8">
                    <div className="bg-rose-50 border border-rose-100 p-8 rounded-[32px]">
                        <h4 className="text-rose-600 font-black uppercase tracking-widest text-sm mb-4">The Pallet Risk</h4>
                        <p className="text-rose-400 text-xs font-bold uppercase leading-relaxed">
                            Hidden damage, missing parts, and excessive junk items that you still have to pay to dispose of.
                        </p>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[32px]">
                        <h4 className="text-emerald-600 font-black uppercase tracking-widest text-sm mb-4">The Individual Advantage</h4>
                        <p className="text-emerald-400 text-xs font-bold uppercase leading-relaxed">
                            You only bid on what you need. Full transparency on condition and actual item photos.
                        </p>
                    </div>
                </div>

                <h2 className="text-3xl font-bold text-secondary uppercase font-display border-l-4 border-primary pl-6">Evaluating Returns Inventory</h2>
                <p className="text-zinc-500 leading-relaxed uppercase font-medium">
                    When bidding on Home Depot or Target returns, pay close attention to the "Condition" field. We categorize items as "New/Open Box," "Inspected/Functional," or "As-Is." For Maryland contractors, "Scratch and Dent" appliances often provide the best ROI for rental properties or flips.
                </p>

                <blockquote className="p-12 bg-secondary rounded-[48px] text-white text-2xl font-black uppercase italic leading-tight text-center shadow-2xl shadow-secondary/20">
                    "Transparency is the only currency that matters in the liquidation industry."
                </blockquote>

                <h2 className="text-3xl font-bold text-secondary uppercase font-display border-l-4 border-primary pl-6">Conclusion</h2>
                <p className="text-zinc-500 leading-relaxed uppercase font-medium">
                    Whether you are sourcing tools for a job in Bethesda, appliances for a renovation in DC, or electronics for resale in Virginia, local liquidation auctions are your secret weapon.
                </p>
            </div>
        </div>
      </section>

      {/* Article Footer CTA */}
      <section className="py-24 px-6 bg-zinc-50 border-t border-zinc-100 italic">
        <div className="max-w-4xl mx-auto bg-white rounded-[48px] p-12 md:p-20 border border-zinc-100 shadow-xl text-center relative overflow-hidden">
            <h2 className="text-4xl font-bold text-secondary font-display uppercase italic mb-8 relative z-10">Start Bidding in Beltsville</h2>
            <p className="text-zinc-400 text-lg uppercase font-medium mb-12 relative z-10">
                Join our next local auction and secure inspected inventory today.
            </p>
            <Link href="/auth/signup" className="bg-primary text-white px-12 py-6 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-secondary transition-all shadow-2xl shadow-primary/20 inline-flex items-center gap-3 relative z-10">
                Create Free Account <User size={18} />
            </Link>
            <div className="absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
        </div>
      </section>
    </div>
  );
}
