"use client";

import { useEventBroadcast } from "@/lib/useBroadcast";

/**
 * Mounts the broadcast channel listener for an event.
 * Place once on event pages — receives server-side broadcast messages
 * and re-dispatches them as DOM CustomEvents for all child components.
 */
export default function EventBroadcastProvider({ eventId }: { eventId: string }) {
  useEventBroadcast(eventId);
  return null;
}
