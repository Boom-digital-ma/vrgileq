-- Patch to add missing columns to the existing site_settings table
ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS auto_extend_threshold_mins INTEGER DEFAULT 2,
ADD COLUMN IF NOT EXISTS auto_extend_duration_mins INTEGER DEFAULT 2,
ADD COLUMN IF NOT EXISTS global_announcement TEXT;
