-- Add default_payment_method_id to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS default_payment_method_id TEXT;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
