# Auction Master - Business Rules

## Core Financials
- **Buyer's Premium (BP):** Default 15% on the hammer price.
- **Tax Rate:** Default 0% (Baltimore/Maryland focused, configurable in `site_settings`).
- **Invoicing:** Consolidated per winner per event via `generate_event_invoices` RPC.
- **Deposit:** Registration hold (authorized amount) required to bid. Subtractive logic (Final Total - Deposit) used for final capture.

## Bidding Engine
- **Anti-Sniping:** 2 minutes auto-extension if a bid is placed near closing time.
- **Staggered Closing:** 2-minute intervals between lots within the same event.
- **Minimum Increment:** Usually $1.00 (enforced in `place_bid_secure`).
- **Proxy Bidding:** Intelligent ceiling price. Any bid above (current + increment) triggers proxy mode.

## Event Lifecycle
- **Statuses:** `draft` -> `scheduled` -> `live` -> `closed`.
- **Auto-Close:** Events transition to `closed` when all linked lots have ended.
