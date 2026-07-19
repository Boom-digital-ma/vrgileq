# Project Workspace Directory & Architecture Map

This document outlines the directory structure, file placements, and architectural separation of concerns for the **Virginia Liquidation** auction marketplace codebase.

---

## 1. Project Root Directory Map

The workspace root contains configurations, test scripts, and core system directories:

```
├── app/                        # Next.js App Router routes and page layouts
├── components/                 # Modular React UI components
├── lib/                        # Client connections, services and global utility functions
├── supabase/                   # PostgreSQL schema migrations and Deno Edge functions
├── guides/                     # Architecture manuals and protocol guidelines
├── public/                     # Static media files, logos and favicon assets
├── tests/                      # Playwright E2E testing scripts
├── package.json                # Project dependencies and script declarations
├── playwright.config.ts        # E2E test suites setup configuration
├── proxy.ts                    # Routing access layers & admin role checking logic
├── next.config.ts              # Next.js optimization and headers settings
└── tsconfig.json               # TypeScript compiler rules mapping
```

---

## 2. The `app/` Directory (App Router Routes)

Next.js routing is split using route groups to isolate page layouts, authentication context, and styles.

```
app/
├── (marketing)/                # Public marketplace pages (sharing main Header/Footer)
│   ├── about/                  # "About Us" static information
│   ├── auctions/               # Auction detail view backbar layout
│   ├── blog/                   # SEO articles directory
│   ├── buyers/                 # Buyers FAQ page
│   ├── contact/                # Contact support form
│   ├── events/                 # Event details and live catalog grid
│   ├── how-it-works/           # Platform guides and onboarding layout
│   ├── profile/                # User dashboard (Live bids, Watchlist, Billing settings)
│   ├── sellers/                # Sellers information page
│   ├── page.tsx                # Homepage (HeroSlider + Featured Events grid)
│   └── layout.tsx              # Marketing layout context
│
├── (logistics)/                # Post-auction transaction print layouts
│   ├── gate-pass/              # Gate Pass printout and QR verification screen
│   ├── invoices/               # Consolidated invoice printable invoice detail screen
│   └── layout.tsx              # Logistics layout element (Stripe Elements wrapper)
│
├── admin/                      # Refine v5 Administrative Dashboard Pages
│   ├── auctions/               # Lots management (Create, Edit, Make Main Image)
│   ├── bids/                   # Bid registry tracking dashboard
│   ├── categories/             # Asset categories configuration
│   ├── events/                 # Auction Events creation and ManyFastScan Excel import
│   ├── logistics/              # Warehouse pickup check-in list
│   ├── sales/                  # Invoices billing and manual Stripe debit controls
│   ├── settings/               # System variables adjustments (Premium, Anti-Sniping)
│   └── users/                  # Users management list
│
├── actions/                    # Next.js Server Actions (Database updates & Stripe calls)
│   ├── auth.ts                 # Signup verification & Stripe customer creation
│   ├── bids.ts                 # Bid submission & increment bracket verification
│   ├── events.ts               # Event lifecycle states changes
│   ├── payment.ts              # Stripe payment methods, captures and releases
│   ├── registrations.ts        # Event entry hold authorizations
│   └── settings.ts             # Vault metadata updates
│
├── globals.css                 # Global Tailwind CSS style overrides
└── layout.tsx                  # Base Root layout (Font loading & GTM scripts)
```

---

## 3. The `components/` Directory (Reusable UI Components)

Components are organized by context to keep directory structures modular:

```
components/
├── auction/                    # Marketplace bidding elements
│   ├── AuctionCard.tsx         # Individual product card (Live bidding status, fast hover)
│   ├── AuctionGrid.tsx         # Catalog grid with real-time property merging
│   ├── AuctionDetailsRealtime.tsx # Details container for item info and slides
│   └── BiddingWidget.tsx       # Bidding interface (Dynamic floor calculations, proxy inputs)
│
├── layout/                     # General structure wrappers
│   ├── Header.tsx              # Navigation bar with user status, links, and responsive sidebar
│   ├── Footer.tsx              # DMV location branding and site map directory
│   └── HeroSlider.tsx          # Fast transition slide carousel for featured events
│
├── auth/                       # Security access forms
│   ├── LoginForm.tsx           # Email signin interface
│   └── SignupForm.tsx          # Account details registration form
│
└── admin/                      # Operations dashboard panels
    ├── Sidebar.tsx             # Flexbox command-center dashboard navigation sidebar
    ├── LogisticsDashboard.tsx  # Warehouse check-in listings and filters
    └── StatsWidgets.tsx        # Dashboard finance KPIs summary widgets
```

---

## 4. The `lib/` and `supabase/` Directories (Backend & Logic)

The library directory maps connections and utilities, while the supabase folder structures migrations and edge code:

```
lib/
├── supabase/                   # Supabase client instantiation
│   ├── client.ts               # Browser client (Singleton pattern for real-time channels)
│   └── server.ts               # Server-side client with cookie integration
│
├── emails/                     # SMTP Mailing templates
│   └── templates.ts            # Victory notifications layout HTML
│
└── utils.ts                    # Global utility files (Price formatting, Increments)

supabase/
├── migrations/                 # PostgreSQL migrations history
│   ├── ..._initial_schema.sql  # Database table declarations
│   ├── ..._proxy_bidding.sql   # Bid engine algorithms
│   ├── ..._event_invoicing.sql # Consolidated sales invoicing
│   └── ..._lower_proxy.sql     # Winner proxy update triggers
│
└── functions/                  # Deno Edge Functions
    ├── close-auction/          # Closes auctions and logs winners at lot expiry
    ├── notify-event-start/     # Triggers live notifications for watchlist users
    └── notify-watchlist-closing/ # Compiles and dispatches batch mails via Resend API
```
