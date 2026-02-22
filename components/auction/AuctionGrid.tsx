"use client";

import { useState, useEffect } from "react";
import AuctionCard, { Product } from "./AuctionCard";
import { createClient } from "@/lib/supabase/client";
import { fetchLots } from "@/app/actions/lots";
import { Loader2, Plus, ArrowDown } from "lucide-react";

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
  const supabase = createClient();

  // Sync with initial props if filters change
  useEffect(() => {
    setItems(products);
    setPage(1);
    setHasMore(initialTotalCount > products.length);
  }, [products, initialTotalCount]);

  const handleLoadMore = async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    const nextPage = page + 1;
    
    const result = await fetchLots({
        eventId,
        categoryId,
        searchQuery,
        page: nextPage,
        pageSize: 12,
        status
    });

    if (result.lots) {
        setItems(prev => [...prev, ...result.lots]);
        setPage(nextPage);
        setHasMore(result.hasMore);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Shared channel for the entire grid
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
    <div className="flex flex-col gap-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {items.map((product) => (
                <AuctionCard key={product.id} product={product} user={user} disableRealtime={true} />
            ))}
        </div>

        {hasMore && (
            <div className="flex justify-center pb-10">
                <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="group relative flex items-center justify-center gap-3 bg-white border-2 border-zinc-100 hover:border-primary/20 px-10 py-5 rounded-[24px] transition-all hover:shadow-2xl hover:shadow-primary/5 active:scale-95 disabled:opacity-50"
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[22px]" />
                    {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    ) : (
                        <Plus className="h-5 w-5 text-primary group-hover:rotate-90 transition-transform duration-500" />
                    )}
                    <span className="text-sm font-bold uppercase tracking-widest text-secondary group-hover:text-primary transition-colors">
                        {loading ? "Loading Assets..." : "Load More Lots"}
                    </span>
                    <ArrowDown className="h-4 w-4 text-zinc-300 group-hover:translate-y-1 transition-transform" />
                </button>
            </div>
        )}
    </div>
  );
}
