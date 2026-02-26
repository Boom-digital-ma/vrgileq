-- Final Security Fix: Set explicit search_path for all SECURITY DEFINER functions
-- This prevents schema hijacking and resolves Supabase security warnings.

ALTER FUNCTION public.check_and_open_and_close_events() SET search_path = public;
ALTER FUNCTION public.check_and_close_auctions() SET search_path = public;
ALTER FUNCTION public.sync_auction_event_data() SET search_path = public;
ALTER FUNCTION public.sync_auction_event_dates() SET search_path = public;
ALTER FUNCTION public.place_bid_secure(uuid, uuid, numeric, text, numeric) SET search_path = public;
ALTER FUNCTION public.place_bid_secure(uuid, uuid, numeric, text) SET search_path = public;
ALTER FUNCTION public.is_admin() SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.check_and_notify_event_start() SET search_path = public;
ALTER FUNCTION public.check_and_notify_watchlist() SET search_path = public;
ALTER FUNCTION public.book_pickup_slot(uuid, uuid) SET search_path = public;
