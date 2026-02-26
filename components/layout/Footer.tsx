import Image from "next/image";
import Link from "next/link";
import { Phone, Mail, MapPin, Instagram, Facebook, Twitter, Linkedin, ArrowRight, ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-20 print:hidden">
      {/* SaaS Premium High-Contrast Banner */}
      <div className="bg-secondary text-white overflow-hidden relative">
        <div className="mx-auto max-w-7xl px-6 py-12 md:py-16 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20" suppressHydrationWarning>
                    <ShieldCheck size={32} className="text-primary" suppressHydrationWarning />
                </div>
                <div>
                    <h3 className="text-xl md:text-2xl font-bold font-display uppercase italic leading-tight tracking-tight">
                        Maryland's trusted <br className="hidden md:block"/> liquidation auction <span className="text-primary">partner.</span>
                    </h3>
                </div>
            </div>
            <Link 
                href="/how-it-works" 
                className="group bg-white text-secondary px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all flex items-center gap-3 shadow-xl shadow-black/20"
                suppressHydrationWarning
            >
                How It Works <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" suppressHydrationWarning />
            </Link>
        </div>
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
      </div>

      {/* Main Footer Links */}
      <div className="bg-white py-20 px-6 border-t border-zinc-100">
        <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 gap-16 md:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
                {/* Brand */}
                <div className="space-y-8">
                    <div className="relative h-10 w-48">
                        <Image
                            src="/images/logo-virginia-transparent.png"
                            alt="Virginia Liquidation"
                            fill
                            className="object-contain object-left opacity-90"
                            suppressHydrationWarning
                        />
                    </div>
                    <p className="text-sm font-medium leading-relaxed text-zinc-400 italic max-w-xs uppercase">
                        Maryland's premier marketplace for inspected Home Depot returns, appliances, and overstock liquidation.
                    </p>
                    <div className="flex gap-3">
                        {[Instagram, Facebook, Twitter, Linkedin].map((Icon, i) => (
                            <a key={i} href="#" className="p-2.5 bg-zinc-50 rounded-xl text-zinc-400 hover:text-primary hover:bg-primary/10 transition-all border border-zinc-100" suppressHydrationWarning>
                                <Icon size={18} suppressHydrationWarning />
                            </a>
                        ))}
                    </div>
                </div>

                {/* Navigation */}
                <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-900 mb-8 italic">Auction Guide</h4>
                    <nav className="flex flex-col gap-4 text-[13px] font-bold text-zinc-50">
                        <Link href="/how-it-works" className="text-zinc-500 hover:text-primary transition-colors uppercase">Process</Link>
                        <Link href="/inventory" className="text-zinc-500 hover:text-primary transition-colors uppercase">Inventory</Link>
                        <Link href="/pickup-information" className="text-zinc-500 hover:text-primary transition-colors uppercase">Local Pickup</Link>
                        <Link href="/blog" className="text-zinc-500 hover:text-primary transition-colors uppercase">Journal</Link>
                    </nav>
                </div>

                {/* Support */}
                <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-900 mb-8 italic">Institutional</h4>
                    <nav className="flex flex-col gap-4 text-[13px] font-bold text-zinc-50">
                        <Link href="/about" className="text-zinc-500 hover:text-primary transition-colors uppercase">Our Mission</Link>
                        <Link href="/sellers" className="text-zinc-500 hover:text-primary transition-colors uppercase">Sell With Us</Link>
                        <Link href="/terms" className="text-zinc-500 hover:text-primary transition-colors uppercase">Bidding Terms</Link>
                        <Link href="/privacy" className="text-zinc-500 hover:text-primary transition-colors uppercase">Privacy Protocol</Link>
                    </nav>
                </div>

                {/* Contact */}
                <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-900 mb-8 italic">Direct Registry</h4>
                    <div className="space-y-6">
                        <a href="tel:2405550123" className="flex items-center gap-4 group">
                            <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-100 group-hover:bg-primary/10 transition-all">
                                <Phone className="w-4 h-4 text-zinc-400 group-hover:text-primary" />
                            </div>
                            <span className="text-[13px] font-bold text-zinc-500 tracking-tighter uppercase italic">(240) 555-0123</span>
                        </a>
                        <div className="flex items-center gap-4 group">
                            <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-100">
                                <Mail className="w-4 h-4 text-zinc-400" />
                            </div>
                            <span className="text-[13px] font-bold text-zinc-500 lowercase italic">concierge@vrgileq.com</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="mt-20 pt-8 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center gap-6">
                <p className="text-[11px] font-medium text-zinc-400 italic uppercase">
                    © 2026 Virginia Liquidation. Serving Maryland, DC & Northern Virginia.
                </p>
                <div className="flex items-center gap-2 bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[9px] font-bold uppercase text-emerald-700 tracking-wider italic">Registry Network Live</span>
                </div>
            </div>
        </div>
      </div>
    </footer>
  );
}
