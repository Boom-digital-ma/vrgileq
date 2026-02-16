-- 1. Mise à jour des valeurs de l'enum user_role
-- Note: PostgreSQL ne permet pas de renommer directement une valeur d'enum facilement
-- On va donc ajouter 'client' et garder 'bidder' comme alias ou migrer les données.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'user_role' AND e.enumlabel = 'client') THEN
        ALTER TYPE user_role ADD VALUE 'client';
    END IF;
END
$$;

-- 2. Migrer les anciens 'bidder' vers 'client'
UPDATE public.profiles SET role = 'client' WHERE role::text = 'bidder';

-- 3. Mise à jour des politiques RLS pour inclure le terme 'moderator'
DROP POLICY IF EXISTS "Admins manage auctions" ON public.auctions;
CREATE POLICY "Admins and Moderators manage auctions" ON public.auctions 
FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'moderator'))
);
