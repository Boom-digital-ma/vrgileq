-- Add proxy_bidding_enabled to site_settings
ALTER TABLE public.site_settings 
ADD COLUMN proxy_bidding_enabled BOOLEAN DEFAULT TRUE;
