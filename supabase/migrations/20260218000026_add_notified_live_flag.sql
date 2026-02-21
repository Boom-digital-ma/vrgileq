-- Add notified_live column to watchlist table
ALTER TABLE public.watchlist 
ADD COLUMN notified_live BOOLEAN DEFAULT FALSE;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_watchlist_notified_live ON public.watchlist(notified_live);
