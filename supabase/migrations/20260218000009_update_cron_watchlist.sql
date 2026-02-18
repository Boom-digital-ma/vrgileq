-- Function to call Watchlist Notification Edge Function
CREATE OR REPLACE FUNCTION public.check_and_notify_watchlist()
RETURNS void AS $$
BEGIN
  -- We only need to call it once per run, the Edge Function handles the looping
  PERFORM net.http_post(
    url := (SELECT value FROM vault.secrets WHERE name = 'SUPABASE_URL') || '/functions/v1/notify-watchlist-closing',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT value FROM vault.secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY')
    ),
    body := jsonb_build_object('scan', true)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule the watchlist notification job every 10 minutes
-- Safer approach: unschedule only if it already exists to avoid errors
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'notify-watchlist-job') THEN
        PERFORM cron.unschedule('notify-watchlist-job');
    END IF;
END $$;

-- Create the schedule
SELECT cron.schedule(
  'notify-watchlist-job',
  '*/10 * * * *',
  'SELECT public.check_and_notify_watchlist()'
);
