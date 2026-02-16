import React from 'react';
import { LayoutDashboard, Briefcase, Zap, ShieldCheck } from 'lucide-react';

const SERVICES = [
  {
    title: "Facility Decommissioning",
    desc: "Complete management of industrial or office site closures, from inventory to key handover.",
    icon: LayoutDashboard
  },
  {
    title: "Asset Recovery Consulting",
    desc: "Strategic analysis to maximize the recovery value of your dormant or excess assets.",
    icon: Briefcase
  },
  {
    title: "High-Speed Liquidation",
    desc: "Emergency solutions to transform your assets into cash in record time (under 30 days).",
    icon: Zap
  },
  {
    title: "Risk & Compliance",
    desc: "Rigorous management of legal and environmental aspects related to industrial asset sales.",
    icon: ShieldCheck
  }
];

export default function EngagePage() {
  return (
    <div className="bg-white font-sans tracking-tight text-neutral">
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <header className="mb-24">
          <div className="text-primary font-black uppercase tracking-[0.3em] text-xs mb-4">STRATEGIC PARTNERSHIPS</div>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-secondary mb-8 leading-none">
            Engage Our Expertise
          </h1>
          <p className="text-xl text-neutral/60 font-medium max-w-3xl leading-relaxed">
            Since 1981, we don&apos;t just sell lots. We manage complex transitions for Fortune 1000 companies and SMEs across Virginia.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-12 mb-32">
          {SERVICES.map((s, i) => (
            <div key={i} className="group p-10 border-2 border-primary hover:bg-primary transition-all duration-300 shadow-[12px_12px_0px_0px_rgba(4,154,158,1)]">
              <s.icon className="w-12 h-12 text-primary group-hover:text-white mb-6 transition-colors" />
              <h3 className="text-2xl font-black uppercase tracking-tighter text-secondary group-hover:text-white mb-4">{s.title}</h3>
              <p className="text-neutral/60 group-hover:text-white/80 font-medium leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-secondary text-white p-12 md:p-20 text-center shadow-[24px_24px_0px_0px_rgba(4,154,158,1)]">
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-8 leading-tight">Ready for a tailor-made <br />industrial solution?</h2>
          <button className="bg-primary text-white px-12 py-6 text-sm font-black uppercase tracking-widest hover:bg-white hover:text-primary transition-all shadow-[8px_8px_0px_0px_rgba(4,154,158,0.3)]">
            Schedule a Consultation
          </button>
        </div>
      </section>
    </div>
  );
}
