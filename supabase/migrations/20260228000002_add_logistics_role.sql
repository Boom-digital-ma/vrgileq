-- Add 'logistics' role to the user_role enum
-- Note: PostgreSQL doesn't allow adding values to enums inside a transaction in some versions, 
-- but this syntax is standard for adding values safely.

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'logistics';

-- Update RLS for Logistics Role
-- They need to see sales to confirm pickups
DROP POLICY IF EXISTS "Logistics can view paid sales" ON sales;
CREATE POLICY "Logistics can view paid sales" 
ON sales FOR SELECT 
USING (
  status = 'paid' 
  OR is_admin()
);

-- They need to update sales to mark as collected
DROP POLICY IF EXISTS "Logistics can update collection status" ON sales;
CREATE POLICY "Logistics can update collection status" 
ON sales FOR UPDATE
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'logistics'
  OR is_admin()
)
WITH CHECK (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'logistics'
  OR is_admin()
);

-- They need to see pickup slots
DROP POLICY IF EXISTS "Logistics can view slots" ON pickup_slots;
CREATE POLICY "Logistics can view slots" 
ON pickup_slots FOR SELECT 
USING (true);

-- They need to see auction details (titles, lot numbers)
DROP POLICY IF EXISTS "Logistics can view auctions" ON auctions;
CREATE POLICY "Logistics can view auctions" 
ON auctions FOR SELECT 
USING (true);
