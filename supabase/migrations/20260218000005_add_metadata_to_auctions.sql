-- Add metadata jsonb column to store additional lot info
ALTER TABLE public.auctions 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
