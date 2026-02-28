---
name: auction-master
description: Senior developer and domain expert for Virginia Liquidation (Auction SaaS). Use for any task involving bidding logic, consolidated invoicing, Refine v5 admin dashboards, or SaaS Premium UI adjustments.
---

# Auction Master

Procedural guide for the Virginia Liquidation industrial auction marketplace.

## Domain Expertise
Refer to the following documents for core project knowledge:
- **Business Rules:** See [references/business-rules.md](references/business-rules.md) for BP, Anti-sniping, and logic.
- **Tech Architecture:** Next.js 16, Refine v5 (Headless), Supabase (PostgreSQL + Realtime).

## Core Workflows

### 1. Bidding Engine
All bid placement MUST use the `place_bid_secure` RPC. Do NOT insert directly into `bids` via UI unless specifically bypassing security (not recommended).
- **Security:** Ensure `SECURITY DEFINER` functions in SQL have `SET search_path = public`.
- **Real-time:** Use `liveMode: "auto"` in Refine `useList` or `useTable` for instant bid updates.

### 2. Admin Interface (Refine v5)
The admin panel uses a headless implementation.
- **Data Access:** Hooks like `useTable` return TanStack query state in `tableQuery`. Data is in `(result as any).tableQuery.data.data`.
- **CRUD:** Prefer custom `Modal.tsx` for creation/editing to avoid page redirects.
- **KPIs:** Calculate volume using `sales` with `status === 'paid'`.

### 3. "SaaS Premium" UI Guidelines
Follow these visual standards for all new components:
- **Fonts:** Geist (Headings/Display), Plus Jakarta Sans (Body).
- **Colors:** Primary Teal (#049A9E), Secondary Prussian Blue (#0B2B53).
- **Aesthetic:** Wide rounded corners (32px for containers, 12px for buttons), Glassmorphism (backdrop-blur-xl), thin borders (1px border-zinc-200).
- **Components:** Use `lucide-react` for iconography.

### 4. Logistics & Invoicing
- **Invoices:** Consolidated per winner per event via `generate_event_invoices(p_event_id)`.
- **Pickups:** Slots are managed via `pickup_slots`. Gate Passes use a unique ID for QR verification.

## Safeguards
- **Credential Protection:** Never log Stripe Secret Keys or Supabase Service Role keys.
- **RLS:** Always verify Row Level Security policies when adding new tables.
- **TypeScript:** Maintain strict typing for Refine resources.
