-- Add announcement_text for the header popup
ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS announcement_text TEXT;
