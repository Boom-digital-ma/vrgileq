import { ShieldCheck, Eye, Lock, Database, Globe2, UserCheck } from "lucide-react";

export default function PrivacyPage() {
  const principles = [
    { title: "Data Security", icon: Lock, desc: "We utilize industry-standard encryption and Stripe-backed secure payment processing." },
    { title: "Transparency", icon: Eye, desc: "Clear disclosure of all data collected during registration and bidding phases." },
    { title: "Storage", icon: Database, desc: "Your data is stored in localized secure cloud architecture with restricted technical access." },
    { title: "Verification", icon: UserCheck, desc: "Identity verification is conducted solely to ensure the integrity of the bidding pool." }
  ];

  return (
    <div className="min-h-screen bg-zinc-50 font-sans antialiased text-secondary italic">
      {/* SaaS Premium Header */}
      <section className="bg-white border-b border-zinc-100 pt-24 pb-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <div className="flex items-center justify-center gap-3 mb-8">
                <div className="h-[1px] w-10 bg-primary" />
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">Data Integrity</span>
                <div className="h-[1px] w-10 bg-primary" />
            </div>
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-secondary leading-[0.85] font-display uppercase mb-8">
                Privacy <br/> <span className="text-primary">Policy</span>.
            </h1>
            <p className="max-w-2xl mx-auto text-zinc-400 text-lg md:text-xl font-medium leading-relaxed uppercase">
                How Virginia Liquidation handles and protects your industrial enterprise data.
            </p>
        </div>
      </section>

      {/* Privacy Principles Grid */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16">
                {principles.map((p, i) => (
                    <div key={i} className="bg-white p-8 rounded-[32px] border border-zinc-100 shadow-sm hover:shadow-xl hover:shadow-secondary/5 transition-all">
                        <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
                            <p.icon size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-secondary uppercase font-display mb-3">{p.title}</h3>
                        <p className="text-zinc-400 text-[11px] font-medium leading-relaxed uppercase">{p.desc}</p>
                    </div>
                ))}
            </div>

            {/* Detailed Policy Text */}
            <div className="bg-white p-12 md:p-20 rounded-[48px] border border-zinc-100 shadow-sm space-y-12">
                <div className="space-y-6">
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Collection Protocols</h2>
                    <p className="text-zinc-500 text-xs font-medium leading-loose uppercase italic">
                        Information collected through registration includes email addresses, mobile numbers, and billing details. These data points are essential for auction synchronization and payment processing.
                    </p>
                </div>

                <div className="space-y-6">
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Third-Party Interfacing</h2>
                    <p className="text-zinc-500 text-xs font-medium leading-loose uppercase italic">
                        Financial data is processed exclusively through Stripe. We do not store full credit card numbers on our infrastructure. Communication alerts are transmitted via Resend.
                    </p>
                </div>

                <div className="space-y-6">
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Digital Rights</h2>
                    <p className="text-zinc-500 text-xs font-medium leading-loose uppercase italic">
                        Participants may request account deletion at any time through their bidder dashboard. Archival data will be maintained as required by licensed auctioneering regulations in the Commonwealth of Virginia.
                    </p>
                </div>
            </div>
        </div>
      </section>
    </div>
  );
}
