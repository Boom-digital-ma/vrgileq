"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X, User, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { logout } from "@/app/actions/auth";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  // Close menu on resize if switching to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
          <div className="mx-auto md:mx-0 font-black tracking-tighter">(703) 768-9000</div>
        </div>
      </div>

      {/* Main Header */}
      <header className="border-b border-light bg-white sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 md:px-1 py-4 md:py-6">
          <Link href="/" className="relative h-12 w-48 md:h-16 md:w-64 transition-opacity hover:opacity-80">
            <Image
              src="/images/logo-virginia-transparent.png"
              alt="Virginialequidation"
              fill
              className="object-contain object-left"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden gap-8 text-xs font-bold uppercase tracking-widest md:flex text-neutral">
            <Link href="/auctions" className="hover:text-primary transition-colors">Auction</Link>
            <Link href="/buyers" className="hover:text-primary transition-colors">Buyers</Link>
            <Link href="/sellers" className="hover:text-primary transition-colors">Sellers</Link>
            <Link href="/about" className="hover:text-primary transition-colors">About Us</Link>
            <Link href="/engage" className="hover:text-primary transition-colors">Engage us</Link>
            <Link href="/contact" className="hover:text-primary transition-colors">Contact us</Link>
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <Link href="/profile" className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary hover:text-secondary transition-colors">
                    <User className="h-4 w-4" />
                    Account
                  </Link>
                  <button 
                    onClick={() => logout()}
                    className="flex items-center gap-2 bg-neutral px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white hover:bg-primary transition-colors"
                  >
                    <LogOut className="h-3 w-3" />
                    Logout
                  </button>
                </div>
              ) : (
                <>
                  <Link href="/auth/signin" className="text-xs font-bold uppercase tracking-widest text-primary hover:opacity-80">Sign In</Link>
                  <Link href="/auth/signup" className="bg-primary px-4 py-2 text-xs font-bold uppercase tracking-widest text-white hover:bg-secondary transition-colors">Join</Link>
                </>
              )}
            </div>
            
            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-primary border-2 border-primary hover:bg-primary hover:text-white transition-all"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        <div className={`fixed inset-0 z-[100] md:hidden transition-all duration-500 ${isMobileMenuOpen ? "visible" : "invisible pointer-events-none"}`}>
          {/* Overlay */}
          <div 
            className={`absolute inset-0 bg-primary/40 backdrop-blur-sm transition-opacity duration-500 ${isMobileMenuOpen ? "opacity-100" : "opacity-0"}`}
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Menu Content */}
          <div className={`absolute top-0 right-0 h-full w-[80%] max-w-xs bg-white border-l-4 border-primary p-8 transition-transform duration-500 shadow-2xl ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
            <div className="flex justify-between items-center mb-12">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">Menu</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-primary hover:rotate-90 transition-transform">
                <X className="h-8 w-8" />
              </button>
            </div>

            <nav className="flex flex-col gap-6 mb-12">
              <Link 
                href="/auctions" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-2xl font-black uppercase tracking-tighter text-secondary hover:text-primary transition-colors"
              >
                Auction
              </Link>
              <Link 
                href="/buyers" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-2xl font-black uppercase tracking-tighter text-secondary hover:text-primary transition-colors"
              >
                Buyers
              </Link>
              <Link 
                href="/sellers" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-2xl font-black uppercase tracking-tighter text-secondary hover:text-primary transition-colors"
              >
                Sellers
              </Link>
              <Link 
                href="/about" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-2xl font-black uppercase tracking-tighter text-secondary hover:text-primary transition-colors"
              >
                About Us
              </Link>
            </nav>

            <div className="pt-8 border-t border-light flex flex-col gap-4">
              {user ? (
                <>
                  <Link 
                    href="/profile" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full text-center py-4 text-xs font-black uppercase tracking-widest border-2 border-primary text-primary flex items-center justify-center gap-2"
                  >
                    <User className="h-4 w-4" /> Account
                  </Link>
                  <button 
                    onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-center py-4 text-xs font-black uppercase tracking-widest bg-neutral text-white flex items-center justify-center gap-2"
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/auth/signin" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full text-center py-4 text-xs font-black uppercase tracking-widest border-2 border-primary text-primary"
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/auth/signup" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full text-center py-4 text-xs font-black uppercase tracking-widest bg-primary text-white"
                  >
                    Join Now
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
