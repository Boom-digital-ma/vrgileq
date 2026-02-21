-- Update the check_and_close_auctions function to also handle opening scheduled events
CREATE OR REPLACE FUNCTION public.check_and_open_and_close_events()
RETURNS void AS $$
DECLARE
  v_auction RECORD;
  v_event RECORD;
BEGIN
  -- 1. Open scheduled events that should be live
  UPDATE auction_events 
  SET status = 'live', updated_at = now()
  WHERE status = 'scheduled' 
  AND start_at <= now();

  -- 2. Find expired auctions that are still 'live'
  FOR v_auction IN 
    SELECT id 
    FROM auctions 
    WHERE status = 'live' 
    AND ends_at <= now()
  LOOP
    -- Call Edge Function to close the auction
    PERFORM net.http_post(
      url := (SELECT value FROM vault.secrets WHERE name = 'SUPABASE_URL') || '/functions/v1/close-auction',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (SELECT value FROM vault.secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY'),
        'apikey', (SELECT value FROM vault.secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY')
      ),
      body := jsonb_build_object('auction_id', v_auction.id)
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the cron schedule to use the new function
-- First unschedule the old one if needed, or just overwrite it
-- pg_cron usually handles overwrite if name is same or we can drop and re-add.
SELECT cron.unschedule('close-expired-auctions-job');

SELECT cron.schedule(
  'open-and-close-events-job',
  '* * * * *',
  'SELECT public.check_and_open_and_close_events()'
);
