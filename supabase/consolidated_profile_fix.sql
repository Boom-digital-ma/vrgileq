-- Consolidated Profile Fix & Backfill
-- This script ensures all users have a profile and the trigger is correctly configured.

-- 1. Ensure the role type and columns exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'moderator', 'client');
    END IF;
END $$;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS address_line TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS zip_code TEXT,
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'USA',
ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'client',
ADD COLUMN IF NOT EXISTS default_payment_method_id TEXT;

-- 2. Update/Create the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    full_name, 
    email, 
    phone, 
    address_line, 
    city, 
    state, 
    zip_code, 
    country,
    role
  )
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'New User'), 
    new.email,
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'address_line',
    new.raw_user_meta_data->>'city',
    new.raw_user_meta_data->>'state',
    new.raw_user_meta_data->>'zip_code',
    COALESCE(new.raw_user_meta_data->>'country', 'USA'),
    (COALESCE(new.raw_user_meta_data->>'role', 'client'))::user_role
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Ensure trigger is active
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. BACKFILL: Create profiles for existing users who don't have one
INSERT INTO public.profiles (id, full_name, email, role)
SELECT 
    id, 
    COALESCE(raw_user_meta_data->>'full_name', 'New User'), 
    email,
    'client'::user_role
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- 5. Sync emails for existing profiles that have NULL email
UPDATE public.profiles p
SET email = au.email
FROM auth.users au
WHERE p.id = au.id AND p.email IS NULL;
