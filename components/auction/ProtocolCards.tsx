"use client";

import { useState, useEffect } from "react";
import { Timer, ShieldCheck, Lock } from "lucide-react";
import RegistrationButton from "./RegistrationButton";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface ProtocolCardsProps {
  event: {
    id: string;
    start_at: string;
    ends_at: string;
    deposit_amount: number;
    status: string;
  };
}

export default function ProtocolCards({ event }: ProtocolCardsProps) {
  const [now, setNow] = useState(new Date());
  const [status, setStatus] = useState(event.status);
  const supabase = createClient();

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);

    const channel = supabase
      .channel(`protocol-event-${event.id}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'auction_events',
        filter: `id=eq.${event.id}`
      }, (payload) => {
        setStatus(payload.new.status);
      })
      .subscribe();

    return () => {
      clearInterval(timer);
      supabase.removeChannel(channel);
    };
  }, [event.id, supabase]);

  const isEnded = new Date(event.ends_at) <= now || status === 'closed';
  const isUpcoming = new Date(event.start_at) > now;

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-20">
        {/* CARD 1: Timing */}
        <div className="md:col-span-3 bg-white border border-zinc-100 rounded-[24px] p-5 shadow-sm flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-xl text-primary">
                <Timer size={22} />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[9px] font-black uppercase text-zinc-300 tracking-[0.15em] mb-0.5 truncate">
                    {isUpcoming ? 'Starts On' : 'Ending On'}
                </p>
                <p className="text-xs font-bold text-secondary uppercase leading-none">
                    {isUpcoming 
                        ? `${new Date(event.start_at).toLocaleDateString()} @ ${new Date(event.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                        : `${new Date(event.ends_at).toLocaleDateString()} @ ${new Date(event.ends_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                    }
                </p>
            </div>
        </div>

        {/* CARD 2: Bidding Hold */}
        <div className="md:col-span-3 bg-white border border-zinc-100 rounded-[24px] p-5 shadow-sm flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-xl text-primary">
                <ShieldCheck size={22} />
            </div>
            <div>
                <p className="text-[9px] font-black uppercase text-zinc-300 tracking-[0.15em] mb-0.5 truncate">Authorization Hold</p>
                <p className="text-lg font-bold text-secondary uppercase leading-none">${Number(event.deposit_amount).toLocaleString()}</p>
            </div>
        </div>

        {/* CARD 3: Bidding Passport */}
        {!isEnded ? (
            <div className={cn(
                "md:col-span-6 rounded-[24px] p-5 flex flex-col justify-center relative overflow-hidden transition-all duration-500",
                isUpcoming ? "bg-zinc-100 border border-zinc-200" : "bg-rose-600 text-white shadow-xl shadow-rose-600/20"
            )}>
                <div className="relative z-10 flex items-center justify-between gap-8">
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "p-3 rounded-xl",
                            isUpcoming ? "bg-zinc-200 text-zinc-400" : "bg-white/10 text-white"
                        )}>
                            <Lock size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold uppercase tracking-widest font-display">Bidding Passport</h3>
                            <p className={cn("text-[9px] font-medium uppercase opacity-60 leading-none mt-1", isUpcoming ? "text-zinc-400" : "text-white")}>
                                {isUpcoming ? "Protocols locked until live" : "Secure your bidding protocol capacity"}
                            </p>
                        </div>
                    </div>
                    <div className="flex-1 max-w-[280px]">
                        <RegistrationButton eventId={event.id} depositAmount={Number(event.deposit_amount)} isUpcoming={isUpcoming} />
                    </div>
                </div>
                {!isUpcoming && <div className="absolute -bottom-10 -right-10 h-32 w-32 bg-primary/10 blur-3xl rounded-full" />}
            </div>
        ) : (
            <div className="md:col-span-6 bg-zinc-900 rounded-[24px] p-5 text-white flex items-center gap-4 grayscale">
                <Lock size={22} className="text-zinc-500" />
                <div>
                    <p className="text-[9px] font-black uppercase text-zinc-500 tracking-[0.15em] mb-0.5">Status Protocol</p>
                    <p className="text-sm font-bold uppercase leading-none">Bidding Closed</p>
                </div>
            </div>
        )}
    </div>
  );
}
