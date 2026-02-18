-- 1. Add max_amount to bids table
ALTER TABLE public.bids 
ADD COLUMN max_amount DECIMAL(12, 2);

-- 2. Update place_bid_secure to handle Proxy Bidding
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
    v_extension_threshold INTERVAL := INTERVAL '2 minutes';
    v_extension_duration INTERVAL := INTERVAL '2 minutes';
BEGIN
    -- Lock the auction row for update to prevent race conditions
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

    -- Basic check: amount must be >= current + increment
    IF p_amount < (v_current_price + v_min_increment) THEN
        -- Exception: if it's the very first bid, we might allow start_price
        -- But for simplicity here, we assume UI handles initial bid correctly
        RAISE EXCEPTION 'Bid amount too low (Current: %, Min: %)', v_current_price, (v_current_price + v_min_increment);
    END IF;

    -- Anti-Sniping: If bid is placed within the threshold of the end time, extend it
    IF (v_ends_at - now()) < v_extension_threshold THEN
        v_ends_at := now() + v_extension_duration;
    END IF;

    -- Check if current winner has a proxy bid (max_amount)
    SELECT max_amount INTO v_current_max_amount
    FROM bids
    WHERE auction_id = p_auction_id AND status = 'active' AND user_id = v_current_winner_id
    LIMIT 1;

    -- SCENARIO 1: Current winner HAS a proxy bid higher than or equal to the new bid
    IF v_current_max_amount IS NOT NULL AND v_current_max_amount >= p_amount THEN
        -- Current winner stays winner, price bumps to p_amount + increment (capped at max)
        v_new_price := LEAST(p_amount + v_min_increment, v_current_max_amount);
        
        UPDATE auctions 
        SET current_price = v_new_price,
            ends_at = v_ends_at
        WHERE id = p_auction_id;

        -- Record the unsuccessful bid (outbid immediately)
        INSERT INTO bids (auction_id, user_id, amount, status, stripe_payment_intent_id)
        VALUES (p_auction_id, p_user_id, p_amount, 'outbid', p_stripe_pi_id);

        -- Update current winner's bid record to show new public amount
        -- Note: In a production system, we might insert a new bid record for history
        UPDATE bids
        SET amount = v_new_price
        WHERE auction_id = p_auction_id AND status = 'active' AND user_id = v_current_winner_id;

    -- SCENARIO 2: New bid is HIGHER than current winner's max
    ELSE
        -- New bidder becomes winner
        v_new_price := p_amount;

        UPDATE auctions 
        SET current_price = v_new_price,
            winner_id = p_user_id,
            ends_at = v_ends_at
        WHERE id = p_auction_id;

        -- Mark previous active bids as 'outbid'
        UPDATE bids
        SET status = 'outbid'
        WHERE auction_id = p_auction_id AND status = 'active';

        -- Insert new bid as 'active'
        INSERT INTO bids (auction_id, user_id, amount, max_amount, stripe_payment_intent_id, status)
        VALUES (p_auction_id, p_user_id, v_new_price, p_max_amount, p_stripe_pi_id, 'active');
    END IF;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
