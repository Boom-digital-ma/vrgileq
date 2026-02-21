"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import ImageGallery from "@/components/auction/ImageGallery";
import BiddingWidget from "@/components/auction/BiddingWidget";
import { Timer, Gavel, Package, ShieldCheck, Info, MapPin, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AuctionDetailsRealtime({ initialLot, initialBids }: { initialLot: any, initialBids: any[] }) {
  const [lot, setLot] = useState(initialLot);
  const [mounted, setMounted] = useState(false);
  const [isAuctionEnded, setIsAuctionEnded] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
    let isMounted = true;

    // Timer to check for expiration
    const checkExpiry = () => {
        if (new Date(lot.ends_at) <= new Date()) {
            setIsAuctionEnded(true);
        } else {
            setIsAuctionEnded(false);
        }
    };

    checkExpiry();
    const expiryTimer = setInterval(checkExpiry, 1000);

    // Watch for start time
    const checkStart = () => {
        if (lot.auction_events?.start_at && new Date(lot.auction_events.start_at) <= new Date()) {
            setIsStarted(true);
        } else if (!lot.auction_events?.start_at) {
            setIsStarted(true);
        } else {
            setIsStarted(false);
        }
    };
    checkStart();
    const startTimer = setInterval(checkStart, 1000);

    const channel = supabase
      .channel(`auction-details-${lot.id}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'auctions',
        filter: `id=eq.${lot.id}`
      }, (payload) => {
        if (isMounted) {
          setLot((prev: any) => ({ ...prev, ...payload.new }));
        }
      })
      .subscribe();

    return () => {
      isMounted = false;
      clearInterval(expiryTimer);
      clearInterval(startTimer);
      supabase.removeChannel(channel);
    };
  }, [lot.id, lot.ends_at, lot.auction_events?.start_at, supabase]);

  const secondaryImages = lot.auction_images?.map((img: any) => img.url) || [];
  const finalGallery = [
    ...(lot.image_url ? [lot.image_url] : []),
    ...secondaryImages
  ].filter((url, index, self) => url && self.indexOf(url) === index);

  const [isStarted, setIsStarted] = useState(!lot.auction_events?.start_at || new Date(lot.auction_events.start_at) <= new Date());
  const isLive = lot.status === 'live' && isStarted && !isAuctionEnded;
  const isUpcoming = !isStarted && !isAuctionEnded;

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* LEFT: Content & Media */}
        <div className="lg:col-span-7">
          <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                  {isLive ? (
                    <div className="flex items-center gap-2 bg-rose-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-rose-500/20">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                        </span>
                        Live Bidding
                    </div>
                  ) : isUpcoming ? (
                    <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 animate-in fade-in zoom-in">
                        Upcoming
                    </div>
                  ) : (
                    <div className="bg-zinc-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-zinc-500/20">
                        {isAuctionEnded ? 'Auction Ended' : `Auction ${lot.status}`}
                    </div>
                  )}
              </div>
              
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-secondary leading-tight mb-4 font-display">
                  {lot.title}
              </h1>
              
              <p className="text-zinc-500 text-base md:text-lg font-medium leading-relaxed max-w-3xl">
                  {lot.description || "Physically verified industrial asset. Complete technical documentation and physical assessment reports available for registered bidders."}
              </p>
          </div>

          <div className="mb-12">
              <ImageGallery images={finalGallery.length > 0 ? finalGallery : ["/images/placeholder.jpg"]} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8 py-12 border-t border-zinc-100">
              {[
                  { label: "Manufacturer", value: lot.manufacturer || "Certified OEM", icon: Package },
                  { label: "Model Reference", value: lot.model || "Industrial Standard", icon: Info },
                  { label: "Bidding Increment", value: `$${lot.min_increment}`, icon: Gavel },
                  { label: "Asset Condition", value: "Verified / In-situ", icon: ShieldCheck },
              ].map((spec, i) => (
                  <div key={i} className="flex items-start gap-4">
                      <div className="p-2 bg-zinc-50 rounded-xl text-zinc-400 border border-zinc-100"><spec.icon size={18} /></div>
                      <div>
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.1em] mb-1">{spec.label}</p>
                          <p className="text-base font-bold text-secondary">{spec.value}</p>
                      </div>
                  </div>
              ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8 py-12 border-t border-zinc-100">
              {[
                  { label: "Removal Protocol", value: "Pickup at event location. Logistics and extraction partners available upon request.", icon: MapPin },
                  { label: "Asset Origin", value: lot.auction_events?.location || "Alexandria Regional Hub", icon: Clock },
              ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                      <div className="p-2 bg-zinc-50 rounded-xl text-zinc-400 border border-zinc-100"><item.icon size={18} /></div>
                      <div>
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.1em] mb-1">{item.label}</p>
                          <p className="text-base font-bold text-secondary uppercase italic">{item.value}</p>
                      </div>
                  </div>
              ))}
          </div>
        </div>

        {/* RIGHT: Action Widget */}
        <div className="lg:col-span-5 lg:sticky lg:top-32">
          <BiddingWidget 
            auctionId={lot.id}
            eventId={lot.event_id}
            initialPrice={Number(lot.current_price)}
            endsAt={new Date(lot.ends_at)}
            startAt={lot.auction_events?.start_at ? new Date(lot.auction_events.start_at) : undefined}
            bids={initialBids}
            minIncrement={Number(lot.min_increment)}
          />
          
          <div className="mt-6 flex items-center justify-center gap-3 px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl">
              <ShieldCheck size={16} className="text-emerald-500" />
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">
                  Security protocol active • Stripe Verified
              </p>
          </div>
        </div>

      </div>
    </div>
  );
}
