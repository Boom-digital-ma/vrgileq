# Post-Auction Logistics, Consolidated Invoicing & Gate Pass Protocol

This document details the real system code and database integrations governing post-auction billing, pickup slot scheduling, and QR-verified warehouse inventory release.

---

## 1. Consolidated Invoicing Protocol

Instead of generating individual invoices per lot (which increases payment processing fees and complicates pickup), the system groups all items won by a user in a single event into a consolidated invoice.

This is governed by the database function `public.generate_event_invoices(p_event_id)` inside [20260223000001_event_based_invoicing.sql](file:///Users/nabil/Documents/Sites/virginia/supabase/migrations/20260223000001_event_based_invoicing.sql).

### Execution Flow:
1. **Winner Scan:** Finds all unique users who won lots (`status = 'sold'`) in the target event that are not yet attached to a consolidated invoice.
2. **Hammer Price Summation:** Computes the total hammer price of all lots won by the user in that event.
3. **Master Sale Creation:** Calculates the Buyer's Premium (15-18% depending on settings), tax amount, and grand total, then inserts a master record in the `sales` table with a unique invoice number.
4. **Line-Item Attachment:** Inserts records in `sale_items` linking the master sale to the individual auctions/lots.

---

## 2. Pickup Scheduling System

To prevent warehouse bottlenecks, buyers are required to book a specific 15-minute pickup slot. This is handled by a capacity-managed scheduling engine in [20260218000016_add_pickup_system.sql](file:///Users/nabil/Documents/Sites/virginia/supabase/migrations/20260218000016_add_pickup_system.sql).

### Database Schema:
* **`pickup_slots` Table:** Stores slots with `start_at`, `end_at`, and `max_capacity` (the maximum number of buyers allowed in the warehouse during that slot, default `2`).
* **`pickup_slots_with_counts` View:** A helper view calculating the active `booking_count` for each slot by counting the number of rows in `sales` associated with it.

### Booking Validation Flow:
Users book slots via the `book_pickup_slot(p_sale_id, p_slot_id)` database RPC:

```sql
CREATE OR REPLACE FUNCTION book_pickup_slot(
    p_sale_id UUID,
    p_slot_id UUID
) RETURNS VOID AS $$
DECLARE
    v_max_cap INTEGER;
    v_curr_count INTEGER;
END;
...
```

1. **Capacity Check:** Asserts that the current booking count for the slot is strictly less than its `max_capacity`.
2. **Ownership Validation:** Updates the `pickup_slot_id` on the `sales` table, validating that the transaction owner matches the authenticated user (`winner_id = auth.uid()`).

---

## 3. QR Gate Pass Verification

Once an invoice is paid, the user can download a printable **Gate Pass** (accessed at `/gate-pass/[id]`). This pass features a secure QR code linking to `/gate-pass/[id]/verify`.

```mermaid
sequenceDiagram
    participant Agent as Warehouse Agent
    participant Web as Verification Page (/gate-pass/id/verify)
    participant DB as Supabase DB

    Agent->>Web: Scans QR code on client paper/phone
    Web->>DB: Fetch invoice details (status, items, slot)
    DB-->>Web: Returns data
    Note over Web: Asserts role = 'admin' or 'logistics'
    Note over Web: Validates invoice status is 'paid'
    alt Paid & Authorized
        Web-->>Agent: Shows green "AUTHORIZED FOR RELEASE"
    else Unpaid or Unauthorized
        Web-->>Agent: Shows red "HOLD - ACCESS DENIED"
    </td>
```

### On-Site Release Flow:
1. **Verification Gate:** When a buyer arrives at the warehouse, the agent scans the QR code using any mobile camera.
2. **Authorization check:** The verification page (`app/(logistics)/gate-pass/[id]/verify/page.tsx`) queries the user profile. Access is restricted to users with the role `'admin'` or `'logistics'`.
3. **Inventory Release Audit:**
   * Verifies the invoice payment status is `'paid'`.
   * Displays all authorized lots and quantities linked to the gate pass.
   * Confirms the scheduled pickup slot to release the physical items safely.
