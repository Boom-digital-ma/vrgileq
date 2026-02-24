-- PERFORMANCE OPTIMIZATION: Missing Foreign Key Indexes
-- This script adds indexes to all foreign keys to speed up JOINs and relationship lookups.

-- 1. Auction Images
CREATE INDEX IF NOT EXISTS idx_auction_images_auction_id ON public.auction_images(auction_id);

-- 2. Auctions
CREATE INDEX IF NOT EXISTS idx_auctions_category_id ON public.auctions(category_id);
CREATE INDEX IF NOT EXISTS idx_auctions_created_by ON public.auctions(created_by);
CREATE INDEX IF NOT EXISTS idx_auctions_winner_id ON public.auctions(winner_id);

-- 3. Bids
CREATE INDEX IF NOT EXISTS idx_bids_auction_id ON public.bids(auction_id);
CREATE INDEX IF NOT EXISTS idx_bids_user_id ON public.bids(user_id);

-- 4. Event Registrations
CREATE INDEX IF NOT EXISTS idx_event_registrations_user_id ON public.event_registrations(user_id);

-- 5. Event Reminders
CREATE INDEX IF NOT EXISTS idx_event_reminders_event_id ON public.event_reminders(event_id);

-- 6. Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_auction_id ON public.notifications(auction_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

-- 7. Pickup Slots
CREATE INDEX IF NOT EXISTS idx_pickup_slots_event_id ON public.pickup_slots(event_id);

-- 8. Sale Items
CREATE INDEX IF NOT EXISTS idx_sale_items_auction_id ON public.sale_items(auction_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON public.sale_items(sale_id);

-- 9. Sales
CREATE INDEX IF NOT EXISTS idx_sales_auction_id ON public.sales(auction_id);
CREATE INDEX IF NOT EXISTS idx_sales_event_id ON public.sales(event_id);
CREATE INDEX IF NOT EXISTS idx_sales_pickup_slot_id ON public.sales(pickup_slot_id);
CREATE INDEX IF NOT EXISTS idx_sales_winner_id ON public.sales(winner_id);

-- 10. Watchlist
CREATE INDEX IF NOT EXISTS idx_watchlist_auction_id ON public.watchlist(auction_id);
