-- Fix foreign key relationship between bids and profiles
-- This allows PostgREST to automatically detect the relationship for joins

-- 1. Drop existing FK to auth.users if it exists
ALTER TABLE public.bids DROP CONSTRAINT IF EXISTS bids_user_id_fkey;

-- 2. Add new FK explicitly to public.profiles
ALTER TABLE public.bids 
ADD CONSTRAINT bids_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;

-- 3. Also fix watchlist table for consistency
ALTER TABLE public.watchlist DROP CONSTRAINT IF EXISTS watchlist_user_id_fkey;
ALTER TABLE public.watchlist 
ADD CONSTRAINT watchlist_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
