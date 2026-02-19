CREATE OR REPLACE FUNCTION public.check_and_close_auctions()
RETURNS void AS $$
DECLARE
  v_auction RECORD;
  v_supabase_url TEXT;
  v_service_role_key TEXT;
BEGIN
  -- Get secrets and TRIM to remove any accidental spaces/newlines
  SELECT TRIM(decrypted_secret) INTO v_supabase_url FROM vault.decrypted_secrets WHERE name = 'SUPABASE_URL' LIMIT 1;
  SELECT TRIM(decrypted_secret) INTO v_service_role_key FROM vault.decrypted_secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY' LIMIT 1;

  IF v_supabase_url IS NULL OR v_service_role_key IS NULL THEN
    RAISE WARNING 'Supabase Vault secrets are not configured.';
    RETURN;
  END IF;

  FOR v_auction IN 
    SELECT id 
    FROM auctions 
    WHERE status = 'live' 
    AND ends_at <= now()
  LOOP
    -- Call the Edge Function with BOTH headers (Authorization and apikey)
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
