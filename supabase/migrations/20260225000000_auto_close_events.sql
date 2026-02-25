-- Update the check_and_open_and_close_events function to also handle closing events
CREATE OR REPLACE FUNCTION public.check_and_open_and_close_events()
RETURNS void AS $$
DECLARE
  v_auction RECORD;
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

  -- 3. Close live events where all associated auctions are finished
  -- We only close if the base event time has passed AND no live auctions remain
  UPDATE auction_events ae
  SET status = 'closed', updated_at = now()
  WHERE ae.status = 'live'
  AND ae.ends_at <= now()
  AND NOT EXISTS (
    SELECT 1 FROM auctions a 
    WHERE a.event_id = ae.id 
    AND a.status = 'live'
  )
  AND EXISTS (
    SELECT 1 FROM auctions a WHERE a.event_id = ae.id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
