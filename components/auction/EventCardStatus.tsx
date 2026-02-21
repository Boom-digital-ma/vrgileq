"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface EventCardStatusProps {
  startAt: string;
  endsAt: string;
}

export default function EventCardStatus({ startAt, endsAt }: EventCardStatusProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isEnded = new Date(endsAt) <= now;
  const isUpcoming = new Date(startAt) > now;

  if (isEnded) {
    return (
        <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-zinc-300" />
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest italic">Auction Closed</span>
        </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
        <div className={cn(
          "h-2 w-2 rounded-full animate-pulse",
          isUpcoming ? "bg-blue-500" : "bg-emerald-500"
        )} />
        <span className="text-[10px] font-bold text-zinc-900 uppercase tracking-widest italic">
            {isUpcoming ? 'Opening Soon' : 'Open for Bidding'}
        </span>
    </div>
  );
}
