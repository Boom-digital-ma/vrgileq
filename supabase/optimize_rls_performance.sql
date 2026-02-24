-- Performance Optimization for RLS Policies
-- This migration wraps auth.uid() in (SELECT auth.uid()) to prevent per-row re-evaluation.

-- 1. Optimized Admin Check Function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid()) AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update Profiles Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING ( (SELECT auth.uid()) = id );

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING ( public.is_admin() );

-- 3. Optimization for Bids
DROP POLICY IF EXISTS "Bids are viewable by everyone" ON bids;
CREATE POLICY "Bids are viewable by everyone" ON bids FOR SELECT USING (true);

-- 4. Optimization for Watchlist
DROP POLICY IF EXISTS "Users can view their own watchlist" ON watchlist;
DROP POLICY IF EXISTS "Users can insert their own watchlist" ON watchlist;
DROP POLICY IF EXISTS "Users can delete their own watchlist" ON watchlist;

CREATE POLICY "Users can view their own watchlist" 
ON watchlist FOR SELECT 
TO authenticated 
USING ( (SELECT auth.uid()) = user_id );

CREATE POLICY "Users can insert their own watchlist" 
ON watchlist FOR INSERT 
TO authenticated 
WITH CHECK ( (SELECT auth.uid()) = user_id );

CREATE POLICY "Users can delete their own watchlist" 
ON watchlist FOR DELETE 
TO authenticated 
USING ( (SELECT auth.uid()) = user_id );
