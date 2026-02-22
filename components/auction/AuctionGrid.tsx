"use client";

import { useState, useEffect } from "react";
import AuctionCard, { Product } from "./AuctionCard";
import { createClient } from "@/lib/supabase/client";

export default function AuctionGrid({ products, user, eventId }: { products: Product[], user: any, eventId: string }) {
  const [items, setItems] = useState<Product[]>(products);
  const supabase = createClient();

  // Sync with initial props
  useEffect(() => {
    setItems(products);
  }, [products]);

  useEffect(() => {
    // Shared channel for the entire grid
    const channel = supabase.channel(`event-grid-${eventId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'auctions',
        filter: `event_id=eq.${eventId}`
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
        // Note: 'bids' table usually doesn't have 'event_id' directly, so we listen to all INSERTs 
        // and filter by auction_id matching our items. 
        // This is acceptable for a specific event page where user is focused on this subset.
      }, (payload: any) => {
        setItems(prevItems => {
            // Check if the bid belongs to one of our items
            const targetItemIndex = prevItems.findIndex(i => i.id === payload.new.auction_id);
            if (targetItemIndex === -1) return prevItems; // Not relevant

            const newItems = [...prevItems];
            const item = newItems[targetItemIndex];
            const newPrice = Number(payload.new.amount);
            
            // Optimistically update
            newItems[targetItemIndex] = {
                ...item,
                bidCount: (item.bidCount || 0) + 1,
                price: Math.max(item.price, newPrice)
            };
            return newItems;
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, supabase]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {items.map((product) => (
            <AuctionCard key={product.id} product={product} user={user} disableRealtime={true} />
        ))}
    </div>
  );
}
