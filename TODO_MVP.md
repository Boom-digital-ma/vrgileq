# 🚀 Project Roadmap: Virginia Liquidation MVP

This document tracks the current state of the project and remaining tasks to reach a production-ready MVP.

## 🛠 Technical Specificities (DO NOT FORGET)
- **Refine v5 Architecture**: This project uses a specific version of Refine.
  - **Data Access**: Hooks like `useTable`, `useList`, and `useShow` return a nested TanStack Query object.
  - **Path**: Always use `result.tableQuery.data.data` (for tables) or `result.query.data.data` (for lists/show).
  - **Auth**: A manual `authProvider` is implemented in `layout.tsx` to sync Supabase Auth with Refine.
- **Hierarchical Structure**: `Auction Events` (Events) -> `Auctions` (Lots).
- **Security**: Mandatory credit card authorization hold via Stripe manual capture before bidding.

## ✅ Completed Milestones
- [x] **Hierarchical Admin**: Events management with nested Lots cataloging.
- [x] **Modal CRUD**: All creation and edition (Auctions, Categories, Users) handled via modern modals.
- [x] **Multi-Image Support**: Support for multiple photos per lot with Supabase Storage integration.
- [x] **SaaS UI**: Zinc-based professional administration interface.
- [x] **Public Catalog**: "Swiss Style" industrial design for events and lots display.
- [x] **Multi-Card Wallet**: Users can store multiple payment methods in their profile.
- [x] **Real-time Engine**: Supabase Realtime enabled for bidding streams.
- [x] **Automated Notifications**: Real-time "Outbid" alerts (SQL Trigger) and "Winning" notifications (Edge Function).
- [x] **Auction Closing Automation**: Automated lot transition from `live` to `sold` via `pg_cron` and Edge Function.
- [x] **Public Search & Discovery**: Functional search bar connecting Home Page to a dedicated results view on `/auctions`.

## 📋 Remaining Tasks (The "Final Touches")

### 1. External Email Integration
- [x] Integration with Resend for email delivery of notifications (Outbid alerts, Winning notifications).
- [x] Automated winning emails in Edge Functions and Outbid alerts in Server Actions.

### 2. Financial Logic Polish
- [ ] Automatic release of Stripe holds for non-winners after auction close (logic present in Edge Function, needs integration testing).

### 3. Visual Identity & Polish
- [x] Unify public typography using **Urbanist** (Headings) and **Manrope** (Body).
- [x] Update Favicon and ensure brand consistency across all transactional pages (SignIn, SignUp).
- [x] Mobile optimization audit and responsive fix for the Admin Console (Sidebar & Layout).
- [ ] Implement a system-wide Toast notification system (e.g., "Logged in successfully", "Bid placed").

---
*Last updated: February 15, 2026*
