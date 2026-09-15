# Phase 6 — Campaign Builder + Checkout UX

## Goal
Polish the existing New Order experience into a clearer, calmer four-step campaign builder without changing pricing, order creation, payment, wallet or recovery contracts.

## What Phase 6 changes
- adds a route-scoped UX shell around `/dashboard/new-order`
- keeps the active four-step flow as the source of truth
- makes the progress navigator sticky so users always know where they are
- strengthens current-step, keyboard-focus and selected-state clarity
- improves form focus treatment without changing validation logic
- improves review/payment visual hierarchy and status-message visibility
- adds safer mobile spacing above the existing dashboard bottom navigation
- adds reduced-motion handling for route-level polish

## Existing capabilities preserved
- live service catalog loading and service-health checks
- favourite services
- public-link validation
- quantity validation and merchandising suggestions
- saved profile selection
- order draft persistence and recovery
- wallet balance logic
- Cashfree checkout and return verification
- direct wallet order placement
- duplicate/payment recovery safeguards
- order and checkout analytics

## Protected scope
- no edits to `lib/service-pricing.ts`
- no new pricing source or discount logic
- no changes to `/api/checkout/**`, `/api/orders`, wallet calculations or Cashfree integration
- no Supabase backend or migration changes
- no auth/middleware changes
- no SEO metadata/schema changes
- no dependency upgrades

## Audit note
`app/dashboard/new-order/page.tsx` currently contains a second full JSX return after the active return. That block is unreachable dead UI code. Phase 6 does not remove it in the initial UX pass because the file is business-critical and the active checkout contract should be validated independently before any large source deletion.

## Validation before merge
- TypeScript check
- production build
- Playwright smoke tests
- exact-head Vercel preview readiness
- changed-file scope review
