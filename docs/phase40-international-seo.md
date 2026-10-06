# Phase 40 — International SEO policy

SocialRUSH currently publishes six explicit English-language market hubs: United States, United Kingdom, Canada, Australia, United Arab Emirates and Singapore.

## Publishing rules

- Country hubs and country/service pages are allowlisted in code. Do not auto-generate a market page merely because a service exists in the main catalog.
- A localized service page must have a self canonical, a unique market-aware title/description, distinct market-planning copy, and three market-specific planning checks.
- Hreflang service clusters contain only genuine same-service equivalents that are actually published.
- Unsupported combinations remain 404/unpublished rather than becoming thin doorway pages.
- Local currency is display-only; INR remains the authoritative checkout currency unless the payment system changes.
- No local availability, local fulfillment, local business presence, rankings, demand, or outcomes may be invented.

## x-default

Phase 40 intentionally does not emit x-default. There is not currently a neutral international fallback page that is equivalent to every localized hub/service. An India-specific money page or a generic-but-different service catalog is not an acceptable fallback.

If a genuinely neutral international directory is created later, add x-default only after reciprocal-equivalence review.

## Monitoring

Run:

\`npm run seo:international\`

The checker validates market inventory, self canonicals, reciprocal hreflang clusters, localized intent completeness, market switcher integrity, unsupported-page guardrails, and the x-default policy.
