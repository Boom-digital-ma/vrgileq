# 🧪 Test Guide: Auction Bidding & Stripe Authorization

This document outlines the steps to test the "Stripe Hold" security logic and the bidding flow for Virginia Liquidation.

## 📌 Prerequisites
1. **Stripe Test Mode:** Ensure your `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` are set to **Test Mode** (keys starting with `sk_test_` and `pk_test_`).
2. **Supabase Data:** You must have at least one **Live Event** and one **Live Lot** in the database.
3. **Database Schema:** Ensure the `site_settings` and `profiles` tables are correctly configured.

---

## 🛠 Step 1: Account Setup & Identity Verification
To participate in an auction, a user must have a verified payment method.

1.  **Register a new user** on `/auth/signup`.
2.  **Step 1:** Enter personal details.
3.  **Step 2 (Security):** You will be prompted to add a card.
4.  **Test Cards:**
    *   **Success (Visa):** `4242 4242 4242 4242`
    *   **Success (Mastercard):** `5555 5555 5555 4444`
    *   **Declined (Generic):** `4000 0566 5566 5556`
    *   **Declined (Insufficient Funds):** `4000 0000 0000 3022`
    *   **Expiry/CVC:** Any future date / `123` / `20101`
5.  **Validation:** Upon success, the system creates a `payment_method` in Stripe and links it to the user's `profile` in Supabase. A **temporary $1 hold** is performed and immediately voided to verify card activity.

---

## 🔨 Step 2: Placing a Bid (The "Hold" Logic)
When a user clicks **"Place Quick Bid"**, the system performs a silent authorization.

1.  Navigate to `/auctions` or an Event page.
2.  Select a **Live Lot**.
3.  Enter a bid amount and click **"Place Quick Bid"**.
4.  **What happens in the background (`app/actions/bids.ts`):**
    *   The system checks if the user has already authorized a deposit for this **Event**.
    *   If NOT, it calls Stripe to create a **PaymentIntent** with `capture_method: 'manual'`.
    *   **Hold Amount:** The amount defined in `auction_events.deposit_amount` (default $500) is frozen on the card.
    *   The bid is only recorded if the hold is successful.

---

## 📊 Step 3: Verification
1.  **Stripe Dashboard:** 
    *   Go to **Payments -> All Payments**.
    *   You should see a payment marked as **"Uncaptured"** or **"Authorized"**.
    *   This confirms the $500 is held but not yet charged.
2.  **Admin Console:**
    *   Go to `/admin/bids`.
    *   The new bid should appear in the **Bid Registry**.

---

## 🏁 Step 4: Auction Closing & Funds Release
When an auction closes (via the Edge Function `close-auction`):

1.  **The Winner:** The hold is captured (converted to a real charge) or used as a partial payment.
2.  **The Non-Winners:** The system should trigger a `void` (cancel) on the authorized PaymentIntents to release the $500 hold back to the users.
    *   *Note: This usually takes 5-7 days to appear on a real bank statement, but in Stripe Test Mode, it happens instantly.*

---

## 🚨 Troubleshooting
- **Error "Card Declined":** Ensure you are using the `4242` test card.
- **Bid fails without error:** Check the Browser Console. It might be a missing role or session.
- **No Hold in Stripe:** Verify that the `deposit_amount` in the Event settings is greater than 0.

---
*Generated for Virginia Liquidation MVP - Feb 2026*
