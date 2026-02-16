"use client";

import { X, Gavel, Timer, Building2, Share2, Loader2, ShieldCheck, AlertCircle, History } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { placeBid } from "@/app/actions/bids";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface QuickViewModalProps {
  product: {
    id: string;
    title: string;
    supplier: string;
    price: number;
    endsAt: string;
    image: string;
    bidCount: number;
    manufacturer?: string;
    model?: string;
    description?: string;
    minIncrement?: number;
  };
  isOpen: boolean;
  onClose: () => void;
  initialBid?: number;
}

export default function QuickViewModal({ product, isOpen, onClose, initialBid }: QuickViewModalProps) {
  const [mounted, setMounted] = useState(false);
  const [bidAmount, setBidAmount] = useState<number>(initialBid || product.price + 100);
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
      if (initialBid) setBidAmount(initialBid);
      
      // Countdown logic
      const calculateTimeLeft = () => {
        const target = new Date(product.endsAt).getTime();
        const now = new Date().getTime();
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
        setTimeLeft(calculateTimeLeft());
      }, 1000);
      
      // Fetch User
      supabase.auth.getUser().then(({ data }) => {
          if (data.user) {
              supabase.from('profiles').select('*').eq('id', data.user.id).single()
                .then(({ data: profile }) => setUserProfile(profile));
          } else {
              setUserProfile(null);
          }
      });

      // Fetch Bids
      supabase.from('bids')
        .select('*, profiles(full_name)')
        .eq('auction_id', product.id)
        .order('amount', { ascending: false })
        .limit(5)
        .then(({ data }) => setBids(data || []));

      return () => {
        clearInterval(timer);
        document.body.style.overflow = "unset";
      };
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen, initialBid, supabase, product.id, product.endsAt]);

  const handleBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) {
        router.push('/auth/signin');
        return;
    }

    if (!userProfile.default_payment_method_id) {
        setError("Missing payment method.");
        return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await placeBid({
        auctionId: product.id,
        amount: bidAmount,
      });

      if (!result.success) throw new Error(result.error);

      alert("Bid placed successfully!");
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/auctions/${product.id}`;
    navigator.clipboard.writeText(url);
    setShowShareTooltip(true);
    setTimeout(() => setShowShareTooltip(false), 2000);
  };

  if (!isOpen) return null;

  const hasCard = !!userProfile?.default_payment_method_id;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-primary/40 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-white shadow-[16px_16px_0px_0px_rgba(11,43,83,1)] border-2 border-primary overflow-hidden max-h-[90vh] flex flex-col md:flex-row animate-in zoom-in-95 duration-200">
        {/* Top Actions */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <button onClick={handleShare} className="relative bg-white border-2 border-primary p-2 hover:bg-light/20 transition-colors text-primary">
            <Share2 className="h-5 w-5" />
            {showShareTooltip && (
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black uppercase px-2 py-1 whitespace-nowrap">Link Copied!</div>
            )}
          </button>
          <button onClick={onClose} className="bg-white border-2 border-primary p-2 hover:bg-primary hover:text-white transition-colors text-primary">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Left: Image */}
        <div className="relative w-full md:w-1/2 h-64 md:h-auto border-b-2 md:border-b-0 md:border-r-2 border-primary bg-light/10">
          <Image src={product.image} alt={product.title} fill className="object-cover" />
          <div className="absolute top-6 left-6 bg-primary px-3 py-1 text-xs font-black uppercase tracking-widest text-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
            Lot #{product.id.slice(0,4)}
          </div>
        </div>

        {/* Right: Info */}
        <div className="w-full md:w-1/2 p-8 overflow-y-auto">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-4 w-4 text-primary" />
              <span className="text-xs font-black uppercase tracking-widest text-neutral/50">{product.supplier}</span>
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter leading-none text-primary mb-4">{product.title}</h2>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8 border-y border-light py-6">
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-neutral/40 mb-1">Current Bid</div>
              <div className="text-2xl font-black text-primary">${product.price.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-neutral/40 mb-1">Total Bids</div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-secondary uppercase">{product.bidCount} Bids</span>
                <button 
                    onClick={() => setShowHistory(!showHistory)}
                    className="text-[8px] font-black uppercase text-primary underline decoration-2 underline-offset-2"
                >
                    {showHistory ? "Hide" : "Show History"}
                </button>
              </div>
            </div>
          </div>

          {showHistory ? (
            <div className="mb-8 animate-in fade-in slide-in-from-top-2 duration-300">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral/40 mb-4 flex items-center gap-2">
                    <History size={12} /> Recent Activity
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {bids.map((bid, i) => (
                        <div key={i} className="flex justify-between items-center p-3 border-2 border-light/30 bg-light/5 text-[10px]">
                            <span className="font-bold text-neutral uppercase">{bid.profiles?.full_name?.split(' ')[0]}***</span>
                            <span className="font-black text-primary tabular-nums italic">${bid.amount.toLocaleString()}</span>
                        </div>
                    ))}
                    {bids.length === 0 && (
                        <p className="text-[10px] text-neutral/30 italic">No activity yet</p>
                    )}
                </div>
            </div>
          ) : (
            <form onSubmit={handleBid} className="space-y-4">
                <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-neutral/40">$</span>
                <input
                    type="number"
                    min={product.price + 1}
                    value={bidAmount}
                    onChange={(e) => setBidAmount(Number(e.target.value))}
                    className="w-full border-2 border-primary py-4 pl-8 pr-4 text-lg font-black focus:outline-none focus:ring-0 text-primary"
                />
                </div>

                {userProfile ? (
                    hasCard ? (
                        <div className="p-4 border-2 border-secondary bg-secondary/5 flex items-center gap-3">
                            <ShieldCheck className="h-5 w-5 text-secondary fill-secondary/20" />
                            <div>
                                <div className="text-[10px] font-black uppercase text-primary">Payment Authorized</div>
                                <div className="text-[8px] font-bold text-neutral/40 uppercase tracking-widest">Card secured on file</div>
                            </div>
                        </div>
                    ) : (
                        <Link href="/profile" className="p-4 border-2 border-red-600 bg-red-50 flex items-center gap-3 group">
                            <AlertCircle className="h-5 w-5 text-red-600" />
                            <div>
                                <div className="text-[10px] font-black uppercase text-red-600">Action Required</div>
                                <div className="text-[8px] font-bold text-red-400 uppercase tracking-widest underline group-hover:text-red-600 transition-colors">Add card to bid</div>
                            </div>
                        </Link>
                    )
                ) : null}

                {error && <div className="text-red-600 text-[10px] font-bold uppercase">{error}</div>}

                <button 
                    type="submit"
                    disabled={loading || (userProfile && !hasCard)}
                    className="w-full flex items-center justify-center gap-2 bg-primary py-4 text-white transition-all hover:bg-secondary font-black text-sm uppercase tracking-widest active:translate-y-1 shadow-[4px_4px_0px_0px_rgba(11,43,83,0.2)] disabled:opacity-50"
                >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Gavel className="h-5 w-5" />}
                    {!userProfile ? "Login to Bid" : (hasCard ? `Place Bid $${bidAmount.toLocaleString()}` : "Verify Account First")}
                </button>
            </form>
          )}
          
          <div className="mt-6 text-center">
            <Link href={`/auctions/${product.id}`} className="text-[10px] font-black uppercase tracking-widest text-secondary underline decoration-2 underline-offset-4" onClick={onClose}>
                View Full Lot Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
