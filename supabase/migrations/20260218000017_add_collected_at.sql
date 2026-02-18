-- Migration: Add Collected At status to sales
-- Date: 2026-02-18

ALTER TABLE public.sales 
ADD COLUMN IF NOT EXISTS collected_at TIMESTAMPTZ;

-- Update the view to include this
CREATE OR REPLACE VIEW public.sales_logistics_view AS
SELECT 
    s.*,
    p.full_name as customer_name,
    p.phone as customer_phone,
    a.title as auction_title,
    a.lot_number,
    e.title as event_title,
    ps.start_at as pickup_start,
    ps.end_at as pickup_end
FROM public.sales s
JOIN public.profiles p ON s.winner_id = p.id
JOIN public.auctions a ON s.auction_id = a.id
LEFT JOIN public.auction_events e ON s.event_id = e.id
LEFT JOIN public.pickup_slots ps ON s.pickup_slot_id = ps.id;
