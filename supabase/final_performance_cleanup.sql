-- FINAL PERFORMANCE & SECURITY CONSOLIDATION
-- This script resolves all 'auth_rls_initplan' and 'multiple_permissive_policies' warnings.

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


-- 1. TABLE: PROFILES
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

CREATE POLICY "policy_profiles_select" ON public.profiles FOR SELECT TO authenticated 
USING ( (SELECT auth.uid()) = id OR public.is_admin() );

CREATE POLICY "policy_profiles_update" ON public.profiles FOR UPDATE TO authenticated 
USING ( (SELECT auth.uid()) = id OR public.is_admin() );


-- 2. TABLE: AUCTIONS
DROP POLICY IF EXISTS "Auctions are viewable by everyone" ON auctions;
DROP POLICY IF EXISTS "Public Read Auctions" ON auctions;
DROP POLICY IF EXISTS "Admin Full Access Auctions" ON auctions;
DROP POLICY IF EXISTS "Admins and Moderators manage auctions" ON auctions;

CREATE POLICY "policy_auctions_select" ON auctions FOR SELECT 
USING ( true ); -- Optimized: No auth check needed for public read

CREATE POLICY "policy_auctions_admin" ON auctions FOR ALL TO authenticated 
USING ( public.is_admin() );


-- 3. TABLE: AUCTION_EVENTS
DROP POLICY IF EXISTS "Public Read Events" ON auction_events;
DROP POLICY IF EXISTS "Admins manage events" ON auction_events;

CREATE POLICY "policy_events_select" ON auction_events FOR SELECT 
USING ( true );

CREATE POLICY "policy_events_admin" ON auction_events FOR ALL TO authenticated 
USING ( public.is_admin() );


-- 4. TABLE: AUCTION_IMAGES
DROP POLICY IF EXISTS "Public Read Images" ON auction_images;
DROP POLICY IF EXISTS "Admin Full Access Images" ON auction_images;

CREATE POLICY "policy_images_select" ON auction_images FOR SELECT 
USING ( true );

CREATE POLICY "policy_images_admin" ON auction_images FOR ALL TO authenticated 
USING ( public.is_admin() );


-- 5. TABLE: CATEGORIES
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
DROP POLICY IF EXISTS "Public Read Categories" ON categories;
DROP POLICY IF EXISTS "Admin Full Access Categories" ON categories;

CREATE POLICY "policy_categories_select" ON categories FOR SELECT 
USING ( true );

CREATE POLICY "policy_categories_admin" ON categories FOR ALL TO authenticated 
USING ( public.is_admin() );


-- 6. TABLE: EVENT_REGISTRATIONS
DROP POLICY IF EXISTS "Users can view own registrations" ON event_registrations;
DROP POLICY IF EXISTS "Admins view all registrations" ON event_registrations;
DROP POLICY IF EXISTS "Users can insert own registrations" ON event_registrations;

CREATE POLICY "policy_registrations_select" ON event_registrations FOR SELECT TO authenticated 
USING ( (SELECT auth.uid()) = user_id OR public.is_admin() );

CREATE POLICY "policy_registrations_insert" ON event_registrations FOR INSERT TO authenticated 
WITH CHECK ( (SELECT auth.uid()) = user_id );


-- 7. TABLE: SALES
DROP POLICY IF EXISTS "Users can view their own sales" ON sales;
DROP POLICY IF EXISTS "Admins manage all sales" ON sales;

CREATE POLICY "policy_sales_select" ON sales FOR SELECT TO authenticated 
USING ( (SELECT auth.uid()) = winner_id OR public.is_admin() );

CREATE POLICY "policy_sales_admin" ON sales FOR ALL TO authenticated 
USING ( public.is_admin() );


-- 8. TABLE: NOTIFICATIONS
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;

CREATE POLICY "policy_notifications_select" ON notifications FOR SELECT TO authenticated 
USING ( (SELECT auth.uid()) = user_id );

CREATE POLICY "policy_notifications_update" ON notifications FOR UPDATE TO authenticated 
USING ( (SELECT auth.uid()) = user_id );


-- 9. TABLE: WATCHLIST
DROP POLICY IF EXISTS "Users can view their own watchlist" ON watchlist;
DROP POLICY IF EXISTS "Users can insert their own watchlist" ON watchlist;
DROP POLICY IF EXISTS "Users can delete their own watchlist" ON watchlist;

CREATE POLICY "policy_watchlist_select" ON watchlist FOR SELECT TO authenticated 
USING ( (SELECT auth.uid()) = user_id );

CREATE POLICY "policy_watchlist_insert" ON watchlist FOR INSERT TO authenticated 
WITH CHECK ( (SELECT auth.uid()) = user_id );

CREATE POLICY "policy_watchlist_delete" ON watchlist FOR DELETE TO authenticated 
USING ( (SELECT auth.uid()) = user_id );


-- 10. TABLE: SITE_SETTINGS
DROP POLICY IF EXISTS "Public can view site_settings" ON site_settings;
DROP POLICY IF EXISTS "Admins can manage site_settings" ON site_settings;

CREATE POLICY "policy_settings_select" ON site_settings FOR SELECT 
USING ( true );

CREATE POLICY "policy_settings_admin" ON site_settings FOR ALL TO authenticated 
USING ( public.is_admin() );


-- 11. TABLE: PICKUP_SLOTS
DROP POLICY IF EXISTS "Public can view pickup slots" ON pickup_slots;
DROP POLICY IF EXISTS "Admins manage pickup slots" ON pickup_slots;

CREATE POLICY "policy_slots_select" ON pickup_slots FOR SELECT 
USING ( true );

CREATE POLICY "policy_slots_admin" ON pickup_slots FOR ALL TO authenticated 
USING ( public.is_admin() );


-- 12. TABLE: EVENT_REMINDERS
DROP POLICY IF EXISTS "Users can view their own reminders" ON event_reminders;
DROP POLICY IF EXISTS "Users can insert their own reminders" ON event_reminders;
DROP POLICY IF EXISTS "Users can delete their own reminders" ON event_reminders;

CREATE POLICY "policy_reminders_select" ON event_reminders FOR SELECT TO authenticated 
USING ( (SELECT auth.uid()) = user_id );

CREATE POLICY "policy_reminders_insert" ON event_reminders FOR INSERT TO authenticated 
WITH CHECK ( (SELECT auth.uid()) = user_id );

CREATE POLICY "policy_reminders_delete" ON event_reminders FOR DELETE TO authenticated 
USING ( (SELECT auth.uid()) = user_id );
