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
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setLoading(false);
    };
    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
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

  const handleLogout = async () => {
    try {
        // 1. Sign out on client
        await supabase.auth.signOut();
        // 2. Call server action for cleanup/cookies
        await logout();
        // 3. Force hard reload to reset everything
        window.location.href = '/';
    } catch (err) {
        console.error("Logout failed:", err);
        window.location.href = '/';
    }
  };

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
            <Link href="/auctions" className="hover:text-primary transition-colors">Auctions</Link>
            <Link href="/buyers" className="hover:text-primary transition-colors">Buyers</Link>
            <Link href="/sellers" className="hover:text-primary transition-colors">Sellers</Link>
            <Link href="/about" className="hover:text-primary transition-colors">About Us</Link>
            <Link href="/engage" className="hover:text-primary transition-colors">Engage us</Link>
            <Link href="/contact" className="hover:text-primary transition-colors">Contact us</Link>
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-4">
              {loading ? (
                <div className="flex items-center gap-2 px-4 py-2 border-2 border-light bg-light/5 animate-pulse">
                    <div className="h-2 w-2 rounded-full bg-primary animate-bounce"></div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-neutral/40 italic">Syncing...</span>
                </div>
              ) : user ? (
                <div className="flex items-center gap-4">
                  <div className="hidden lg:flex flex-col items-end">
                    <span className="text-[8px] font-black uppercase text-neutral/40 leading-none mb-1 font-sans">Authenticated</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-secondary leading-none font-display italic">{user.user_metadata?.full_name || 'My Account'}</span>
                  </div>
                  <Link href="/profile" className="flex items-center gap-2 group transition-all">
                    <div className="bg-primary/10 p-2 rounded-lg border-2 border-primary group-hover:bg-primary group-hover:text-white transition-colors">
                        <User className="h-4 w-4 text-primary group-hover:text-white" />
                    </div>
                    <span className="lg:hidden text-xs font-black uppercase tracking-widest text-primary">Account</span>
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="p-2 text-neutral/40 hover:text-rose-600 transition-colors border-2 border-transparent hover:border-rose-100 rounded-lg group"
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4" />
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
                Auctions
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
                        handleLogout();
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
