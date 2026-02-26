# 🚀 Project Roadmap: Virginia Liquidation MVP

This document tracks the current state of the project and remaining tasks to reach a production-ready MVP.

## 🛠 Technical Specificities (DO NOT FORGET)
- **Refine v5 Architecture**: This project uses a specific version of Refine.
- **Hierarchical Structure**: `Auction Events` (Events) -> `Auctions` (Lots).
- **Security**: Mandatory credit card authorization hold via Stripe manual capture before bidding.

## 📋 PRIORITY 1: Core Engine & Financial Security (Completed)

### 1. Anti-Sniping (Auto-Extension)
- [x] **Database Logic:** Update `place_bid_secure` RPC to check `ends_at`.
- [x] **Rule:** If bid is placed < 2 mins before end, extend by 2 mins.
- [x] **Real-time:** UI updates immediately via Realtime subscription.

### 2. Max Bid (Proxy Bidding)
- [x] **Logic:** Allow user to set a hidden maximum amount.
- [x] **Automation:** System auto-bids by `min_increment` up to the max cap.
- [x] **Admin Control:** Toggle Proxy Bidding on/off in System Settings.

## 📋 PRIORITY 2: Bidding Experience & Visuals (Completed)

### 1. SaaS Premium Visual Overhaul
- [x] **Identity:** Complete redesign with "SaaS Premium" aesthetic (Plus Jakarta Sans, Geist, Glassmorphism).
- [x] **Components:** Modernized AuctionCard (Full Image), Header, Footer, Auth Pages (SignIn/Up), and Profile.
- [x] **UX:** Removed native alerts for `sonner` toasts; streamlined Bidding Authorization flow.

### 2. Admin Modernization
- [x] **Event Edit:** Fixed empty fields and loading states in Admin modals using direct fetch.
- [x] **Image Management:** Added "Make Main" functionality for lot images.
- [x] **Reliability:** Secured data fetching for Admin Tables and Edit forms.

### 3. Dynamic Rules
- [x] **Settings:** Manage Buyer's Premium, Anti-Sniping, and Announcements from Admin.
- [x] **Maintenance:** Real-time Maintenance Mode with auto-reload for clients.

### 4. Performance Optimization
- [x] **Auth Check:** Centralized user session fetching in parent pages (Auctions, Events) to prevent N+1 API calls in AuctionCards.
- [x] **Image Optimization:** Implemented `sizes` prop and `priority` handling for LCP images.

## 📋 PRIORITY 3: Post-Auction & Logistics (Completed)

### 1. Winner Invoicing System
- [x] **Web Page:** Create dynamic route `/invoices/[id]` with "Print/Download PDF".
- [x] **Data:** Display Hammer Price + Buyer's Premium + Taxes = Total.
- [x] **Email Content:** Enhance Winning email with direct link to Invoice.

### 2. Pickup Scheduling System
- [x] **Database:** Create `pickup_slots` table linked to events.
- [x] **Workflow:** Auto-generate 15-min slots; winners must book via Profile/Invoice.

### 3. Admin Sales Management
- [x] **New Page:** `/admin/sales` list with status badges (Paid, Pending, Refunded).
- [x] **Logistics:** `/admin/logistics` dashboard for warehouse pickup management.
- [x] **Receipts:** A4-optimized HTML print view (Gate Pass) with QR Code for gate verification.

## 📋 PRIORITY 4: Final Polish & Pre-production (Completed)

### 1. Dashboard Admin
- [x] **Metrics:** Real-time revenue tracking and logistics pickup rate.
- [x] **UX:** Reorganized Sidebar into logical groups (Management, Operations, Data).

### 2. Global Optimization
- [x] **SEO:** Dynamic metadata generation for all Lot and Event pages.
- [x] **Images:** CDN resizing and compression utility for all storage assets.
- [x] **Code:** Removed all debug console logs and verified RLS policies.

### 3. End-to-End Testing
- [x] **Playwright:** Full automated auth flow (Signup -> Stripe -> Yopmail OTP -> Login).

## 📋 PRIORITY 5: Scalability & Payment Polish (Completed)

### 1. Payment Optimization
- [x] **Subtractive Logic:** Automatically deduct registration deposits from final purchase totals.
- [x] **Simplified Flow:** Removed per-bid holds to reduce bank friction and user stress.
- [x] **Auto-Debit:** Implemented automatic full charge for winners upon auction closing.

### 2. Notification Engine (Scale)
- [x] **Batch API:** Switched to Resend Batch API for all system notifications (Won, Watchlist, Reminders).
- [x] **Rate Limiting:** Resolved 429 errors by sending up to 100 emails in a single minute-by-minute execution.
- [x] **Event Reminders:** Added user-facing "Notify Me" (Bell icon) for upcoming events with automated alerts.

### 3. Reliability & Data
- [x] **Admin Fallback:** Secured email retrieval via Admin Client for outbid notifications.
- [x] **Vault Sync:** Updated SQL functions to use correct Supabase Vault column names (`decrypted_secret`).
- [x] **Real-time Sync:** Implemented real-time profile name synchronization across Header and Dashboard.

## 📋 PRIORITY 6: Event Lifecycle & Security Hardening (Completed)

### 1. Staggered Closing Fix
- [x] **Logic:** Switched from absolute lot numbers to relative indexing for 2-minute offsets.
- [x] **UX:** Ensures first lot ends at base time, eliminating multi-hour gaps for high lot numbers.

### 2. Automated Event Lifecycle
- [x] **Status:** Events now automatically transition to `closed` when the last lot is sold/ended.
- [x] **UI:** Enhanced `EventStatusBadge` and list filters to keep events visible as "Live" until technical closure.

### 3. SQL Security (Option A)
- [x] **Schema Lockdown:** Applied `SET search_path = public` to all critical `SECURITY DEFINER` functions.
- [x] **Compliance:** Resolved Supabase security warnings regarding mutable search paths.

### 4. Admin & User UX Polish
- [x] **Navigation:** Added context-aware "Back to Event" button on Auction Detail pages.
- [x] **Alerts:** Redesigned Bidding Widget with prioritized "Action Required" cards and real-time status (Winning/Outbid).
- [x] **Settings:** Refactored Admin Settings into a modern horizontal tabbed interface.

---

## ✅ Completed Milestones
- [x] **Full Bidding Engine**: Atomic RPC, Anti-sniping, Intelligent Proxy bidding.
- [x] **SaaS Premium UI**: Complete visual overhaul of public and admin interfaces.
- [x] **Post-Auction Workflow**: Automated invoicing, pickup booking, and gate passes.
- [x] **Subtractive Payments**: Deposit deduction and automatic final charging.
- [x] **Notification Engine**: Batch processing for high-volume email reliability.
- [x] **Event Lifecycle**: Automated staggering and closure logic.
- [x] **Production Build**: 100% TypeScript compliance and optimized assets.

---
*Last updated: February 25, 2026*
