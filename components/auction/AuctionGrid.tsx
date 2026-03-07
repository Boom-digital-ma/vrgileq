"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import AuctionCard, { Product } from "./AuctionCard";
import { createClient } from "@/lib/supabase/client";
import { fetchLots } from "@/app/actions/lots";
import { Loader2, PackageSearch } from "lucide-react";

interface AuctionGridProps {
  products: Product[];
  user: any;
  eventId?: string;
  categoryId?: string;
  searchQuery?: string;
  initialTotalCount?: number;
  status?: string | string[] | null;
}

export default function AuctionGrid({ 
    products, 
    user: initialUser, 
    eventId, 
    categoryId, 
    searchQuery,
    initialTotalCount = 0,
    status = null // Default to null (all statuses)
}: AuctionGridProps) {
  const [items, setItems] = useState<Product[]>(products);
  const [user, setUser] = useState(initialUser);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialTotalCount > products.length);
  const observerTarget = useRef<HTMLDivElement>(null);
  
  // Memoize Supabase to prevent recreating listeners unnecessarily
  const supabase = useMemo(() => createClient(), []);

  // Sync user session once
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
        if (session?.user?.id !== user?.id) {
            setUser(session?.user ?? null);
        }
    });
    return () => subscription.unsubscribe();
  }, [supabase, user?.id]);

  // Sync with initial props if filters change (Reset state)
  const resetKey = `${eventId}-${categoryId}-${searchQuery}-${JSON.stringify(status)}`;
  useEffect(() => {
    setItems(products);
    setPage(1);
    setHasMore(initialTotalCount > products.length);
  }, [resetKey, initialTotalCount, products]);

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
    const channelId = `grid-${eventId || 'global'}`;
    
    const channel = supabase.channel(channelId)
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
              endsAt: payload.new.ends_at,
              winner_id: payload.new.winner_id
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
            const item = { ...newItems[targetItemIndex] };
            const isMyBid = user && payload.new.user_id === user.id;
            
            newItems[targetItemIndex] = {
                ...item,
                bidCount: (item.bidCount || 0) + 1,
                price: Math.max(item.price, Number(payload.new.amount)),
                winner_id: payload.new.status === 'active' ? payload.new.user_id : item.winner_id,
                userMaxBid: (isMyBid && payload.new.max_amount) ? Number(payload.new.max_amount) : item.userMaxBid,
                userCurrentBid: isMyBid ? Number(payload.new.amount) : item.userCurrentBid
            };
            return newItems;
        });
      })
      .subscribe((status: any) => {
        console.log(`[Realtime] ${channelId} status:`, status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, supabase, user?.id]);

  return (
    <div className="flex flex-col gap-12">
        {items.length === 0 ? (
            <div className="py-32 flex flex-col items-center justify-center text-center bg-white rounded-[48px] border border-zinc-100 shadow-sm px-10">
                <div className="bg-zinc-50 p-6 rounded-[32px] mb-8 border border-zinc-100/50">
                    <PackageSearch size={48} className="text-zinc-200" />
                </div>
                <h3 className="text-2xl font-bold text-secondary font-display uppercase italic mb-3">Inventory Pending</h3>
                <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest max-w-md leading-relaxed">
                    Our technical team is currently verifying and listing assets for this protocol. <br/> Please check back shortly for the full catalog deployment.
                </p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {items.map((product) => (
                    <AuctionCard 
                        key={product.id} 
                        product={product} 
                        user={user} 
                        disableRealtime={true} 
                    />
                ))}
            </div>
        )}

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
