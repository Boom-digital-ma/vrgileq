-- ========================================================
-- SCRIPT DE RÉPARATION DES POLITIQUES DE SÉCURITÉ (RLS)
-- ========================================================

-- 1. Désactivation et Nettoyage des anciennes politiques
DROP POLICY IF EXISTS "Enable read access for all users" ON public.auctions;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.categories;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.auction_images;
DROP POLICY IF EXISTS "Admins can do everything on auctions" ON public.auctions;
DROP POLICY IF EXISTS "Admins can do everything on categories" ON public.categories;

-- 2. Autoriser la LECTURE PUBLIQUE (Pour le site et l'admin)
-- Indispensable pour que les données s'affichent
CREATE POLICY "Public Read Auctions" ON public.auctions FOR SELECT USING (true);
CREATE POLICY "Public Read Categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public Read Images" ON public.auction_images FOR SELECT USING (true);
CREATE POLICY "Public Read Bids" ON public.bids FOR SELECT USING (true);

-- 3. Autoriser les ADMINS à modifier les données
-- On vérifie le rôle dans la table profiles
CREATE POLICY "Admin Full Access Auctions" ON public.auctions
FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admin Full Access Categories" ON public.categories
FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admin Full Access Images" ON public.auction_images
FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 4. Activer le Realtime pour les notifications en direct
-- Si cette commande échoue, c'est que le Realtime est déjà actif (pas grave)
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE auctions, categories, bids;
COMMIT;

-- 5. Vérification finale des données existantes
SELECT 'Auctions count' as label, count(*) FROM public.auctions
UNION ALL
SELECT 'Categories count' as label, count(*) FROM public.categories;
