import { ShieldAlert, Scale, FileText, Gavel, Clock, CreditCard } from "lucide-react";

export default function TermsPage() {
  const sections = [
    {
      title: "Nature of Sale",
      icon: Gavel,
      content: "All auctions are final. Items are sold 'AS IS, WHERE IS' with all faults. No warranties or representations of any kind are made by Virginia Liquidation regarding the condition, utility, or merchantability of any asset."
    },
    {
      title: "Buyer's Premium",
      icon: Scale,
      content: "A standard buyer's premium is added to the high bid price of all items. This fee is automatically calculated and disclosed during the bidding process and on the final invoice."
    },
    {
      title: "Payment Terms",
      icon: CreditCard,
      content: "Payments are processed immediately following the close of the auction using the credit card on file. For high-value transactions, wire transfer may be required as determined by management."
    },
    {
      title: "Removal Protocols",
      icon: Clock,
      content: "Buyers are strictly responsible for the removal of all purchased items within the designated pickup window. Failure to remove items results in forfeiture without refund and potential storage fees."
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-50 font-sans antialiased text-secondary italic">
      {/* SaaS Premium Header */}
      <section className="bg-white border-b border-zinc-100 pt-24 pb-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <div className="flex items-center justify-center gap-3 mb-8">
                <div className="h-[1px] w-10 bg-primary" />
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">Legal Framework</span>
                <div className="h-[1px] w-10 bg-primary" />
            </div>
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-secondary leading-[0.85] font-display uppercase mb-8">
                Terms of <br/> <span className="text-primary">Service</span>.
            </h1>
            <p className="max-w-2xl mx-auto text-zinc-400 text-lg md:text-xl font-medium leading-relaxed uppercase">
                Official bidding protocols and contractual obligations for Virginia Liquidation participants.
            </p>
        </div>
      </section>

      {/* Terms Content - Modern Document Style */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {sections.map((section, i) => (
                    <div key={i} className="bg-white p-10 rounded-[40px] border border-zinc-100 shadow-sm hover:shadow-xl hover:shadow-secondary/5 transition-all duration-500">
                        <div className="h-12 w-12 bg-zinc-50 rounded-2xl flex items-center justify-center text-primary mb-8 border border-zinc-100">
                            <section.icon size={22} />
                        </div>
                        <h3 className="text-xl font-bold text-secondary font-display uppercase mb-4 leading-tight">{section.title}</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed uppercase font-medium">
                            {section.content}
                        </p>
                    </div>
                ))}
            </div>

            {/* Detailed Legal Text Block */}
            <div className="bg-white p-12 md:p-20 rounded-[48px] border border-zinc-100 shadow-sm italic text-zinc-500 space-y-8">
                <div className="flex items-center gap-3 mb-10 border-b border-zinc-50 pb-6">
                    <FileText size={20} className="text-primary" />
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary">General Provisions</h2>
                </div>
                
                <div className="space-y-10 uppercase text-xs font-medium leading-loose">
                    <p>
                        1. REGISTRATION: To bid, users must provide valid credit card information. Virginia Liquidation reserves the right to deny registration to any person or entity at its sole discretion.
                    </p>
                    <p>
                        2. ABANDONMENT: Any item not picked up within the specified removal period will be considered abandoned. Virginia Liquidation may resell or dispose of such items without further notice or refund.
                    </p>
                    <p>
                        3. LIABILITY: Virginia Liquidation is not responsible for any damage or injury occurring during the inspection, bidding, or removal phases of the auction.
                    </p>
                    <p>
                        4. DISPUTES: Any disputes regarding the auction process or item condition will be resolved by Virginia Liquidation management, whose decision shall be final and binding.
                    </p>
                </div>
            </div>
        </div>
      </section>
    </div>
  );
}
