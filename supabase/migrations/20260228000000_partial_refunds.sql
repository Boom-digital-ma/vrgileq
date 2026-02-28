-- 1. Create type for sale item status
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sale_item_status') THEN
        CREATE TYPE sale_item_status AS ENUM ('active', 'refunded');
    END IF;
END
$$;

-- 2. Add status to sale_items
ALTER TABLE public.sale_items 
ADD COLUMN IF NOT EXISTS status sale_item_status DEFAULT 'active';

-- 3. Add refund metadata to sales for tracking
ALTER TABLE public.sales
ADD COLUMN IF NOT EXISTS refunded_amount NUMERIC(12,2) DEFAULT 0.00;
