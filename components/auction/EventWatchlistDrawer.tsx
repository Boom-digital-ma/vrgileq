"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { toggleWatchlist } from "@/app/actions/watchlist";
import { Star, X, Clock, Trash2, Loader2, Gavel } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface WatchedProduct {
  id: string;
  lot_number?: string | number;
  title: string;
  current_price: number;
  ends_at: string;
  image_url: string;
  status: string;
  categories?: { name: string };
  auction_images?: { url: string }[];
}

export default function EventWatchlistDrawer({ eventId, user: initialUser }: { eventId: string; user?: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<WatchedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(Date.now());
  const [user, setUser] = useState<any>(initialUser || null);
  
  const supabase = useMemo(() => createClient(), []);

  // Update clock every second for countdowns
  useEffect(() => {
    if (!isOpen || items.length === 0) return;
    const interval = setInterval(() => {
      setTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, items.length]);

  // Fetch watched items for this event (bulletproof direct query + client-side filtering)
  const fetchWatchedItems = async (currentUser = user) => {
    console.log("[WatchlistDrawer] fetchWatchedItems starting...", { currentUser: currentUser?.id, eventId });
    if (!currentUser) {
      console.log("[WatchlistDrawer] fetchWatchedItems aborted: No current user.");
      return;
    }
    try {
      const { data, error } = await supabase
        .from("watchlist")
        .select(`
          id,
          auctions (
            *,
            categories (name),
            auction_images (*)
          )
        `)
        .eq("user_id", currentUser.id);

      if (error) throw error;

      console.log("[WatchlistDrawer] Raw watchlist data:", data);

      const watchedLots = (data || [])
        .map((entry: any) => entry.auctions)
        .filter((lot: any) => lot && lot.event_id === eventId);

      console.log("[WatchlistDrawer] Filtered items for this event:", watchedLots);
      setItems(watchedLots as any[]);
    } catch (err) {
      console.error("[WatchlistDrawer] Error fetching items:", err);
    } finally {
      setLoading(false);
    }
  };

  // Client-side session and watchlist sync
  useEffect(() => {
    let isMounted = true;
    console.log("[WatchlistDrawer] Mounted. eventId:", eventId, "initialUser:", initialUser?.id);
    async function getSession() {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      console.log("[WatchlistDrawer] getSession returned user:", currentUser?.id);
      if (isMounted) {
        setUser(currentUser);
        if (currentUser) {
          fetchWatchedItems(currentUser);
        }
      }
    }
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      console.log("[WatchlistDrawer] onAuthStateChange event:", _event, "user:", session?.user?.id);
      if (isMounted) {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          fetchWatchedItems(currentUser);
        } else {
          setItems([]);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [eventId, supabase]);

  // Real-time listener for price/expiry updates of the watched items
  useEffect(() => {
    if (!user || items.length === 0) return;
    console.log("[WatchlistDrawer] Starting real-time channel for event:", eventId);

    const channel = supabase
      .channel(`watchlist-drawer-${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "auctions",
          filter: `event_id=eq.${eventId}`,
        },
        (payload: any) => {
          console.log("[WatchlistDrawer] Real-time lot update received:", payload.new.id);
          setItems((prev) =>
            prev.map((item) =>
              item.id === payload.new.id
                ? {
                    ...item,
                    current_price: Number(payload.new.current_price),
                    ends_at: payload.new.ends_at,
                    status: payload.new.status,
                  }
                : item
            )
          );
        }
      )
      .subscribe();

    return () => {
      console.log("[WatchlistDrawer] Cleaning up real-time channel");
      supabase.removeChannel(channel);
    };
  }, [eventId, user, items.length, supabase]);

  // Handle Remove from Watchlist
  const handleRemove = async (e: React.MouseEvent, lotId: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await toggleWatchlist(lotId);
      setItems((prev) => prev.filter((item) => item.id !== lotId));
      toast.success("Removed from watchlist");
      
      // Dispatch global event so AuctionCards and BiddingWidgets can update their local state
      window.dispatchEvent(new CustomEvent("watchlist-updated", { detail: { lotId, isWatched: false } }));
    } catch (err) {
      toast.error("Failed to remove item");
    }
  };

  // Helper to get formatted countdown
  const getCountdown = (endsAtStr: string, status?: string) => {
    if (status === "sold" || status === "ended") return "Ended";
    const diff = new Date(endsAtStr).getTime() - time;
    if (diff <= 0) return "Ended";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Listen to global custom events for watchlist updates from cards
  useEffect(() => {
    const handleGlobalWatchUpdate = () => {
      fetchWatchedItems();
    };

    window.addEventListener("watchlist-updated", handleGlobalWatchUpdate);
    return () => {
      window.removeEventListener("watchlist-updated", handleGlobalWatchUpdate);
    };
  }, [user]);

  if (!user || items.length === 0) return null;

  return (
    <>
      {/* FLOATING WATCHLIST BUBBLE */}
      <div className="fixed bottom-6 right-6 z-40">
        <motion.button
          onClick={() => setIsOpen(true)}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-3 bg-[#0B2B53] hover:bg-[#049A9E] text-white px-5 py-4 rounded-full shadow-2xl border border-white/10 transition-colors duration-300 font-display italic font-bold uppercase tracking-wider text-xs cursor-pointer"
        >
          <div className="relative">
            <Star size={16} className="fill-current text-amber-400" />
            <span className="absolute -top-3.5 -right-3.5 bg-rose-500 text-white rounded-full text-[9px] font-black h-5 w-5 flex items-center justify-center border-2 border-[#0B2B53]">
              {items.length}
            </span>
          </div>
          <span>My Watchlist</span>
        </motion.button>
      </div>

      {/* DRAWER SLIDE PANEL */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 cursor-pointer"
            />

            {/* Sidebar Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[420px] bg-white shadow-2xl z-50 border-l border-zinc-100 flex flex-col font-sans text-secondary"
            >
              {/* Header */}
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black uppercase tracking-wider font-display italic">
                    My Watchlist
                  </h3>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    {items.length} assets tracked in this event
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl bg-zinc-50 border border-zinc-100 text-zinc-400 hover:text-zinc-900 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Watched Lots List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {items.map((item) => {
                  const countdown = getCountdown(item.ends_at, item.status);
                  const isUrgent = countdown !== "Ended" && !countdown.startsWith("Starts") && Number(countdown.split(":")[0]) < 24;

                  return (
                    <div
                      key={item.id}
                      className="group flex gap-4 p-3 rounded-2xl border border-zinc-100 bg-zinc-50 hover:bg-white hover:shadow-xl transition-all duration-300 relative overflow-hidden"
                    >
                      {/* Thumbnail */}
                      <div className="relative h-20 w-20 rounded-xl overflow-hidden border border-zinc-100 shrink-0 bg-zinc-200">
                        <Image
                          src={item.image_url || "/images/placeholder.jpg"}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-[9px] font-black uppercase tracking-widest text-primary">
                              Lot {item.lot_number || "—"}
                            </span>
                            <button
                              onClick={(e) => handleRemove(e, item.id)}
                              className="text-zinc-300 hover:text-rose-500 p-1 rounded-lg transition-colors cursor-pointer"
                              title="Remove from Watchlist"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                          <h4 className="text-xs font-bold truncate pr-4 text-zinc-800">
                            {item.title}
                          </h4>
                          <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider truncate mb-2">
                            {item.categories?.name}
                          </p>
                        </div>

                        <div className="flex items-end justify-between">
                          <div>
                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block mb-0.5">
                              Current Bid
                            </span>
                            <span className="text-sm font-black font-display text-[#0B2B53]">
                              ${item.current_price.toLocaleString()}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block mb-0.5">
                              Time Left
                            </span>
                            <span
                              className={cn(
                                "text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-full justify-end",
                                countdown === "Ended"
                                  ? "text-zinc-400 bg-zinc-100"
                                  : isUrgent
                                  ? "text-rose-500 bg-rose-50 font-bold animate-pulse"
                                  : "text-zinc-600 bg-zinc-100"
                              )}
                            >
                              <Clock size={10} />
                              {countdown}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Link Overlay click handler */}
                      <Link
                        href={`/auctions/${item.id}`}
                        onClick={() => setIsOpen(false)}
                        className="absolute inset-0 z-10 opacity-0 focus:opacity-100 focus:ring-2 focus:ring-primary rounded-2xl"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Footer info */}
              <div className="p-6 border-t border-zinc-100 bg-zinc-50/50">
                <div className="flex items-center gap-3 justify-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  <Gavel size={14} className="text-primary animate-pulse" />
                  <span>Real-time bidding synchronization active</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
