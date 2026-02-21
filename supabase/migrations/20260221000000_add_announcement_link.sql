-- Add announcement_link and maintenance_details to site_settings
ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS announcement_link TEXT,
ADD COLUMN IF NOT EXISTS maintenance_details TEXT;
