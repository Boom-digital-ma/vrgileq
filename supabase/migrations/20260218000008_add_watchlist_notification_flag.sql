-- Add notified_closing_soon column to watchlist table
ALTER TABLE public.watchlist 
ADD COLUMN notified_closing_soon BOOLEAN DEFAULT FALSE;

-- Index for performance when scanning for notifications
CREATE INDEX idx_watchlist_notified ON public.watchlist(notified_closing_soon);
