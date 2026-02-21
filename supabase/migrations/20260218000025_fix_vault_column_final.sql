-- Fix all cron functions to use correct vault columns and headers
-- Date: 2026-02-21

-- 1. Fix check_and_notify_watchlist
CREATE OR REPLACE FUNCTION public.check_and_notify_watchlist()
RETURNS void AS $$
DECLARE
  v_supabase_url TEXT;
  v_service_role_key TEXT;
BEGIN
  -- Get secrets from vault.decrypted_secrets
  SELECT TRIM(decrypted_secret) INTO v_supabase_url FROM vault.decrypted_secrets WHERE name = 'SUPABASE_URL' LIMIT 1;
  SELECT TRIM(decrypted_secret) INTO v_service_role_key FROM vault.decrypted_secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY' LIMIT 1;

  IF v_supabase_url IS NOT NULL AND v_service_role_key IS NOT NULL THEN
    PERFORM net.http_post(
      url := v_supabase_url || '/functions/v1/notify-watchlist-closing',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || v_service_role_key,
        'apikey', v_service_role_key
      ),
      body := jsonb_build_object('scan', true)
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Fix check_and_open_and_close_events
CREATE OR REPLACE FUNCTION public.check_and_open_and_close_events()
RETURNS void AS $$
DECLARE
  v_auction RECORD;
  v_supabase_url TEXT;
  v_service_role_key TEXT;
BEGIN
  -- 1. Open scheduled events that should be live
  UPDATE auction_events 
  SET status = 'live', updated_at = now()
  WHERE status = 'scheduled' 
  AND start_at <= now();

  -- 2. Get secrets for Edge Function calls
  SELECT TRIM(decrypted_secret) INTO v_supabase_url FROM vault.decrypted_secrets WHERE name = 'SUPABASE_URL' LIMIT 1;
  SELECT TRIM(decrypted_secret) INTO v_service_role_key FROM vault.decrypted_secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY' LIMIT 1;

  IF v_supabase_url IS NOT NULL AND v_service_role_key IS NOT NULL THEN
    -- Find expired auctions that are still 'live'
    FOR v_auction IN 
      SELECT id 
      FROM auctions 
      WHERE status = 'live' 
      AND ends_at <= now()
    LOOP
      -- Call Edge Function to close the auction
      PERFORM net.http_post(
        url := v_supabase_url || '/functions/v1/close-auction',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || v_service_role_key,
          'apikey', v_service_role_key
        ),
        body := jsonb_build_object('auction_id', v_auction.id)
      );
    END LOOP;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
