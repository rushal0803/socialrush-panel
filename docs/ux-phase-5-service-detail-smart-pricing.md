# Phase 5 — Service Detail Pages + Smart Pricing

## Goal
Make service-detail pages feel more like a premium product decision experience while preserving SocialRUSH's existing pricing, availability and checkout contracts.

## What this phase adds
- Smart pricing planner on eligible dynamic `/services/[slug]` pages.
- Reuses the existing `buildQuantityMerchandising` quantity ladder instead of inventing a second package system.
- Calculates a planning estimate from the existing catalog `pricePer1000` value.
- Shows delivery, refill/support and ordering instructions beside the estimate.
- Hands platform, service and supported quantity into the existing New Order route with its existing `prefill=1` contract.
- Adds a light visual-polish layer to the existing generic service-detail surfaces.

## Live-only services
Services marked `requiresLiveCatalogFacts` do not expose placeholder totals in the smart planner. The planner sends the user to the existing order builder, where protected live facts, limits, rate and availability are loaded and validated before checkout.

## Dedicated service experiences
Existing dedicated LinkedIn USA landing experiences and canonical redirects remain unchanged to avoid duplicating their current order builders or SEO logic.

## Protected scope
- No edits to `lib/service-pricing.ts`.
- No new pricing source or discount logic.
- No checkout, payment, wallet or order-creation changes.
- No API, middleware, Supabase backend or migration changes.
- No metadata, schema, canonical or hreflang changes.
- No dependency upgrades.

## Validation before merge
- TypeScript check.
- Production build.
- Playwright smoke tests.
- Vercel preview readiness.
- Changed-file scope review.
