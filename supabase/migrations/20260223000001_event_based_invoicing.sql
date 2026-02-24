-- Migration: Transition from Lot-based to Event-based Invoicing
-- Date: 2026-02-23

-- 1. Create sale_items table to link multiple auctions to one sale
CREATE TABLE IF NOT EXISTS public.sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID REFERENCES public.sales(id) ON DELETE CASCADE,
    auction_id UUID REFERENCES public.auctions(id),
    hammer_price NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Modify sales table to be more event-centric
-- We make auction_id nullable because it's replaced by sale_items
ALTER TABLE public.sales ALTER COLUMN auction_id DROP NOT NULL;

-- 3. Deactivate old trigger to prevent automatic lot-based sales
DROP TRIGGER IF EXISTS on_auction_sold ON public.auctions;

-- 4. New Procedure: Generate Consolidated Invoices for an Event
CREATE OR REPLACE FUNCTION public.generate_event_invoices(p_event_id UUID)
RETURNS TABLE (v_sale_id UUID, v_winner_id UUID, v_total NUMERIC) AS $$
DECLARE
    v_winner RECORD;
    v_bp_rate NUMERIC;
    v_tax_rate NUMERIC;
    v_curr_sale_id UUID;
    v_total_hammer NUMERIC;
    v_bp_amount NUMERIC;
    v_tax_amount NUMERIC;
    v_grand_total NUMERIC;
BEGIN
    -- Get current global settings
    SELECT COALESCE(buyers_premium, 15), COALESCE(tax_rate, 0) 
    INTO v_bp_rate, v_tax_rate 
    FROM public.site_settings WHERE id = 'global';

    -- Loop through each winner who hasn't been invoiced yet for this event
    FOR v_winner IN 
        SELECT winner_id 
        FROM public.auctions 
        WHERE event_id = p_event_id 
          AND status = 'sold' 
          AND winner_id IS NOT NULL
          AND id NOT IN (SELECT auction_id FROM public.sale_items) -- Not already in a consolidated invoice
        GROUP BY winner_id
    LOOP
        -- Calculate total hammer price for this winner in this event
        SELECT SUM(current_price) INTO v_total_hammer
        FROM public.auctions 
        WHERE event_id = p_event_id AND winner_id = v_winner.winner_id AND status = 'sold';

        -- Calculations
        v_bp_amount := v_total_hammer * (v_bp_rate / 100);
        v_tax_amount := (v_total_hammer + v_bp_amount) * (v_tax_rate / 100);
        v_grand_total := v_total_hammer + v_bp_amount + v_tax_amount;

        -- A. Create the Master Sale Record
        INSERT INTO public.sales (
            invoice_number,
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
            v_winner.winner_id,
            p_event_id,
            v_total_hammer,
            v_bp_rate,
            v_bp_amount,
            v_tax_rate,
            v_tax_amount,
            v_grand_total,
            'pending'
        ) RETURNING id INTO v_curr_sale_id;

        -- B. Attach all lots won by this user to this invoice
        INSERT INTO public.sale_items (sale_id, auction_id, hammer_price)
        SELECT v_curr_sale_id, id, current_price
        FROM public.auctions
        WHERE event_id = p_event_id AND winner_id = v_winner.winner_id AND status = 'sold';

        -- Mark auctions as "fully processed" (optional, but good for tracking)
        -- They are already linked via sale_items now.

        v_sale_id := v_curr_sale_id;
        v_winner_id := v_winner.winner_id;
        v_total := v_grand_total;
        RETURN NEXT;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
