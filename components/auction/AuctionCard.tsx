"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Timer, Building2, Gavel, Eye, Share2, Star, ArrowLeft, ArrowRight, MapPin, Clock, Loader2, Lock, LogIn, Zap, Trophy, AlertCircle, ChevronDown } from "lucide-react";
import QuickViewModal from "./QuickViewModal";
import { toggleWatchlist } from "@/app/actions/watchlist";
import { placeBid } from "@/app/actions/bids";
import { checkRegistration } from "@/app/actions/registrations";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn, getOptimizedImageUrl, formatEventDate } from "@/lib/utils";

export interface Product {
  id: string;
  event_id: string;
  lotNumber?: string | number;
  title: string;
  supplier: string;
  price: number;
  endsAt: string;
  startAt?: string;
  image: string;
  images?: string[];
  bidCount: number;
  pickupLocation?: string;
  pickupDate?: string;
  manufacturer?: string;
  model?: string;
  description?: string;
  minIncrement?: number;
  userMaxBid?: number;
  userCurrentBid?: number;
  winner_id?: string;
}

export default function AuctionCard({ product, user, disableRealtime = false }: { product: Product, user: any, disableRealtime?: boolean }) {
  const [bidAmount, setBidAmount] = useState<number>(product.price + (product.minIncrement || 100));
  const [mounted, setMounted] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const [isWatched, setIsWatched] = useState(false);
  const [loadingWatch, setLoadingWatch] = useState(false);
  const [loadingBid, setLoadingBid] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [realtimePrice, setRealtimePrice] = useState(product.price);
  const [realtimeBidCount, setRealtimeBidCount] = useState(product.bidCount);
  const [realtimeEndsAt, setRealtimeEndsAt] = useState(product.endsAt);
  const [userMaxBid, setUserMaxBid] = useState(product.userMaxBid);
  const [userCurrentBid, setUserCurrentBid] = useState(product.userCurrentBid);
  const [winnerId, setWinnerId] = useState(product.winner_id);
  const [isStarted, setIsStarted] = useState(!product.startAt || new Date(product.startAt) <= new Date());
  const [isEnded, setIsEnded] = useState(new Date(product.endsAt) <= new Date());
  const [isUrgent, setIsUrgent] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();
  
  const allImages = product.images && product.images.length > 0 ? product.images : [product.image];
  const supabase = createClient();

  // Reset image loading state when changing images
  useEffect(() => {
    setImageLoading(true);
  }, [currentImageIndex]);

  // Handle Touch Swiping
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    } else if (isRightSwipe) {
      setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    }
  };

  // Sync state with props (for when parent updates data)
  useEffect(() => {
    setRealtimePrice(product.price);
    setRealtimeBidCount(product.bidCount);
    setRealtimeEndsAt(product.endsAt);
    setUserMaxBid(product.userMaxBid);
    setUserCurrentBid(product.userCurrentBid);
    setWinnerId(product.winner_id);
  }, [product.price, product.bidCount, product.endsAt, product.userMaxBid, product.userCurrentBid, product.winner_id]);

  // 1. Timer Effect
  useEffect(() => {
    setMounted(true);
    let isTimerMounted = true;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const startTime = product.startAt ? new Date(product.startAt).getTime() : 0;
      const endTime = new Date(realtimeEndsAt).getTime();
      
      const started = !product.startAt || startTime <= now;
      const ended = endTime <= now;

      if (isTimerMounted) {
        setIsStarted(started);
        setIsEnded(ended);
        setIsUrgent(started && !ended && (endTime - now) < 24 * 60 * 60 * 1000);
      }

      if (!started && product.startAt) {
        return `Starts ${formatEventDate(product.startAt)}`;
      }

      if (ended) return "Auction Ended";
      
      const diff = endTime - now;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      let parts = [];
      if (days > 0) parts.push(`${days}d`);
      parts.push(`${hours.toString().padStart(2, "0")}h`);
      parts.push(`${minutes.toString().padStart(2, "0")}m`);
      parts.push(`${seconds.toString().padStart(2, "0")}s`);
      return parts.join(" ");
    };

    if (isTimerMounted) setTimeLeft(calculateTimeLeft());
    
    const timer = setInterval(() => {
        if (isTimerMounted) setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => {
        isTimerMounted = false;
        clearInterval(timer);
    };
  }, [product.startAt, realtimeEndsAt]);

  // 2. Realtime Subscription Effect
  useEffect(() => {
    if (disableRealtime) return;

    let isSubscriptionMounted = true;

    const channel = supabase
      .channel(`auction-card-${product.id}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'auctions',
        filter: `id=eq.${product.id}`
      }, (payload: any) => {
        if (isSubscriptionMounted) {
          setRealtimePrice(Number(payload.new.current_price));
          setWinnerId(payload.new.winner_id);
          if (payload.new.ends_at) {
            setRealtimeEndsAt(payload.new.ends_at);
          }
        }
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'bids',
        filter: `auction_id=eq.${product.id}`
      }, (payload: any) => {
        if (isSubscriptionMounted) {
          setRealtimeBidCount(prev => prev + 1);
          setRealtimePrice(prev => Math.max(prev, Number(payload.new.amount)));
          if (payload.new.status === 'active') {
              setWinnerId(payload.new.user_id);
          }
        }
      })
      .subscribe();

    // Only fetch watchlist status if user is present
    async function checkWatchlist() {
        if (user && isSubscriptionMounted) {
            const { data } = await supabase.from('watchlist').select('id').eq('user_id', user.id).eq('auction_id', product.id).maybeSingle();
            if (isSubscriptionMounted) setIsWatched(!!data);
        }
    }
    checkWatchlist();

    return () => {
        isSubscriptionMounted = false;
        supabase.removeChannel(channel);
    };
  }, [product.id, supabase, user, disableRealtime]);

  useEffect(() => {
    setBidAmount(realtimePrice + (product.minIncrement || 100));
  }, [realtimePrice, product.minIncrement]);

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const handleToggleWatch = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) {
        toast.error("Login required", { description: "Please sign in to track items." });
        return;
    }
    setLoadingWatch(true);
    try {
        await toggleWatchlist(product.id);
        const nextState = !isWatched;
        setIsWatched(nextState);
        toast.success(nextState ? "Added to watchlist" : "Removed from watchlist");
    } catch (err) {
        toast.error("Operation failed");
    } finally {
        setLoadingWatch(false);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    const url = `${window.location.origin}/auctions/${product.id}`;
    navigator.clipboard.writeText(url);
    setShowShareTooltip(true);
    setTimeout(() => setShowShareTooltip(false), 2000);
  };

  const handleBid = async (e: React.FormEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) { router.push('/auth/signin'); return; }

    setLoadingBid(true);
    try {
        const { registered } = await checkRegistration(product.event_id);
        if (!registered) {
            toast.error("Authorization Required", {
                description: "Complete authorization at the top of the event page.",
            });
            setLoadingBid(false);
            return;
        }

        const minRequiredBid = realtimePrice + (product.minIncrement || 1);
        const isProxy = bidAmount > minRequiredBid;

        const result = await placeBid({ auctionId: product.id, amount: bidAmount });
        if (!result.success) throw new Error(result.error);
        
        if (isProxy) {
            toast.success("Max Bid Activated!", {
                description: `System will bid for you up to $${bidAmount.toLocaleString()}.`
            });
        } else {
            toast.success("Bid placed!");
        }
    } catch (err: any) {
        if (err.name !== 'AbortError') toast.error(err.message);
    } finally {
        setLoadingBid(false);
    }
  };

  const isWinning = user && winnerId === user.id;
  const isOutbid = user && userCurrentBid && winnerId && winnerId !== user.id;

  return (
    <>
      <div className={cn(
          "group flex flex-col bg-white border rounded-[24px] transition-all duration-500 hover:shadow-[0_20px_50px_rgba(11,43,83,0.1)] overflow-hidden h-full relative italic",
          isWinning ? "border-emerald-500/30 bg-emerald-50/5 shadow-lg shadow-emerald-500/5" : 
          isOutbid ? "border-rose-500/30 bg-rose-50/5 shadow-lg shadow-rose-500/5" : 
          "border-zinc-200/80 hover:border-primary/20"
      )}>
        {/* Media Container */}
        <div 
          className="block relative w-full pt-[75%] overflow-hidden bg-zinc-100 cursor-pointer"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <Link href={`/auctions/${product.id}`} className="absolute inset-0">
            <Image
              src={getOptimizedImageUrl(allImages[currentImageIndex], { width: 600 })}
              alt={`${product.title} ${product.manufacturer ? `by ${product.manufacturer}` : ''} ${product.model ? `(${product.model})` : ''} - Virginia Liquidation`}
              fill
              className={cn(
                "object-cover transition-all duration-700 group-hover:scale-105",
                imageLoading ? "opacity-0 blur-lg" : "opacity-100 blur-0"
              )}
              onLoad={() => setImageLoading(false)}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
              priority={false}
            />
          </Link>

          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-50/50 backdrop-blur-sm">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
          )}
          
          <div className="absolute top-6 left-6 flex items-center gap-2 z-10 pointer-events-none">
            <div className="bg-white/90 backdrop-blur-md text-secondary px-3 py-1.5 rounded-full text-[10px] font-bold shadow-sm border border-white/20">
              #{product.lotNumber || product.id.slice(0,4)}
            </div>
            
            {mounted && isStarted && timeLeft !== "Auction Ended" && (
              <div className="bg-rose-500 text-white px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-rose-500/20 animate-in fade-in zoom-in duration-500">
                  <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                  Live
              </div>
            )}
            {mounted && !isStarted && (
              <div className="bg-blue-500 text-white px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-blue-500/20 animate-in fade-in zoom-in duration-500">
                  Upcoming
              </div>
            )}
            {mounted && isStarted && timeLeft === "Auction Ended" && (
              <div className="bg-zinc-500 text-white px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-zinc-500/20 animate-in fade-in zoom-in duration-500">
                  Ended
              </div>
            )}
          </div>

          {allImages.length > 1 && (
            <>
              {/* Pagination Dots */}
              <div className="absolute bottom-4 left-1/2 -translate-y-1/2 -translate-x-1/2 flex gap-1.5 z-10 pointer-events-none">
                {allImages.map((_, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "h-1 rounded-full transition-all duration-300",
                      i === currentImageIndex 
                        ? "w-4 bg-primary shadow-sm" 
                        : "w-1 bg-white/60 shadow-sm"
                    )} 
                  />
                ))}
              </div>

              {/* Navigation Arrows */}
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-3 opacity-0 group-hover:opacity-100 lg:group-hover:opacity-100 transition-all duration-300 z-20">
                  <button onClick={handlePrevImage} className="bg-white/90 backdrop-blur-md p-2 rounded-full text-secondary hover:bg-primary hover:text-white transition-all shadow-lg shadow-black/5 border border-zinc-100"><ArrowLeft size={14} /></button>
                  <button onClick={handleNextImage} className="bg-white/90 backdrop-blur-md p-2 rounded-full text-secondary hover:bg-primary hover:text-white transition-all shadow-lg shadow-black/5 border border-zinc-100"><ArrowRight size={14} /></button>
              </div>
            </>
          )}
        </div>

        {/* Content Container */}
        <div className="flex flex-1 flex-col p-6 border-t border-zinc-100">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
                <div className="bg-primary/10 p-1.5 rounded-lg">
                    <Building2 className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest truncate max-w-[120px]">{product.supplier}</span>
            </div>
            <div className="flex gap-1">
                <button 
                    onClick={handleToggleWatch} 
                    aria-label={isWatched ? "Remove from Watchlist" : "Add to Watchlist"}
                    className={cn(
                        "p-2 rounded-xl transition-all border",
                        isWatched ? "bg-primary/10 border-primary/20 text-primary" : "bg-zinc-50 border-zinc-100 text-zinc-400 hover:text-primary hover:border-primary/20"
                    )}
                >
                    <Star size={14} className={isWatched ? "fill-current" : ""} />
                </button>
                <button onClick={handleShare} className="p-2 rounded-xl bg-zinc-50 border border-zinc-100 text-zinc-400 hover:text-primary hover:border-primary/20 transition-all">
                    <Share2 size={14} />
                </button>
            </div>
          </div>
          
          <Link href={`/auctions/${product.id}`} className="group/title">
            <h2 className="mb-2 text-base font-bold leading-tight text-secondary group-hover/title:text-primary transition-colors line-clamp-2 min-h-[2.5rem] font-display uppercase italic">
              {product.title}
            </h2>
          </Link>

          <div className="relative">
            <div className={cn(
                "space-y-3 overflow-hidden transition-all duration-500",
                isExpanded ? "max-h-96 opacity-100" : "max-h-6 opacity-60"
            )}>
                <p className={cn(
                    "text-[11px] font-medium text-zinc-400 leading-relaxed uppercase italic",
                    !isExpanded && "line-clamp-1"
                )}>
                    {product.description || "High-quality industrial asset. Physically verified by our technical assessment team."}
                </p>

                {(product.manufacturer || product.model) && (
                    <div className={cn(
                        "flex flex-wrap gap-x-4 gap-y-1 transition-opacity duration-300",
                        isExpanded ? "opacity-100" : "opacity-0"
                    )}>
                    {product.manufacturer && (
                        <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-tight">Mfr:</span>
                        <span className="text-[10px] font-bold text-secondary uppercase truncate max-w-[100px]">{product.manufacturer}</span>
                        </div>
                    )}
                    {product.model && (
                        <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-tight">Model:</span>
                        <span className="text-[10px] font-bold text-secondary uppercase truncate max-w-[100px]">{product.model}</span>
                        </div>
                    )}
                    </div>
                )}
            </div>

            <button 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsExpanded(!isExpanded); }}
                className="mt-2 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-primary hover:text-secondary transition-colors group/more"
            >
                {isExpanded ? "Show Less" : "Details"}
                <ChevronDown size={12} className={cn("transition-transform duration-300", isExpanded ? "rotate-180" : "")} />
            </button>
          </div>

          <div className="mt-auto pt-5 border-t border-zinc-100 flex items-center justify-between mb-6">
            <div className="space-y-3">
              {/* Timer back in content area - LARGER & STATIC RED */}
              <div className={cn(
                  "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 font-black uppercase tracking-wider transition-all duration-500",
                  "bg-rose-50 border-rose-200 text-rose-600 shadow-sm"
              )}>
                <Timer size={14} />
                <span className="text-[11px] tabular-nums">{mounted ? timeLeft : "---"}</span>
              </div>

              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 italic leading-none">Current Price</p>
                <div className="text-2xl font-bold text-secondary tabular-nums font-display leading-none" suppressHydrationWarning>
                  ${mounted ? realtimePrice.toLocaleString() : realtimePrice.toString()}
                </div>

                {/* Status Section */}
                <div className="mt-1.5 space-y-1">
                    {/* Winning Status */}
                    {isWinning && (
                        <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-[9px] uppercase tracking-widest animate-in fade-in duration-500">
                            <Trophy size={12} />
                            You are in the lead
                        </div>
                    )}

                    {/* Proxy Active */}
                    {userMaxBid && userMaxBid > realtimePrice && (
                        <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 uppercase tracking-widest" suppressHydrationWarning>
                            <Zap size={10} className="fill-current" /> 
                            Proxy Active: ${userMaxBid.toLocaleString()}
                        </div>
                    )}

                    {/* Outbid Status - Positioned at the bottom */}
                    {isOutbid && (
                        <div className="flex items-center gap-1.5 text-rose-600 animate-pulse">
                            <AlertCircle size={12} />
                            <span className="text-[9px] font-black uppercase tracking-widest leading-none">Someone outbid you!</span>
                        </div>
                    )}
                </div>
              </div>
            </div>
            <button 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsHistoryModalOpen(true); }}
                className="flex flex-col items-end group/bids"
            >
              <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-1 rounded-lg group-hover/bids:bg-primary group-hover/bids:text-white transition-all">{realtimeBidCount} Bids</span>
              <span className="text-[8px] font-bold text-zinc-300 uppercase mt-1">History →</span>
            </button>
          </div>

          {/* Conditional Bidding / Login UI */}
          {!user ? (
            <Link href="/auth/signin" className="w-full bg-primary/10 border-2 border-primary/20 text-primary py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2 group shadow-sm">
                <LogIn size={16} className="group-hover:translate-x-1 transition-transform" />
                Login to Bid
            </Link>
          ) : isEnded ? (
            <button 
              disabled
              className="w-full bg-zinc-100 border-2 border-zinc-200 text-zinc-400 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 cursor-default"
            >
                <Lock size={16} />
                Bidding Closed
            </button>
          ) : !isStarted ? (
            <button 
              disabled
              className="w-full bg-zinc-50 border-2 border-zinc-100 text-zinc-400 py-3 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 cursor-default text-[10px]"
            >
                <Clock size={16} />
                Starting Soon
            </button>
          ) : (
            <form onSubmit={handleBid} className="flex gap-2">
                <div className="relative flex-1 group/input">
                    <label className="absolute -top-2 left-3 bg-white px-1.5 text-[8px] font-bold uppercase tracking-widest text-zinc-400 z-10 group-focus-within/input:text-primary transition-colors">
                        Bid / Max Bid
                    </label>
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-xs font-bold">$</span>
                    <input 
                      type="number" 
                      step="any"
                      min={realtimePrice + (product.minIncrement || 1)} 
                      value={bidAmount} 
                      onChange={(e) => setBidAmount(Number(e.target.value))} 
                      className="w-full bg-zinc-50 border-2 border-zinc-100/80 rounded-xl py-2.5 pl-7 pr-3 text-sm font-bold text-secondary focus:outline-none focus:border-primary/30 focus:bg-white transition-all outline-none" 
                    />
                </div>
                <button 
                  type="submit" 
                  disabled={loadingBid} 
                  className="bg-secondary text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-primary transition-all active:scale-95 shadow-lg shadow-secondary/10 flex items-center gap-2"
                >
                  {loadingBid ? <Loader2 size={14} className="animate-spin" /> : <Gavel size={14} />} 
                  Bid
                </button>
            </form>
          )}
        </div>
      </div>

      <QuickViewModal product={product} isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} initialBid={bidAmount} onlyHistory={true} />
    </>
  );
}
