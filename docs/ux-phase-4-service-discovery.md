# Phase 4 — Service Discovery + Search + Compare

## Goal
Make it easier for customers to identify the right SocialRUSH service before entering the existing order flow.

## What this phase adds
- Cross-platform comparison studio available from the Services page.
- Search across the server-provided live service catalog.
- Platform filtering inside the compare experience.
- Up to three services can be shortlisted side by side.
- Comparison includes current catalog price, delivery estimate, refill/support terms and quantity range.
- Direct handoff to the existing New Order route using the selected platform and service code.
- Accessible dialog semantics, Escape-to-close and clear selection controls.

## Existing discovery preserved
The current Services page platform selector, service-type filters, search field, service health display, catalog cards, personalization shelf, conversion decision bar and India discovery content remain unchanged.

## Protected scope
- No new pricing source.
- No edits to pricing calculations or `lib/service-pricing.ts`.
- No checkout, payment, wallet or order creation logic changes.
- No API, middleware, Supabase backend or migration changes.
- No metadata, FAQ schema, canonical or hreflang changes.
- No dependency upgrades.

## Data contract
`ServiceCompareStudio` receives the same `serviceCatalog` assembled by `app/services/page.tsx`. Live-only services continue to use the existing `getLiveServiceFacts` resolution and availability gates before being passed to the client.

## Validation before merge
- TypeScript check.
- Production build.
- Playwright smoke tests.
- Vercel preview readiness.
- Changed-file scope review.
