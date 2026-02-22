"use client";

import { X, Gavel, Timer, Building2, Share2, Loader2, ShieldCheck, AlertCircle, History, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { placeBid } from "@/app/actions/bids";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
  onlyHistory?: boolean;
}

export default function QuickViewModal({ product, isOpen, onClose, initialBid, onlyHistory }: QuickViewModalProps) {
  const [mounted, setMounted] = useState(false);
  const [bidAmount, setBidAmount] = useState<number>(initialBid || product.price + 100);
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const [showHistory, setShowHistory] = useState(onlyHistory || false);
  const [timeLeft, setTimeLeft] = useState("");
  const [realtimeBids, setRealtimeBids] = useState<any[]>([]);
  const [realtimePrice, setRealtimePrice] = useState(product.price);
  const [realtimeBidCount, setRealtimeBidCount] = useState(product.bidCount);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
    let isMounted = true;

    if (isOpen) {
      document.body.style.overflow = "hidden";
      if (initialBid) setBidAmount(initialBid);
      if (onlyHistory) setShowHistory(true);
      
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
        if (isMounted) setTimeLeft(calculateTimeLeft());
      }, 1000);
      
      supabase.auth.getUser().then(({ data }: any) => {
          if (data.user && isMounted) {
              supabase.from('profiles').select('*').eq('id', data.user.id).single()
                .then(({ data: profile }: any) => {
                  if (isMounted) setUserProfile(profile);
                });
          }
      });

      supabase.from('bids')
        .select('*, profiles(full_name)')
        .eq('auction_id', product.id)
        .order('amount', { ascending: false })
        .limit(10)
        .then(({ data }: any) => {
          if (isMounted) setRealtimeBids(data || []);
        });

      // REALTIME SUBSCRIPTION
      const channel = supabase
        .channel(`quickview-${product.id}`)
        .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'auctions',
          filter: `id=eq.${product.id}`
        }, (payload: any) => {
          if (isMounted) {
            setRealtimePrice(Number(payload.new.current_price));
          }
        })
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'bids',
          filter: `auction_id=eq.${product.id}`
        }, (payload: any) => {
          console.log(`[QuickView] INSERT Bid:`, payload.new);
          if (isMounted) {
            setRealtimeBids(prev => [payload.new, ...prev].sort((a, b) => b.amount - a.amount).slice(0, 10));
            setRealtimeBidCount(prev => prev + 1);
            setRealtimePrice(prev => Math.max(prev, Number(payload.new.amount)));
          }
        })
        .subscribe((status: any) => {
            console.log(`[QuickView] Status:`, status);
        });

      return () => {
        isMounted = false;
        clearInterval(timer);
        document.body.style.overflow = "unset";
        supabase.removeChannel(channel);
      };
    }
  }, [isOpen, initialBid, supabase, product.id, product.endsAt, onlyHistory]);

  useEffect(() => {
    setRealtimePrice(product.price);
    setRealtimeBidCount(product.bidCount);
  }, [product.price, product.bidCount]);

  useEffect(() => {
    setBidAmount(realtimePrice + (product.minIncrement || 100));
  }, [realtimePrice, product.minIncrement]);

  const handleBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) { router.push('/auth/signin'); return; }
    if (!userProfile.default_payment_method_id) { setError("Missing payment method."); return; }
    setLoading(true);
    setError(null);
    try {
      const result = await placeBid({ auctionId: product.id, amount: bidAmount });
      if (!result.success) throw new Error(result.error);
      toast.success("Bid placed successfully!");
      onClose();
    } catch (err: any) {
      toast.error(err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const hasCard = !!userProfile?.default_payment_method_id;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-secondary/40 backdrop-blur-md animate-in fade-in duration-500" onClick={onClose} />
      
      <div className={cn(
        "relative bg-white rounded-[40px] shadow-2xl shadow-secondary/20 overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-300 border border-zinc-100",
        onlyHistory ? "w-full max-w-md" : "w-full max-w-4xl md:flex-row"
      )}>
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-6 right-6 z-20 p-2.5 bg-white/80 backdrop-blur-md border border-zinc-100 rounded-full text-zinc-400 hover:text-secondary transition-all shadow-sm">
          <X size={18} strokeWidth={2.5} />
        </button>

        {/* Top Miniature Info (Always shown in History Only mode) */}
        <div className={cn(
          "relative bg-zinc-50 border-zinc-100 flex items-center p-8 gap-6",
          onlyHistory ? "border-b" : "w-full md:w-1/2 h-64 md:h-auto border-b-2 md:border-b-0 md:border-r-2"
        )}>
          {onlyHistory ? (
            <>
              <div className="relative h-20 w-20 shrink-0 rounded-2xl overflow-hidden border-2 border-white shadow-xl shadow-black/5">
                <Image src={product.image} alt={product.title} fill className="object-cover" sizes="80px" />
              </div>
              <div className="min-w-0 pr-10 italic">
                <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Lot #{product.id.slice(0,4)}</span>
                    <div className="h-1 w-1 bg-zinc-200 rounded-full" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{product.supplier}</span>
                </div>
                <h2 className="text-base font-bold uppercase tracking-tight text-secondary line-clamp-2 leading-tight font-display">{product.title}</h2>
              </div>
            </>
          ) : (
            <>
              <Image src={product.image} alt={product.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 400px" />
              <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md text-secondary px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border border-white/20 shadow-sm italic">
                Lot #{product.id.slice(0,4)}
              </div>
            </>
          )}
        </div>

        {/* Main Content Area */}
        <div className={cn("p-8 overflow-y-auto flex-1", onlyHistory ? "bg-white" : "w-full md:w-1/2")}>
          <div className="grid grid-cols-2 gap-8 mb-10 pb-8 border-b border-zinc-50 italic">
            <div>
              <p className="text-[9px] font-bold text-zinc-300 uppercase tracking-[0.2em] mb-1">Current Valuation</p>
              <div className="text-3xl font-bold text-secondary font-display">${realtimePrice.toLocaleString()}</div>
            </div>
            <div>
              <p className="text-[9px] font-bold text-zinc-300 uppercase tracking-[0.2em] mb-1">Total Activity</p>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-primary font-display">{realtimeBidCount}</span>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-2">Offers</span>
              </div>
            </div>
          </div>

          <div className="animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-2 text-zinc-400">
                    <History size={14} className="text-primary" />
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em]">Transmission Log</h3>
                </div>
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-2 mb-10">
                {realtimeBids.map((bid, i) => (
                    <div key={i} className="flex justify-between items-center p-4 rounded-2xl bg-zinc-50/50 border border-zinc-100 hover:border-primary/20 transition-all group italic">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-secondary uppercase tracking-tight">Bidder #{bid.user_id?.slice(0,4) || 'UNK'}</span>
                            <span className="text-[8px] font-medium text-zinc-300 uppercase tracking-widest">{new Date(bid.created_at).toLocaleTimeString()}</span>
                        </div>
                        <div className="text-right">
                            <span className="text-lg font-bold text-secondary font-display group-hover:text-primary transition-colors tracking-tight">${bid.amount.toLocaleString()}</span>
                        </div>
                    </div>
                ))}
                {realtimeBids.length === 0 && (
                    <div className="py-16 text-center border-2 border-dashed border-zinc-100 rounded-[32px]">
                        <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest italic">No activity recorded yet</p>
                    </div>
                )}
            </div>
            
            {onlyHistory && (
              <div className="pt-2">
                <Link 
                  href={`/auctions/${product.id}`} 
                  className="w-full flex items-center justify-between bg-secondary text-white p-6 rounded-3xl font-bold uppercase text-[11px] tracking-widest hover:bg-primary transition-all shadow-xl shadow-secondary/10 group italic" 
                  onClick={onClose}
                >
                  Initiate Bidding Protocol
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
