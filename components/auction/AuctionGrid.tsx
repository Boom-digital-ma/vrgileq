"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import AuctionCard, { Product } from "./AuctionCard";
import { createClient } from "@/lib/supabase/client";
import { fetchLots } from "@/app/actions/lots";
import { Loader2, PackageSearch, Search, X, Star, Gavel } from "lucide-react";
import { cn } from "@/lib/utils";

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
    searchQuery: initialSearchQuery = "",
    initialTotalCount = 0,
    status = null // Default to null (all statuses)
}: AuctionGridProps) {
  const [items, setItems] = useState<Product[]>(products);
  const [user, setUser] = useState(initialUser);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialTotalCount > products.length);
  const [watchedLotIds, setWatchedLotIds] = useState<Set<string>>(new Set());
  const [biddedLotIds, setBiddedLotIds] = useState<Set<string>>(new Set());
  const [userBidsMap, setUserBidsMap] = useState<Record<string, { amount: number, max_amount: number }>>({});
  
  // Local filter states
  const [localSearchQuery, setLocalSearchQuery] = useState(initialSearchQuery);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(initialSearchQuery);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showBiddedOnly, setShowBiddedOnly] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  
  const mountedRef = useRef(false);
  const prevWatchedIdsRef = useRef(watchedLotIds);
  const prevBiddedIdsRef = useRef(biddedLotIds);
  const observerTarget = useRef<HTMLDivElement>(null);
  
  // Memoize Supabase to prevent recreating listeners unnecessarily
  const supabase = useMemo(() => createClient(), []);

  // Fetch watched and bidded lot IDs once on mount/user change
  useEffect(() => {
    if (!user) {
        setWatchedLotIds(new Set<string>());
        setBiddedLotIds(new Set<string>());
        return;
    }
    async function fetchUserData() {
        try {
            const [watchRes, bidRes] = await Promise.all([
                supabase.from('watchlist').select('auction_id').eq('user_id', user.id),
                supabase.from('bids').select('auction_id, amount, max_amount').eq('user_id', user.id)
            ]);

            let watchIds: string[] = Array.from(new Set((watchRes.data || []).map((w: any) => w.auction_id as string)));
            let bidIds: string[] = Array.from(new Set((bidRes.data || []).map((b: any) => b.auction_id as string)));

            // 2. If we are on an event page, filter these IDs to only keep those belonging to this event
            if (eventId && (watchIds.length > 0 || bidIds.length > 0)) {
                const allIds = Array.from(new Set([...watchIds, ...bidIds]));
                
                // Fetch the event_id for all these lots
                const { data: validAuctions, error: validErr } = await supabase
                    .from('auctions')
                    .select('id')
                    .eq('event_id', eventId)
                    .in('id', allIds);

                if (!validErr && validAuctions) {
                    const validIds = new Set(validAuctions.map((a: any) => a.id));
                    watchIds = watchIds.filter(id => validIds.has(id));
                    bidIds = bidIds.filter(id => validIds.has(id));
                }
            }

            const map: Record<string, { amount: number, max_amount: number }> = {};
            (bidRes.data || []).forEach((b: any) => {
                map[b.auction_id] = { amount: b.amount, max_amount: b.max_amount };
            });
            setUserBidsMap(map);

            setWatchedLotIds(new Set<string>(watchIds));
            setBiddedLotIds(new Set<string>(bidIds));

        } catch (err) {
            console.error("[AuctionGrid] Error fetching user data:", err);
        }
    }
    fetchUserData();
  }, [user, supabase]);

  // Listen to global watchlist update events to keep status in sync in real-time
  useEffect(() => {
    const handleWatchlistUpdate = (e: Event) => {
        const customEvent = e as CustomEvent;
        if (customEvent.detail) {
            const { lotId, isWatched } = customEvent.detail;
            setWatchedLotIds(prev => {
                const next = new Set(prev);
                if (isWatched) {
                    next.add(lotId);
                } else {
                    next.delete(lotId);
                }
                return next;
            });
        }
    };
    window.addEventListener('watchlist-updated', handleWatchlistUpdate);
    return () => window.removeEventListener('watchlist-updated', handleWatchlistUpdate);
  }, []);

  // Sync user session once
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
        if (session?.user?.id !== user?.id) {
            setUser(session?.user ?? null);
        }
    });
    return () => subscription.unsubscribe();
  }, [supabase, user?.id]);

  // Debounce search query input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(localSearchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [localSearchQuery]);

  // Reset local filters on category/event changes (from prop tabs)
  useEffect(() => {
    setLocalSearchQuery("");
    setShowFavoritesOnly(false);
  }, [categoryId, eventId]);

  useEffect(() => {
    const handleReset = () => {
        setLocalSearchQuery('');
        setShowFavoritesOnly(false);
        setShowBiddedOnly(false);
        setResetKey(prev => prev + 1);
    };
    window.addEventListener('reset-auction-grid', handleReset);
    return () => window.removeEventListener('reset-auction-grid', handleReset);
  }, []);

  // Sync with initial props if filters change (Reset state)
  const gridKey = `${eventId}-${categoryId}-${initialSearchQuery}-${JSON.stringify(status)}-${resetKey}`;
  useEffect(() => {
    setItems(products);
    setPage(1);
    setHasMore(initialTotalCount > products.length);
  }, [gridKey]);

  // Sync fresh server props (such as updated prices, winner_id, and userMaxBid proxy limit)
  // into existing grid items without resetting pagination or filters
  useEffect(() => {
    setItems(prevItems => 
      prevItems.map(prev => {
        const fresh = products.find(p => p.id === prev.id);
        if (!fresh) return prev;
        return {
          ...prev,
          price: fresh.price,
          winner_id: fresh.winner_id,
          userMaxBid: fresh.userMaxBid,
          userCurrentBid: fresh.userCurrentBid,
          bidCount: fresh.bidCount,
          endsAt: fresh.endsAt
        };
      })
    );
  }, [products]);

  // Reactive filtering effect (Search + Favorites Only + Bidded Only)
  useEffect(() => {
    let isCurrent = true;
    
    // Check if the only thing that changed was the watchedLotIds or biddedLotIds
    const isWatchedIdsChanged = prevWatchedIdsRef.current !== watchedLotIds;
    prevWatchedIdsRef.current = watchedLotIds;
    const isBiddedIdsChanged = prevBiddedIdsRef.current !== biddedLotIds;
    prevBiddedIdsRef.current = biddedLotIds;
    
    if (!showFavoritesOnly && isWatchedIdsChanged && !showBiddedOnly) {
        return;
    }
    if (!showBiddedOnly && isBiddedIdsChanged && !showFavoritesOnly) {
        return;
    }

    async function applyFilters() {
        setLoading(true);
        try {
            if (showFavoritesOnly || showBiddedOnly) {
                let targetIds = new Set<string>();
                if (showFavoritesOnly && showBiddedOnly) {
                    targetIds = new Set([...watchedLotIds].filter(x => biddedLotIds.has(x)));
                } else if (showFavoritesOnly) {
                    targetIds = watchedLotIds;
                } else {
                    targetIds = biddedLotIds;
                }

                if (targetIds.size === 0) {
                    if (isCurrent) {
                        setItems([]);
                        setHasMore(false);
                    }
                    return;
                }
                
                let query = supabase
                    .from('auctions')
                    .select('*, categories(name), bids(count), auction_images(url), auction_events(location, start_at)')
                    .in('id', Array.from(targetIds))
                    .order('lot_number', { ascending: true });

                if (eventId) {
                    query = query.eq('event_id', eventId);
                }
                
                const { data: lots, error } = await query;

                if (error) throw error;

                const mapped = (lots || []).map((lot: any) => {
                    const sortedGallery = (lot.auction_images?.map((i: any) => i.url) || [])
                        .sort((a: string, b: string) => a.localeCompare(b, undefined, { numeric: true }));

                    const allImages = [
                        ...(lot.image_url ? [lot.image_url] : []),
                        ...sortedGallery
                    ].filter((v, i, a) => a.indexOf(v) === i);

                    return {
                        id: lot.id,
                        event_id: lot.event_id,
                        lotNumber: lot.lot_number,
                        title: lot.title,
                        supplier: lot.categories?.name || "Industrial Liquidation",
                        price: Number(lot.current_price),
                        endsAt: lot.ends_at,
                        startAt: lot.auction_events?.start_at,
                        image: allImages[0] || "/images/placeholder.jpg",
                        images: allImages,
                        bidCount: lot.bids?.[0]?.count || 0,
                        pickupLocation: lot.auction_events?.location,
                        description: lot.description,
                        minIncrement: Number(lot.min_increment),
                        winner_id: lot.winner_id,
                        manufacturer: lot.manufacturer,
                        model: lot.model,
                        userCurrentBid: userBidsMap[lot.id]?.amount,
                        userMaxBid: userBidsMap[lot.id]?.max_amount
                    };
                });

                let finalLots = mapped;
                if (debouncedSearchQuery) {
                    const q = debouncedSearchQuery.toLowerCase().trim();
                    finalLots = mapped.filter((l: any) => 
                        l.title?.toLowerCase()?.includes(q) || 
                        l.description?.toLowerCase()?.includes(q) ||
                        (l.lotNumber && l.lotNumber.toString() === q)
                    );
                }

                if (isCurrent) {
                    setItems(finalLots);
                    setHasMore(false);
                }
            } else {
                if (debouncedSearchQuery === initialSearchQuery) {
                    if (isCurrent) {
                        setItems(products);
                        setPage(1);
                        setHasMore(initialTotalCount > products.length);
                    }
                } else {
                    const result = await fetchLots({
                        eventId,
                        categoryId,
                        searchQuery: debouncedSearchQuery,
                        page: 1,
                        pageSize: 12,
                        status
                    });

                    if (isCurrent) {
                        setItems(result.lots || []);
                        setPage(1);
                        setHasMore(result.hasMore);
                    }
                }
            }
        } catch (err) {
            console.error("Filter error:", err);
        } finally {
            if (isCurrent) setLoading(false);
        }
    }

    if (mountedRef.current) {
        applyFilters();
    } else {
        mountedRef.current = true;
    }

    return () => {
        isCurrent = false;
    };
  }, [debouncedSearchQuery, showFavoritesOnly, showBiddedOnly, categoryId, eventId, status, watchedLotIds, biddedLotIds, userBidsMap, supabase]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore || showFavoritesOnly) return;
    
    setLoading(true);
    const nextPage = page + 1;
    
    console.log(`[INFINITE_SCROLL] Fetching page ${nextPage}`, {
        eventId,
        categoryId,
        searchQuery: debouncedSearchQuery,
        status,
        currentItems: items.length,
        totalExpected: initialTotalCount
    });

    try {
        const result = await fetchLots({
            eventId,
            categoryId,
            searchQuery: debouncedSearchQuery,
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
  }, [page, loading, hasMore, showFavoritesOnly, eventId, categoryId, debouncedSearchQuery, status, items.length, initialTotalCount]);

  // Intersection Observer for Automatic Loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          console.log("[INFINITE_SCROLL] Sentinel visible, triggering loadMore...");
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
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

  // Real-time listener for current price & bid updates
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
    <div className="flex flex-col gap-8">
        {/* Toolbar: Search & Watchlist Filter */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white border border-zinc-200 rounded-[28px] p-4 shadow-md shadow-zinc-100/50">
            {/* Search Input */}
            <div className="relative w-full sm:max-w-md group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-primary transition-colors h-4 w-4" />
                <input 
                    type="text"
                    placeholder="Search catalog by keyword or lot number..."
                    value={localSearchQuery}
                    onChange={(e) => setLocalSearchQuery(e.target.value)}
                    className="w-full h-11 bg-zinc-50 border border-zinc-200 rounded-2xl pl-11 pr-10 text-xs font-bold text-secondary focus:outline-none focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary transition-all font-sans outline-none"
                />
                {localSearchQuery && (
                    <button 
                        type="button"
                        onClick={() => setLocalSearchQuery("")}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-secondary transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Filter toggles */}
            {user && (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                        type="button"
                        onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                        className={cn(
                            "flex items-center gap-2.5 px-6 h-11 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all flex-1 sm:flex-none justify-center active:scale-95",
                            showFavoritesOnly 
                                ? "bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20" 
                                : watchedLotIds.size > 0
                                    ? "bg-amber-50/70 border-amber-200 text-amber-700 hover:bg-amber-100 hover:border-amber-300"
                                    : "bg-white text-zinc-400 border-zinc-200 hover:border-zinc-300"
                        )}
                    >
                        <Star 
                            size={14} 
                            className={cn(
                                showFavoritesOnly ? "fill-white text-white" : "",
                                !showFavoritesOnly && watchedLotIds.size > 0 ? "fill-amber-500 text-amber-500" : ""
                            )} 
                        />
                        <span className="hidden sm:inline">Watchlist</span> ({watchedLotIds.size})
                    </button>

                    <button
                        type="button"
                        onClick={() => setShowBiddedOnly(!showBiddedOnly)}
                        className={cn(
                            "flex items-center gap-2.5 px-6 h-11 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all flex-1 sm:flex-none justify-center active:scale-95",
                            showBiddedOnly 
                                ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                                : biddedLotIds.size > 0
                                    ? "bg-primary/5 border-primary/20 text-primary hover:bg-primary/10 hover:border-primary/30"
                                    : "bg-white text-zinc-400 border-zinc-200 hover:border-zinc-300"
                        )}
                    >
                        <Gavel 
                            size={14} 
                        />
                        <span className="hidden sm:inline">My Bids</span> ({biddedLotIds.size})
                    </button>
                </div>
            )}
        </div>

        {items.length === 0 ? (
            <div className="py-32 flex flex-col items-center justify-center text-center bg-white rounded-[48px] border border-zinc-100 shadow-sm px-10">
                <div className="bg-zinc-50 p-6 rounded-[32px] mb-8 border border-zinc-100/50">
                    <PackageSearch size={48} className="text-zinc-200" />
                </div>
                <h3 className="text-2xl font-bold text-secondary font-display uppercase italic mb-3">
                    {showFavoritesOnly && showBiddedOnly ? "No Matches Found" : showFavoritesOnly ? "No Favorites Found" : showBiddedOnly ? "No Bids Found" : "No Assets Found"}
                </h3>
                <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest max-w-md leading-relaxed">
                    {showFavoritesOnly && showBiddedOnly 
                        ? "You don't have any items that are both in your watchlist and have your bids."
                        : showFavoritesOnly 
                            ? "You haven't added any items to your watchlist for this event yet." 
                            : showBiddedOnly
                                ? "You haven't placed any bids in this event yet."
                                : "No assets match your search criteria. Please try another query."}
                </p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {items.map((product) => (
                    <AuctionCard 
                        key={product.id} 
                        product={product} 
                        user={user} 
                        isInitiallyWatched={watchedLotIds.has(product.id)}
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
                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Loading Items...</span>
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
