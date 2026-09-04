-- Store a durable account-registration timestamp for admin reporting.
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ;

-- Existing profiles predate the column; use their authoritative Auth creation time.
UPDATE public.profiles AS profile
SET created_at = auth_user.created_at
FROM auth.users AS auth_user
WHERE profile.id = auth_user.id
  AND profile.created_at IS NULL;

ALTER TABLE public.profiles
ALTER COLUMN created_at SET DEFAULT timezone('utc'::text, now()),
ALTER COLUMN created_at SET NOT NULL;

CREATE INDEX IF NOT EXISTS profiles_created_at_idx
ON public.profiles (created_at);
