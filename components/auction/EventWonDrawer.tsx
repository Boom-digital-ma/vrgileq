"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Trophy, X, DollarSign } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface WonProduct {
  id: string;
  lot_number?: string | number;
  title: string;
  current_price: number;
  image_url: string;
  status: string;
  categories?: { name: string };
  auction_images?: { url: string }[];
}

export default function EventWonDrawer({ eventId, user: initialUser }: { eventId: string; user?: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<WonProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(initialUser || null);

  const supabase = useMemo(() => createClient(), []);

  const fetchWonItems = async (currentUser = user) => {
    if (!currentUser) return;
    try {
      const { data, error } = await supabase
        .from("auctions")
        .select(`*, categories(name), auction_images(url)`)
        .eq("winner_id", currentUser.id)
        .eq("event_id", eventId)
        .in("status", ["sold", "ended"])
        .order("lot_number", { ascending: true });

      if (error) throw error;
      const wonItems = (data || []) as any[];
      setItems(wonItems);
      // Broadcast count so toolbar button can display it
      window.dispatchEvent(new CustomEvent("won-count-updated", { detail: { count: wonItems.length } }));
    } catch (err) {
      console.error("[WonDrawer] Error fetching items:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function getSession() {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (isMounted) {
        setUser(currentUser);
        if (currentUser) {
          fetchWonItems(currentUser);
        }
      }
    }
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      if (isMounted) {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          fetchWonItems(currentUser);
        } else {
          setItems([]);
          window.dispatchEvent(new CustomEvent("won-count-updated", { detail: { count: 0 } }));
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [eventId, supabase]);

  // Real-time listener for auction status updates (items becoming sold/ended)
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`won-drawer-${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "auctions",
          filter: `event_id=eq.${eventId}`,
        },
        (payload: any) => {
          const updated = payload.new;
          if (updated.winner_id === user.id && (updated.status === "sold" || updated.status === "ended")) {
            fetchWonItems();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, user, supabase]);

  // Listen for open event from toolbar button
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-won-drawer", handleOpen);
    return () => window.removeEventListener("open-won-drawer", handleOpen);
  }, []);

  if (!user) return null;

  const totalValue = items.reduce((sum, item) => sum + Number(item.current_price), 0);

  return (
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
                  Won Items
                </h3>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  {items.length} {items.length === 1 ? "item" : "items"} won in this event
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl bg-zinc-50 border border-zinc-100 text-zinc-400 hover:text-zinc-900 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Won Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                  <Trophy size={40} className="text-zinc-200 mb-4" />
                  <p className="text-sm font-bold uppercase tracking-widest text-zinc-300">No items won yet</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-300 mt-2">Items you win will appear here</p>
                </div>
              )}
              {items.map((item) => (
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
                        <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          Won
                        </span>
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
                          Final Price
                        </span>
                        <span className="text-sm font-black font-display text-[#0B2B53]">
                          ${Number(item.current_price).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Link Overlay */}
                  <Link
                    href={`/auctions/${item.id}`}
                    onClick={() => setIsOpen(false)}
                    className="absolute inset-0 z-10 opacity-0 focus:opacity-100 focus:ring-2 focus:ring-primary rounded-2xl"
                  />
                </div>
              ))}
            </div>

            {/* Footer with total */}
            <div className="p-6 border-t border-zinc-100 bg-zinc-50/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  <DollarSign size={14} className="text-emerald-500" />
                  <span>Total Won</span>
                </div>
                <span className="text-lg font-black font-display text-[#0B2B53]">
                  ${totalValue.toLocaleString()}
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
