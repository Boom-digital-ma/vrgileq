-- ==========================================
-- 1. GESTION DES TYPES ET COLONNES
-- ==========================================

-- Création du type ENUM pour les rôles (sécurisé)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'moderator', 'client');
    END IF;
END $$;

-- Ajout de la colonne role à la table profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'client';


-- ==========================================
-- 2. AUTOMATISATION DES PROFILS
-- ==========================================

-- Fonction pour créer un profil automatiquement à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'New User'), 
    'client'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Suppression du trigger s'il existe et recréation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ==========================================
-- 3. ATTRIBUTION DU RÔLE ADMIN
-- ==========================================

-- NOTE : Remplace 'nabil@example.com' par TON email d'inscription
-- Ce script va chercher ton ID Auth et créer/mettre à jour ton profil en ADMIN

INSERT INTO public.profiles (id, full_name, role)
SELECT id, 'Administrator', 'admin'
FROM auth.users 
WHERE email = 'nabil@boom-digital.ma' -- <--- CHANGE CET EMAIL
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- Vérification : Liste des admins pour confirmer
SELECT id, full_name, role FROM public.profiles WHERE role = 'admin';
