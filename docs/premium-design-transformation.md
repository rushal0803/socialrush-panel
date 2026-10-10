# Premium design transformation

Branch: `feat/socialrush-premium-design-transformation`
Baseline: `4f968b5235a40e1554945d2b84d54ccd198dad8a` (main, including PRs 623–626).

## Findings and direction

Use the existing phase-0 route inventory and performance reports. The homepage currently combines a marketing header, sticky secondary navigation, a decision rail, hero actions and another ordering preview. Repeated cards and orange gradients compete with the purchase path. Several sample visuals use very small labels. Shared service and account components already exist; preserve their data contracts.

Art direction: warm charcoal, cream interface previews, precise orange actions, generous editorial typography and a visible grid. Use platform identity in useful places. Replace decorative motion with direct feedback. Keep headings and meaningful content as HTML.

## Implementation sequence

1. Foundation and public shell: accessible actions, quiet surfaces, focus states and consistent headings.
2. Homepage: composed hero with clearly labeled sample workspace; remove the redundant sticky navigator and pointer effects; retain service discovery, price configuration, FAQs and crawl links.
3. Discovery and shared templates: more legible service cards, structured service summaries, supporting-page hero and package presentation.
4. Account presentation: login/register shell and dashboard primitives; no auth, balance, checkout, database or API changes.
5. Quality gates: production build, TypeScript, lint, existing unit and smoke coverage, rendered before/after review and performance comparison.

## Review artifacts

`scripts/premium-design-review.cjs before|after` captures representative desktop/mobile screenshots and rendered metadata, schema, links, H1s and overflow from the same fixture-backed local production server. These are lab observations, not field p75 claims. The existing performance benchmark supplies matched throttled measurements.

No production deployment or merge is authorized. Review changes on the feature branch and preview first. Further phases must be separately reviewed if this first change cannot safely cover every application flow.

## Implemented scope

The homepage has a server-rendered charcoal hero, orange actions, a cream workspace preview explicitly marked as sample data, a platform directory and an earlier service-discovery section. Removed the homepage pointer glow, tilt/reveal wrapper, duplicate sticky navigation and unverified availability banner. Existing conversion tracking, pricing configuration and handoff remain.

Shared public/header surfaces, seven-platform service summaries, country service templates, discovery cards, packages, login/register, blog presentation and dashboard primitives now use the same restrained surfaces and typography. Prices, quantities, wallet balances, authentication, payment APIs and database contracts were not changed. This is the first reviewable phase; page-specific redesigns for every admin, tool, legal, review and support view remain separate work. Shared styling alone does not certify that every page meets the full creative brief.

The implementation adds no client library or generated imagery. It keeps meaningful copy and structured data in HTML, exposes keyboard focus and respects reduced motion.

## Validation record

- Unit tests: 200 passed. Live service facts: 5 passed. Payment confidence: 5 passed.
- International SEO and keyword ownership audits passed (6 markets, 22 localized pages, 4 reciprocal clusters; 53 canonical keyword owners).
- Production build, TypeScript and lint passed; lint retains existing repository warnings.
- Initial complete smoke run: 294 passed, 51 skipped, 14 failed. Eleven failures identified excessive service-card height; one new keyboard assertion incorrectly assumed the next control after email could not be the existing Forgot password link; two review cases timed out during concurrent browser jobs.
- Corrected card layout: all 11 catalogue/comparison widths passed, including order-button contrast, overflow, comparison modal and keyboard return. Targeted service-page, new responsive hero, login contrast and keyboard checks passed in the 46 passing cases of the first recheck. Keep the original failure logs as evidence rather than presenting the first full run as clean.
- Authenticated responsive audit: 11 widths from 320 through 1920px, each covering 13 routes (143 route/width combinations), passed without horizontal overflow or recorded runtime errors. The previously timed-out 12-page service-matrix group at 1024px passed on an isolated rerun.
- Final rendered SEO comparison: all 36 documents (18 routes at 390 and 1440px) preserved baseline title, canonical, robots, JSON-LD, H1 and original link targets, with HTTP 200 and no document overflow. Visually reviewed homepage, service discovery, login and fixture-backed dashboard/order screenshots.

Local artifacts are intentionally gitignored: `artifacts/premium-design/` includes build and test logs, baseline and final screenshots, rendered SEO comparison and matched performance reports. Dashboard screenshots use `artifacts/premium-responsive/premium-design/`. The earlier dashboard baseline is from the existing audit and is not a newly captured exact-main comparison.

## Limits

## Matched performance comparison

Three runs per route/cache/device condition against the same owned localhost production server; mobile uses the existing 4G and 4x CPU profile. Cold-browser medians:

| Route | Desktop LCP before → after | Mobile LCP before → after | Desktop JS before → after |
| --- | --- | --- | --- |
| Home | 620 → 704 ms | 2540 → 2212 ms | 329594 → 277689 bytes |
| Services | 684 → 640 ms | 2144 → 2124 ms | 288706 → 279914 bytes |
| Packages | 532 → 524 ms | 1908 → 1848 ms | 289944 → 280883 bytes |

Cold CLS stayed zero for home/packages; services improved from 0.00231 to zero desktop and 0.00179 to 0.00143 mobile. Transfer-budget and client-navigation checks passed. Desktop home-to-services transition median rose from 539 to 744 ms; mobile fell from 2777 to 2548 ms. Desktop homepage LCP rose 84 ms. These timing differences remain review limitations; this is not an across-the-board performance improvement. Files: `performance-before-owned.json`, `performance-after.json`, `performance-comparison.json`.

Local browser fixtures never submit real payments, alter balances or place real orders. Synthetic timings are diagnostic medians, not field p75, INP, a ranking guarantee or a site-wide WCAG certification. A production release requires review of the draft PR and rendered preview.
