-- Admin Transparency and Preview Migration
-- Allows users with the 'admin' role to see draft/scheduled items and full bidder info on the public side.

-- 1. Helper function to check if current user is admin (security definer to bypass RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Update Auctions RLS
DROP POLICY IF EXISTS "Auctions are viewable by everyone" ON auctions;
CREATE POLICY "Auctions viewable by everyone if live/ended, or by admin always" 
ON auctions FOR SELECT 
USING (
  status IN ('live', 'sold', 'ended') 
  OR is_admin()
);

-- 3. Update Auction Events RLS
DROP POLICY IF EXISTS "Auction events are viewable by everyone" ON auction_events;
CREATE POLICY "Auction events viewable by everyone if not draft, or by admin always" 
ON auction_events FOR SELECT 
USING (
  status != 'draft' 
  OR is_admin()
);

-- 4. Update Bids RLS (Admins see all info, users see limited info via views/logic)
DROP POLICY IF EXISTS "Bids are viewable by everyone" ON bids;
CREATE POLICY "Bids are viewable by everyone" 
ON bids FOR SELECT 
USING (true); -- We control visibility of sensitive info (names) in the UI components

-- 5. Profiles RLS (Crucial: allow admin to see other profiles for name resolution in bid history)
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users view own profile or admin view all" 
ON profiles FOR SELECT 
USING (
  auth.uid() = id 
  OR is_admin()
);
