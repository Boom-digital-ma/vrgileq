"use client";

import { useState, useEffect } from "react";
import { Timer, Gavel, History, Loader2, Lock, ShieldCheck, AlertCircle, TrendingUp, Star, Clock, Trophy, Zap, ChevronRight, Edit3, Eye, User, Shield } from "lucide-react";
import { placeBid } from "@/app/actions/bids";
import { toggleWatchlist } from "@/app/actions/watchlist";
import { checkRegistration } from "@/app/actions/registrations";
import RegistrationButton from "./RegistrationButton";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn, formatEventDate } from "@/lib/utils";

interface BiddingWidgetProps {
  auctionId: string;
  eventId: string;
  initialPrice: number;
  endsAt: Date;
  startAt?: Date;
  bids: any[];
  minIncrement: number;
}

export default function BiddingWidget({ auctionId, eventId, initialPrice, endsAt, startAt, bids, minIncrement }: BiddingWidgetProps) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [realtimePrice, setRealtimePrice] = useState(initialPrice);
  const [realtimeBids, setRealtimeBids] = useState(bids);
  const [realtimeEndsAt, setRealtimeEndsAt] = useState(endsAt);
  const [bidAmount, setBidAmount] = useState<number>(initialPrice + minIncrement);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isWatched, setIsWatched] = useState(false);
  const [loadingWatch, setLoadingWatch] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [isStarted, setIsStarted] = useState(!startAt || startAt <= new Date());
  const [isEnded, setIsEnded] = useState(realtimeEndsAt <= new Date());
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
    let isMounted = true;
    
    async function getInitialData() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user && isMounted) {
                const [profileRes, watchRes] = await Promise.all([
                    supabase.from('profiles').select('*').eq('id', user.id).single(),
                    supabase.from('watchlist').select('id').eq('user_id', user.id).eq('auction_id', auctionId).maybeSingle()
                ]);
                if (isMounted) {
                    setUserProfile(profileRes.data);
                    setIsWatched(!!watchRes.data);
                }
            }

            const { data: siteSettings } = await supabase.from('site_settings').select('*').eq('id', 'global').maybeSingle();
            if (isMounted) setSettings(siteSettings);
        } catch (e) {
            console.warn("Initial data fetch aborted");
        }
    }
    getInitialData();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const startTime = startAt ? new Date(startAt).getTime() : 0;
      const endTime = realtimeEndsAt.getTime();
      
      const started = !startAt || startTime <= now;
      const ended = endTime <= now;

      if (isMounted) {
        setIsStarted(started);
        setIsEnded(ended);
      }

      if (started && !ended) {
        const distance = endTime - now;
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        let timerText = "";
        if (days > 0) timerText += `${days}d `;
        timerText += `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

        if (isMounted) {
            setTimeLeft(timerText);
            setIsUrgent(distance < 24 * 60 * 60 * 1000);
        }
      } else if (ended) {
          if (isMounted) setTimeLeft("00:00:00");
      }
    }, 1000);

    const channel = supabase
      .channel(`auction-${auctionId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'auctions', filter: `id=eq.${auctionId}` },
        (payload: any) => {
          if (isMounted) {
            setRealtimePrice(Number(payload.new.current_price));
            setRealtimeEndsAt(new Date(payload.new.ends_at));
            setBidAmount(Number(payload.new.current_price) + Number(payload.new.min_increment));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'bids', filter: `auction_id=eq.${auctionId}` },
        async () => {
          const { data: newBids } = await supabase
            .from('bids')
            .select('*, profiles(full_name)')
            .eq('auction_id', auctionId)
            .order('amount', { ascending: false });
          
          if (isMounted && newBids) {
            setRealtimeBids(newBids);
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      clearInterval(timer);
      supabase.removeChannel(channel);
    };
  }, [auctionId, startAt, realtimeEndsAt, supabase]);

  const handleToggleWatch = async () => {
    if (!userProfile) return;
    setLoadingWatch(true);
    try {
        const result = await toggleWatchlist(auctionId);
        if (result.success) {
            setIsWatched(result.action === 'added');
            toast.success(result.action === 'added' ? "Added to watchlist" : "Removed from watchlist");
        }
    } catch (e) {
        toast.error("Operation failed");
    } finally {
        setLoadingWatch(false);
    }
  };

  const isAdmin = userProfile?.role === 'admin';

  const handleBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAdmin) {
      toast.error("Admin accounts cannot place bids.");
      return;
    }
    if (!userProfile) {
        router.push('/auth/signin');
        return;
    }

    setLoading(true);
    setError(null);

    try {
      const { registered } = await checkRegistration(eventId);
      if (!registered) {
          toast.error("Authorization Required", {
              description: "Please complete the Bidding Authorization at the top of the page.",
              duration: 5000,
          });
          setLoading(false);
          return;
      }

      const result = await placeBid({
        auctionId,
        amount: bidAmount,
      });

      if (!result.success) throw new Error(result.error);

      if (bidAmount > (realtimePrice + minIncrement)) {
          toast.success("Max Bid Activated!", {
              description: `System will bid for you up to $${mounted ? bidAmount.toLocaleString() : bidAmount.toString()}.`
          });
      } else {
          toast.success("Bid placed successfully!");
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        toast.error(err.message);
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const sortedBids = [...realtimeBids].sort((a, b) => b.amount - a.amount);
  const isWinning = sortedBids.length > 0 && userProfile && sortedBids[0].user_id === userProfile.id;
  const isOutbid = !isWinning && userProfile && realtimeBids.some(b => b.user_id === userProfile.id);
  const userWinningBid = userProfile ? sortedBids.find(b => b.user_id === userProfile.id && b.status === 'active') : null;
  const userProxyAmount = userWinningBid?.max_amount;
  const isProxyActive = isWinning && userProxyAmount && userProxyAmount > realtimePrice;

  const premiumPercent = settings?.buyers_premium || 15;
  const taxRate = settings?.tax_rate || 0;
  const currentHammer = bidAmount > (realtimePrice + minIncrement) ? (realtimePrice + minIncrement) : bidAmount;
  const premiumAmount = currentHammer * (premiumPercent / 100);
  const taxAmount = (currentHammer + premiumAmount) * (taxRate / 100);
  const totalAuth = currentHammer + premiumAmount + taxAmount;

  return (
    <div className="sticky top-24 flex flex-col bg-white border border-zinc-200/80 rounded-[32px] p-8 shadow-[0_20px_50px_rgba(11,43,83,0.05)]">
      
      {isAdmin && (
          <div className="mb-8 p-6 bg-secondary rounded-[24px] text-white flex flex-col gap-4 shadow-xl shadow-secondary/20">
              <div className="flex items-center gap-4">
                  <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md">
                      <Shield className="h-6 w-6 text-teal-400" />
                  </div>
                  <div>
                      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-400">Admin Control</div>
                      <div className="text-sm font-bold uppercase italic tracking-tighter">Manage this lot directly</div>
                  </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                  <Link href={`/admin/auctions/edit/${auctionId}`} className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all">
                      <Edit3 size={14} /> Edit Lot
                  </Link>
                  <Link href={`/admin/auctions/${auctionId}`} className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all">
                      <Eye size={14} /> Analytics
                  </Link>
              </div>
          </div>
      )}

      {userProfile && !userProfile.default_payment_method_id && !isAdmin && (
          <Link href="/profile" className="mb-8 p-6 bg-rose-500 rounded-[24px] text-white flex items-center justify-between group transition-all hover:bg-rose-600 shadow-xl animate-pulse">
              <div className="flex items-center gap-4">
                  <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md"><AlertCircle className="h-6 w-6" /></div>
                  <div>
                      <div className="text-xs font-black uppercase tracking-[0.2em] leading-none mb-1">Action Required</div>
                      <div className="text-sm font-bold uppercase italic tracking-tighter">Add card to bid</div>
                  </div>
              </div>
              <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
      )}

      {isWinning && isStarted && !isEnded && (
          <div className="mb-8 bg-emerald-500 rounded-[24px] p-6 text-white shadow-xl shadow-emerald-500/20">
              <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                      <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md"><Trophy className="h-6 w-6" /></div>
                      <div>
                          <div className="text-[10px] font-black uppercase tracking-[0.2em] leading-none mb-1">High Bidder</div>
                          <div className="text-lg font-bold uppercase italic tracking-tighter">You are in the lead</div>
                      </div>
                  </div>
                  {isProxyActive && (
                      <div className="bg-white/20 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-white/30 backdrop-blur-md">Proxy Active</div>
                  )}
              </div>
          </div>
      )}

      {isOutbid && isStarted && !isEnded && (
          <div className="mb-8 bg-rose-500 rounded-[24px] p-6 text-white shadow-xl shadow-rose-500/20 animate-pulse">
              <div className="flex items-center gap-4">
                  <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md"><Zap className="h-6 w-6" /></div>
                  <div>
                      <div className="text-[10px] font-black uppercase tracking-[0.2em] leading-none mb-1">Outbid</div>
                      <div className="text-lg font-bold uppercase italic tracking-tighter">Bid again to win</div>
                  </div>
              </div>
          </div>
      )}
      <div className="flex items-center justify-between mb-10">
        <div>
          <div className={cn("text-[9px] font-bold uppercase tracking-[0.3em]", isUrgent ? "text-rose-500" : "text-zinc-400")}>
            {isUrgent ? "Auction Closing Soon" : (!isStarted ? "Starts In" : "Time Remaining")}
          </div>
          <div className={cn("text-4xl font-bold tabular-nums font-display tracking-tight italic", isUrgent ? "text-rose-600 animate-in fade-in" : "text-secondary")}>
            {mounted ? timeLeft : <span className="opacity-0">--:--:--</span>}
          </div>
        </div>
        <div className={cn("p-3 rounded-2xl transition-all duration-500", isUrgent ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20 scale-110" : "bg-white text-zinc-300 border border-zinc-100")}>
            <Timer className={cn("h-6 w-6", isUrgent && "animate-pulse")} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-10">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2 italic">Current Bid</div>
          <div className="text-3xl font-bold text-primary font-display italic tracking-tight" suppressHydrationWarning>
            ${mounted ? realtimePrice.toLocaleString() : realtimePrice.toString()}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2 italic">Next Min Bid</div>
          <div className="text-3xl font-bold text-secondary/40 font-display italic tracking-tight" suppressHydrationWarning>
            ${mounted ? (realtimePrice + minIncrement).toLocaleString() : (realtimePrice + minIncrement).toString()}
          </div>
        </div>
      </div>

      <form onSubmit={handleBid} className="flex flex-col gap-5 mb-8">
        <div className="relative group/input">
          <label className="absolute -top-2 left-4 bg-white px-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 z-10 group-focus-within/input:text-primary transition-colors">
            {isAdmin ? "Bid Simulation (Disabled)" : "Place Your Bid / Max Bid"}
          </label>
          <div className="relative">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-300 text-xl font-bold font-display">$</span>
            <input
              type="number" step="any" disabled={isAdmin} min={realtimePrice + minIncrement}
              value={bidAmount} onChange={(e) => setBidAmount(Number(e.target.value))}
              className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl py-5 pl-10 pr-6 text-2xl font-bold text-secondary focus:outline-none focus:border-primary/20 focus:bg-white transition-all font-display italic outline-none disabled:opacity-50"
            />
          </div>
        </div>

        {userProfile && (
            <button type="button" onClick={handleToggleWatch} disabled={loadingWatch} className={cn(
                "flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all",
                isWatched ? "bg-primary/10 border-primary/20 text-primary" : "bg-zinc-50 border-zinc-100 text-zinc-400 hover:text-primary hover:border-primary/20"
            )}>
                {loadingWatch ? <Loader2 size={14} className="animate-spin" /> : <Star size={14} className={isWatched ? "fill-current" : ""} />}
                {isWatched ? "In Watchlist" : "Add to Watchlist"}
            </button>
        )}

        <button type="submit" disabled={loading || isEnded || !isStarted || isAdmin} className={cn(
            "w-full py-5 rounded-[20px] font-bold text-base transition-all active:scale-[0.98] shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale font-display italic uppercase tracking-tight",
            isAdmin ? "bg-zinc-100 text-zinc-400 cursor-not-allowed shadow-none" : "bg-secondary text-white hover:bg-primary shadow-secondary/10"
          )}>
          {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (isAdmin ? <Shield className="h-6 w-6" /> : (isEnded ? <Lock className="h-6 w-6" /> : (isStarted ? <Gavel className="h-6 w-6" /> : <Clock className="h-6 w-6" />)))}
          {isAdmin ? "ADMIN MODE: CANNOT BID" : (isEnded ? "Bidding Closed" : (!isStarted ? "Bidding Not Started" : (userProfile ? `Place Bid $${mounted ? bidAmount.toLocaleString() : bidAmount.toString()}` : "Sign In to Bid")))}
        </button>
      </form>

      <div className="bg-zinc-50 rounded-2xl p-5 text-center mb-10 border border-zinc-100">
        <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest leading-relaxed">
            * A {premiumPercent}% Buyer's Premium {taxRate > 0 ? `& ${taxRate}% Tax` : ''} is applied.<br />
            <span className="text-secondary font-bold" suppressHydrationWarning>Est. Auth Total: ${mounted ? Math.round(totalAuth).toLocaleString() : Math.round(totalAuth).toString()}</span>
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-6 px-2">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                <History className="h-3.5 w-3.5" /> <span>Real-time Activity</span>
            </div>
            {isAdmin && <div className="bg-teal-100 text-teal-700 px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest italic">Detailed View</div>}
        </div>
        <div className="space-y-3">
          {sortedBids.slice(0, isAdmin ? 20 : 5).map((bid, i) => {
            const isTopBid = i === 0;
            const bidderName = isAdmin ? (bid.profiles?.full_name || 'Anonymous') : `Bidder #${bid.user_id?.slice(0,4)}`;
            return (
              <div key={i} className={cn("flex justify-between items-center p-4 rounded-2xl border transition-all", isTopBid ? "bg-emerald-50/50 border-emerald-200 shadow-sm" : "bg-zinc-50/30 border-zinc-50 hover:bg-white hover:border-zinc-100")}>
                <div className="flex flex-col">
                  <span className={cn("text-[10px] font-bold uppercase tracking-tight flex items-center gap-1.5", isAdmin ? "text-primary" : "text-secondary")}>{isAdmin && <User size={10} />}{bidderName}</span>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-[9px] font-black uppercase tracking-widest", isTopBid ? "text-emerald-600" : "text-zinc-400")}>{isTopBid ? "Winning!" : "Outbid."}</span>
                    <span className="text-[8px] font-medium text-zinc-300 uppercase tracking-widest italic">• {mounted ? new Date(bid.created_at).toLocaleTimeString() : "--:--:--"}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold font-display italic tracking-tight transition-colors" suppressHydrationWarning>${mounted ? bid.amount.toLocaleString() : bid.amount.toString()}</div>
                  {isAdmin && bid.max_amount && <div className="text-[8px] font-black text-rose-500 uppercase tracking-widest mt-1" suppressHydrationWarning>Proxy: ${mounted ? bid.max_amount.toLocaleString() : bid.max_amount.toString()}</div>}
                </div>
              </div>
            );
          })}
          {sortedBids.length === 0 && <div className="text-center py-8 border-2 border-dashed border-zinc-100 rounded-2xl"><p className="text-[10px] font-bold text-zinc-300 uppercase italic">Waiting for first bid...</p></div>}
        </div>
      </div>
    </div>
  );
}
