"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Timer, Building2, Gavel, Eye, Share2, Star, ArrowLeft, ArrowRight, MapPin, Clock } from "lucide-react";
import QuickViewModal from "./QuickViewModal";
import { toggleWatchlist } from "@/app/actions/watchlist";
import { createClient } from "@/lib/supabase/client";

interface Product {
  id: string;
  lotNumber?: string | number; // Dynamic lot number
  title: string;
  supplier: string;
  price: number;
  endsAt: string;
  image: string;
  images?: string[]; // Multiple images for slider
  bidCount: number;
  pickupLocation?: string;
  pickupDate?: string;
  manufacturer?: string;
  model?: string;
  description?: string;
  minIncrement?: number;
}

export default function AuctionCard({ product }: { product: Product }) {
  const [bidAmount, setBidAmount] = useState<number>(product.price + (product.minIncrement || 100));
  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const [isWatched, setIsWatched] = useState(false);
  const [loadingWatch, setLoadingWatch] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const allImages = product.images && product.images.length > 0 ? product.images : [product.image];
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
    
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

    async function checkWatchlist() {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data } = await supabase
                .from('watchlist')
                .select('id')
                .eq('user_id', user.id)
                .eq('auction_id', product.id)
                .single();
            setIsWatched(!!data);
        }
    }
    checkWatchlist();

    return () => {
        clearInterval(timer);
        document.body.style.overflow = "unset";
    };
  }, [product.id, product.endsAt, supabase]);

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const handleToggleWatch = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoadingWatch(true);
    try {
        await toggleWatchlist(product.id);
        setIsWatched(!isWatched);
    } catch (err) {
        alert("Please login to follow this auction");
    } finally {
        setLoadingWatch(false);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/auctions/${product.id}`;
    navigator.clipboard.writeText(url);
    setShowShareTooltip(true);
    setTimeout(() => setShowShareTooltip(false), 2000);
  };

  return (
    <>
      <div 
        onClick={() => setIsModalOpen(true)}
        className="group flex flex-col border-2 border-primary transition-all hover:shadow-[12px_12px_0px_0px_rgba(11,43,83,1)] bg-white h-full cursor-pointer relative"
      >
        <div className="relative aspect-square w-full overflow-hidden border-b-2 border-primary bg-light/10">
          <Image
            src={allImages[currentImageIndex]}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* Image Slider Navigation */}
          {allImages.length > 1 && (
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <button onClick={handlePrevImage} className="bg-white/90 border-2 border-primary p-1.5 hover:bg-primary hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(11,43,83,1)]">
                    <ArrowLeft size={14} />
                </button>
                <button onClick={handleNextImage} className="bg-white/90 border-2 border-primary p-1.5 hover:bg-primary hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(11,43,83,1)]">
                    <ArrowRight size={14} />
                </button>
            </div>
          )}

          {/* Icons Overlay */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
                onClick={handleToggleWatch}
                disabled={loadingWatch}
                className={`p-2 border-2 border-primary transition-colors shadow-[4px_4px_0px_0px_rgba(11,43,83,1)] ${
                    isWatched ? 'bg-secondary text-primary' : 'bg-white text-primary hover:bg-light/20'
                }`}
            >
                <Star className={`h-4 w-4 ${isWatched ? 'fill-primary' : ''}`} />
            </button>
            <button 
              onClick={handleShare}
              className="bg-white text-primary border-2 border-primary p-2 hover:bg-primary hover:text-white transition-colors shadow-[4px_4px_0px_0px_rgba(11,43,83,1)]"
            >
              <Share2 className="h-4 w-4" />
              {showShareTooltip && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-primary text-white text-[8px] font-black uppercase px-2 py-1 whitespace-nowrap">
                  Copied!
                </div>
              )}
            </button>
          </div>

          <div className="absolute top-4 left-4 bg-primary px-2 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-[4px_4px_0px_0px_rgba(11,43,83,1)]">
            Lot #{product.lotNumber || product.id.slice(0,4)}
          </div>
          
          {/* Detailed Countdown */}
          <div className="absolute bottom-4 right-4 bg-white border-2 border-primary px-3 py-1.5 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary shadow-[4px_4px_0px_0px_rgba(4,154,158,1)] italic">
            <Timer className="h-3.5 w-3.5" /> {mounted ? timeLeft : "..."}
          </div>
        </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-2 mb-2">
          <Building2 className="h-3 w-3 text-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest text-neutral/50 truncate">{product.supplier}</span>
        </div>
        
        <h2 className="mb-4 text-lg font-black leading-tight uppercase group-hover:text-primary transition-colors line-clamp-2 italic h-14">
          {product.title}
        </h2>

        {/* Pickup Info */}
        {(product.pickupLocation || product.pickupDate) && (
            <div className="mb-4 p-3 bg-light/5 border border-dashed border-primary/20 flex flex-col gap-1">
                <div className="flex items-center gap-2 text-[8px] font-black uppercase text-neutral/40">
                    <MapPin className="h-3 w-3 text-primary" /> 
                    <span>Pickup: {product.pickupLocation || 'Alexandria, VA'}</span>
                </div>
                {product.pickupDate && (
                    <div className="flex items-center gap-2 text-[8px] font-black uppercase text-neutral/40">
                        <Clock className="h-3 w-3 text-primary" /> 
                        <span>Date: {product.pickupDate}</span>
                    </div>
                )}
            </div>
        )}

        {/* Bidding Info */}
        <div className="mt-auto pt-4 border-t border-light flex items-end justify-between">
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-neutral/40 mb-1">Current Bid</div>
            <div className="text-2xl font-black text-primary italic tabular-nums">
              ${mounted ? product.price.toLocaleString() : product.price.toString()}
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="text-[10px] font-black uppercase tracking-widest text-secondary">{product.bidCount} Bids</div>
            <div className="text-[8px] font-bold text-neutral/30 uppercase mt-1">Ref: {product.id.slice(-4)}</div>
          </div>
        </div>
      </div>
      </div>

      <QuickViewModal 
        product={product} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        initialBid={bidAmount}
      />
    </>
  );
}
