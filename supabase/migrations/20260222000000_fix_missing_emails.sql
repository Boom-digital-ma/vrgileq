-- Fix missing emails in profiles table by syncing from auth.users
-- This ensures that older users created before the email sync trigger was added will receive notifications.

DO $$
BEGIN
    UPDATE public.profiles
    SET email = au.email
    FROM auth.users au
    WHERE public.profiles.id = au.id
    AND public.profiles.email IS NULL;
END $$;
