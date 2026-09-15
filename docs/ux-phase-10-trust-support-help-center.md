# Phase 10 — Trust, Support + Help Center

## Goal
Connect the existing public Help Centre, Trust Center, FAQ, order tracking, wallet/payment guidance and authenticated ticket system into one clearer customer-support journey without creating a second support backend.

## Existing foundation reused
- `/support` public Help Centre
- `/faq` searchable FAQ experience
- `/trust` Customer Safety & Trust Center
- `/dashboard/support` authenticated ticket history, replies and ticket creation
- `/dashboard/orders` order tracking and refill context
- `/dashboard/wallet` payment and wallet history
- existing WhatsApp, email and contact paths

## Phase 10 changes
- add a shared Support Journey component
- surface FAQ, order tracking, wallet/payment help and Trust Center as clear support paths
- connect public support directly to authenticated dashboard support for account-specific issues
- add the same support-path navigator above dashboard support
- reinforce safe-support guidance: never share passwords, OTPs, UPI PINs, CVV or recovery codes
- encourage including an order ID or payment reference when relevant

## Protected scope
- no support API changes
- no support ticket status or reply logic changes
- no Supabase query/schema/RPC changes
- no order/refill logic changes
- no payment/wallet logic changes
- no auth/middleware changes
- no pricing changes
- no dependency upgrades
- no FAQ schema/SEO metadata changes

## Validation before merge
- `npx tsc --noEmit`
- `npm run build`
- Playwright smoke tests
- exact-head Vercel preview reaches READY
- compare branch with `main` and confirm no unrelated files changed
