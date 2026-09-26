# Phase 5A — Search Demand Engine

## Evidence used

Implementation date: 27 September 2026.

Fresh Google Search Console data was unavailable because the connected GSC Wizard subscription is inactive. Semrush also reported insufficient API units. Phase 5A therefore uses current live SERP evidence plus the existing SocialRUSH SEO architecture and catalog.

Live search review showed SocialRUSH money pages already ranking/indexing with the right primary transactional intent. Competitor result patterns repeatedly emphasize:
- INR price and package size
- 1K+ quantity comparisons
- no-password/public-link ordering
- UPI / Indian payment context
- delivery and refill/support terms

## Decision

Do not create new commercial URLs for quantity or price variants. That would duplicate the existing canonical transactional intent and increase cannibalization risk.

Instead, strengthen the canonical India audience pages with one reusable crawlable search-demand section.

## Phase 5A implementation

Priority pages:
- Instagram Followers
- YouTube Subscribers
- LinkedIn Followers
- Twitter / X Followers
- Facebook Followers
- TikTok Followers
- Telegram Members

The shared section adds:
- common quantity rows: 100, 500, 1K, 5K, 10K when valid
- current INR totals derived from the page's catalog facts
- protected live-only services never expose a static total
- Telegram can pass its active live rate/min/max into the module
- explicit no-password and public-link guidance
- current India UPI checkout context
- links to pricing, platform growth hub and relevant guides

## Guardrails

- No new indexable route is introduced.
- No canonical, sitemap or redirect ownership changes.
- No checkout, payment, service-rate or order logic changes.
- Quantity examples are not presented as discounts or fixed packages.
- Final checkout availability, active service terms and total remain authoritative.
- Protected live-catalog prices remain hidden.

## Measurement

Once Search Console access is restored, review query/page performance for:
- <platform> followers/subscribers/members price India
- 1000 / 5000 / 10000 <service> price India
- buy <service> with UPI
- <service> no password
- <service> delivery / refill

Use page + query dimensions to confirm whether the canonical money pages gain impressions without splitting intent across new URLs.
