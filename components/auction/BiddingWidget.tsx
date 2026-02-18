"use client";

import { useState, useEffect } from "react";
import { Timer, Gavel, History, Loader2, Lock, ShieldCheck, AlertCircle, TrendingUp } from "lucide-react";
import { placeBid } from "@/app/actions/bids";
import { checkRegistration } from "@/app/actions/registrations";
import RegistrationButton from "./RegistrationButton";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface BiddingWidgetProps {
  auctionId: string;
  eventId: string;
  initialPrice: number;
  endsAt: Date;
  bids: any[];
  minIncrement: number;
}

export default function BiddingWidget({ auctionId, eventId, initialPrice, endsAt, bids, minIncrement }: BiddingWidgetProps) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [bidAmount, setBidAmount] = useState<number>(initialPrice + minIncrement);
  const [isProxy, setIsProxy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const router = useRouter();
  
  const supabase = createClient();

  useEffect(() => {
    let isMounted = true;
    
    async function getInitialData() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user && isMounted) {
                const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                if (isMounted) setUserProfile(profile);
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
      const distance = endsAt.getTime() - now;

      if (distance < 0) {
        clearInterval(timer);
        if (isMounted) setTimeLeft("AUCTION ENDED");
        return;
      }

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
    }, 1000);

    return () => {
        isMounted = false;
        clearInterval(timer);
    };
  }, [endsAt, supabase, eventId]);

  const handleBid = async (e: React.FormEvent) => {
    e.preventDefault();
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
        amount: isProxy ? initialPrice + minIncrement : bidAmount,
        maxBidAmount: isProxy ? bidAmount : undefined,
      });

      if (!result.success) throw new Error(result.error);

      toast.success(isProxy ? "Maximum bid set successfully!" : "Bid placed successfully!");
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        toast.error(err.message);
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const hasCard = !!userProfile?.default_payment_method_id;
  const sortedBids = [...bids].sort((a, b) => b.amount - a.amount);
  
  const premiumPercent = settings?.buyers_premium || 20;
  const premiumAmount = (isProxy ? initialPrice + minIncrement : bidAmount) * (premiumPercent / 100);
  const totalWithPremium = (isProxy ? initialPrice + minIncrement : bidAmount) + premiumAmount;

  return (
    <div className="sticky top-24 flex flex-col bg-white border border-zinc-200/80 rounded-[32px] p-8 shadow-[0_20px_50px_rgba(11,43,83,0.05)]">
      {/* Urgency-Driven Timer Section */}
      <div className={cn(
        "mb-10 p-6 rounded-[24px] border transition-all duration-500 flex items-center justify-between group",
        isUrgent 
            ? "bg-rose-50 border-rose-200 shadow-[0_10px_30px_rgba(244,63,94,0.1)]" 
            : "bg-zinc-50 border-zinc-100"
      )}>
        <div className="flex flex-col gap-1">
          <div className={cn(
            "text-[9px] font-bold uppercase tracking-[0.3em]",
            isUrgent ? "text-rose-500" : "text-zinc-400"
          )}>
            {isUrgent ? "Auction Closing Soon" : "Time Remaining"}
          </div>
          <div className={cn(
            "text-4xl font-bold tabular-nums font-display tracking-tight italic",
            isUrgent ? "text-rose-600 animate-in fade-in duration-300" : "text-secondary"
          )}>{timeLeft || "00:00:00"}</div>
        </div>
        
        <div className={cn(
            "p-3 rounded-2xl transition-all duration-500",
            isUrgent ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20 scale-110" : "bg-white text-zinc-300 border border-zinc-100"
        )}>
            <Timer className={cn("h-6 w-6", isUrgent && "animate-pulse")} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-10">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2">Current Bid</div>
          <div className="text-3xl font-bold text-primary font-display italic tracking-tight">${initialPrice.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2">Next Min Bid</div>
          <div className="text-3xl font-bold text-secondary/40 font-display italic tracking-tight">${(initialPrice + minIncrement).toLocaleString()}</div>
        </div>
      </div>

      <form onSubmit={handleBid} className="flex flex-col gap-5 mb-8">
        {settings?.proxy_bidding_enabled && (
            <div className="flex items-center justify-between bg-zinc-50/80 border border-zinc-100 rounded-2xl p-4 transition-all hover:bg-zinc-50">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "p-2 rounded-lg transition-colors",
                        isProxy ? "bg-primary/10 text-primary" : "bg-zinc-200 text-zinc-400"
                    )}>
                        <TrendingUp size={16} />
                    </div>
                    <div>
                        <span className="text-xs font-bold text-zinc-900 block leading-none mb-1">Proxy Bidding</span>
                        <span className="text-[9px] font-medium text-zinc-400 uppercase tracking-tight">Auto-surenchère active</span>
                    </div>
                </div>
                <button 
                    type="button"
                    onClick={() => setIsProxy(!isProxy)}
                    className={cn(
                        "relative inline-flex h-6 w-11 items-center rounded-full transition-all focus:outline-none",
                        isProxy ? "bg-primary" : "bg-zinc-200"
                    )}
                >
                    <span className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm",
                        isProxy ? "translate-x-6" : "translate-x-1"
                    )} />
                </button>
            </div>
        )}

        <div className="relative group/input">
          <label className="absolute -top-2 left-4 bg-white px-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 z-10 group-focus-within/input:text-primary transition-colors">
            {isProxy ? "Your Maximum Limit" : "Place Your Bid"}
          </label>
          <div className="relative">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-300 text-xl font-bold font-display">$</span>
            <input
              type="number"
              min={initialPrice + minIncrement}
              value={bidAmount}
              onChange={(e) => setBidAmount(Number(e.target.value))}
              className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl py-5 pl-10 pr-6 text-2xl font-bold text-secondary focus:outline-none focus:border-primary/20 focus:bg-white transition-all font-display italic outline-none"
            />
          </div>
          {isProxy && (
            <p className="text-[9px] font-medium text-zinc-400 mt-3 px-2 leading-relaxed italic">
                The system will automatically bid the minimum necessary amount up to this limit to keep you in the lead.
            </p>
          )}
        </div>

        {userProfile && (
            hasCard ? (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3">
                    <div className="bg-white p-1.5 rounded-full shadow-sm">
                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">Identity Verified</div>
                        <div className="text-[9px] font-medium text-emerald-600/70 uppercase">Payment method secured</div>
                    </div>
                </div>
            ) : (
                <Link href="/profile" className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 group transition-all hover:bg-rose-100/50">
                    <div className="bg-white p-1.5 rounded-full shadow-sm">
                        <AlertCircle className="h-4 w-4 text-rose-500" />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-rose-700 uppercase tracking-wide group-hover:underline">Action Required</div>
                        <div className="text-[9px] font-medium text-rose-600/70 uppercase">Add card to your profile</div>
                    </div>
                </Link>
            )
        )}

        <button 
          type="submit"
          disabled={loading || timeLeft === "AUCTION ENDED"}
          className="w-full bg-secondary text-white py-5 rounded-[20px] font-bold text-base hover:bg-primary transition-all active:scale-[0.98] shadow-xl shadow-secondary/10 flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale font-display italic uppercase tracking-tight"
        >
          {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Gavel className="h-6 w-6" />}
          {userProfile ? (isProxy ? `Set Maximum $${bidAmount.toLocaleString()}` : `Place Bid $${bidAmount.toLocaleString()}`) : "Sign In to Bid"}
        </button>
      </form>

      <div className="bg-zinc-50 rounded-2xl p-5 text-center mb-10 border border-zinc-100">
        <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest leading-relaxed">
            * A {premiumPercent}% Buyer's Premium is applied.
            <br />
            <span className="text-secondary font-bold">Est. Auth Total: ${Math.round(totalWithPremium * 1.2).toLocaleString()}</span>
        </p>
      </div>

      <div>
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-6 px-2">
          <History className="h-3.5 w-3.5" /> <span>Real-time Activity</span>
        </div>
        <div className="space-y-3">
          {sortedBids.slice(0, 5).map((bid, i) => (
            <div key={i} className="flex justify-between items-center p-4 rounded-2xl border border-zinc-50 bg-zinc-50/30 hover:bg-white hover:border-zinc-100 transition-all group">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">Bidder #{bid.id.slice(0,4)}</span>
                <span className="text-[8px] font-medium text-zinc-300 uppercase">{new Date(bid.created_at).toLocaleTimeString()}</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-secondary font-display italic tracking-tight group-hover:text-primary transition-colors">${bid.amount.toLocaleString()}</div>
              </div>
            </div>
          ))}
          {sortedBids.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed border-zinc-100 rounded-2xl">
                <p className="text-[10px] font-bold text-zinc-300 uppercase italic">Waiting for first bid...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
