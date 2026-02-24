-- FINAL SECURITY & PERFORMANCE CONSOLIDATION (v2 - Corrected Syntax)
-- This script merges overlapping policies and optimizes RLS for high traffic.
-- It follows the strict Postgres syntax requirement of one action per policy.

-- 0. STABILIZE ADMIN CHECK
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid()) AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- 1. AUCTION_EVENTS
DROP POLICY IF EXISTS "policy_events_select" ON auction_events;
DROP POLICY IF EXISTS "policy_events_insert" ON auction_events;
DROP POLICY IF EXISTS "policy_events_update" ON auction_events;
DROP POLICY IF EXISTS "policy_events_delete" ON auction_events;
DROP POLICY IF EXISTS "policy_events_modify" ON auction_events;
DROP POLICY IF EXISTS "Public Read Events" ON auction_events;
DROP POLICY IF EXISTS "Admins manage events" ON auction_events;

CREATE POLICY "policy_events_select" ON auction_events FOR SELECT USING (true);
CREATE POLICY "policy_events_insert" ON auction_events FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "policy_events_update" ON auction_events FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "policy_events_delete" ON auction_events FOR DELETE TO authenticated USING (public.is_admin());


-- 2. AUCTION_IMAGES
DROP POLICY IF EXISTS "policy_images_select" ON auction_images;
DROP POLICY IF EXISTS "policy_images_insert" ON auction_images;
DROP POLICY IF EXISTS "policy_images_update" ON auction_images;
DROP POLICY IF EXISTS "policy_images_delete" ON auction_images;
DROP POLICY IF EXISTS "policy_images_modify" ON auction_images;
DROP POLICY IF EXISTS "Public Read Images" ON auction_images;
DROP POLICY IF EXISTS "Admin Full Access Images" ON auction_images;

CREATE POLICY "policy_images_select" ON auction_images FOR SELECT USING (true);
CREATE POLICY "policy_images_insert" ON auction_images FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "policy_images_update" ON auction_images FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "policy_images_delete" ON auction_images FOR DELETE TO authenticated USING (public.is_admin());


-- 3. AUCTIONS
DROP POLICY IF EXISTS "policy_auctions_select" ON auctions;
DROP POLICY IF EXISTS "policy_auctions_insert" ON auctions;
DROP POLICY IF EXISTS "policy_auctions_update" ON auctions;
DROP POLICY IF EXISTS "policy_auctions_delete" ON auctions;
DROP POLICY IF EXISTS "policy_auctions_modify" ON auctions;
DROP POLICY IF EXISTS "Public Read Auctions" ON auctions;
DROP POLICY IF EXISTS "Admin Full Access Auctions" ON auctions;
DROP POLICY IF EXISTS "Admins and Moderators manage auctions" ON auctions;
DROP POLICY IF EXISTS "Auctions are viewable by everyone" ON auctions;

CREATE POLICY "policy_auctions_select" ON auctions FOR SELECT USING (true);
CREATE POLICY "policy_auctions_insert" ON auctions FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "policy_auctions_update" ON auctions FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "policy_auctions_delete" ON auctions FOR DELETE TO authenticated USING (public.is_admin());


-- 4. BIDS
DROP POLICY IF EXISTS "policy_bids_select" ON bids;
DROP POLICY IF EXISTS "Bids are viewable by everyone" ON bids;
DROP POLICY IF EXISTS "Public Read Bids" ON bids;

CREATE POLICY "policy_bids_select" ON bids FOR SELECT USING (true);


-- 5. CATEGORIES
DROP POLICY IF EXISTS "policy_categories_select" ON categories;
DROP POLICY IF EXISTS "policy_categories_insert" ON categories;
DROP POLICY IF EXISTS "policy_categories_update" ON categories;
DROP POLICY IF EXISTS "policy_categories_delete" ON categories;
DROP POLICY IF EXISTS "policy_categories_modify" ON categories;
DROP POLICY IF EXISTS "Public Read Categories" ON categories;
DROP POLICY IF EXISTS "Admin Full Access Categories" ON categories;
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;

CREATE POLICY "policy_categories_select" ON categories FOR SELECT USING (true);
CREATE POLICY "policy_categories_insert" ON categories FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "policy_categories_update" ON categories FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "policy_categories_delete" ON categories FOR DELETE TO authenticated USING (public.is_admin());


-- 6. PICKUP_SLOTS
DROP POLICY IF EXISTS "policy_slots_select" ON pickup_slots;
DROP POLICY IF EXISTS "policy_slots_insert" ON pickup_slots;
DROP POLICY IF EXISTS "policy_slots_update" ON pickup_slots;
DROP POLICY IF EXISTS "policy_slots_delete" ON pickup_slots;
DROP POLICY IF EXISTS "policy_slots_modify" ON pickup_slots;
DROP POLICY IF EXISTS "Public can view pickup slots" ON pickup_slots;
DROP POLICY IF EXISTS "Admins manage pickup slots" ON pickup_slots;

CREATE POLICY "policy_slots_select" ON pickup_slots FOR SELECT USING (true);
CREATE POLICY "policy_slots_insert" ON pickup_slots FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "policy_slots_update" ON pickup_slots FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "policy_slots_delete" ON pickup_slots FOR DELETE TO authenticated USING (public.is_admin());


-- 7. SALE_ITEMS
DROP POLICY IF EXISTS "policy_sale_items_select" ON sale_items;
DROP POLICY IF EXISTS "Admins can view all sale items" ON sale_items;
DROP POLICY IF EXISTS "Users can view their own sale items" ON sale_items;

CREATE POLICY "policy_sale_items_select" ON sale_items FOR SELECT TO authenticated
USING ( 
  public.is_admin() OR 
  EXISTS (
    SELECT 1 FROM public.sales
    WHERE sales.id = sale_items.sale_id
    AND sales.winner_id = (SELECT auth.uid())
  )
);


-- 8. SALES
DROP POLICY IF EXISTS "policy_sales_select" ON sales;
DROP POLICY IF EXISTS "policy_sales_insert" ON sales;
DROP POLICY IF EXISTS "policy_sales_update" ON sales;
DROP POLICY IF EXISTS "policy_sales_delete" ON sales;
DROP POLICY IF EXISTS "policy_sales_modify" ON sales;
DROP POLICY IF EXISTS "Users can view their own sales" ON sales;
DROP POLICY IF EXISTS "Admins manage all sales" ON sales;

CREATE POLICY "policy_sales_select" ON sales FOR SELECT TO authenticated USING ((SELECT auth.uid()) = winner_id OR public.is_admin());
CREATE POLICY "policy_sales_insert" ON sales FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "policy_sales_update" ON sales FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "policy_sales_delete" ON sales FOR DELETE TO authenticated USING (public.is_admin());


-- 9. SITE_SETTINGS
DROP POLICY IF EXISTS "policy_settings_select" ON site_settings;
DROP POLICY IF EXISTS "policy_settings_insert" ON site_settings;
DROP POLICY IF EXISTS "policy_settings_update" ON site_settings;
DROP POLICY IF EXISTS "policy_settings_delete" ON site_settings;
DROP POLICY IF EXISTS "policy_settings_modify" ON site_settings;
DROP POLICY IF EXISTS "Public can view site_settings" ON site_settings;
DROP POLICY IF EXISTS "Admins can manage site_settings" ON site_settings;

CREATE POLICY "policy_settings_select" ON site_settings FOR SELECT USING (true);
CREATE POLICY "policy_settings_insert" ON site_settings FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "policy_settings_update" ON site_settings FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "policy_settings_delete" ON site_settings FOR DELETE TO authenticated USING (public.is_admin());


-- 10. PROFILES
DROP POLICY IF EXISTS "policy_profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "policy_profiles_update" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

CREATE POLICY "policy_profiles_select" ON public.profiles FOR SELECT TO authenticated USING ((SELECT auth.uid()) = id OR public.is_admin());
CREATE POLICY "policy_profiles_update" ON public.profiles FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = id OR public.is_admin());
