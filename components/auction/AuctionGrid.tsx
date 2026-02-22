"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import AuctionCard, { Product } from "./AuctionCard";
import { createClient } from "@/lib/supabase/client";
import { fetchLots } from "@/app/actions/lots";
import { Loader2 } from "lucide-react";

interface AuctionGridProps {
  products: Product[];
  user: any;
  eventId?: string;
  categoryId?: string;
  searchQuery?: string;
  initialTotalCount?: number;
  status?: string | string[];
}

export default function AuctionGrid({ 
    products, 
    user, 
    eventId, 
    categoryId, 
    searchQuery,
    initialTotalCount = 0,
    status = 'live'
}: AuctionGridProps) {
  const [items, setItems] = useState<Product[]>(products);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialTotalCount > products.length);
  const observerTarget = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Sync with initial props if filters change (Reset state)
  // We use a JSON string check to avoid unnecessary resets on every render
  const productsKey = JSON.stringify(products.map(p => p.id));
  useEffect(() => {
    setItems(products);
    setPage(1);
    setHasMore(initialTotalCount > products.length);
  }, [productsKey, initialTotalCount]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    const nextPage = page + 1;
    
    console.log(`[INFINITE_SCROLL] Fetching page ${nextPage}`, {
        eventId,
        categoryId,
        searchQuery,
        status,
        currentItems: items.length,
        totalExpected: initialTotalCount
    });

    try {
        const result = await fetchLots({
            eventId,
            categoryId,
            searchQuery,
            page: nextPage,
            pageSize: 12,
            status
        });

        if (result.lots && result.lots.length > 0) {
            console.log(`[INFINITE_SCROLL] Received ${result.lots.length} items. hasMore: ${result.hasMore}`);
            setItems(prev => {
                const existingIds = new Set(prev.map(i => i.id));
                const newItems = result.lots.filter(i => !existingIds.has(i.id));
                return [...prev, ...newItems];
            });
            setPage(nextPage);
            setHasMore(result.hasMore);
        } else {
            console.log(`[INFINITE_SCROLL] No more items received.`);
            setHasMore(false);
        }
    } catch (err) {
        console.error("[INFINITE_SCROLL] Error loading more:", err);
    } finally {
        setLoading(false);
    }
  }, [page, loading, hasMore, eventId, categoryId, searchQuery, status, items.length, initialTotalCount]);

  // Intersection Observer for Automatic Loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          console.log("[INFINITE_SCROLL] Sentinel visible, triggering loadMore...");
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '200px' } // Increased margin for smoother experience
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [loadMore, hasMore, loading]);

  useEffect(() => {
    // Realtime channel
    const channel = supabase.channel(`event-grid-${eventId || 'global'}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'auctions'
      }, (payload: any) => {
        setItems(prevItems => prevItems.map(item => {
          if (item.id === payload.new.id) {
            return {
              ...item,
              price: Number(payload.new.current_price),
              endsAt: payload.new.ends_at
            };
          }
          return item;
        }));
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'bids'
      }, (payload: any) => {
        setItems(prevItems => {
            const targetItemIndex = prevItems.findIndex(i => i.id === payload.new.auction_id);
            if (targetItemIndex === -1) return prevItems;

            const newItems = [...prevItems];
            const item = newItems[targetItemIndex];
            const isMyBid = user && payload.new.user_id === user.id;
            
            newItems[targetItemIndex] = {
                ...item,
                bidCount: (item.bidCount || 0) + 1,
                price: Math.max(item.price, Number(payload.new.amount)),
                userMaxBid: isMyBid ? Number(payload.new.max_amount) : item.userMaxBid
            };
            return newItems;
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, supabase, user]);

  return (
    <div className="flex flex-col gap-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {items.map((product) => (
                <AuctionCard key={product.id} product={product} user={user} disableRealtime={true} />
            ))}
        </div>

        {/* Sentinel element for intersection observer */}
        <div ref={observerTarget} className="w-full h-20 flex items-center justify-center">
            {loading && (
                <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-zinc-100 shadow-sm">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Loading Assets...</span>
                </div>
            )}
            {!hasMore && items.length > 0 && (
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-300 italic">
                    End of Catalog — {items.length} items loaded
                </div>
            )}
        </div>
    </div>
  );
}
