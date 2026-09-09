-- Store the latest successful account sign-in for admin reporting.
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS last_sign_in_at TIMESTAMPTZ;

-- Backfill the authoritative Supabase Auth value for existing accounts.
UPDATE public.profiles AS profile
SET last_sign_in_at = auth_user.last_sign_in_at
FROM auth.users AS auth_user
WHERE profile.id = auth_user.id
  AND profile.last_sign_in_at IS NULL
  AND auth_user.last_sign_in_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS profiles_last_sign_in_at_idx
ON public.profiles (last_sign_in_at DESC);
