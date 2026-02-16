-- 1. Création du bucket pour les images des enchères
INSERT INTO storage.buckets (id, name, public) 
VALUES ('auction-images', 'auction-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Politique : Autoriser la lecture publique des images
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'auction-images' );

-- 3. Politique : Autoriser les Admins/Moderators à Uploader des images
CREATE POLICY "Admin Upload" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (
    bucket_id = 'auction-images' AND 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'moderator')
);

-- 4. Politique : Autoriser les Admins/Moderators à Supprimer/Modifier
CREATE POLICY "Admin Update Delete" 
ON storage.objects FOR ALL 
TO authenticated 
USING (
    bucket_id = 'auction-images' AND 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'moderator')
);
