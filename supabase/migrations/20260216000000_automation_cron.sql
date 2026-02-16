-- 1. Activer les extensions nécessaires
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Création de la fonction pour appeler l'Edge Function
CREATE OR REPLACE FUNCTION public.check_and_close_auctions()
RETURNS void AS $$
DECLARE
  v_auction RECORD;
BEGIN
  -- Trouver les enchères terminées qui sont encore 'live'
  FOR v_auction IN 
    SELECT id 
    FROM auctions 
    WHERE status = 'live' 
    AND ends_at <= now()
  LOOP
    -- Appeler l'Edge Function pour chaque lot
    -- Note: L'URL et la clé devront être configurées dans les secrets Supabase ou injectées.
    -- Ici on utilise une approche par variable d'environnement si possible,
    -- sinon on s'appuie sur le fait que l'admin configurera les secrets.
    PERFORM net.http_post(
      url := (SELECT value FROM vault.secrets WHERE name = 'SUPABASE_URL') || '/functions/v1/close-auction',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (SELECT value FROM vault.secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY')
      ),
      body := jsonb_build_object('auction_id', v_auction.id)
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Planifier le job toutes les minutes
SELECT cron.schedule(
  'close-expired-auctions-job',
  '* * * * *',
  'SELECT public.check_and_close_auctions()'
);
