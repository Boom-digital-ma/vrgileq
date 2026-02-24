-- Security Fixes for Supabase Linter Alerts

-- 1. Fix RLS for sale_items table
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all sale items" ON public.sale_items;
DROP POLICY IF EXISTS "Users can view their own sale items" ON public.sale_items;

-- Users can only see items that belong to their own sales
CREATE POLICY "Users can view their own sale items"
ON public.sale_items FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.sales
    WHERE sales.id = sale_items.sale_id
    AND sales.winner_id = (SELECT auth.uid())
  )
);

-- Admins can see everything
CREATE POLICY "Admins can view all sale items"
ON public.sale_items FOR SELECT
TO authenticated
USING ( public.is_admin() );


-- 2. Fix Security Definer Views (Replace with Security Invoker)
-- This ensures RLS is respected when querying these views.

-- 2.1 sales_logistics_view
DROP VIEW IF EXISTS public.sales_logistics_view;
CREATE VIEW public.sales_logistics_view WITH (security_invoker = true) AS
SELECT 
    s.id AS sale_id,
    s.invoice_number,
    s.status AS sale_status,
    p.full_name AS winner_name,
    p.email AS winner_email,
    p.phone AS winner_phone,
    ps.start_at AS pickup_start,
    ps.end_at AS pickup_end,
    s.collected_at
FROM sales s
JOIN profiles p ON s.winner_id = p.id
LEFT JOIN pickup_slots ps ON s.pickup_slot_id = ps.id;


-- 2.2 pickup_slots_with_counts
DROP VIEW IF EXISTS public.pickup_slots_with_counts;
CREATE VIEW public.pickup_slots_with_counts WITH (security_invoker = true) AS
SELECT 
    ps.id,
    ps.event_id,
    ps.start_at,
    ps.end_at,
    ps.max_capacity,
    (SELECT count(*)::INTEGER FROM public.sales s WHERE s.pickup_slot_id = ps.id) AS current_appointments,
    (ps.max_capacity - (SELECT count(*)::INTEGER FROM public.sales s WHERE s.pickup_slot_id = ps.id)) AS available_slots
FROM pickup_slots ps;

-- Grant access to these views for authenticated users
GRANT SELECT ON public.sales_logistics_view TO authenticated;
GRANT SELECT ON public.pickup_slots_with_counts TO authenticated;
