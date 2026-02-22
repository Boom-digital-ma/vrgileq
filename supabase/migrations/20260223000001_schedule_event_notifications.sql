-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the notify-event-start function to run every 10 minutes
SELECT cron.schedule(
    'notify-event-start', -- unique job name
    '*/10 * * * *',      -- every 10 minutes
    $$
    SELECT
      net.http_post(
          url:='https://project-ref.supabase.co/functions/v1/notify-event-start',
          headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
          body:='{}'::jsonb
      ) as request_id;
    $$
);
