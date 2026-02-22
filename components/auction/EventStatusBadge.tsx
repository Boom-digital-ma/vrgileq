"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface EventStatusBadgeProps {
  initialStatus: string;
  startAt: string;
  endsAt: string;
  eventId: string;
}

export default function EventStatusBadge({ initialStatus, startAt, endsAt, eventId }: EventStatusBadgeProps) {
  const [status, setStatus] = useState(initialStatus);
  const [now, setNow] = useState(new Date());
  const supabase = createClient();

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);

    const channel = supabase
      .channel(`event-status-${eventId}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'auction_events',
        filter: `id=eq.${eventId}`
      }, (payload: any) => {
        setStatus(payload.new.status);
      })
      .subscribe();

    return () => {
      clearInterval(timer);
      supabase.removeChannel(channel);
    };
  }, [eventId, supabase]);

  const isEnded = new Date(endsAt) <= now;
  const isUpcoming = new Date(startAt) > now;
  const displayStatus = isEnded ? 'closed' : (isUpcoming ? 'upcoming' : status);
  const isLive = displayStatus === 'live';

  return (
    <span className={cn(
        "px-3 py-1 rounded-full font-bold uppercase text-[9px] tracking-widest border italic transition-all",
        isLive ? "bg-rose-50 text-rose-600 border-rose-100 animate-pulse" : 
        isEnded ? "bg-zinc-900 text-white border-zinc-900 shadow-sm" :
        "bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/20"
    )}>
        {displayStatus} Event
    </span>
  );
}
