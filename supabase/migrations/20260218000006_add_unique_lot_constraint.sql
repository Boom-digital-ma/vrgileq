-- Fix for upsert: Add unique constraint on lot_number within an event
-- This allows updating lots during re-imports instead of creating duplicates

ALTER TABLE public.auctions 
ADD CONSTRAINT unique_lot_per_event UNIQUE (event_id, lot_number);

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
