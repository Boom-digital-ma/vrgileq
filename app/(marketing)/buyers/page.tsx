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
    <div className="bg-zinc-50 font-sans antialiased text-secondary">
      {/* SaaS Premium Header */}
      <section className="relative overflow-hidden border-b border-zinc-100 bg-white pb-8 pt-10 italic">
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <div className="mb-5 flex items-center justify-center gap-3">
                <div className="h-[1px] w-10 bg-primary" />
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">Rules & Guidelines</span>
                <div className="h-[1px] w-10 bg-primary" />
            </div>
            <h1 className="mb-5 text-5xl font-bold leading-[0.85] tracking-tight text-secondary font-display uppercase md:text-7xl">
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
      <section className="px-6 py-12">
        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {steps.map((step, i) => (
                    <div key={i} className="group flex flex-col rounded-[32px] border border-zinc-100 bg-white p-6 italic transition-all duration-500 hover:-translate-y-1 hover:border-primary/20 hover:shadow-[0_20px_40px_rgba(11,43,83,0.05)]">
                        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-100 bg-zinc-50 text-zinc-400 transition-all group-hover:border-primary/20 group-hover:bg-primary/10 group-hover:text-primary">
                            <step.icon size={24} strokeWidth={1.5} />
                        </div>
                        <div className="mb-3 flex items-center gap-3">
                            <span className="text-[10px] font-bold text-primary tabular-nums">0{i+1}</span>
                            <h3 className="text-xl font-bold leading-none text-secondary font-display uppercase">{step.title}</h3>
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
      <section className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
            <div className="relative overflow-hidden rounded-[40px] bg-secondary p-7 text-white italic shadow-2xl shadow-secondary/20 md:p-9">
                <div className="relative z-10 grid grid-cols-1 items-center gap-7 lg:grid-cols-[1.5fr_1fr]">
                    <div>
                        <h2 className="mb-5 text-3xl font-bold leading-[0.9] tracking-tight font-display uppercase md:text-4xl">
                            Have an industrial <span className="text-primary">lead</span>? <br/> Earn up to 20% fees.
                        </h2>
                        <p className="mb-6 max-w-xl text-base font-medium text-white/50">
                            Virginia Liquidation is proud to pay industry-leading referral fees for successful auction placements and asset acquisitions.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Link href="/contact" className="group flex items-center gap-3 rounded-2xl bg-primary px-7 py-3 text-xs font-bold uppercase tracking-widest text-white shadow-xl shadow-primary/20 transition-all hover:bg-white hover:text-secondary">
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
      <section className="border-t border-zinc-100 bg-white px-6 py-12">
        <div className="max-w-3xl mx-auto text-center">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-100 bg-zinc-50 text-zinc-400">
                <HelpCircle size={24} />
            </div>
            <h2 className="mb-4 text-3xl font-bold text-secondary font-display uppercase italic">Need Further Clarification?</h2>
            <p className="mb-6 text-sm font-medium uppercase text-zinc-400">
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
