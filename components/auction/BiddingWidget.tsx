"use client";

import { useState, useEffect } from "react";
import { Timer, Gavel, History } from "lucide-react";

interface BiddingWidgetProps {
  initialPrice: number;
  endsAt: Date;
}

export default function BiddingWidget({ initialPrice, endsAt }: BiddingWidgetProps) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [mounted, setMounted] = useState(false);
  const nextBid = initialPrice + 500;

  useEffect(() => {
    setMounted(true);
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

      setTimeLeft(
        `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
      
      setIsUrgent(distance < 24 * 60 * 60 * 1000);
    }, 1000);

    return () => clearInterval(timer);
  }, [endsAt]);

  const recentBids = [
    { bidder: "A***1", amount: 42500, time: "2 mins ago" },
    { bidder: "J***9", amount: 41000, time: "15 mins ago" },
    { bidder: "M***k", amount: 40500, time: "1 hour ago" },
  ];

  return (
    <div className="sticky top-6 flex flex-col border-2 border-primary bg-white p-8 tracking-tight shadow-[8px_8px_0px_0px_rgba(11,43,83,1)]">
      <div className="mb-8 flex items-center justify-between border-b-2 border-primary pb-6">
        <div className="flex flex-col gap-1">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral/50">Time Remaining</div>
          <div className={`text-3xl font-black tabular-nums ${isUrgent ? "text-red-600" : "text-primary"}`}>
            {timeLeft || "00:00:00"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-10">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral/50 mb-2">Current Bid</div>
          <div className="text-2xl font-black text-primary">
            {mounted 
              ? `$${initialPrice.toLocaleString(undefined, { minimumFractionDigits: 0 })}` 
              : `$${initialPrice.toFixed(0)}`
            }
          </div>
        </div>
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral/50 mb-2">Next Bid</div>
          <div className="text-2xl font-black text-primary">
            {mounted 
              ? `$${nextBid.toLocaleString(undefined, { minimumFractionDigits: 0 })}` 
              : `$${nextBid.toFixed(0)}`
            }
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        <div className="relative">
          <div className="absolute -top-2 left-4 bg-white px-2 text-[10px] font-black uppercase tracking-widest text-neutral/50">
            Enter Max Bid
          </div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral/40 font-bold">$</span>
            <input
              type="number"
              placeholder={nextBid.toString()}
              className="w-full border-2 border-primary py-4 pl-8 pr-4 text-xl font-black focus:outline-none focus:ring-0 text-primary"
            />
          </div>
        </div>
        
        <button className="flex items-center justify-center gap-2 bg-primary py-5 text-white transition-all hover:bg-secondary font-black text-xl uppercase tracking-tighter active:translate-y-1 shadow-[4px_4px_0px_0px_rgba(4,154,158,1)]">
          <Gavel className="h-6 w-6" />
          Bid {mounted ? `$${nextBid.toLocaleString()}` : `$${nextBid}`}
        </button>
      </div>

      <div className="mb-8 rounded bg-light/10 p-4 border border-light">
        <div className="text-[10px] font-bold uppercase tracking-widest text-neutral/50 text-center leading-relaxed">
          * A 20% Buyer's Premium will be added to the final bid.
          <br />
          Total: {mounted ? `$${(nextBid * 1.2).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : `$${(nextBid * 1.2).toFixed(0)}`}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
            <History className="h-4 w-4" />
            <span>Recent Bids</span>
          </div>
          <button className="text-[10px] font-black uppercase tracking-widest text-secondary underline decoration-2 underline-offset-4">
            Full History
          </button>
        </div>
        <div className="flex flex-col gap-5">
          {recentBids.map((bid, i) => (
            <div key={i} className="flex justify-between items-center text-sm border-b border-light pb-3 last:border-0">
              <span className="font-bold text-neutral/40 uppercase tracking-tighter">{bid.bidder}</span>
              <div className="text-right">
                <div className="font-black text-primary">
                  {mounted ? `$${bid.amount.toLocaleString()}` : `$${bid.amount}`}
                </div>
                <div className="text-[10px] font-bold text-neutral/30 uppercase">{bid.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
