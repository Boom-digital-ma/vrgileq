"use client";

import { X, Gavel, Timer, Building2, History, Share2 } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";

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
  };
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const [mounted, setMounted] = useState(false);
  const [bidAmount, setBidAmount] = useState("");
  const [view, setView] = useState<"bid" | "history">("bid");
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const nextBid = product.price + 500;

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setView("bid"); // Reset to bid view when opening
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleShare = () => {
    const url = `${window.location.origin}/auctions/${product.id}`;
    navigator.clipboard.writeText(url);
    setShowShareTooltip(true);
    setTimeout(() => setShowShareTooltip(false), 2000);
  };

  if (!isOpen) return null;

  const mockHistory = [
    { id: 1, bidder: "A***1", amount: 42500, time: "2 mins ago" },
    { id: 2, bidder: "J***9", amount: 41000, time: "15 mins ago" },
    { id: 3, bidder: "M***k", amount: 40500, time: "1 hour ago" },
    { id: 4, bidder: "R***2", amount: 39000, time: "3 hours ago" },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-primary/40 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-white shadow-[16px_16px_0px_0px_rgba(11,43,83,1)] border-2 border-primary overflow-hidden max-h-[90vh] flex flex-col md:flex-row">
        {/* Top Actions */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <button 
            onClick={handleShare}
            className="relative bg-white border-2 border-primary p-2 hover:bg-light/20 transition-colors text-primary"
            title="Share Lot"
          >
            <Share2 className="h-5 w-5" />
            {showShareTooltip && (
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black uppercase px-2 py-1 whitespace-nowrap animate-in fade-in zoom-in duration-200">
                Link Copied!
              </div>
            )}
          </button>
          <button 
            onClick={onClose}
            className="bg-white border-2 border-primary p-2 hover:bg-primary hover:text-white transition-colors text-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Left: Image */}
        <div className="relative w-full md:w-1/2 h-64 md:h-auto border-b-2 md:border-b-0 md:border-r-2 border-primary bg-light/10">
          <Image
            src={product.image}
            alt={product.title}
            fill
            className="object-cover"
          />
          <div className="absolute top-6 left-6 bg-primary px-3 py-1 text-xs font-black uppercase tracking-widest text-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
            Lot #{product.id}
          </div>
        </div>

        {/* Right: Info */}
        <div className="w-full md:w-1/2 p-8 overflow-y-auto">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-4 w-4 text-primary" />
              <span className="text-xs font-black uppercase tracking-widest text-neutral/50">{product.supplier}</span>
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter leading-none text-primary mb-4">
              {product.title}
            </h2>
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-primary bg-light/20 px-4 py-2 border border-primary/10">
              <Timer className="h-4 w-4" /> Ends in: {product.endsAt}
            </div>
          </div>

          {view === "bid" ? (
            <>
              <div className="grid grid-cols-2 gap-6 mb-8 border-y border-light py-6">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-neutral/40 mb-1">Current Bid</div>
                  <div className="text-2xl font-black text-primary">
                    ${mounted ? product.price.toLocaleString() : product.price.toString()}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-neutral/40 mb-1">Manufacturer</div>
                  <div className="text-sm font-bold text-neutral uppercase tracking-tight">{product.manufacturer || "N/A"}</div>
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-neutral/40 mb-1">Model</div>
                  <div className="text-sm font-bold text-neutral uppercase tracking-tight">{product.model || "N/A"}</div>
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-neutral/40 mb-1">Total Bids</div>
                  <div className="text-sm font-bold text-secondary">{product.bidCount} Bids</div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">Description</h3>
                <p className="text-xs font-medium leading-relaxed text-neutral/70 line-clamp-4">
                  {product.description || "No description available for this lot."}
                </p>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-neutral/40">$</span>
                  <input
                    type="number"
                    placeholder={`Minimum bid $${nextBid}`}
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="w-full border-2 border-primary py-4 pl-8 pr-4 text-lg font-black focus:outline-none focus:ring-0 text-primary placeholder:text-neutral/20"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button className="flex items-center justify-center gap-2 bg-primary py-4 text-white transition-all hover:bg-secondary font-black text-sm uppercase tracking-widest active:translate-y-1 shadow-[4px_4px_0px_0px_rgba(11,43,83,0.2)]">
                    <Gavel className="h-5 w-5" /> Place Bid
                  </button>
                  <button 
                    onClick={() => setView("history")}
                    className="flex items-center justify-center gap-2 border-2 border-primary py-4 text-primary transition-all hover:bg-light/20 font-black text-sm uppercase tracking-widest active:translate-y-1"
                  >
                    <History className="h-5 w-5" /> History
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary">Bid History</h3>
                <button 
                  onClick={() => setView("bid")}
                  className="text-[10px] font-black uppercase tracking-widest text-neutral/40 hover:text-primary transition-colors underline decoration-2 underline-offset-4"
                >
                  Back to Bidding
                </button>
              </div>
              
              <div className="flex-1 space-y-4 mb-8">
                {mockHistory.map((bid) => (
                  <div key={bid.id} className="flex items-center justify-between border-b border-light pb-4">
                    <div className="flex items-center gap-4">
                      <div className="h-8 w-8 rounded-full bg-light/20 flex items-center justify-center text-[10px] font-black text-primary">
                        {bid.bidder.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs font-black uppercase tracking-tight text-neutral">{bid.bidder}</div>
                        <div className="text-[10px] font-bold text-neutral/30 uppercase">{bid.time}</div>
                      </div>
                    </div>
                    <div className="text-sm font-black text-primary">
                      ${mounted ? bid.amount.toLocaleString() : bid.amount.toString()}
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setView("bid")}
                className="w-full bg-primary py-4 text-white font-black text-sm uppercase tracking-widest hover:bg-secondary transition-colors"
              >
                Place a Counter-Bid
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
