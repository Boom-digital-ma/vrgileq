"use client";

import { useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Subscribes to the event broadcast channel and dispatches
 * custom DOM events that individual components can listen to.
 *
 * Should be mounted ONCE per event page (in the event page or layout).
 * Components listen via window.addEventListener('auction:update', ...)
 * and window.addEventListener('bid:new', ...).
 *
 * Automatically disconnects when the tab is hidden and reconnects
 * when visible again, freeing Supabase concurrent connection slots.
 */
export function useEventBroadcast(eventId: string | null) {
  const channelRef = useRef<any>(null);
  const supabaseRef = useRef<any>(null);

  const connect = useCallback(() => {
    if (!eventId || channelRef.current) return;

    if (!supabaseRef.current) {
      supabaseRef.current = createClient();
    }
    const supabase = supabaseRef.current;

    channelRef.current = supabase
      .channel(`event-${eventId}`)
      .on('broadcast', { event: 'auction:update' }, ({ payload }: any) => {
        window.dispatchEvent(new CustomEvent('auction:update', { detail: payload }));
      })
      .on('broadcast', { event: 'bid:new' }, ({ payload }: any) => {
        window.dispatchEvent(new CustomEvent('bid:new', { detail: payload }));
      })
      .subscribe();
  }, [eventId]);

  const disconnect = useCallback(() => {
    if (channelRef.current && supabaseRef.current) {
      supabaseRef.current.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!eventId) return;

    connect();

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        disconnect();
      } else {
        connect();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      disconnect();
    };
  }, [eventId, connect, disconnect]);
}
