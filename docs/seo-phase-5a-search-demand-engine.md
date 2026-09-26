# Phase 5A — Search Demand Engine

Audit date: 27 September 2026.

## Goal

Expand high-intent organic demand on existing canonical money pages without creating duplicate transactional URLs or cannibalizing established service pages.

## Current data availability

- Google Search Console data could not be queried through the connected GSC Wizard because its subscription is inactive.
- Semrush is connected, but the account currently has insufficient API units for domain, organic-keyword, or competitor reports.
- This sprint therefore used live public SERP checks, the current SocialRUSH production pages, repository SEO architecture, and confirmed catalog pricing.

## Search patterns observed

Current India-facing results repeatedly emphasize:
- "price in India"
- 1K / 5K / 10K quantity framing
- INR totals
- public-link / no-password ordering
- payment and checkout clarity
- refill/support information
- decision guidance before ordering

SocialRUSH already owns canonical transaction pages for these intents, so the correct implementation is to strengthen those pages rather than create separate "price" or quantity URLs.

## Phase 5A implementation

The shared SearchDemandPriceSection now adds crawlable price-intent coverage to canonical service pages while keeping checkout authoritative.

Key behaviors:
- 1K / 5K / 10K planning totals are derived only from confirmed public per-1K rates.
- Live-only/protected pricing is not exposed as a static value.
- Final checkout remains authoritative for availability, service terms, and the exact payable amount.
- Helpful internal links connect money pages to relevant guides.
- Metadata expands quantity-price variants without changing canonical ownership.
- No new transactional page family, sitemap expansion, or redirect changes were introduced.

## Integrity rules retained

- One primary URL per deliberate transactional intent.
- No invented discounts, package guarantees, or ranking promises.
- No checkout, wallet, payment, database, or order-flow changes.
- Public-link and no-password guidance remains consistent with visible order requirements.

## Validation

Phase 5A passed:
- npm ci
- TypeScript
- production build
- browser smoke tests
- deterministic SEO/unit coverage

## Next measurement loop

When Search Console access is restored, evaluate:
1. query impressions and CTR for "price India" and quantity-intent variants;
2. page/query overlap for cannibalization;
3. platform-level gaps that justify distinct informational content;
4. internal-link contribution from guides/tools into canonical money pages;
5. whether deferred Facebook, LinkedIn, X, Telegram, or TikTok informational clusters show validated demand.
