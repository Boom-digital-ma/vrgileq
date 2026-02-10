import Image from "next/image";
import Link from "next/link";
import { Phone, Mail, MapPin, Instagram, Facebook, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-light bg-light/10 py-20 px-6 md:px-1">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-12 mb-16 md:grid-cols-[1.5fr_1fr_1.2fr_1fr]">
          {/* Column 1: Logo & Text */}
          <div>
            <div className="relative h-12 w-48 md:h-16 md:w-64 mb-6">
              <Image
                src="/images/logo-virginia-transparent.png"
                alt="Virginialequidation"
                fill
                className="object-contain object-left"
              />
            </div>
            <p className="max-w-xs text-xs font-medium leading-relaxed text-neutral/70">
              This online auction site specializes in large lots of bulk items in a wide variety
              of different product categories. Like uBid, Liquidation sources their inventory
              from overstocked manufacturers.
            </p>
          </div>

          {/* Column 2: Company */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-6">Company</h4>
            <div className="flex flex-col gap-4 text-xs font-bold uppercase tracking-widest text-neutral/60">
              <Link href="/about" className="hover:text-primary transition-colors">About Us</Link>
              <Link href="/engage" className="hover:text-primary transition-colors">Engage Us</Link>
              <Link href="/auctions" className="hover:text-primary transition-colors">Auctions</Link>
              <Link href="/sellers" className="hover:text-primary transition-colors">Sellers</Link>
              <Link href="/buyers" className="hover:text-primary transition-colors">Buyers</Link>
            </div>
          </div>

          {/* Column 3: Contact Info (3 lines) */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-6">Contact Info</h4>
            <div className="flex flex-col gap-6 text-xs font-bold uppercase tracking-tight text-neutral/60">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary" />
                <span>(703) 768-9000</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary" />
                <span className="lowercase">info@virginialiquidation.com</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-primary" />
                <span>Alexandria, VA 22301</span>
              </div>
            </div>
          </div>

          {/* Column 4: Social Media (icon + name per line) */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-6">Social Media</h4>
            <div className="flex flex-col gap-4 text-xs font-bold uppercase tracking-widest text-neutral/60">
              <a href="#" className="flex items-center gap-3 hover:text-primary transition-colors">
                <Instagram className="w-4 h-4" /> <span>Instagram</span>
              </a>
              <a href="#" className="flex items-center gap-3 hover:text-primary transition-colors">
                <Facebook className="w-4 h-4" /> <span>Facebook</span>
              </a>
              <a href="#" className="flex items-center gap-3 hover:text-primary transition-colors">
                <Twitter className="w-4 h-4" /> <span>Twitter</span>
              </a>
              <a href="#" className="flex items-center gap-3 hover:text-primary transition-colors">
                <Linkedin className="w-4 h-4" /> <span>LinkedIn</span>
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-t border-light pt-8">
          <div className="text-[10px] font-bold uppercase tracking-widest text-neutral/40 flex flex-col md:flex-row items-center gap-2 md:gap-4">
            <span>© 2026 Virginialequidation. All Rights Reserved.</span>
            <span className="hidden md:block h-1 w-1 bg-neutral/20 rounded-full"></span>
            <span className="text-primary/60">Northern Virginia New Player</span>
          </div>
          <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest">
            <Link href="/terms" className="text-neutral/40 hover:text-primary transition-colors">Terms & Conditions</Link>
            <Link href="/privacy" className="text-neutral/40 hover:text-primary transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}