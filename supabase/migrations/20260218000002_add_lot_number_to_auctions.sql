-- Add lot_number to auctions
ALTER TABLE public.auctions 
ADD COLUMN IF NOT EXISTS lot_number INTEGER;

-- Initialize existing lots with a sequence based on creation date
WITH numbered_lots AS (
    SELECT id, row_number() OVER (PARTITION BY event_id ORDER BY created_at ASC) as row_num
    FROM public.auctions
)
UPDATE public.auctions
SET lot_number = numbered_lots.row_num
FROM numbered_lots
WHERE public.auctions.id = numbered_lots.id;

-- Optional: Add a trigger to auto-assign lot_number if not provided (simplified logic)
-- For now, we will handle it in the Admin UI.
