# Phase 20 — Instagram conversion-rate optimization

## Goal

Improve the measurable path from an Instagram commercial landing page to the existing secure order flow without changing catalog prices, discounts, service availability, payment calculations, checkout rules, Supabase data, or SEO ownership.

The conversion path is:

Search / referral → commercial landing page → understand the service → choose quantity → provide the correct public Instagram destination → review current price and service terms → continue to the existing secure order flow.

## Audit findings

The six canonical Instagram commercial journeys already had live pricing, quantity controls, destination validation, order summaries, and Phase 19 mobile safeguards. The remaining CRO gaps were mainly decision clarity and measurement:

1. Quantity presets were hard-coded independently across the six services.
2. Preset buttons showed quantity but not the resulting order total, forcing customers to compare options mentally.
3. Existing neutral quantity merchandising ("Starter", "Balanced", "Scale") was not being used on the main Instagram builders.
4. The order summary did not provide a compact readiness state showing exactly what still needed attention.
5. First-party analytics could track builder views, quantity selections, and valid handoffs using existing event types, but the six landing-page builders were not consistently emitting those funnel events.

## Changes

- Reused the existing quantity-merchandising engine.
- Added a shared quantity decision grid showing quantity, neutral merchandising labels, and the calculated total using the same current rate logic already used by each builder.
- Added a shared order-readiness checklist for service details, valid quantity, and correct public Instagram destination.
- Added first-party, consent-aware measurement using existing `package_viewed`, `package_selected`, and `new_order_clicked` events.
- Applied the shared CRO primitives to Followers, Likes, Views, Comments, Saves, and Shares.
- Added Phase 20 unit and Playwright regression coverage.

## Guardrails

Phase 20 deliberately does not use "most popular" or bestseller claims, fake scarcity, countdown timers, invented savings, unverified testimonials, fabricated performance outcomes, or changed service prices/discounts.

"Starter", "Balanced", and "Scale" are neutral merchandising positions, not popularity claims.

## Expected impact

The implementation reduces calculation effort and uncertainty immediately before the order handoff. It also creates a clean first-party measurement layer for future evidence-based iterations: builder view → quantity selection → valid order handoff.

Any future A/B test should use the existing disabled-by-default experiment framework and should only be enabled after baseline event data is available.
