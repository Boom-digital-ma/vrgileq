-- Setup storage bucket for auctions
INSERT INTO storage.buckets (id, name, public) 
VALUES ('auctions', 'auctions', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for the bucket
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'auctions');
CREATE POLICY "Admin Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'auctions');
CREATE POLICY "Admin Delete" ON storage.objects FOR DELETE USING (bucket_id = 'auctions');
