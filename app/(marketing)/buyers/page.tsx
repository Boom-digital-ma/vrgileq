import { Gavel, CreditCard, Truck, Search, ShieldCheck, HelpCircle, ArrowRight, CheckCircle2, MessageSquare } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function BuyersPage() {
  const steps = [
    {
      title: "Inspection",
      icon: Search,
      desc: "Items are available for physical inspection prior to the auction close. We strongly recommend viewing assets in-situ to assess condition."
    },
    {
      title: "Registration",
      icon: CheckCircle2,
      desc: "Create an account and authorize your bidding capacity. A fully refundable deposit may be required for specific industrial events."
    },
    {
      title: "Bidding",
      icon: Gavel,
      desc: "Place your bids in real-time or set a Maximum Bid (Proxy). Our system automatically handles increments to keep you in the lead."
    },
    {
      title: "Closing",
      icon: ShieldCheck,
      desc: "Auctions close dynamically. Any last-minute bid triggers an automatic time extension to ensure fair market value for all parties."
    },
    {
      title: "Payment",
      icon: CreditCard,
      desc: "Invoices are generated immediately after the event. Payment is processed securely via the card on file or wire transfer for large amounts."
    },
    {
      title: "Removal",
      icon: Truck,
      desc: "Buyers are responsible for asset removal. Our logistics partners can assist with rigging, extraction, and nationwide shipping."
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-50 font-sans antialiased text-secondary">
      {/* SaaS Premium Header */}
      <section className="bg-white border-b border-zinc-100 pt-24 pb-20 relative overflow-hidden italic">
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <div className="flex items-center justify-center gap-3 mb-8">
                <div className="h-[1px] w-10 bg-primary" />
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">Protocol & Guidelines</span>
                <div className="h-[1px] w-10 bg-primary" />
            </div>
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-secondary leading-[0.85] font-display uppercase mb-8">
                Buyer's <br/> <span className="text-primary">Guide</span>.
            </h1>
            <p className="max-w-2xl mx-auto text-zinc-400 text-lg md:text-xl font-medium leading-relaxed uppercase">
                Everything you need to know about participating in Northern Virginia's premier industrial auctions.
            </p>
        </div>
        {/* Background Depth */}
        <div className="absolute -bottom-24 -left-24 h-96 w-96 bg-primary/5 blur-[120px] rounded-full" />
      </section>

      {/* Steps Grid - Modern SaaS Cards */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {steps.map((step, i) => (
                    <div key={i} className="group bg-white p-10 rounded-[40px] border border-zinc-100 transition-all duration-500 hover:shadow-[0_30px_60px_rgba(11,43,83,0.05)] hover:-translate-y-2 flex flex-col italic">
                        <div className="h-14 w-14 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-400 group-hover:bg-primary/10 group-hover:text-primary transition-all mb-8 border border-zinc-100 group-hover:border-primary/20">
                            <step.icon size={28} strokeWidth={1.5} />
                        </div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-[10px] font-bold text-primary tabular-nums">0{i+1}</span>
                            <h3 className="text-2xl font-bold text-secondary font-display uppercase leading-none">{step.title}</h3>
                        </div>
                        <p className="text-zinc-400 text-[13px] font-medium leading-relaxed uppercase">
                            {step.desc}
                        </p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Referral Banner - High Contrast SaaS CTA */}
      <section className="px-6 py-12">
        <div className="max-w-7xl mx-auto">
            <div className="bg-secondary rounded-[48px] p-12 md:p-20 text-white relative overflow-hidden italic shadow-2xl shadow-secondary/20">
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-12 items-center">
                    <div>
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight uppercase font-display leading-[0.9] mb-8">
                            Have an industrial <span className="text-primary">lead</span>? <br/> Earn up to 20% fees.
                        </h2>
                        <p className="text-lg text-white/50 font-medium max-w-xl mb-10">
                            Virginia Liquidation is proud to pay industry-leading referral fees for successful auction placements and asset acquisitions.
                        </p>
                        <div className="flex flex-wrap gap-6">
                            <Link href="/contact" className="bg-primary text-white px-10 py-5 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-white hover:text-secondary transition-all shadow-xl shadow-primary/20 flex items-center gap-3 group">
                                Contact Our Team <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                    <div className="hidden lg:flex justify-center">
                        <div className="h-48 w-48 rounded-full border border-white/10 flex items-center justify-center p-4 relative">
                            <div className="absolute inset-0 border-2 border-dashed border-primary/30 rounded-full animate-[spin_20s_linear_infinite]" />
                            <MessageSquare size={64} className="text-primary" />
                        </div>
                    </div>
                </div>
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
            </div>
        </div>
      </section>

      {/* FAQ Link Section */}
      <section className="py-24 px-6 bg-white border-t border-zinc-100">
        <div className="max-w-3xl mx-auto text-center">
            <div className="h-12 w-12 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-400 mx-auto mb-8 border border-zinc-100">
                <HelpCircle size={24} />
            </div>
            <h2 className="text-3xl font-bold text-secondary font-display uppercase italic mb-6">Need Further Clarification?</h2>
            <p className="text-zinc-400 font-medium uppercase text-sm mb-10">
                Our support desk is available Monday - Friday to assist with bidding registration, payment processing, or removal scheduling.
            </p>
            <Link href="/contact" className="text-xs font-bold uppercase tracking-[0.2em] text-primary border-b-2 border-primary pb-1 hover:text-secondary hover:border-secondary transition-all">
                Access Support Center →
            </Link>
        </div>
      </section>
    </div>
  );
}
