# Phase 21 — SERP CTR

## Objective

Improve how the six canonical Instagram commercial pages present in organic search without clickbait, keyword stuffing, fake urgency, invented discounts, or fabricated performance claims.

Phase 21 focuses on titles, descriptions, breadcrumbs, and SocialRUSH brand presentation. It does not change service pricing, availability, checkout, payment behavior, Supabase data, canonicals, redirects, or page ownership.

## Live audit before implementation

The production audit found:

- Followers, Likes, Views, and Comments meta descriptions were approximately 176–179 characters, making truncation more likely.
- Likes, Saves, and Shares emitted two BreadcrumbList graphs.
- Title patterns repeated "Live INR Plans" mechanically across the Instagram money-page family.
- Breadcrumb hierarchy was inconsistent between "Services", query-string service URLs, and the stable Instagram growth hub.

Search Console CTR data was not available during this phase because the connected GSC Wizard account did not have an active subscription. No CTR baseline or improvement number is claimed.

## Implementation

- Added one shared Instagram SERP profile for Followers, Likes, Views, Comments, Saves, and Shares.
- Standardized titles to:
  - `Buy Instagram [Service] in India | INR Pricing | SocialRUSH`
- Rewrote descriptions to 145–151 characters while preserving live INR pricing, destination-link requirements, delivery/refill or support review, and secure-order intent.
- Standardized Open Graph and Twitter brand presentation through the same metadata source.
- Removed duplicate BreadcrumbList and duplicate Service schema where the existing commercial schema already owns those entities.
- Aligned the Followers breadcrumb hierarchy to the stable `/instagram-growth-india` hub.
- Added Phase 21 unit and Playwright regression coverage.

## Guardrails

- No "best", "cheap", "#1", popularity, scarcity, or guaranteed-result language.
- No fabricated Search Console metrics.
- No pricing or service-availability changes.
- No canonical URL changes.
- No redirects or sitemap changes.
- No database migration.

## Measurement follow-up

When Search Console access is available again, compare page-level impressions, clicks, CTR, and average position over equivalent settled periods. Separate CTR changes from ranking changes; do not attribute a CTR movement to metadata alone without considering position and query mix.
