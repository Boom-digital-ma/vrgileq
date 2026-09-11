"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, LogOut, ChevronDown, ChevronRight, Bell, Shield } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { toast } from "sonner";

interface HeaderProps {
  minimal?: boolean;
}

const accountLinks = [
  { label: 'Profile', href: '/profile#info' },
  { label: 'My Bids', href: '/profile#bids' },
  { label: 'Invoices', href: '/profile#invoices' },
  { label: 'Watchlist', href: '/profile#watchlist' },
];

export default function Header({ minimal = false }: HeaderProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [announcement, setAnnouncement] = useState<string | null>(null);
  const [announcementPopupText, setAnnouncementPopupText] = useState<string | null>(null);
  const [announcementLink, setAnnouncementLink] = useState<string | null>(null);
  const [isAnnouncementPopupOpen, setIsAnnouncementPopupOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const supabase = useMemo(() => createClient(), []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('full_name, role').eq('id', userId).single();
    return data;
  };

  // 1. Initial Session & Auth Listener
  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      const profileData = currentUser ? await fetchProfile(currentUser.id) : null;
      if (isMounted) {
        setUser(currentUser);
        setProfile(profileData);
        setLoading(false);
      }
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      if (!isMounted) return;
      const currentUser = session?.user ?? null;
      const profileData = currentUser ? await fetchProfile(currentUser.id) : null;
      if (!isMounted) return;
      setUser(currentUser);
      setProfile(profileData);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  // 2. Realtime Profile Listener
  useEffect(() => {
    if (!user?.id) return;
    
    let isMounted = true;
    const profileChannel = supabase
        .channel(`public:profiles:id=eq.${user.id}`)
        .on('postgres_changes', { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'profiles', 
            filter: `id=eq.${user.id}` 
        }, (payload: any) => {
            if (isMounted) setProfile(payload.new);
        })
        .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(profileChannel);
    };
  }, [supabase, user?.id]);

  // 3. Site Settings & Scroll
  useEffect(() => {
    let isMounted = true;

    const fetchSettings = async () => {
      const { data: settings } = await supabase
        .from('site_settings')
        .select('global_announcement, announcement_text, announcement_link')
        .eq('id', 'global')
        .maybeSingle();
      
      if (!isMounted) return;
      if (settings?.global_announcement) setAnnouncement(settings.global_announcement);
      if (settings?.announcement_text) setAnnouncementPopupText(settings.announcement_text);
      if (settings?.announcement_link) setAnnouncementLink(settings.announcement_link);
    };
    
    fetchSettings();

    const handleScroll = () => {
        if (isMounted) setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      isMounted = false;
      window.removeEventListener("scroll", handleScroll);
    };
  }, [supabase]);

  const handleLogout = async () => {
    const { error: clientError } = await supabase.auth.signOut();
    if (clientError) {
      console.error('Client sign out failed:', clientError);
      toast.error("Sign out failed. Please try again.");
      return;
    }

    toast.success("You have been signed out.");
    window.location.assign('/');
  };

  const isAdmin = profile?.role === 'admin';
  const accountInitial = (profile?.full_name || user?.user_metadata?.full_name || 'Account').trim().charAt(0).toUpperCase();

  if (minimal) {
    const isSignIn = pathname === '/auth/signin';
    const isProfilePage = pathname === '/profile';
    const actionHref = isProfilePage ? '/' : (isSignIn ? '/auth/signup' : '/auth/signin');
    const actionLabel = isProfilePage ? 'Browse Auctions' : (isSignIn ? 'Create Account' : 'Sign In');

    return (
      <header className="border-b border-zinc-100 bg-white py-4 print:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          <Link href="/" className="relative h-8 w-32 shrink-0 transition-opacity hover:opacity-80 md:h-9 md:w-40">
            <Image
              src="/images/logo-virginia-transparent.png"
              alt="Virginia Liquidation"
              fill
              className="object-contain object-left"
              priority
            />
          </Link>
          {isProfilePage && loading ? (
            <div className="h-10 w-32 animate-pulse rounded-xl bg-zinc-50" />
          ) : isProfilePage && user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsAccountMenuOpen((open) => !open)}
                aria-expanded={isAccountMenuOpen}
                aria-haspopup="menu"
                className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-2 py-1.5 text-zinc-700 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary text-[11px] font-black text-white">
                  {accountInitial}
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest">My Account</span>
                <ChevronDown size={14} className={cn("text-zinc-400 transition-transform", isAccountMenuOpen && "rotate-180")} />
              </button>
              {isAccountMenuOpen && (
                <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-52 rounded-2xl border border-zinc-200 bg-white p-2 shadow-xl shadow-zinc-900/10">
                  {accountLinks.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      role="menuitem"
                      onClick={() => setIsAccountMenuOpen(false)}
                      className="block rounded-xl px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-primary"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <div className="my-1 border-t border-zinc-100" />
                  <button
                    type="button"
                    onClick={handleLogout}
                    role="menuitem"
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-rose-500 transition-colors hover:bg-rose-50"
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href={actionHref} className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 transition-colors hover:text-primary">
              {actionLabel}
            </Link>
          )}
        </div>
      </header>
    );
  }

  return (
    <>
      {/* Grouped Sticky Container for Announcement + Menu */}
      <div className="sticky top-0 z-50 w-full print:hidden">
        {/* Announcement Bar */}
        {announcement && (
            <div className="bg-secondary text-white py-1.5 px-6 border-b border-white/5 overflow-hidden">
                <div className="mx-auto flex max-w-7xl items-center justify-center gap-4">
                    <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-white/70 italic flex items-center gap-2">
                        <span className="h-1 w-1 bg-primary rounded-full animate-pulse" />
                        {announcement}
                    </p>
                    {announcementPopupText ? (
                        <button 
                            onClick={() => setIsAnnouncementPopupOpen(true)}
                            className="text-[8px] md:text-[9px] font-black uppercase text-primary hover:text-white transition-colors border-b border-primary/30 cursor-pointer"
                        >
                            Details
                        </button>
                    ) : announcementLink ? (
                        <Link
                            href={announcementLink} 
                            className="text-[8px] md:text-[9px] font-black uppercase text-primary hover:text-white transition-colors border-b border-primary/30"
                        >
                            Details
                        </Link>
                    ) : (
                        <Link 
                            href="/auctions" 
                            className="text-[8px] md:text-[9px] font-black uppercase text-primary hover:text-white transition-colors border-b border-primary/30"
                        >
                            Details
                        </Link>
                    )}
                </div>
            </div>
        )}

        {/* Main Navigation */}
        <header 
            suppressHydrationWarning
            className={cn(
                "w-full transition-all duration-300 ease-in-out border-b",
                scrolled 
                    ? "bg-white/90 backdrop-blur-md border-zinc-200 py-3 shadow-sm" 
                    : "bg-white border-zinc-100 py-5"
            )}
        >
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
                {/* Logo */}
                <Link href="/" className="relative h-8 w-20 md:h-10 md:w-48 transition-opacity hover:opacity-80 shrink-0">
                    <Image
                        src="/images/logo-virginia-transparent.png"
                        alt="Virginia Liquidation"
                        fill
                        className="object-contain object-left"
                        priority
                        suppressHydrationWarning
                    />
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden lg:flex items-center gap-1">
                    {[
                        { name: 'Auctions', href: '/' },
                        { name: 'How It Works', href: '/how-it-works' },
                        { name: 'Pickup', href: '/pickup-information' },
                        { name: 'About', href: '/about' },
                        { name: 'Contact', href: '/contact' },
                    ].map((item) => {
                        const isActive = item.href === '/' 
                            ? pathname === '/' 
                            : pathname.startsWith(item.href) || (item.name === 'Auctions' && pathname.startsWith('/events'));
                        return (
                            <Link 
                                key={item.name} 
                                href={item.href} 
                                className={cn(
                                    "px-3 py-2 text-[10px] font-bold uppercase tracking-widest transition-all italic rounded-xl",
                                    isActive 
                                        ? "text-primary bg-primary/5" 
                                        : "text-zinc-500 hover:text-primary"
                                )}
                            >
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-2 sm:gap-4">
                    {loading ? (
                        <div className="hidden h-8 w-24 animate-pulse rounded-lg bg-zinc-50 lg:block" suppressHydrationWarning />
                    ) : user ? (
                        <div className="flex items-center gap-2 sm:gap-3" suppressHydrationWarning>
                            {isAdmin ? (
                                <Link
                                    href="/admin"
                                    className="flex items-center gap-2 rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-1.5 transition-all hover:border-primary/20 group"
                                    suppressHydrationWarning
                                >
                                    <Shield size={14} className="text-zinc-400 group-hover:text-primary" suppressHydrationWarning />
                                    <span className="text-[10px] font-bold uppercase tracking-tight text-zinc-600 italic">Console</span>
                                </Link>
                            ) : (
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setIsAccountMenuOpen((open) => !open)}
                                        aria-expanded={isAccountMenuOpen}
                                        aria-haspopup="menu"
                                        className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-2 py-1.5 text-zinc-700 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
                                    >
                                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary text-[11px] font-black text-white">
                                            {accountInitial}
                                        </span>
                                        <span className="text-[9px] font-black uppercase tracking-wide sm:text-[10px] sm:tracking-widest">My Account</span>
                                        <ChevronDown size={14} className={cn("text-zinc-400 transition-transform", isAccountMenuOpen && "rotate-180")} />
                                    </button>

                                    {isAccountMenuOpen && (
                                        <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-52 rounded-2xl border border-zinc-200 bg-white p-2 shadow-xl shadow-zinc-900/10">
                                            {accountLinks.map((item) => (
                                                <Link
                                                    key={item.label}
                                                    href={item.href}
                                                    role="menuitem"
                                                    onClick={() => setIsAccountMenuOpen(false)}
                                                    className="block rounded-xl px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-primary"
                                                >
                                                    {item.label}
                                                </Link>
                                            ))}
                                            <div className="my-1 border-t border-zinc-100" />
                                            <button
                                                type="button"
                                                onClick={handleLogout}
                                                role="menuitem"
                                                className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-rose-500 transition-colors hover:bg-rose-50"
                                            >
                                                <LogOut size={14} />
                                                Sign Out
                                            </button>
                                        </div>
                                    )}
                                    {isAdmin && (
                                        <button
                                            type="button"
                                            onClick={handleLogout}
                                            aria-label="Sign out"
                                            className="text-zinc-300 transition-colors hover:text-rose-500"
                                        >
                                            <LogOut size={16} />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="hidden items-center gap-3 lg:flex">
                            <Link
                                href="/auth/signin"
                                className="px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest text-zinc-500 hover:text-primary transition-all italic"
                            >
                                Sign In
                            </Link>
                            <Link
                                href="/auth/signup"
                                className="bg-secondary text-white px-5 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-primary transition-all shadow-lg shadow-secondary/5 italic"
                            >
                                Register Free
                            </Link>
                        </div>
                    )}

                    {!loading && !user && (
                        <Link
                            href="/auth/signin"
                            className="rounded-xl border border-zinc-200 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-600 transition-all hover:border-primary/40 lg:hidden"
                        >
                            Sign In
                        </Link>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button 
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle Menu"
                        className="lg:hidden p-2 text-zinc-600 hover:bg-zinc-50 rounded-lg transition-all"
                        suppressHydrationWarning
                    >
                        {isMobileMenuOpen ? <X size={20} suppressHydrationWarning /> : <Menu size={20} suppressHydrationWarning />}
                    </button>
                </div>
            </div>
        </header>
      </div>

      {/* Mobile Menu - Drawer */}
      <div 
        className={cn(
            "fixed inset-0 z-[100] lg:hidden transition-all duration-500",
            isMobileMenuOpen ? "visible" : "invisible pointer-events-none"
        )}
        suppressHydrationWarning
      >
          <div className={cn("absolute inset-0 bg-secondary/20 backdrop-blur-sm transition-opacity duration-500", isMobileMenuOpen ? "opacity-100" : "opacity-0")} onClick={() => setIsMobileMenuOpen(false)} />
          
          <div className={cn(
            "absolute top-0 right-0 h-full w-full max-w-sm bg-white p-8 transition-transform duration-500 shadow-2xl flex flex-col",
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          )}>
            <div className="flex justify-between items-center mb-12">
              <div className="relative h-8 w-32">
                <Image src="/images/logo-virginia-transparent.png" alt="Logo" fill className="object-contain object-left" suppressHydrationWarning />
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-zinc-400" suppressHydrationWarning><X size={24} suppressHydrationWarning /></button>
            </div>

            <nav className="flex flex-col gap-1 mb-auto">
              {[
                { name: 'Auctions', href: '/' },
                { name: 'How It Works', href: '/how-it-works' },
                { name: 'Pickup', href: '/pickup-information' },
                { name: 'About', href: '/about' },
                { name: 'Contact', href: '/contact' },
              ].map((item) => {
                const isActive = item.href === '/' 
                    ? pathname === '/' 
                    : pathname.startsWith(item.href) || (item.name === 'Auctions' && pathname.startsWith('/events'));
                return (
                    <Link 
                        key={item.name}
                        href={item.href} 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                            "flex items-center justify-between py-4 px-4 rounded-2xl text-xl font-bold transition-all font-display italic uppercase",
                            isActive 
                                ? "text-primary bg-primary/5 border-l-4 border-primary" 
                                : "text-secondary hover:text-primary hover:bg-zinc-50"
                        )}
                    >
                        {item.name} <ChevronRight size={18} className={cn(isActive ? "text-primary" : "text-zinc-200")} />
                    </Link>
                );
              })}
            </nav>

            <div className="pt-8 space-y-3">
              {user ? (
                <Link
                    href={isAdmin ? "/admin" : "/profile"}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center py-4 rounded-xl font-bold bg-secondary text-white italic"
                >
                    {isAdmin ? "Admin Console" : "My Account"}
                </Link>
              ) : (
                <>
                  <Link
                      href="/auth/signup"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full flex items-center justify-center py-4 rounded-xl font-bold bg-secondary text-white italic uppercase tracking-widest text-[11px]"
                  >
                      Register Free
                  </Link>
                  <Link
                      href="/auth/signin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full flex items-center justify-center py-4 rounded-xl font-bold border border-zinc-200 text-zinc-600 italic uppercase tracking-widest text-[11px] hover:border-primary/40 transition-all"
                  >
                      Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
      </div>

      {/* Announcement Popup Modal */}
      <AnnouncementModal 
          isOpen={isAnnouncementPopupOpen} 
          onClose={() => setIsAnnouncementPopupOpen(false)} 
          title={announcement || "System Update"}
          text={announcementPopupText || "No details provided for this announcement."}
      />
    </>
  );
}

function AnnouncementModal({ isOpen, onClose, title, text }: { isOpen: boolean, onClose: () => void, title: string, text: string }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-secondary/40 backdrop-blur-md" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl border border-zinc-100 p-10 animate-in fade-in zoom-in duration-300">
                <button 
                    onClick={onClose}
                    className="absolute top-8 right-8 text-zinc-400 hover:text-zinc-900 transition-colors"
                >
                    <X size={20} />
                </button>
                
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary italic">System Notification</h2>
                </div>

                <h3 className="text-2xl font-black text-secondary uppercase tracking-tight italic mb-6 leading-none">
                    {title}
                </h3>

                <div className="prose prose-zinc prose-sm">
                    <p className="text-zinc-500 font-medium leading-relaxed italic whitespace-pre-wrap">
                        {text}
                    </p>
                </div>

                <div className="mt-10">
                    <button 
                        onClick={onClose}
                        className="w-full bg-secondary text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-primary transition-all shadow-lg shadow-secondary/10 italic"
                    >
                        Acknowledge
                    </button>
                </div>
            </div>
        </div>
    );
}
