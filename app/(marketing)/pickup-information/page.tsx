import { MapPin, Clock, FileText, UserCheck, Phone, Mail, ExternalLink, Calendar, Truck } from "lucide-react";
import Link from "next/link";

export default function PickupInformationPage() {
  const pickupSteps = [
    {
      title: "Win & Pay",
      desc: "Ensure your invoice is paid in full. Payments are automatically processed for winning bidders.",
      icon: Calendar
    },
    {
      title: "Schedule a Window",
      desc: "From your invoice, book a specific 15-minute pickup slot to avoid wait times.",
      icon: Clock
    },
    {
      title: "Bring Your Gate Pass",
      desc: "Download your QR-coded Gate Pass from your invoice page. Our staff will scan it on arrival.",
      icon: FileText
    },
    {
      title: "Load Your Items",
      desc: "Our warehouse team in Beltsville will assist with locating your items. Buyers must provide their own loading labor for heavy assets.",
      icon: Truck
    }
  ];

  return (
    <div className="bg-zinc-50 font-sans antialiased text-secondary">
      {/* Page Header */}
      <section className="relative overflow-hidden border-b border-zinc-100 bg-white px-6 py-10 italic md:py-12">
        <div className="relative z-10 mx-auto max-w-7xl text-center">
            <div className="mb-4 flex items-center justify-center gap-2">
                <div className="h-[1px] w-6 bg-primary" />
                <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary">Warehouse Logistics</span>
                <div className="h-[1px] w-6 bg-primary" />
            </div>
            <h1 className="mb-4 text-4xl font-black leading-none tracking-tighter text-secondary font-display uppercase md:text-5xl">
                Local <br/> <span className="text-primary">Pickup</span>.
            </h1>
            <p className="max-w-xl mx-auto text-zinc-400 text-base md:text-lg font-medium leading-relaxed uppercase">
                Centralized collection process at our Beltsville, Maryland facility.
            </p>
        </div>
        <div className="absolute top-0 right-0 h-full w-1/3 bg-primary/5 blur-[100px] rounded-full translate-x-1/2" />
      </section>

      {/* Location Section */}
      <section className="px-6 py-10 md:py-12">
        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-[1.5fr_1fr]">
                {/* Map/Address Card */}
                <div className="flex flex-col justify-between rounded-[40px] border border-zinc-100 bg-white p-7 shadow-sm italic md:p-10">
                    <div>
                        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                            <MapPin size={28} />
                        </div>
                        <h2 className="mb-4 text-4xl font-bold leading-none text-secondary font-display uppercase">Beltsville <br/>Facility.</h2>
                        <div className="mb-6 space-y-2 text-lg font-medium text-zinc-500 uppercase">
                            <p>Virginia Liquidation Beltsville</p>
                            <p>Beltsville, Maryland</p>
                            <p className="text-zinc-300 text-sm">Full address provided on winning invoices.</p>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 border-t border-zinc-50 pt-6">
                        <a href="https://maps.app.goo.gl/aQMddztNZFg9tPwC8" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-2xl bg-secondary px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-primary">
                            Open in Maps <ExternalLink size={14} />
                        </a>
                        <Link href="/contact" className="rounded-2xl border border-zinc-100 bg-zinc-50 px-6 py-3 text-xs font-bold uppercase tracking-widest text-zinc-400 transition-all hover:bg-zinc-100">
                            Facility Support
                        </Link>
                    </div>
                </div>

                {/* Contact/Hours Card */}
                <div className="relative flex flex-col justify-between overflow-hidden rounded-[40px] bg-secondary p-7 text-white shadow-2xl shadow-secondary/20 italic md:p-9">
                    <div className="relative z-10">
                        <h3 className="mb-5 text-2xl font-bold text-primary font-display uppercase italic">Bidding Support</h3>
                        <div className="space-y-5">
                            <div>
                                <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Email</div>
                                <a href="mailto:support@virginialiquidation.com" className="flex items-center gap-4 group">
                                    <div className="h-10 w-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-hover:bg-primary group-hover:border-primary transition-all">
                                        <Mail size={18} />
                                    </div>
                                    <span className="text-sm font-bold tracking-tight">support@virginialiquidation.com</span>
                                </a>
                            </div>

                            <div>
                                <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Direct Phone</div>
                                <a href="tel:+17038691965" className="flex items-center gap-4 group">
                                    <div className="h-10 w-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-hover:bg-primary group-hover:border-primary transition-all">
                                        <Phone size={18} />
                                    </div>
                                    <span className="text-sm font-bold uppercase tracking-widest italic">+1 (703) 869-1965</span>
                                </a>
                            </div>

                            <div>
                                <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Office Location</div>
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                                        <MapPin size={18} />
                                    </div>
                                    <span className="text-sm font-bold uppercase tracking-widest italic">6415 Virginia Manor Rd, Beltsville, MD 20705</span>
                                </div>
                            </div>

                            <div>
                                <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Availability</div>
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                                        <Clock size={18} />
                                    </div>
                                    <span className="text-sm font-bold uppercase tracking-widest italic">Tue - Sat, 11am - 5pm EST</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <Clock size={200} />
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="border-y border-zinc-100 bg-white px-6 py-12 md:py-16">
        <div className="max-w-7xl mx-auto">
            <div className="mb-10 text-center">
                <h2 className="text-3xl font-bold text-secondary font-display uppercase italic">Pickup Process</h2>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {pickupSteps.map((step, i) => (
                    <div key={i} className="flex flex-col italic group">
                        <div className="mb-5 h-1 w-full overflow-hidden rounded-full bg-zinc-100">
                            <div className="h-full bg-primary w-0 group-hover:w-full transition-all duration-700 delay-100" />
                        </div>
                        <div className="mb-4 flex items-center gap-4">
                            <div className="h-10 w-10 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-400 group-hover:bg-primary/10 group-hover:text-primary transition-all border border-zinc-100">
                                <step.icon size={20} />
                            </div>
                            <span className="text-xs font-black text-secondary tabular-nums italic">STEP 0{i+1}</span>
                        </div>
                        <h3 className="mb-3 text-xl font-bold leading-tight text-secondary uppercase">{step.title}</h3>
                        <p className="text-zinc-400 text-[13px] font-medium leading-relaxed uppercase">
                            {step.desc}
                        </p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Critical Requirements Section */}
      <section className="px-6 py-10 md:py-12">
        <div className="max-w-7xl mx-auto">
            <div className="relative overflow-hidden rounded-[32px] border border-primary/10 bg-primary/5 p-7 italic md:p-9">
                <div className="relative z-10 grid grid-cols-1 items-center gap-7 lg:grid-cols-2">
                    <div>
                        <h2 className="mb-5 text-3xl font-bold leading-none text-secondary font-display uppercase italic md:text-4xl">
                            Required Documentation <br/> <span className="text-primary">During Pickup</span>.
                        </h2>
                        <ul className="space-y-3">
                            {[
                                "Valid Government Issued Identification",
                                "Digital or Printed Gate Pass (QR Code)",
                                "Credit card used during the auction",
                                "Appropriate vehicle for asset transport"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-zinc-600 font-bold uppercase tracking-tight text-xs">
                                    <UserCheck className="text-primary shrink-0" size={18} />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="rounded-[24px] border border-zinc-100 bg-white p-6 shadow-lg italic">
                        <h4 className="mb-3 text-lg font-bold text-secondary uppercase">Loading Policy</h4>
                        <p className="mb-4 text-xs leading-relaxed text-zinc-400 uppercase">
                            Virginia Liquidation does not provide tie-downs, blankets, or packing materials. Buyers are responsible for securing all loads in compliance with Maryland DOT regulations.
                        </p>
                        <div className="flex items-center justify-between border-t border-zinc-50 pt-4">
                            <span className="text-[9px] font-black text-zinc-300 uppercase tracking-widest">Facility Code</span>
                            <span className="text-xs font-mono font-bold text-secondary">MD-BLTS-01</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="border-t border-zinc-100 bg-zinc-50 px-6 py-10 md:py-12">
        <div className="max-w-2xl mx-auto text-center">
            <h2 className="mb-4 text-xl font-bold text-secondary font-display uppercase italic">Planning a Large Pickup?</h2>
            <Link href="/contact" className="inline-block rounded-xl bg-primary px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-white italic shadow-xl shadow-primary/10 transition-all hover:bg-secondary">
                Contact Us
            </Link>
        </div>
      </section>
    </div>
  );
}
