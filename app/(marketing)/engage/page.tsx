import { Building2, ShieldCheck, Zap, BarChart3, Globe2, ChevronRight, MessageSquare, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function EngagePage() {
  const services = [
    { title: "Corporate Decommissioning", icon: Building2, desc: "End-to-end management of large-scale facility closures and technical asset liquidation." },
    { title: "Strategic Inventory Recovery", icon: BarChart3, desc: "Maximizing the residual value of surplus machinery and technical commercial hardware." },
    { title: "Technical Asset Appraisal", icon: ShieldCheck, desc: "Certified valuation reports for industrial equipment and complex institutional assets." },
    { title: "Logistics Coordination", icon: Globe2, desc: "Nationwide extraction, rigging, and specialized shipping for heavy-duty industrial lots." }
  ];

  return (
    <div className="min-h-screen bg-zinc-50 font-sans antialiased text-secondary italic">
      {/* SaaS Premium Header */}
      <section className="bg-white border-b border-zinc-100 pt-24 pb-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <div className="flex items-center justify-center gap-3 mb-8">
                <div className="h-[1px] w-10 bg-primary" />
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">Enterprise Solutions</span>
                <div className="h-[1px] w-10 bg-primary" />
            </div>
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-secondary leading-[0.85] font-display uppercase mb-8">
                Strategic <br/> <span className="text-primary">Engagement</span>.
            </h1>
            <p className="max-w-2xl mx-auto text-zinc-400 text-lg md:text-xl font-medium leading-relaxed uppercase">
                Customized liquidation protocols for high-value industrial and institutional stakeholders.
            </p>
        </div>
        <div className="absolute -bottom-24 -right-24 h-96 w-96 bg-primary/5 blur-[120px] rounded-full" />
      </section>

      {/* Services Grid */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {services.map((service, i) => (
                    <div key={i} className="group bg-white p-10 rounded-[40px] border border-zinc-100 transition-all duration-500 hover:shadow-[0_30px_60px_rgba(11,43,83,0.05)] hover:-translate-y-2 flex flex-col items-start h-full">
                        <div className="h-14 w-14 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-400 group-hover:bg-primary/10 group-hover:text-primary transition-all mb-8 border border-zinc-100 group-hover:border-primary/20">
                            <service.icon size={28} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-2xl font-bold text-secondary font-display uppercase mb-4 leading-none">{service.title}</h3>
                        <p className="text-zinc-400 text-[13px] font-medium leading-relaxed uppercase mb-8 flex-1">
                            {service.desc}
                        </p>
                        <Link href="/contact" className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-widest group-hover:gap-4 transition-all">
                            Consult Details <ChevronRight size={14} />
                        </Link>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* High-Contrast CTA Banner */}
      <section className="px-6 pb-24">
        <div className="max-w-7xl mx-auto">
            <div className="bg-secondary rounded-[48px] p-12 md:p-20 text-white relative overflow-hidden shadow-2xl shadow-secondary/20">
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-12 items-center">
                    <div>
                        <h2 className="text-4xl md:text-6xl font-bold tracking-tight uppercase font-display leading-[0.85] mb-8">
                            Propel your <span className="text-primary">Asset</span> <br/>Recovery Strategy.
                        </h2>
                        <p className="text-lg text-white/50 font-medium max-w-xl mb-12 uppercase tracking-tight">
                            Direct executive consulting for industrial liquidation and corporate facility management.
                        </p>
                        <div className="flex flex-wrap gap-6">
                            <Link href="/contact" className="bg-primary text-white px-12 py-6 rounded-3xl font-bold text-sm uppercase tracking-widest transition-all hover:bg-white hover:text-secondary shadow-2xl shadow-primary/30 flex items-center gap-3 group">
                                Contact Enterprise Team <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                    <div className="hidden lg:flex justify-center">
                        <div className="h-56 w-56 rounded-full border border-white/10 flex items-center justify-center p-4 relative">
                            <div className="absolute inset-0 border-2 border-dashed border-primary/30 rounded-full animate-[spin_30s_linear_infinite]" />
                            <div className="h-40 w-40 bg-primary/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/5">
                                <Zap size={64} className="text-primary animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
            </div>
        </div>
      </section>
    </div>
  );
}
