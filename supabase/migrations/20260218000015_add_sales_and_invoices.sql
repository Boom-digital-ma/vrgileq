-- Migration: Add Sales and Invoicing System
-- Date: 2026-02-18

-- 1. Add tax_rate to site_settings
ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS tax_rate NUMERIC DEFAULT 0;

-- 2. Create Sale Status Type
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sale_status') THEN
        CREATE TYPE sale_status AS ENUM ('pending', 'paid', 'cancelled', 'refunded');
    END IF;
END
$$;

-- 3. Create Sales table
CREATE TABLE IF NOT EXISTS public.sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT UNIQUE NOT NULL,
    auction_id UUID REFERENCES public.auctions(id) NOT NULL,
    winner_id UUID REFERENCES public.profiles(id) NOT NULL,
    event_id UUID REFERENCES public.auction_events(id),
    
    hammer_price NUMERIC(12,2) NOT NULL,
    buyers_premium_rate NUMERIC(5,2) NOT NULL,
    buyers_premium_amount NUMERIC(12,2) NOT NULL,
    tax_rate NUMERIC(5,2) NOT NULL,
    tax_amount NUMERIC(12,2) NOT NULL,
    total_amount NUMERIC(12,2) NOT NULL,
    
    status sale_status DEFAULT 'pending',
    stripe_payment_intent_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Enable RLS
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- 5. Policies
DROP POLICY IF EXISTS "Users can view their own sales" ON public.sales;
CREATE POLICY "Users can view their own sales" ON public.sales FOR SELECT 
USING (auth.uid() = winner_id);

DROP POLICY IF EXISTS "Admins manage all sales" ON public.sales;
CREATE POLICY "Admins manage all sales" ON public.sales FOR ALL 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- 6. Helper for invoice numbers
CREATE SEQUENCE IF NOT EXISTS invoice_seq START 1001;

CREATE OR REPLACE FUNCTION generate_invoice_number() 
RETURNS TEXT AS $$
BEGIN
    RETURN 'INV-' || nextval('invoice_seq')::TEXT;
END;
$$ LANGUAGE plpgsql;

-- 7. Trigger to auto-create sale on auction sold
CREATE OR REPLACE FUNCTION handle_new_sale() 
RETURNS TRIGGER AS $$
DECLARE
    v_bp_rate NUMERIC;
    v_tax_rate NUMERIC;
    v_bp_amount NUMERIC;
    v_tax_amount NUMERIC;
    v_total NUMERIC;
BEGIN
    -- Only trigger when status changes to 'sold' and winner is set
    IF (NEW.status = 'sold' AND (OLD.status IS NULL OR OLD.status != 'sold') AND NEW.winner_id IS NOT NULL) THEN
        -- Get current settings (using default 15 and 0 if not found)
        SELECT 
            COALESCE(buyers_premium, 15), 
            COALESCE(tax_rate, 0) 
        INTO v_bp_rate, v_tax_rate 
        FROM public.site_settings 
        WHERE id = 'global';
        
        -- Calculations
        v_bp_amount := NEW.current_price * (v_bp_rate / 100);
        v_tax_amount := (NEW.current_price + v_bp_amount) * (v_tax_rate / 100);
        v_total := NEW.current_price + v_bp_amount + v_tax_amount;
        
        -- Create Sale record
        INSERT INTO public.sales (
            invoice_number,
            auction_id,
            winner_id,
            event_id,
            hammer_price,
            buyers_premium_rate,
            buyers_premium_amount,
            tax_rate,
            tax_amount,
            total_amount,
            status
        ) VALUES (
            generate_invoice_number(),
            NEW.id,
            NEW.winner_id,
            NEW.event_id,
            NEW.current_price,
            v_bp_rate,
            v_bp_amount,
            v_tax_rate,
            v_tax_amount,
            v_total,
            'pending'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_auction_sold ON public.auctions;
CREATE TRIGGER on_auction_sold
    AFTER UPDATE ON public.auctions
    FOR EACH ROW
    EXECUTE PROCEDURE handle_new_sale();
