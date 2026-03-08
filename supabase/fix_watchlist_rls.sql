-- Fix for "RLS Enabled No Policy" on public.watchlist
-- This script adds the missing policies to allow users to manage their own watchlist items.

-- 1. Enable RLS (already done, but good practice to include)
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

-- 2. Policy: Allow users to view only their own watchlist items
DROP POLICY IF EXISTS "Users can view their own watchlist" ON public.watchlist;
CREATE POLICY "Users can view their own watchlist" 
ON public.watchlist FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- 3. Policy: Allow users to add items for themselves
DROP POLICY IF EXISTS "Users can add items to their own watchlist" ON public.watchlist;
CREATE POLICY "Users can add items to their own watchlist" 
ON public.watchlist FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- 4. Policy: Allow users to remove their own items
DROP POLICY IF EXISTS "Users can remove their own watchlist items" ON public.watchlist;
CREATE POLICY "Users can remove their own watchlist items" 
ON public.watchlist FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- 5. Admin override: Admins can see all watchlist items for support
DROP POLICY IF EXISTS "Admins can view all watchlist items" ON public.watchlist;
CREATE POLICY "Admins can view all watchlist items" 
ON public.watchlist FOR SELECT 
TO authenticated 
USING ( (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' );
