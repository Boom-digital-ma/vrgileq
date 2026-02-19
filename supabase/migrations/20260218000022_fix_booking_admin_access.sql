-- Fix book_pickup_slot to allow admins to book on behalf of users
CREATE OR REPLACE FUNCTION public.book_pickup_slot(
    p_sale_id UUID,
    p_slot_id UUID
) RETURNS VOID AS $$
DECLARE
    v_max_cap INTEGER;
    v_curr_count INTEGER;
    v_is_admin BOOLEAN;
BEGIN
    -- Check if current user is admin
    SELECT (role = 'admin') INTO v_is_admin FROM profiles WHERE id = auth.uid();

    -- Check capacity
    SELECT max_capacity INTO v_max_cap FROM pickup_slots WHERE id = p_slot_id;
    SELECT count(*) INTO v_curr_count FROM sales WHERE pickup_slot_id = p_slot_id;
    
    IF v_curr_count >= v_max_cap THEN
        RAISE EXCEPTION 'This slot is fully booked';
    END IF;
    
    -- Update sale
    -- Allow update if user is the winner OR if user is an admin
    UPDATE sales 
    SET pickup_slot_id = p_slot_id 
    WHERE id = p_sale_id 
    AND (winner_id = auth.uid() OR v_is_admin = true);

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Sale not found or unauthorized access';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
