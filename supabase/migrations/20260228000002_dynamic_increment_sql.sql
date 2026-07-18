-- Create dynamic increment calculator function
CREATE OR REPLACE FUNCTION public.calculate_next_increment(p_price DECIMAL)
RETURNS DECIMAL AS $$
DECLARE
    p DECIMAL := COALESCE(p_price, 0);
BEGIN
    IF p < 1 THEN RETURN 0.10;
    ELSIF p < 3 THEN RETURN 0.50;
    ELSIF p < 10 THEN RETURN 1.00;
    ELSIF p < 25 THEN RETURN 2.00;
    ELSIF p < 50 THEN RETURN 2.50;
    ELSIF p < 100 THEN RETURN 5.00;
    ELSIF p < 150 THEN RETURN 7.50;
    ELSIF p < 200 THEN RETURN 10.00;
    ELSIF p < 500 THEN RETURN 15.00;
    ELSIF p < 550 THEN RETURN 25.00;
    ELSIF p < 600 THEN RETURN 30.00;
    ELSIF p < 2000 THEN RETURN 50.00;
    ELSIF p < 30000 THEN RETURN 100.00;
    ELSIF p < 40000 THEN RETURN 300.00;
    ELSIF p < 50000 THEN RETURN 400.00;
    ELSIF p < 100000 THEN RETURN 500.00;
    ELSIF p < 150000 THEN RETURN 1000.00;
    ELSIF p < 200000 THEN RETURN 1500.00;
    ELSIF p < 250000 THEN RETURN 2000.00;
    ELSIF p < 300000 THEN RETURN 2500.00;
    ELSIF p < 350000 THEN RETURN 3000.00;
    ELSE RETURN 3500.00;
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update place_bid_secure to calculate increments dynamically and update the auctions.min_increment column
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
    v_user_role user_role;
BEGIN
    -- 1. Fetch user role
    SELECT role INTO v_user_role FROM profiles WHERE id = p_user_id;
    IF v_user_role = 'admin' THEN RAISE EXCEPTION 'Admin accounts cannot place bids on the public marketplace'; END IF;

    -- 2. Fetch dynamic settings
    SELECT auto_extend_threshold_mins, auto_extend_duration_mins 
    INTO v_ext_threshold_mins, v_ext_duration_mins
    FROM site_settings WHERE id = 'global';

    -- 2. Lock the auction row
    SELECT current_price, ends_at, status, winner_id
    INTO v_current_price, v_ends_at, v_status, v_current_winner_id
    FROM auctions WHERE id = p_auction_id FOR UPDATE;

    -- Compute dynamic increment based on current price
    v_min_increment := public.calculate_next_increment(v_current_price);

    -- 3. Basic Validations
    IF v_status != 'live' THEN RAISE EXCEPTION 'Auction is not live'; END IF;
    IF v_ends_at < now() THEN RAISE EXCEPTION 'Auction has ended'; END IF;
    
    -- If the bidder is already the highest bidder, we only allow them to raise their proxy limit
    IF v_current_winner_id = p_user_id THEN
        -- Find their active bid
        SELECT max_amount INTO v_current_max_amount
        FROM bids WHERE auction_id = p_auction_id AND status = 'active' AND user_id = p_user_id
        LIMIT 1;

        IF p_amount <= COALESCE(v_current_max_amount, v_current_price) THEN
            RAISE EXCEPTION 'You are already the highest bidder. To raise your max bid, your new bid must be higher than your current max bid of %', COALESCE(v_current_max_amount, v_current_price);
        END IF;

        -- Update their active bid max_amount to the new amount
        UPDATE bids 
        SET max_amount = p_amount
        WHERE auction_id = p_auction_id AND status = 'active' AND user_id = p_user_id;

        RETURN;
    END IF;
    
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
        v_new_price := LEAST(p_amount + public.calculate_next_increment(p_amount), v_current_max_amount);
        
        -- User requested to avoid the ".1" systematically. If the increment is small (decimal), 
        -- we round up to the next integer if it's within the proxy limit.
        IF (v_new_price - floor(v_new_price)) > 0 AND ceil(v_new_price) <= v_current_max_amount THEN
            v_new_price := ceil(v_new_price);
        END IF;

        UPDATE auctions 
        SET current_price = v_new_price,
            min_increment = public.calculate_next_increment(v_new_price),
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
            COALESCE(v_current_max_amount + public.calculate_next_increment(v_current_max_amount), 0)
        );
        
        -- Round up if there was a proxy outbid to avoid things like $15.1
        IF v_current_max_amount IS NOT NULL AND (v_new_price - floor(v_new_price)) > 0 AND ceil(v_new_price) <= p_amount THEN
            v_new_price := ceil(v_new_price);
        END IF;

        -- Don't let the auto-jump exceed the new bidder's actual max bid
        v_new_price := LEAST(v_new_price, p_amount);

        UPDATE auctions 
        SET current_price = v_new_price, 
            min_increment = public.calculate_next_increment(v_new_price),
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
