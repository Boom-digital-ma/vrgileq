import { ArrowLeft, Clock, Calendar, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import ShareButton from "@/components/blog/ShareButton";

export default function BlogPostPage() {
  return (
    <div className="bg-white font-sans antialiased text-secondary">
      {/* Article Header */}
      <section className="border-b border-zinc-100 px-6 pb-10 pt-12 md:pb-12 md:pt-16">
        <div className="max-w-4xl mx-auto">
            <Link href="/blog" className="group mb-7 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 transition-all hover:text-primary">
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                Back to Journal
            </Link>
            
            <div className="mb-5 flex items-center gap-4">
                <span className="px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/10">
                    Auction Guide
                </span>
                <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest italic">
                    <div className="flex items-center gap-1.5"><Calendar size={12} /> February 25, 2026</div>
                    <div className="h-1 w-1 bg-zinc-200 rounded-full" />
                    <div className="flex items-center gap-1.5"><Clock size={12} /> 12 minute read</div>
                </div>
            </div>

            <h1 className="mb-6 text-4xl font-bold leading-[1.1] tracking-tight text-secondary font-display uppercase italic md:text-5xl">
                Buying at Liquidation Auctions in <br/> <span className="text-primary text-glow">Maryland</span>.
            </h1>

            <div className="flex items-center justify-between border-y border-zinc-100 py-5 italic">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-zinc-100 border border-zinc-200 overflow-hidden">
                        <div className="w-full h-full bg-secondary flex items-center justify-center text-primary font-black text-xs italic">VL</div>
                    </div>
                    <div>
                        <p className="mb-1 text-xs font-black uppercase tracking-widest leading-none">Virginia Liquidation</p>
                        <p className="text-[10px] font-bold uppercase text-zinc-400">Auction Team</p>
                    </div>
                </div>
                <ShareButton title="Buying at Liquidation Auctions in Maryland" />
            </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="px-6 py-10 italic md:py-12">
        <div className="max-w-3xl mx-auto prose prose-zinc prose-invert lg:prose-xl">
            <div className="mb-8 aspect-[16/9] overflow-hidden rounded-[32px] border border-zinc-100 bg-zinc-100 shadow-2xl">
                <img 
                    src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=1200" 
                    className="w-full h-full object-cover" 
                    alt="Liquidation Warehouse"
                />
            </div>

            <div className="space-y-8">
                <p className="text-xl text-zinc-500 leading-relaxed font-medium uppercase tracking-tight">
                    The liquidation market in the Maryland, DC, and Virginia (DMV) region has transformed. Gone are the days of mystery pallets and blind buying. Today, savvy homeowners and resellers are turning to local, individual-item auctions to secure high-value assets at a fraction of retail prices.
                </p>

                <h2 className="text-3xl font-bold text-secondary uppercase font-display border-l-4 border-primary pl-6">What are Liquidation Auctions?</h2>
                <p className="text-zinc-500 leading-relaxed uppercase font-medium">
                    Liquidation auctions occur when major retailers like Home Depot, Target, or Amazon need to move surplus inventory, seasonal overstock, or customer returns quickly. Instead of selling these to specialized brokers who hide junk in "mystery pallets," Virginia Liquidation brings these items directly to you, the end-user.
                </p>

                <div className="rounded-[32px] border border-zinc-100 bg-zinc-50 p-7 italic">
                    <h3 className="mb-4 text-xl font-bold leading-tight text-secondary uppercase">Why Maryland Buyers Choose Local Pickup</h3>
                    <ul className="space-y-3">
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

                <div className="grid grid-cols-1 gap-5 py-4 md:grid-cols-2">
                    <div className="rounded-[32px] border border-rose-100 bg-rose-50 p-6">
                        <h4 className="mb-3 text-sm font-black uppercase tracking-widest text-rose-600">The Pallet Risk</h4>
                        <p className="text-rose-400 text-xs font-bold uppercase leading-relaxed">
                            Hidden damage, missing parts, and excessive junk items that you still have to pay to dispose of.
                        </p>
                    </div>
                    <div className="rounded-[32px] border border-emerald-100 bg-emerald-50 p-6">
                        <h4 className="mb-3 text-sm font-black uppercase tracking-widest text-emerald-600">The Individual Advantage</h4>
                        <p className="text-emerald-400 text-xs font-bold uppercase leading-relaxed">
                            You only bid on what you need. Full transparency on condition and actual item photos.
                        </p>
                    </div>
                </div>

                <h2 className="text-3xl font-bold text-secondary uppercase font-display border-l-4 border-primary pl-6">Evaluating Returns Inventory</h2>
                <p className="text-zinc-500 leading-relaxed uppercase font-medium">
                    When bidding on Home Depot or Target returns, pay close attention to the "Condition" field. We categorize items as "New/Open Box," "Inspected/Functional," or "As-Is." For Maryland contractors, "Scratch and Dent" appliances often provide the best ROI for rental properties or flips.
                </p>

                <blockquote className="rounded-[32px] bg-secondary p-7 text-center text-xl font-black leading-tight text-white uppercase italic shadow-2xl shadow-secondary/20">
                    "Transparency is the only currency that matters in the liquidation industry."
                </blockquote>

                <h2 className="text-3xl font-bold text-secondary uppercase font-display border-l-4 border-primary pl-6">Conclusion</h2>
                <p className="text-zinc-500 leading-relaxed uppercase font-medium">
                    Whether you are sourcing tools for a job in Bethesda, appliances for a renovation in DC, or electronics for resale in Virginia, local liquidation auctions are your secret weapon.
                </p>
            </div>
        </div>
      </section>

    </div>
  );
}
