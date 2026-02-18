-- Migration: Add Pickup Scheduling System
-- Date: 2026-02-18

-- 1. Create Pickup Slots table
CREATE TABLE IF NOT EXISTS public.pickup_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.auction_events(id) ON DELETE CASCADE NOT NULL,
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    max_capacity INTEGER DEFAULT 2, -- Nombre de personnes pouvant venir en même temps
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Add pickup_slot_id to sales
ALTER TABLE public.sales 
ADD COLUMN IF NOT EXISTS pickup_slot_id UUID REFERENCES public.pickup_slots(id);

-- 3. Enable RLS
ALTER TABLE public.pickup_slots ENABLE ROW LEVEL SECURITY;

-- 4. Policies for Pickup Slots
-- Everyone can view slots (to see availability)
CREATE POLICY "Public can view pickup slots" 
ON public.pickup_slots FOR SELECT 
USING (true);

-- Only admins can manage slots
CREATE POLICY "Admins manage pickup slots" 
ON public.pickup_slots FOR ALL 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- 5. Helper function to count current bookings for a slot
CREATE OR REPLACE FUNCTION get_slot_booking_count(p_slot_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (SELECT count(*)::INTEGER FROM public.sales WHERE pickup_slot_id = p_slot_id);
END;
$$ LANGUAGE plpgsql STABLE;

-- 6. RPC to book a slot securely
CREATE OR REPLACE FUNCTION book_pickup_slot(
    p_sale_id UUID,
    p_slot_id UUID
) RETURNS VOID AS $$
DECLARE
    v_max_cap INTEGER;
    v_curr_count INTEGER;
BEGIN
    -- Check capacity
    SELECT max_capacity INTO v_max_cap FROM pickup_slots WHERE id = p_slot_id;
    SELECT count(*) INTO v_curr_count FROM sales WHERE pickup_slot_id = p_slot_id;
    
    IF v_curr_count >= v_max_cap THEN
        RAISE EXCEPTION 'This slot is fully booked';
    END IF;
    
    -- Update sale
    UPDATE sales 
    SET pickup_slot_id = p_slot_id 
    WHERE id = p_sale_id 
    AND winner_id = auth.uid(); -- Security: only owner can book
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. View for easy fetching with counts
CREATE OR REPLACE VIEW public.pickup_slots_with_counts AS
SELECT 
    ps.*,
    (SELECT count(*)::INTEGER FROM public.sales s WHERE s.pickup_slot_id = ps.id) as booking_count
FROM public.pickup_slots ps;

