-- ==========================================================
-- SCRIPT D'ACTIVATION DE L'AUTOMATISATION DES ENCHÈRES (CORRIGÉ)
-- Virginia Liquidation MVP
-- ==========================================================

-- 1. NETTOYAGE DES ANCIENS SECRETS
-- On nettoie pour pouvoir utiliser create_secret proprement
DO $$
BEGIN
    DELETE FROM vault.secrets WHERE name = 'SUPABASE_URL';
    DELETE FROM vault.secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY';
EXCEPTION WHEN OTHERS THEN 
    NULL;
END $$;

-- 2. CONFIGURATION DES SECRETS VIA LES FONCTIONS OFFICIELLES
-- NOTE: REMPLACER LES VALEURS CI-DESSOUS DANS VOTRE ÉDITEUR SQL
BEGIN;
  -- On utilise vault.create_secret() car l'INSERT direct est bloqué par les permissions crypto
  SELECT vault.create_secret(
    'https://xiqvzoedklamiwpgizfy.supabase.co', 
    'SUPABASE_URL', 
    'URL API Supabase'
  );

  SELECT vault.create_secret(
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpcXZ6b2Vka2xhbWl3cGdpemZ5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTA5Mjc4NywiZXhwIjoyMDg2NjY4Nzg3fQ.ir1UNhwtKfpZgxt4XgP3iWUcQYRQKG7k-dL8u_Rdjvw', 
    'SUPABASE_SERVICE_ROLE_KEY', 
    'Clé Service Role API'
  );
COMMIT;

-- 3. ACTIVATION DU JOB AUTOMATIQUE (Cron)
-- Ce job scanne les enchères expirées toutes les 60 secondes
DO $$
BEGIN
    -- On supprime le job s'il existe déjà pour éviter les doublons
    PERFORM cron.unschedule('close-expired-auctions-job');
EXCEPTION WHEN OTHERS THEN
    -- On ignore si le job n'existait pas
END $$;

SELECT cron.schedule(
  'close-expired-auctions-job', -- Nom du job
  '* * * * *',                  -- Fréquence : toutes les minutes
  'SELECT public.check_and_close_auctions()' -- Fonction à exécuter
);

-- 4. VÉRIFICATION
-- Affiche si les secrets sont bien enregistrés
SELECT name, created_at FROM vault.secrets WHERE name IN ('SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY');
