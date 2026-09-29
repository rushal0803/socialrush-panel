# Phase 7G — International SEO integrity guard

## Goal

Close Phase 7 by protecting the international SEO architecture already built in 7A–7F.

This phase does **not** add new country pages or create new transactional intents. It adds release-time checks so future SEO work cannot silently introduce duplicate URLs, broken hreflang clusters, non-self canonicals, duplicate localized metadata, or sitemap omissions.

## Guardrails added

- International hub URLs must be unique.
- Published country service URLs must be unique.
- Hub and service URL sets must not overlap.
- Every published country service page must emit a self-referential canonical.
- Every country service hreflang cluster must contain only pages for the same service.
- Hreflang clusters must be reciprocal across every published market for that service.
- Localized titles, descriptions and canonicals must remain unique across published country service pages.
- International hubs and published country service paths must remain included in the sitemap discovery set.
- Hreflang URLs may not contain query strings or fragments.

## CI

The pre-merge workflow now runs `npm run test:international-seo` after TypeScript and before the production build.

Any future pull request that breaks the international SEO contract will fail before merge.

## Scope intentionally unchanged

- No new country or service routes.
- No checkout, pricing, payment, wallet, auth or database changes.
- No new claims about local checkout or local payment methods.
- No change to INR-authoritative checkout.
- No speculative search-volume or ranking claims.
