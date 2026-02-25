-- Migration: Fix Sales and Sale Items RLS for Admins
-- Date: 2026-02-24

-- 1. Ensure RLS is enabled
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;

-- 2. Sales Policies
DROP POLICY IF EXISTS "Users can view their own sales" ON public.sales;
CREATE POLICY "Users can view their own sales" ON public.sales FOR SELECT 
USING (auth.uid() = winner_id OR (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')));

DROP POLICY IF EXISTS "Admins manage all sales" ON public.sales;
CREATE POLICY "Admins manage all sales" ON public.sales FOR ALL 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- 3. Sale Items Policies
-- Users should be able to view items belonging to their sales
DROP POLICY IF EXISTS "Users can view their own sale items" ON public.sale_items;
CREATE POLICY "Users can view their own sale items" ON public.sale_items FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.sales 
        WHERE sales.id = sale_items.sale_id 
        AND (sales.winner_id = auth.uid() OR (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')))
    )
);

DROP POLICY IF EXISTS "Admins manage all sale items" ON public.sale_items;
CREATE POLICY "Admins manage all sale items" ON public.sale_items FOR ALL
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
