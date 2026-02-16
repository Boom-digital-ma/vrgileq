-- Add manufacturer and model to auctions
ALTER TABLE public.auctions 
ADD COLUMN IF NOT EXISTS manufacturer TEXT,
ADD COLUMN IF NOT EXISTS model TEXT;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
