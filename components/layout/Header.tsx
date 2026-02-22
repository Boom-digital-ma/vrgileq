"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, User, LogOut, ChevronRight, Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { logout } from "@/app/actions/auth";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    const { data } = await supabase.from('profiles').select('full_name').eq('id', userId).single();
    if (data) setProfile(data);
  };

  useEffect(() => {
    // 1. Initial Session Check
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) fetchProfile(currentUser.id);
      setLoading(false);
    });

    // 2. Listen for Auth Changes (Login/Logout)
    const { data: authListener } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) fetchProfile(currentUser.id);
      else {
        setProfile(null);
        setLoading(false);
      }
    });

    // 3. Listen for Profile Changes (Realtime)
    let profileChannel: any;
    if (user?.id) {
        profileChannel = supabase
            .channel(`public:profiles:id=eq.${user.id}`)
            .on('postgres_changes', { 
                event: 'UPDATE', 
                schema: 'public', 
                table: 'profiles', 
                filter: `id=eq.${user.id}` 
            }, (payload: any) => {
                setProfile(payload.new);
            })
            .subscribe();
    }

    // 4. Fetch Site Settings (Announcements)
    const fetchSettings = async () => {
      const { data: settings } = await supabase
        .from('site_settings')
        .select('global_announcement, announcement_text, announcement_link')
        .eq('id', 'global')
        .maybeSingle();
      if (settings?.global_announcement) setAnnouncement(settings.global_announcement);
      if (settings?.announcement_text) setAnnouncementPopupText(settings.announcement_text);
      if (settings?.announcement_link) setAnnouncementLink(settings.announcement_link);
    };
    fetchSettings();

    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      authListener.subscription.unsubscribe();
      if (profileChannel) supabase.removeChannel(profileChannel);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [supabase, user?.id]);

  const handleLogout = async () => {
    try {
        await supabase.auth.signOut();
        await logout();
        window.location.href = '/';
    } catch (err) {
        window.location.href = '/';
    }
  };

  return (
    <>
      {/* Grouped Sticky Container for Announcement + Menu */}
      <div className="sticky top-0 z-50 w-full">
        {/* Announcement Bar - Now inside the sticky wrapper */}
        {announcement && (
            <div className="bg-secondary text-white py-2 px-6 border-b border-white/5 overflow-hidden">
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

        {/* Main Navigation - Integrated with Backdrop Blur */}
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
                <Link href="/" className="relative h-8 w-32 md:h-10 md:w-48 transition-opacity hover:opacity-80 shrink-0">
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
                                            <nav className="hidden lg:flex items-center gap-2">
                                                {[
                                                    { name: 'Home', href: '/' },
                                                    { name: 'Auctions', href: '/auctions' },
                                                    { name: 'Buyers', href: '/buyers' },
                                                    { name: 'Sellers', href: '/sellers' },
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
                                                                                    "px-4 py-2 text-[11px] font-bold uppercase tracking-widest transition-all italic rounded-xl",
                                                                                    isActive 
                                                                                        ? "text-primary bg-primary/5" 
                                                                                        : "text-zinc-500 hover:text-primary"
                                                                                )}
                                                                            >
                                                                                {item.name}
                                                                            </Link>
                                                                        );
                                                                    })}                                            </nav>                {/* Actions */}
                <div className="flex items-center gap-4">
                    {loading ? (
                        <div className="h-8 w-24 bg-zinc-50 animate-pulse rounded-lg" suppressHydrationWarning />
                    ) : user ? (
                        <div className="flex items-center gap-3" suppressHydrationWarning>
                            <Link href="/profile" className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-50 border border-zinc-100 hover:border-primary/20 transition-all group" suppressHydrationWarning>
                                <User size={14} className="text-zinc-400 group-hover:text-primary" suppressHydrationWarning />
                                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-tight italic">
                                    {profile?.full_name?.split(' ')[0] || user?.user_metadata?.full_name?.split(' ')[0] || 'Account'}
                                </span>
                            </Link>
                            <button 
                                onClick={handleLogout} 
                                aria-label="Logout"
                                className="text-zinc-300 hover:text-rose-500 transition-colors"
                                suppressHydrationWarning
                            >
                                <LogOut size={16} suppressHydrationWarning />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link href="/auth/signin" className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-900 px-3">
                                Sign In
                            </Link>
                            <Link 
                                href="/auth/signup" 
                                className="bg-secondary text-white px-5 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-primary transition-all shadow-lg shadow-secondary/5 italic"
                            >
                                Join
                            </Link>
                        </div>
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
              {['Home', 'Auctions', 'Buyers', 'Sellers', 'About', 'Contact'].map((item) => {
                const href = item === 'Home' ? '/' : `/${item.toLowerCase()}`;
                const isActive = href === '/' 
                    ? pathname === '/' 
                    : pathname.startsWith(href) || (item === 'Auctions' && pathname.startsWith('/events'));
                return (
                    <Link 
                        key={item}
                        href={href} 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                            "flex items-center justify-between py-4 px-4 rounded-2xl text-xl font-bold transition-all font-display italic uppercase",
                            isActive 
                                ? "text-primary bg-primary/5 border-l-4 border-primary" 
                                : "text-secondary hover:text-primary hover:bg-zinc-50"
                        )}
                    >
                        {item} <ChevronRight size={18} className={cn(isActive ? "text-primary" : "text-zinc-200")} />
                    </Link>
                );
              })}
            </nav>

            <div className="pt-8 space-y-4">
              {user ? (
                <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="w-full flex items-center justify-center py-4 rounded-xl font-bold bg-secondary text-white italic">My Account</Link>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/auth/signin" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center py-4 rounded-xl font-bold bg-zinc-50 text-secondary border border-zinc-100">Sign In</Link>
                  <Link href="/auth/signup" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center py-4 rounded-xl font-bold bg-primary text-white">Join</Link>
                </div>
              )}
            </div>
                                  </div>
                              </div>
                      
                              {/* Announcement Popup Modal */}
                              <AnnouncementModal 
                                  isOpen={isAnnouncementPopupOpen} 
                                  onClose={() => setIsAnnouncementPopupOpen(false)} 
                                  title={announcement || "System Protocol Update"}
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
                              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary italic">System Protocol</h2>
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
                                  Acknowledge Protocol
                              </button>
                          </div>
                      </div>
                  </div>
              );
          }
