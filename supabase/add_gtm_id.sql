-- Add GTM ID field to site_settings
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS gtm_id TEXT;
