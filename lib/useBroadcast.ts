"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Subscribes to the event broadcast channel and dispatches
 * custom DOM events that individual components can listen to.
 *
 * Should be mounted ONCE per event page (in the event page or layout).
 * Components listen via window.addEventListener('auction:update', ...)
 * and window.addEventListener('bid:new', ...).
 */
export function useEventBroadcast(eventId: string | null) {
  useEffect(() => {
    if (!eventId) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`event-${eventId}`)
      .on('broadcast', { event: 'auction:update' }, ({ payload }: any) => {
        window.dispatchEvent(new CustomEvent('auction:update', { detail: payload }));
      })
      .on('broadcast', { event: 'bid:new' }, ({ payload }: any) => {
        window.dispatchEvent(new CustomEvent('bid:new', { detail: payload }));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId]);
}
