-- Enable Realtime for critical bidding and event tables
BEGIN;
  -- Add auctions to the publication
  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'auctions'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE "public"."auctions";
    END IF;
  END
  $$;

  -- Add bids to the publication
  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'bids'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE "public"."bids";
    END IF;
  END
  $$;

  -- Add auction_events to the publication
  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'auction_events'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE "public"."auction_events";
    END IF;
  END
  $$;

  -- Ensure replica identity is set to FULL for updates to contain all data
  ALTER TABLE "public"."auctions" REPLICA IDENTITY FULL;
  ALTER TABLE "public"."auction_events" REPLICA IDENTITY FULL;
  ALTER TABLE "public"."bids" REPLICA IDENTITY FULL;
COMMIT;
