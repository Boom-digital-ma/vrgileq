-- Fix vault column names in cron functions
-- Supabase Vault uses 'decrypted_secret' in the decrypted_secrets view

CREATE OR REPLACE FUNCTION public.check_and_notify_watchlist()
RETURNS void AS $$
BEGIN
  PERFORM net.http_post(
    url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_URL') || '/functions/v1/notify-watchlist-closing',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY')
    ),
    body := jsonb_build_object('scan', true)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.check_and_open_and_close_events()
RETURNS void AS $$
DECLARE
  v_auction RECORD;
  v_url TEXT;
  v_key TEXT;
BEGIN
  -- Get credentials once
  SELECT decrypted_secret INTO v_url FROM vault.decrypted_secrets WHERE name = 'SUPABASE_URL';
  SELECT decrypted_secret INTO v_key FROM vault.decrypted_secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY';

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
    PERFORM net.http_post(
      url := v_url || '/functions/v1/close-auction',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || v_key,
        'apikey', v_key
      ),
      body := jsonb_build_object('auction_id', v_auction.id)
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
