-- SUPABASE PERFORMANCE ADVISOR: TOTAL CLEANUP (v3)
-- This script nukes all possible legacy policy names and rebuilds a clean, single-policy-per-action structure.

DO $$ 
DECLARE 
    pol record;
BEGIN
    -- This dynamic loop drops EVERY policy in the public schema to ensure a fresh start
    -- Only affects 'public' schema tables to be safe.
    FOR pol IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

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


-- 1. TABLE: AUCTION_EVENTS
CREATE POLICY "policy_events_select" ON auction_events FOR SELECT USING (true);
CREATE POLICY "policy_events_insert" ON auction_events FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "policy_events_update" ON auction_events FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "policy_events_delete" ON auction_events FOR DELETE TO authenticated USING (public.is_admin());


-- 2. TABLE: AUCTION_IMAGES
CREATE POLICY "policy_images_select" ON auction_images FOR SELECT USING (true);
CREATE POLICY "policy_images_insert" ON auction_images FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "policy_images_update" ON auction_images FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "policy_images_delete" ON auction_images FOR DELETE TO authenticated USING (public.is_admin());


-- 3. TABLE: AUCTIONS
CREATE POLICY "policy_auctions_select" ON auctions FOR SELECT USING (true);
CREATE POLICY "policy_auctions_insert" ON auctions FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "policy_auctions_update" ON auctions FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "policy_auctions_delete" ON auctions FOR DELETE TO authenticated USING (public.is_admin());


-- 4. TABLE: BIDS
CREATE POLICY "policy_bids_select" ON bids FOR SELECT USING (true);
-- Note: Bids are inserted via secure RPC, so no INSERT policy needed for users.


-- 5. TABLE: CATEGORIES
CREATE POLICY "policy_categories_select" ON categories FOR SELECT USING (true);
CREATE POLICY "policy_categories_insert" ON categories FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "policy_categories_update" ON categories FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "policy_categories_delete" ON categories FOR DELETE TO authenticated USING (public.is_admin());


-- 6. TABLE: PICKUP_SLOTS
CREATE POLICY "policy_slots_select" ON pickup_slots FOR SELECT USING (true);
CREATE POLICY "policy_slots_insert" ON pickup_slots FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "policy_slots_update" ON pickup_slots FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "policy_slots_delete" ON pickup_slots FOR DELETE TO authenticated USING (public.is_admin());


-- 7. TABLE: SALE_ITEMS
CREATE POLICY "policy_sale_items_select" ON sale_items FOR SELECT TO authenticated
USING ( 
  public.is_admin() OR 
  EXISTS (
    SELECT 1 FROM public.sales
    WHERE sales.id = sale_items.sale_id
    AND sales.winner_id = (SELECT auth.uid())
  )
);


-- 8. TABLE: SALES
CREATE POLICY "policy_sales_select" ON sales FOR SELECT TO authenticated USING ((SELECT auth.uid()) = winner_id OR public.is_admin());
CREATE POLICY "policy_sales_insert" ON sales FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "policy_sales_update" ON sales FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "policy_sales_delete" ON sales FOR DELETE TO authenticated USING (public.is_admin());


-- 9. TABLE: SITE_SETTINGS
CREATE POLICY "policy_settings_select" ON site_settings FOR SELECT USING (true);
CREATE POLICY "policy_settings_insert" ON site_settings FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "policy_settings_update" ON site_settings FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "policy_settings_delete" ON site_settings FOR DELETE TO authenticated USING (public.is_admin());


-- 10. TABLE: PROFILES
CREATE POLICY "policy_profiles_select" ON public.profiles FOR SELECT TO authenticated USING ((SELECT auth.uid()) = id OR public.is_admin());
CREATE POLICY "policy_profiles_update" ON public.profiles FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = id OR public.is_admin());


-- 11. TABLE: NOTIFICATIONS
CREATE POLICY "policy_notifications_select" ON notifications FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "policy_notifications_update" ON notifications FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id);


-- 12. TABLE: EVENT_REGISTRATIONS
CREATE POLICY "policy_registrations_select" ON event_registrations FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id OR public.is_admin());
CREATE POLICY "policy_registrations_insert" ON event_registrations FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);


-- 13. TABLE: EVENT_REMINDERS
CREATE POLICY "policy_reminders_select" ON event_reminders FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "policy_reminders_insert" ON event_reminders FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "policy_reminders_delete" ON event_reminders FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);
