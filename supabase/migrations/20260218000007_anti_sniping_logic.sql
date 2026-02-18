-- Update place_bid_secure to include Anti-Sniping logic
CREATE OR REPLACE FUNCTION place_bid_secure(
    p_auction_id UUID,
    p_user_id UUID,
    p_amount DECIMAL,
    p_stripe_pi_id TEXT
) RETURNS VOID AS $$
DECLARE
    v_current_price DECIMAL;
    v_ends_at TIMESTAMP WITH TIME ZONE;
    v_status auction_status;
    v_min_increment DECIMAL;
    v_extension_threshold INTERVAL := INTERVAL '2 minutes';
    v_extension_duration INTERVAL := INTERVAL '2 minutes';
BEGIN
    -- Lock the auction row for update to prevent race conditions
    SELECT current_price, ends_at, status, min_increment 
    INTO v_current_price, v_ends_at, v_status, v_min_increment
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

    -- Anti-Sniping: If bid is placed within the threshold of the end time, extend it
    IF (v_ends_at - now()) < v_extension_threshold THEN
        v_ends_at := now() + v_extension_duration;
    END IF;

    -- Update auction current price and potentially end time
    UPDATE auctions 
    SET current_price = p_amount,
        winner_id = p_user_id,
        ends_at = v_ends_at
    WHERE id = p_auction_id;

    -- Mark previous active bids for this auction as 'outbid'
    UPDATE bids
    SET status = 'outbid'
    WHERE auction_id = p_auction_id AND status = 'active';

    -- Insert new bid
    INSERT INTO bids (auction_id, user_id, amount, stripe_payment_intent_id, status)
    VALUES (p_auction_id, p_user_id, p_amount, p_stripe_pi_id, 'active');

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
