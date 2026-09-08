import { Building2, ShieldCheck, Zap, BarChart3, Globe2, ChevronRight, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function EngagePage() {
  const services = [
    { title: "Corporate Decommissioning", icon: Building2, desc: "End-to-end management of large-scale facility closures and technical asset liquidation." },
    { title: "Strategic Inventory Recovery", icon: BarChart3, desc: "Maximizing the residual value of surplus machinery and technical commercial hardware." },
    { title: "Technical Asset Appraisal", icon: ShieldCheck, desc: "Certified valuation reports for industrial equipment and complex institutional assets." },
    { title: "Logistics Coordination", icon: Globe2, desc: "Nationwide extraction, rigging, and specialized shipping for heavy-duty industrial lots." }
  ];

  return (
    <div className="bg-zinc-50 font-sans antialiased text-secondary italic">
      {/* SaaS Premium Header */}
      <section className="relative overflow-hidden border-b border-zinc-100 bg-white px-6 py-10 md:py-12">
        <div className="relative z-10 mx-auto max-w-7xl text-center">
            <div className="mb-4 flex items-center justify-center gap-3">
                <div className="h-[1px] w-10 bg-primary" />
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">Business Services</span>
                <div className="h-[1px] w-10 bg-primary" />
            </div>
            <h1 className="mb-4 text-4xl font-bold leading-[0.85] tracking-tight text-secondary font-display uppercase md:text-5xl">
                Turn Your Extra <br/> Inventory &amp; Equipment <br/> <span className="text-primary">Into Cash</span>
            </h1>
            <p className="mx-auto max-w-2xl text-base font-medium leading-relaxed text-zinc-400 uppercase md:text-lg">
                We help large companies and organizations sell off valuable equipment, inventory, or other assets using a customized process.
            </p>
        </div>
        <div className="absolute -bottom-24 -right-24 h-96 w-96 bg-primary/5 blur-[120px] rounded-full" />
      </section>

      {/* Services Grid */}
      <section className="px-6 py-10 md:py-12">
        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {services.map((service, i) => (
                    <div key={i} className="group flex h-full flex-col items-start rounded-[32px] border border-zinc-100 bg-white p-7 transition-all duration-500 hover:-translate-y-2 hover:border-primary/20 hover:shadow-[0_30px_60px_rgba(11,43,83,0.05)]">
                        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-100 bg-zinc-50 text-zinc-400 transition-all group-hover:border-primary/20 group-hover:bg-primary/10 group-hover:text-primary">
                            <service.icon size={28} strokeWidth={1.5} />
                        </div>
                        <h3 className="mb-3 text-2xl font-bold leading-none text-secondary font-display uppercase">{service.title}</h3>
                        <p className="mb-5 flex-1 text-[13px] font-medium leading-relaxed text-zinc-400 uppercase">
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
      <section className="px-6 pb-10 md:pb-12">
        <div className="max-w-7xl mx-auto">
            <div className="relative overflow-hidden rounded-[32px] bg-secondary p-7 text-white shadow-2xl shadow-secondary/20 md:p-10">
                <div className="relative z-10 grid grid-cols-1 items-center gap-7 lg:grid-cols-[1.5fr_1fr]">
                    <div>
                        <h2 className="mb-5 text-4xl font-bold leading-[0.85] tracking-tight font-display uppercase md:text-5xl">
                            Propel your <span className="text-primary">Asset</span> <br/>Recovery Strategy.
                        </h2>
                        <p className="mb-6 max-w-xl text-base font-medium tracking-tight text-white/50 uppercase md:text-lg">
                            Direct executive consulting for industrial liquidation and corporate facility management.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Link href="/contact" className="group flex items-center gap-3 rounded-2xl bg-primary px-8 py-4 text-sm font-bold uppercase tracking-widest text-white shadow-2xl shadow-primary/30 transition-all hover:bg-white hover:text-secondary">
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
