import { createAdminClient } from '@/lib/supabase/server'

/**
 * Broadcast an auction update to all clients listening on the event channel.
 * Used after a bid is placed to push price/bid updates via Broadcast
 * instead of relying on postgres_changes (which we can't throttle).
 */
export async function broadcastBidUpdate({
  eventId,
  auctionId,
  auction,
  bid,
}: {
  eventId: string
  auctionId: string
  auction: { current_price: number; winner_id: string | null; ends_at: string; status: string }
  bid: { id: string; user_id: string; amount: number; max_amount: number | null; status: string; created_at: string; full_name?: string }
}) {
  const supabase = createAdminClient()

  const channel = supabase.channel(`event-${eventId}`)

  // Send both events in one connection
  await channel.send({
    type: 'broadcast',
    event: 'auction:update',
    payload: {
      id: auctionId,
      current_price: auction.current_price,
      winner_id: auction.winner_id,
      ends_at: auction.ends_at,
      status: auction.status,
    },
  })

  await channel.send({
    type: 'broadcast',
    event: 'bid:new',
    payload: {
      id: bid.id,
      auction_id: auctionId,
      user_id: bid.user_id,
      amount: bid.amount,
      max_amount: bid.max_amount,
      status: bid.status,
      created_at: bid.created_at,
      full_name: bid.full_name,
    },
  })

  await supabase.removeChannel(channel)
}
