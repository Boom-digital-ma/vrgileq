"use client";

import { useState, useEffect } from "react";
import { Timer, Gavel, History, Loader2, Lock, ShieldCheck, AlertCircle } from "lucide-react";
import { placeBid } from "@/app/actions/bids";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface BiddingWidgetProps {
  auctionId: string;
  initialPrice: number;
  endsAt: Date;
  bids: any[];
  minIncrement: number;
}

export default function BiddingWidget({ auctionId, initialPrice, endsAt, bids, minIncrement }: BiddingWidgetProps) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [bidAmount, setBidAmount] = useState<number>(initialPrice + minIncrement);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const router = useRouter();
  
  const supabase = createClient();

  useEffect(() => {
    async function getProfile() {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            setUserProfile(data);
        } else {
            setUserProfile(null);
        }
    }
    getProfile();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = endsAt.getTime() - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft("EXPIRED");
        return;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`);
      setIsUrgent(distance < 24 * 60 * 60 * 1000);
    }, 1000);

    return () => clearInterval(timer);
  }, [endsAt, supabase]);

  const handleBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) {
        router.push('/auth/signin');
        return;
    }

    if (!userProfile.default_payment_method_id) {
        setError("Missing payment method. Please update your profile.");
        return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await placeBid({
        auctionId,
        amount: bidAmount,
      });

      if (!result.success) throw new Error(result.error);

      alert("Bid placed successfully!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const hasCard = !!userProfile?.default_payment_method_id;
  const sortedBids = [...bids].sort((a, b) => b.amount - a.amount);

  return (
    <div className="sticky top-6 flex flex-col border-2 border-primary bg-white p-8 tracking-tight shadow-[8px_8px_0px_0px_rgba(11,43,83,1)]">
      <div className="mb-8 flex items-center justify-between border-b-2 border-primary pb-6">
        <div className="flex flex-col gap-1">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral/50">Time Remaining</div>
          <div className={`text-3xl font-black tabular-nums ${isUrgent ? "text-red-600" : "text-primary"}`}>{timeLeft || "00:00:00"}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-10">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral/50 mb-2">Current Bid</div>
          <div className="text-2xl font-black text-primary">${initialPrice.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral/50 mb-2">Next Min Bid</div>
          <div className="text-2xl font-black text-primary">${(initialPrice + minIncrement).toLocaleString()}</div>
        </div>
      </div>

      <form onSubmit={handleBid} className="flex flex-col gap-4 mb-6">
        <div className="relative mb-2">
          <div className="absolute -top-2 left-4 bg-white px-2 text-[10px] font-black uppercase tracking-widest text-neutral/50 z-10">Enter Your Bid</div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral/40 font-bold">$</span>
            <input
              type="number"
              min={initialPrice + minIncrement}
              value={bidAmount}
              onChange={(e) => setBidAmount(Number(e.target.value))}
              className="w-full border-2 border-primary py-4 pl-8 pr-4 text-xl font-black focus:outline-none focus:ring-0 text-primary"
            />
          </div>
        </div>

        {userProfile ? (
            hasCard ? (
                <div className="p-4 border-2 border-secondary bg-secondary/5 flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-secondary fill-secondary/20" />
                    <div>
                        <div className="text-[10px] font-black uppercase text-primary">Payment Authorized</div>
                        <div className="text-[8px] font-bold text-neutral/40 uppercase tracking-widest">Default card secured</div>
                    </div>
                    <Link href="/profile" className="ml-auto text-[8px] font-black uppercase underline">Settings</Link>
                </div>
            ) : (
                <Link href="/profile" className="p-4 border-2 border-red-600 bg-red-50 flex items-center gap-3 group">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <div>
                        <div className="text-[10px] font-black uppercase text-red-600">Verification Required</div>
                        <div className="text-[8px] font-bold text-red-400 uppercase tracking-widest underline group-hover:text-red-600 transition-colors">Add card to your profile</div>
                    </div>
                </Link>
            )
        ) : null}

        {error && <div className="text-red-600 text-xs font-bold uppercase p-2 bg-red-50 border border-red-200">{error}</div>}
        
        <button 
          type="submit"
          disabled={loading || (userProfile && !hasCard) || timeLeft === "EXPIRED"}
          className="flex items-center justify-center gap-2 bg-primary py-5 text-white transition-all hover:bg-secondary font-black text-xl uppercase tracking-tighter active:translate-y-1 shadow-[4px_4px_0px_0px_rgba(11,43,83,1)] disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Gavel className="h-6 w-6" />}
          {userProfile ? (hasCard ? `Place Bid $${bidAmount.toLocaleString()}` : "Verify Account First") : "Login to Bid"}
        </button>
      </form>

      <div className="text-[10px] font-bold uppercase tracking-widest text-neutral/50 text-center leading-relaxed mb-8">
        * A 20% Buyer's Premium will be added.
        <br />
        Authorization Hold: ${Math.round(bidAmount * 1.2).toLocaleString()}
      </div>

      <div>
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary mb-6">
          <History className="h-4 w-4" /> <span>Recent Bids</span>
        </div>
        <div className="flex flex-col gap-5">
          {sortedBids.slice(0, 5).map((bid, i) => (
            <div key={i} className="flex justify-between items-center text-sm border-b border-light pb-3 last:border-0">
              <span className="font-bold text-neutral/40 uppercase tracking-tighter italic">Bidder #{bid.id.slice(0,4)}</span>
              <div className="text-right">
                <div className="font-black text-primary">${bid.amount.toLocaleString()}</div>
                <div className="text-[10px] font-bold text-neutral/30 uppercase">{new Date(bid.created_at).toLocaleTimeString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
