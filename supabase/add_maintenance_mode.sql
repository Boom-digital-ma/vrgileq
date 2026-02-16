-- Add maintenance_mode to site_settings
ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS maintenance_mode BOOLEAN DEFAULT false;
