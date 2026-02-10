"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Timer, Building2, Gavel, Eye, Share2 } from "lucide-react";
import QuickViewModal from "./QuickViewModal";

interface Product {
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
}

export default function AuctionCard({ product }: { product: Product }) {
  const [bidAmount, setBidAmount] = useState<string>("");
  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const nextBid = product.price + 500;

  useEffect(() => {
    setMounted(true);
  }, []);

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
      <div className="group flex flex-col border-2 border-primary transition-all hover:shadow-[8px_8px_0px_0px_rgba(11,43,83,1)] bg-white">
        {/* Top Part: Link to details */}
        <div className="relative aspect-square w-full overflow-hidden border-b-2 border-primary">
          <Link href={`/auctions/${product.id}`}>
            <Image
              src={product.image}
              alt={product.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </Link>
          
          {/* Quick View Button Overlay */}
          <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-white text-primary border-2 border-primary px-4 py-2 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-primary hover:text-white transition-colors shadow-[4px_4px_0px_0px_rgba(11,43,83,1)]"
            >
              <Eye className="h-3 w-3" /> Quick View
            </button>
            <button 
              onClick={handleShare}
              className="relative bg-white text-primary border-2 border-primary p-2 hover:bg-primary hover:text-white transition-colors shadow-[4px_4px_0px_0px_rgba(11,43,83,1)]"
            >
              <Share2 className="h-4 w-4" />
              {showShareTooltip && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-primary text-white text-[8px] font-black uppercase px-2 py-1 whitespace-nowrap">
                  Copied!
                </div>
              )}
            </button>
          </div>

          <div className="absolute top-4 left-4 bg-primary px-2 py-1 text-[10px] font-black uppercase tracking-widest text-white">
            Lot #{product.id}
          </div>
          <div className="absolute bottom-4 right-4 bg-white border-2 border-primary px-2 py-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary shadow-[4px_4px_0px_0px_rgba(4,154,158,1)]">
            <Timer className="h-3 w-3" /> {product.endsAt}
          </div>
        </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-2 mb-2">
          <Building2 className="h-3 w-3 text-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest text-neutral/50 truncate">{product.supplier}</span>
        </div>
        <Link href={`/auctions/${product.id}`}>
          <h2 className="mb-4 text-lg font-black leading-tight uppercase hover:underline line-clamp-2 text-primary">
            {product.title}
          </h2>
        </Link>

        {/* Bidding Info */}
        <div className="mb-6 flex items-end justify-between border-t border-light pt-4">
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-neutral/40 mb-1">Current Bid</div>
            <div className="text-xl font-black text-primary">
              ${mounted ? product.price.toLocaleString() : product.price.toString()}
            </div>
          </div>
          <div className="text-[10px] font-bold uppercase text-secondary">
            {product.bidCount} Bids
          </div>
        </div>

        {/* Quick Bid Interface */}
        <div className="mt-auto space-y-3">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-neutral/40">$</span>
            <input
              type="number"
              placeholder={`Min $${nextBid}`}
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              className="w-full border-2 border-primary py-2 pl-6 pr-3 text-sm font-black focus:outline-none focus:ring-0 text-primary placeholder:text-neutral/20"
            />
          </div>
          <button className="w-full flex items-center justify-center gap-2 bg-primary py-3 text-white transition-all hover:bg-secondary font-black text-xs uppercase tracking-widest active:translate-y-1 shadow-[4px_4px_0px_0px_rgba(11,43,83,0.2)]">
            <Gavel className="h-4 w-4" />
            Place Quick Bid
          </button>
        </div>
      </div>
      </div>

      <QuickViewModal 
        product={product} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}
