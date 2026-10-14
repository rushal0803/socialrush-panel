# SocialRUSH customer workspace upgrade — first safe batch
Date: 2026-10-14. Audited base main: `d4c2baaa765c2e632b3a2124399e3f0e9c76094b`.

## Audit findings
- The money-critical `/dashboard/order-summary` combines light white panels with light text, difficult to read. Error, success and checkout recovery panels also mix pale foreground/background colours.
- The `ProfessionalUpiCheckout` client component is mounted globally on all authenticated routes though it renders only on `/dashboard/order-summary`. Route-scoping removes its unnecessary client-bundle reach; no measured speed claims yet.
- Shared drawer already groups long navigation, preserves every destination, has focus and scroll lock, a visible X and money/help quick actions. Preserve rather than rewrite.
- Money paths depend on existing Supabase and wallet/UPI validation, payment and ledger rules. Do not alter.

## Implemented
- Order review and summary, inputs, UPI instructions, errors/success UI: consistent graphite/orange contrast.
- Saved-checkout recovery banner: dark surface and legible text.
- Route-specific order-summary layout owns the legacy UPI overlay; dashboard global layout no longer loads it.
- Scoped compact phone form input text >=16px.
- Static regression contract in the existing dashboard-navigation unit suite.

## Subsequent priority routes
1. New Order, Wallet, Add Funds, direct UPI, Order history/details, Packages, Billing/invoices.
2. Overview, Campaign Stacks, Recurring Revenue, Reseller Hub, Campaigns, Clients, Saved Profiles, Favourites, Referrals, Repeat Campaigns.
3. Notifications, Account, Settings, Rewards, Reviews, Support, API Docs.

## Verification and release gates
- Run npx tsc --noEmit, dashboard navigation unit test, payment-confidence tests, Next build, browser smoke.
- Authenticated screenshots for 320/360/390/430/768/1024/1440px: review with sufficient/insufficient wallet, invalid URL, saved checkout reminder, mocked success. No production test orders.
- Verify route overlay still appears on order-review only, once, and UPI recovery works.
- Measure actual before/after JS and LCP/INP/CLS on authenticated device before claiming performance wins.
- No change to service rates, payment calculations, UTR verification, cashfree/razorpay, idempotency, wallet, RLS, migrations or order state.
- **Draft PR only**, do not merge or deploy to production before reviewed green checks.

## Follow-up improvement: billing money-record interaction
- Payment details now layer above the mobile bottom navigation, respect phone safe areas, restore the originating Details button focus, constrain Tab focus, close on Escape, and scroll-lock only while open.
- Mobile and desktop payment-search empty states now offer a Clear filters action without changing any financial data or transaction filtering logic.
- Regression coverage added to the existing dashboard navigation/money-page tests; no changes to financial APIs or Supabase.
- Fresh exact-head CI and authenticated responsive checks are still required before release.
