import { MapPin, Clock, FileText, UserCheck, Phone, Mail, ArrowRight, ExternalLink, Calendar, Truck } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function PickupInformationPage() {
  const pickupSteps = [
    {
      title: "Win & Pay",
      desc: "Ensure your invoice is paid in full. Payments are automatically processed for winning bidders.",
      icon: Calendar
    },
    {
      title: "Schedule a Window",
      desc: "Log in to your profile to book a specific 15-minute pickup slot to avoid wait times.",
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
    <div className="min-h-screen bg-zinc-50 font-sans antialiased text-secondary">
      {/* Page Header */}
      <section className="bg-white border-b border-zinc-100 pt-24 pb-20 relative overflow-hidden italic">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="h-[1px] w-10 bg-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">Warehouse Logistics</span>
                    <div className="h-[1px] w-10 bg-primary" />
                </div>
                <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-secondary leading-[0.85] font-display uppercase mb-8">
                    Local <br/> <span className="text-primary">Pickup</span>.
                </h1>
                <p className="max-w-2xl mx-auto text-zinc-400 text-lg md:text-xl font-medium leading-relaxed uppercase">
                    Centralized collection protocol at our Beltsville, Maryland facility.
                </p>
            </div>
        </div>
        <div className="absolute top-0 right-0 h-full w-1/3 bg-primary/5 blur-[120px] rounded-full translate-x-1/2" />
      </section>

      {/* Location Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-12 items-stretch">
                {/* Map/Address Card */}
                <div className="bg-white border border-zinc-100 rounded-[48px] p-10 md:p-16 shadow-sm italic flex flex-col justify-between">
                    <div>
                        <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-8 border border-primary/20">
                            <MapPin size={28} />
                        </div>
                        <h2 className="text-4xl font-bold text-secondary font-display uppercase mb-6 leading-none">Beltsville <br/>Facility.</h2>
                        <div className="space-y-4 mb-12 text-zinc-500 text-lg font-medium uppercase">
                            <p>Virginia Liquidation Beltsville</p>
                            <p>Beltsville, Maryland</p>
                            <p className="text-zinc-300 text-sm">Full address provided on winning invoices.</p>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 pt-10 border-t border-zinc-50">
                        <a href="https://maps.google.com" target="_blank" className="bg-secondary text-white px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-primary transition-all">
                            Open in Maps <ExternalLink size={14} />
                        </a>
                        <Link href="/contact" className="bg-zinc-50 text-zinc-400 border border-zinc-100 px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-zinc-100 transition-all">
                            Facility Support
                        </Link>
                    </div>
                </div>

                {/* Contact/Hours Card */}
                <div className="bg-secondary text-white rounded-[48px] p-10 md:p-12 shadow-2xl shadow-secondary/20 italic flex flex-col justify-between relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-2xl font-bold font-display uppercase text-primary mb-8 italic">Operating Windows</h3>
                        <div className="space-y-8">
                            <div>
                                <div className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-3">Pickup Hours</div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-sm font-bold uppercase tracking-tight">
                                        <span>Mon - Fri</span>
                                        <span className="text-primary">09:00 AM - 05:00 PM</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-bold uppercase tracking-tight text-white/40">
                                        <span>Sat - Sun</span>
                                        <span>Closed</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <div className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-3">Contact Registry</div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 group">
                                        <div className="h-10 w-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-hover:bg-primary group-hover:border-primary transition-all">
                                            <Phone size={18} />
                                        </div>
                                        <span className="text-sm font-bold uppercase tracking-widest italic">(240) 555-0123</span>
                                    </div>
                                    <div className="flex items-center gap-4 group">
                                        <div className="h-10 w-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-hover:bg-primary group-hover:border-primary transition-all">
                                            <Mail size={18} />
                                        </div>
                                        <span className="text-sm font-bold uppercase tracking-widest italic">logistics@vrgileq.com</span>
                                    </div>
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
      <section className="py-24 px-6 bg-white border-y border-zinc-100">
        <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
                <h2 className="text-4xl font-bold text-secondary font-display uppercase italic mb-4">The Collection Protocol</h2>
                <p className="text-zinc-400 font-medium uppercase tracking-widest text-sm">Systematic removal for high-speed logistics</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {pickupSteps.map((step, i) => (
                    <div key={i} className="flex flex-col italic group">
                        <div className="h-1 w-full bg-zinc-100 mb-8 overflow-hidden rounded-full">
                            <div className="h-full bg-primary w-0 group-hover:w-full transition-all duration-700 delay-100" />
                        </div>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-10 w-10 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-400 group-hover:bg-primary/10 group-hover:text-primary transition-all border border-zinc-100">
                                <step.icon size={20} />
                            </div>
                            <span className="text-xs font-black text-secondary tabular-nums italic">PROTOCOL 0{i+1}</span>
                        </div>
                        <h3 className="text-xl font-bold text-secondary uppercase mb-4 leading-tight">{step.title}</h3>
                        <p className="text-zinc-400 text-[13px] font-medium leading-relaxed uppercase">
                            {step.desc}
                        </p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Critical Requirements Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
            <div className="bg-primary/5 rounded-[48px] border border-primary/10 p-12 md:p-20 italic relative overflow-hidden">
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div>
                        <h2 className="text-4xl md:text-5xl font-bold text-secondary font-display uppercase italic leading-none mb-10">
                            Required for <br/> <span className="text-primary">Authorization</span>.
                        </h2>
                        <ul className="space-y-6">
                            {[
                                "Valid Government Issued Identification",
                                "Digital or Printed Gate Pass (QR Code)",
                                "Confirmation of fully cleared funds",
                                "Appropriate vehicle for asset transport"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-4 text-zinc-600 font-bold uppercase tracking-tight text-sm">
                                    <UserCheck className="text-primary shrink-0" size={20} />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="p-10 bg-white rounded-[40px] border border-zinc-100 shadow-xl italic">
                        <h4 className="text-xl font-bold text-secondary uppercase mb-6">Loading Policy</h4>
                        <p className="text-zinc-400 text-sm leading-relaxed uppercase mb-8">
                            Virginia Liquidation does not provide tie-downs, blankets, or packing materials. Buyers are responsible for securing all loads in compliance with Maryland DOT regulations.
                        </p>
                        <div className="pt-8 border-t border-zinc-50 flex items-center justify-between">
                            <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Facility Code</span>
                            <span className="text-xs font-mono font-bold text-secondary">MD-BLTS-01</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>
    </div>
  );
}
