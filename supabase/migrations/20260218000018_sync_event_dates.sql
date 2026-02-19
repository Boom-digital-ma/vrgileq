-- Migration to sync auction end dates when the event end date changes
CREATE OR REPLACE FUNCTION public.sync_auction_event_dates()
RETURNS TRIGGER AS $$
BEGIN
    -- Only sync if the ends_at date has actually changed
    IF (OLD.ends_at IS DISTINCT FROM NEW.ends_at) THEN
        UPDATE public.auctions
        SET ends_at = NEW.ends_at
        WHERE event_id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auction_events table
DROP TRIGGER IF EXISTS trigger_sync_auction_dates ON public.auction_events;
CREATE TRIGGER trigger_sync_auction_dates
AFTER UPDATE OF ends_at ON public.auction_events
FOR EACH ROW
EXECUTE FUNCTION public.sync_auction_event_dates();
