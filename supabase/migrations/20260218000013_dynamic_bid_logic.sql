-- Update place_bid_secure to use dynamic settings for auto-extension
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
    -- Dynamic settings
    v_ext_threshold_mins INTEGER;
    v_ext_duration_mins INTEGER;
BEGIN
    -- 1. Fetch dynamic settings
    SELECT auto_extend_threshold_mins, auto_extend_duration_mins 
    INTO v_ext_threshold_mins, v_ext_duration_mins
    FROM site_settings
    WHERE id = 'global';

    -- 2. Lock the auction row
    SELECT current_price, ends_at, status, min_increment, winner_id
    INTO v_current_price, v_ends_at, v_status, v_min_increment, v_current_winner_id
    FROM auctions
    WHERE id = p_auction_id
    FOR UPDATE;

    -- Validations
    IF v_status != 'live' THEN
        RAISE EXCEPTION 'Auction is not live';
    END IF;

    IF v_ends_at < now() THEN
        RAISE EXCEPTION 'Auction has ended';
    END IF;

    IF p_amount < (v_current_price + v_min_increment) THEN
        RAISE EXCEPTION 'Bid amount too low';
    END IF;

    -- Anti-Sniping: Use dynamic settings
    IF (v_ends_at - now()) < (v_ext_threshold_mins * INTERVAL '1 minute') THEN
        v_ends_at := now() + (v_ext_duration_mins * INTERVAL '1 minute');
    END IF;

    -- Check if current winner has a proxy bid (max_amount)
    SELECT max_amount INTO v_current_max_amount
    FROM bids
    WHERE auction_id = p_auction_id AND status = 'active' AND user_id = v_current_winner_id
    LIMIT 1;

    -- SCENARIO 1: Current winner HAS a proxy bid higher than or equal to the new bid
    IF v_current_max_amount IS NOT NULL AND v_current_max_amount >= p_amount THEN
        v_new_price := LEAST(p_amount + v_min_increment, v_current_max_amount);
        
        UPDATE auctions 
        SET current_price = v_new_price,
            ends_at = v_ends_at
        WHERE id = p_auction_id;

        INSERT INTO bids (auction_id, user_id, amount, status, stripe_payment_intent_id)
        VALUES (p_auction_id, p_user_id, p_amount, 'outbid', p_stripe_pi_id);

        UPDATE bids
        SET amount = v_new_price
        WHERE auction_id = p_auction_id AND status = 'active' AND user_id = v_current_winner_id;

    -- SCENARIO 2: New bidder becomes winner
    ELSE
        v_new_price := p_amount;

        UPDATE auctions 
        SET current_price = v_new_price,
            winner_id = p_user_id,
            ends_at = v_ends_at
        WHERE id = p_auction_id;

        UPDATE bids
        SET status = 'outbid'
        WHERE auction_id = p_auction_id AND status = 'active';

        INSERT INTO bids (auction_id, user_id, amount, max_amount, stripe_payment_intent_id, status)
        VALUES (p_auction_id, p_user_id, v_new_price, p_max_amount, p_stripe_pi_id, 'active');
    END IF;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
