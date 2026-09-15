# Phase 8 — Order Tracking + Repeat Campaigns

## Goal
Make order tracking and repeat-campaign actions easier to understand without changing SocialRUSH order, refill, pricing, payment or support contracts.

## Existing capabilities preserved
The current customer order experience already includes:

- order search and status/platform filters
- live order status labels
- delivered, remaining and progress values
- payment verification visibility
- delivery estimates and refill policy visibility
- refill eligibility and refill-request state
- order receipts
- support and WhatsApp handoff
- completed-order **Order Again** actions
- repeat-order prefill for platform, service, quantity and public link
- repeat-order analytics events
- current pricing re-evaluation in the New Order flow before checkout

Phase 8 does not replace these flows.

## Phase 8 changes

- adds a shared Order Tracking Command Bar to `/dashboard/orders`
- applies the same experience to `/dashboard/orders/[id]`
- keeps the legacy `/dashboard/order-history` route visually aligned
- makes live delivery progress, refill status and repeat campaigns easier to discover
- explains that repeated campaigns are prefilled and reviewed against current pricing before checkout
- adds direct shortcuts to all orders and a new campaign
- improves keyboard focus visibility
- adds responsive/mobile spacing and reduced-motion handling

## Protected scope

- no edits to order/refill APIs
- no Supabase query or schema changes
- no order status mutation changes
- no pricing-source changes
- no payment/wallet changes
- no support workflow changes
- no authentication or middleware changes
- no SEO/schema changes
- no dependency upgrades

## Validation before merge

- `npx tsc --noEmit`
- `npm run build`
- Playwright smoke tests
- exact-head Vercel preview readiness
- changed-file scope review
