-- Migration: Link Stripe Payment Intent to Sales record for refunds
CREATE OR REPLACE FUNCTION public.handle_new_sale() 
RETURNS TRIGGER AS $$
DECLARE
    v_bp_rate NUMERIC;
    v_tax_rate NUMERIC;
    v_bp_amount NUMERIC;
    v_tax_amount NUMERIC;
    v_total NUMERIC;
    v_stripe_pi TEXT;
BEGIN
    -- Only trigger when status changes to 'sold' and winner is set
    IF (NEW.status = 'sold' AND (OLD.status IS NULL OR OLD.status != 'sold') AND NEW.winner_id IS NOT NULL) THEN
        -- Get current settings
        SELECT 
            COALESCE(buyers_premium, 15), 
            COALESCE(tax_rate, 0) 
        INTO v_bp_rate, v_tax_rate 
        FROM public.site_settings 
        WHERE id = 'global';
        
        -- Find the winning bid's stripe payment intent
        SELECT stripe_payment_intent_id INTO v_stripe_pi
        FROM public.bids
        WHERE auction_id = NEW.id AND user_id = NEW.winner_id AND status = 'won'
        LIMIT 1;

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
            status,
            stripe_payment_intent_id
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
            'pending',
            v_stripe_pi
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
