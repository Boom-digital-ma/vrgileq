-- Final robustness fix for Event Start Reminders
-- This uses the Vault to avoid hardcoded URLs/Keys in the Cron Job.

CREATE OR REPLACE FUNCTION public.check_and_notify_event_start()
RETURNS void AS $$
BEGIN
  PERFORM net.http_post(
    url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_URL') || '/functions/v1/notify-event-start',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY')
    ),
    body := jsonb_build_object('scan', true)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the schedule to use this new function
-- First remove the old hardcoded one if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'notify-event-start') THEN
        PERFORM cron.unschedule('notify-event-start');
    END IF;
END $$;

SELECT cron.schedule(
    'notify-event-start',
    '*/10 * * * *',
    'SELECT public.check_and_notify_event_start()'
);
