-- Update place_bid_secure to handle "Price Jumps" in Proxy Duels
-- This ensures that if a challenger bids $100 on a $50 item where someone has a $80 proxy, 
-- the price jumps to $85, not just $55.

CREATE OR REPLACE FUNCTION public.place_bid_secure(
    p_auction_id UUID,
    p_user_id UUID,
    p_amount DECIMAL,
    p_stripe_pi_id TEXT,
    p_max_amount DECIMAL DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
    v_current_price DECIMAL;
    v_ends_at TIMESTAMP WITH TIME ZONE;
    v_status auction_status;
    v_min_increment DECIMAL;
    v_current_winner_id UUID;
    v_current_max_amount DECIMAL;
    v_new_price DECIMAL;
    v_ext_threshold_mins INTEGER;
    v_ext_duration_mins INTEGER;
    v_old_pi_id TEXT;
BEGIN
    -- 1. Fetch dynamic settings
    SELECT auto_extend_threshold_mins, auto_extend_duration_mins 
    INTO v_ext_threshold_mins, v_ext_duration_mins
    FROM site_settings WHERE id = 'global';

    -- 2. Lock the auction row
    SELECT current_price, ends_at, status, min_increment, winner_id
    INTO v_current_price, v_ends_at, v_status, v_min_increment, v_current_winner_id
    FROM auctions WHERE id = p_auction_id FOR UPDATE;

    -- 3. Basic Validations
    IF v_status != 'live' THEN RAISE EXCEPTION 'Auction is not live'; END IF;
    IF v_ends_at < now() THEN RAISE EXCEPTION 'Auction has ended'; END IF;
    IF v_current_winner_id = p_user_id THEN RAISE EXCEPTION 'You are already the highest bidder'; END IF;
    
    -- Ensure bid is at least current_price + increment
    IF p_amount < (v_current_price + v_min_increment) THEN 
        RAISE EXCEPTION 'Bid amount too low. Min required: %', (v_current_price + v_min_increment); 
    END IF;

    -- 4. Anti-Sniping
    IF (v_ends_at - now()) < (v_ext_threshold_mins * INTERVAL '1 minute') THEN
        v_ends_at := now() + (v_ext_duration_mins * INTERVAL '1 minute');
    END IF;

    -- 5. Check if current winner has a proxy bid (max_amount)
    SELECT max_amount INTO v_current_max_amount
    FROM bids WHERE auction_id = p_auction_id AND status = 'active' AND user_id = v_current_winner_id
    LIMIT 1;

    -- SCENARIO 1: Current winner's Proxy is still higher than (or equal to) the new bid
    IF v_current_max_amount IS NOT NULL AND v_current_max_amount >= p_amount THEN
        -- The price jumps to beat the new bidder by one increment, capped at the winner's max
        v_new_price := LEAST(p_amount + v_min_increment, v_current_max_amount);
        
        UPDATE auctions 
        SET current_price = v_new_price,
            ends_at = v_ends_at
        WHERE id = p_auction_id;

        -- Insert the Challenger's bid (Outbid immediately)
        INSERT INTO bids (auction_id, user_id, amount, status, stripe_payment_intent_id)
        VALUES (p_auction_id, p_user_id, p_amount, 'outbid', p_stripe_pi_id);

        -- Archive the Defender's previous active bid
        UPDATE bids SET status = 'outbid' 
        WHERE auction_id = p_auction_id AND status = 'active' AND user_id = v_current_winner_id
        RETURNING stripe_payment_intent_id INTO v_old_pi_id;

        -- Insert the Defender's NEW auto-bid
        INSERT INTO bids (auction_id, user_id, amount, max_amount, stripe_payment_intent_id, status, is_auto_bid)
        VALUES (p_auction_id, v_current_winner_id, v_new_price, v_current_max_amount, v_old_pi_id, 'active', true);

    -- SCENARIO 2: New bidder beats the existing Proxy (or there was no proxy)
    ELSE
        -- The price becomes either the new bidder's minimum required OR 
        -- one increment above the previous winner's max bid (whichever is higher)
        v_new_price := GREATEST(
            v_current_price + v_min_increment, 
            COALESCE(v_current_max_amount + v_min_increment, 0)
        );
        
        -- Don't let the auto-jump exceed the new bidder's actual max bid
        v_new_price := LEAST(v_new_price, p_amount);

        UPDATE auctions 
        SET current_price = v_new_price, 
            winner_id = p_user_id, 
            ends_at = v_ends_at
        WHERE id = p_auction_id;

        -- Outbid everyone else
        UPDATE bids SET status = 'outbid' WHERE auction_id = p_auction_id AND status = 'active';

        -- Insert the new winner's bid
        INSERT INTO bids (auction_id, user_id, amount, max_amount, status, stripe_payment_intent_id)
        VALUES (p_auction_id, p_user_id, v_new_price, p_amount, 'active', p_stripe_pi_id);
    END IF;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
