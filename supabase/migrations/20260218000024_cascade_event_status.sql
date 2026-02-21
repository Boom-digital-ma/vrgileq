-- Update the sync function to also cascade status changes from event to its lots
CREATE OR REPLACE FUNCTION public.sync_auction_event_data()
RETURNS TRIGGER AS $$
BEGIN
    -- 1. Sync ends_at if changed
    IF (OLD.ends_at IS DISTINCT FROM NEW.ends_at) THEN
        UPDATE public.auctions
        SET ends_at = NEW.ends_at
        WHERE event_id = NEW.id;
    END IF;

    -- 2. Sync status if changed
    IF (OLD.status IS DISTINCT FROM NEW.status) THEN
        -- live -> live
        IF (NEW.status = 'live') THEN
            UPDATE public.auctions
            SET status = 'live'
            WHERE event_id = NEW.id AND status != 'live';
        END IF;

        -- closed -> ended (except those already 'sold')
        IF (NEW.status = 'closed') THEN
            UPDATE public.auctions
            SET status = 'ended'
            WHERE event_id = NEW.id AND status = 'live';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update trigger to also watch for status changes
DROP TRIGGER IF EXISTS trigger_sync_auction_dates ON public.auction_events;

CREATE TRIGGER trigger_sync_auction_data
AFTER UPDATE OF ends_at, status ON public.auction_events
FOR EACH ROW
EXECUTE FUNCTION public.sync_auction_event_data();
