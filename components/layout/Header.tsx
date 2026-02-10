import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <>
      {/* Utility Bar */}
      <div className="bg-primary py-2 px-6 text-[10px] font-bold uppercase tracking-widest text-white/90">
        <div className="mx-auto flex max-w-7xl justify-between items-center">
          <div className="hidden md:flex gap-6">
            <span className="cursor-pointer hover:text-secondary transition-colors">Get Text Alerts</span>
            <span className="cursor-pointer hover:text-secondary transition-colors">Newsletter</span>
            <span className="cursor-pointer hover:text-secondary transition-colors">Sell With Us</span>
          </div>
          <div className="mx-auto md:mx-0">(703) 768-9000</div>
        </div>
      </div>

      {/* Main Header */}
      <header className="border-b border-light bg-white sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <Link href="/" className="relative h-24 w-80 transition-opacity hover:opacity-80">
            <Image
              src="/images/logo-virginia-transparent.png"
              alt="Virginialequidation"
              fill
              className="object-contain object-left"
              priority
            />
          </Link>
          <nav className="hidden gap-8 text-xs font-bold uppercase tracking-widest md:flex text-neutral">
            <Link href="/auctions" className="hover:text-primary transition-colors">Auction</Link>
            <Link href="/buyers" className="hover:text-primary transition-colors">Buyers</Link>
            <Link href="/sellers" className="hover:text-primary transition-colors">Sellers</Link>
            <Link href="/about" className="hover:text-primary transition-colors">About Us</Link>
            <Link href="/engage" className="hover:text-primary transition-colors">Engage us</Link>
            <Link href="/contact" className="hover:text-primary transition-colors">Contact us</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/auth/signin" className="text-xs font-bold uppercase tracking-widest text-primary hover:opacity-80">Sign In</Link>
            <Link href="/auth/signup" className="bg-primary px-4 py-2 text-xs font-bold uppercase tracking-widest text-white hover:bg-secondary transition-colors">Join</Link>
          </div>
        </div>
      </header>
    </>
  );
}
