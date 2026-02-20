"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Timer, Building2, Gavel, Eye, Share2, Star, ArrowLeft, ArrowRight, MapPin, Clock, Loader2, Lock, LogIn } from "lucide-react";
import QuickViewModal from "./QuickViewModal";
import { toggleWatchlist } from "@/app/actions/watchlist";
import { placeBid } from "@/app/actions/bids";
import { checkRegistration } from "@/app/actions/registrations";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn, getOptimizedImageUrl } from "@/lib/utils";

interface Product {
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
}

export default function AuctionCard({ product, user }: { product: Product, user: any }) {
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
  const router = useRouter();
  
  const allImages = product.images && product.images.length > 0 ? product.images : [product.image];
  const supabase = createClient();

  const isStarted = !product.startAt || new Date(product.startAt) <= new Date();
  const isEnded = new Date(realtimeEndsAt) <= new Date();

  useEffect(() => {
    let isMounted = true;
    setMounted(true);
    setBidAmount(realtimePrice + (product.minIncrement || 100));

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      
      // Handle upcoming state
      if (!isStarted && product.startAt) {
        return `Starts ${new Date(product.startAt).toLocaleDateString()}`;
      }

      const target = new Date(realtimeEndsAt).getTime();
      const diff = target - now;
      if (diff <= 0) return "Auction Ended";
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

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
        if (isMounted) setTimeLeft(calculateTimeLeft());
    }, 1000);

    // REALTIME SUBSCRIPTION
    const channel = supabase
      .channel(`auction-card-${product.id}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'auctions',
        filter: `id=eq.${product.id}`
      }, (payload) => {
        if (isMounted) {
          setRealtimePrice(Number(payload.new.current_price));
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
      }, () => {
        if (isMounted) {
          setRealtimeBidCount(prev => prev + 1);
        }
      })
      .subscribe();

    // Only fetch watchlist status if user is present
    async function checkWatchlist() {
        if (user && isMounted) {
            const { data } = await supabase.from('watchlist').select('id').eq('user_id', user.id).eq('auction_id', product.id).maybeSingle();
            if (isMounted) setIsWatched(!!data);
        }
    }
    checkWatchlist();

    return () => {
        isMounted = false;
        clearInterval(timer);
        supabase.removeChannel(channel);
    };
  }, [product.id, realtimeEndsAt, product.minIncrement, supabase, user]);

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
        const result = await placeBid({ auctionId: product.id, amount: bidAmount });
        if (!result.success) throw new Error(result.error);
        toast.success("Bid placed!");
    } catch (err: any) {
        if (err.name !== 'AbortError') toast.error(err.message);
    } finally {
        setLoadingBid(false);
    }
  };

  return (
    <>
      <div className="group flex flex-col bg-white border border-zinc-200/80 rounded-[24px] transition-all duration-500 hover:shadow-[0_20px_50px_rgba(11,43,83,0.1)] hover:border-primary/20 overflow-hidden h-full relative italic">
        {/* Media Container - FIXED: Force full fill */}
        <Link href={`/auctions/${product.id}`} className="block relative w-full pt-[75%] overflow-hidden bg-zinc-100">
          <div className="absolute inset-0">
            <Image
              src={getOptimizedImageUrl(allImages[currentImageIndex], { width: 600 })}
              alt={product.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
              priority={false}
            />
          </div>
          
          <div className="absolute top-6 left-6 flex gap-2 items-center z-10">
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

          <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-md border border-white/40 px-3 py-1.5 rounded-full flex items-center gap-2 text-[10px] font-bold text-primary shadow-sm">
            {isStarted ? <Timer className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />} {mounted ? timeLeft : "..."}
          </div>

          {allImages.length > 1 && (
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-3 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
                <button onClick={handlePrevImage} className="bg-white/90 backdrop-blur-md p-2 rounded-full text-secondary hover:bg-primary hover:text-white transition-all shadow-lg shadow-black/5 border border-zinc-100"><ArrowLeft size={14} /></button>
                <button onClick={handleNextImage} className="bg-white/90 backdrop-blur-md p-2 rounded-full text-secondary hover:bg-primary hover:text-white transition-all shadow-lg shadow-black/5 border border-zinc-100"><ArrowRight size={14} /></button>
            </div>
          )}
        </Link>

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
            <h2 className="mb-2 text-lg font-bold leading-tight text-secondary group-hover/title:text-primary transition-colors line-clamp-2 min-h-[3.5rem] font-display uppercase italic">
              {product.title}
            </h2>
          </Link>

          <p className="text-[11px] font-medium text-zinc-400 leading-relaxed uppercase mb-4 line-clamp-2">
            {product.description || "High-quality industrial asset. Physically verified by our technical assessment team."}
          </p>

          <div className="mt-auto pt-5 border-t border-zinc-50 flex items-center justify-between mb-6">
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 italic">Current Price</p>
              <div className="text-2xl font-bold text-secondary tabular-nums font-display leading-none">
                ${mounted ? realtimePrice.toLocaleString() : realtimePrice.toString()}
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
          ) : !isStarted ? (
            <button 
              disabled
              className="w-full bg-zinc-50 border-2 border-zinc-100 text-zinc-400 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 cursor-default"
            >
                <Clock size={16} />
                Starting Soon
            </button>
          ) : (
            <form onSubmit={handleBid} className="flex gap-2">
                <div className="relative flex-1 group/input">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-xs font-bold">$</span>
                    <input 
                      type="number" 
                      min={realtimePrice + (product.minIncrement || 1)} 
                      value={bidAmount} 
                      onChange={(e) => setBidAmount(Number(e.target.value))} 
                      className="w-full bg-zinc-50 border-2 border-zinc-100/80 rounded-xl py-2.5 pl-7 pr-3 text-sm font-bold text-secondary focus:outline-none focus:border-primary/30 focus:bg-white transition-all outline-none" 
                    />
                </div>
                <button 
                  type="submit" 
                  disabled={loadingBid || isEnded} 
                  className="bg-secondary text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-primary transition-all active:scale-95 shadow-lg shadow-secondary/10 flex items-center gap-2 disabled:opacity-50"
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
