-- ==========================================
-- SETUP SITE SETTINGS TABLE
-- ==========================================

-- 1. Create the table
-- We use a CHECK constraint to ensure only one row (id='global') exists
CREATE TABLE IF NOT EXISTS public.site_settings (
    id TEXT PRIMARY KEY DEFAULT 'global',
    buyers_premium NUMERIC DEFAULT 15,
    default_deposit NUMERIC DEFAULT 500,
    support_email TEXT DEFAULT 'support@virginialiquidation.com',
    support_phone TEXT DEFAULT '(703) 555-0123',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT one_row CHECK (id = 'global')
);

-- 2. Enable Row Level Security
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- 3. Policies

-- Allow admins to manage settings
DROP POLICY IF EXISTS "Admins can manage site_settings" ON public.site_settings;
CREATE POLICY "Admins can manage site_settings" 
ON public.site_settings
FOR ALL 
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

-- Allow everyone (including non-logged users) to read settings for the frontend
DROP POLICY IF EXISTS "Public can view site_settings" ON public.site_settings;
CREATE POLICY "Public can view site_settings"
ON public.site_settings
FOR SELECT
USING (true);

-- 4. Initial Seed
INSERT INTO public.site_settings (id, buyers_premium, default_deposit, support_email, support_phone)
VALUES ('global', 15, 500, 'support@virginialiquidation.com', '(703) 555-0123')
ON CONFLICT (id) DO NOTHING;

-- 5. Helper function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_site_settings_updated_at
    BEFORE UPDATE ON public.site_settings
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
