-- Fix for "Function Search Path Mutable" Warnings
-- This script hardens functions by explicitly setting the search_path to 'public'.
-- This prevents potential hijacking attacks by malicious users.

-- 1. Authentication & Profiles
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.is_admin() SET search_path = public;

-- 2. Bidding Engine
-- We use signatures because functions might be overloaded
ALTER FUNCTION public.place_bid_secure(uuid, uuid, numeric, text, numeric) SET search_path = public;
ALTER FUNCTION public.place_bid_secure(uuid, uuid, numeric, text) SET search_path = public;
ALTER FUNCTION public.handle_outbid_notification() SET search_path = public;

-- 3. Auctions & Events Status Management
ALTER FUNCTION public.sync_auction_event_dates() SET search_path = public;
ALTER FUNCTION public.sync_auction_event_data() SET search_path = public;
ALTER FUNCTION public.check_and_close_auctions() SET search_path = public;
ALTER FUNCTION public.check_and_open_and_close_events() SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;

-- 4. Notifications & Watchlist Logic
ALTER FUNCTION public.check_and_notify_watchlist() SET search_path = public;
ALTER FUNCTION public.check_and_notify_event_start() SET search_path = public;

-- 5. Invoicing & Billing
ALTER FUNCTION public.generate_event_invoices(uuid) SET search_path = public;
ALTER FUNCTION public.generate_invoice_number() SET search_path = public;
ALTER FUNCTION public.handle_new_sale() SET search_path = public;

-- 6. Logistics & Scheduling
ALTER FUNCTION public.book_pickup_slot(uuid, uuid) SET search_path = public;
ALTER FUNCTION public.get_slot_booking_count(uuid) SET search_path = public;
