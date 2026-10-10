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

## Matched performance comparison

Three runs per route/cache/device condition against the same owned localhost production server; mobile uses the existing 4G and 4x CPU profile. Cold-browser medians:

| Route | Desktop LCP before → after | Mobile LCP before → after | Desktop JS before → after |
| --- | --- | --- | --- |
| Home | 620 → 704 ms | 2540 → 2212 ms | 329594 → 277689 bytes |
| Services | 684 → 640 ms | 2144 → 2124 ms | 288706 → 279914 bytes |
| Packages | 532 → 524 ms | 1908 → 1848 ms | 289944 → 280883 bytes |

Cold CLS stayed zero for home/packages; services improved from 0.00231 to zero desktop and 0.00179 to 0.00143 mobile. Transfer-budget and client-navigation checks passed. Desktop home-to-services transition median rose from 539 to 744 ms; mobile fell from 2777 to 2548 ms. Desktop homepage LCP rose 84 ms. These timing differences remain review limitations; this is not an across-the-board performance improvement. Files: `performance-before-owned.json`, `performance-after.json`, `performance-comparison.json`.

Local browser fixtures never submit real payments, alter balances or place real orders. Synthetic timings are diagnostic medians, not field p75, INP, a ranking guarantee or a site-wide WCAG certification. A production release requires review of the draft PR and rendered preview.

## PR #630 readability and CI follow-up

Continuing on the original branch and draft PR. Main was synchronized through `10cfdbaf` with the CRM candidate-promotion migration, allowed activity type correction, role-inbox greeting and outreach sender fixes retained verbatim. No CRM code, database execution or outreach action was performed by this follow-up.

The original GitHub Actions run `38063201988` failed on three Phase 31 homepage source tests before build or smoke tests ran. Hero content now lives in a server component, so those assertions read both components and also verify the component wiring. All original action, destination and analytics assertions remain. Restored the explicit three conversion-path labels and catalogue/ordering explanation. Added browser assertions for actual destinations and each first-party conversion event.

Workspace labels/statuses now have a 12px minimum; body/row text is 14px. Mobile rows stack their statuses, and narrow summary tiles reflow into one column. Authentication guidance, consent, errors and links are 14–15px with 16px inputs; submit-button text and auth links have stronger contrast. Discovery-card descriptions are 14px, price details/requirements 13px and health labels 12px. Business handlers and numerical values remain unchanged.

CSS `content-visibility` now also defers deep desktop homepage/discovery sections while retaining their HTML, text and links. Hero and live catalogue remain eager. No runtime animation, client dependency or application JavaScript was added for performance. Lab instrumentation now records the LCP element and click-to-render timing/resources; it runs only in the benchmark browser.

The existing Vercel preview remains on `f836cd5d`. This follow-up must not deploy: `vercel.json` disables Git auto-deployments specifically for `feat/socialrush-premium-design-transformation`. Other branches keep their existing behavior. Do not create a new preview or promote a deployment during this follow-up.

Committed visual evidence is in [the PR #630 image gallery](design/pr-630/README.md), using lossless PNGs, native-resolution links and descriptive alternative text. Original-to-final viewport pairs and Phase-1-to-follow-up service-card detail pairs are labeled separately. The latest images are local production renders, not an updated Vercel deployment.

Configured local regressions passed: 232 phase/SEO tests, 200 unit tests, 5 live-price equivalence tests, 5 payment-confidence tests and 9 CRM pipeline tests. Remote final CI, final browser checks and the final five-run desktop comparison are recorded in the PR body and linked evidence, after completion.

Final affected browser rerun: 22 passed, covering 11 catalogue/comparison widths, minimum readable fonts (including health badges), keyboard/contrast, all three conversion destinations/events and package checkout price/quantity/server-total protections. The earlier 43-case follow-up run also passed guest/signed-in handoffs for all seven platforms and the 11-width public matrix. Final rendered SEO comparison passed 10 documents across the five changed routes; full before/after metadata, schemas, H1s and original links are identical, with no document overflow. Ownership and international-integrity audits passed.

Final matched desktop experiment: five runs per cache/route, 1440x900 Chromium 151 on the same Windows/Node 24 host, cold browser/warm server, 3-second observation, DNT and fixture backend. Before public build is the original Phase 1 build (`f836cd5d`); the merged main changes only CRM code and migrations. After build includes this follow-up. JSON `sourceCommit` records repository HEAD when the lab ran, not the uncommitted public-source changes; the differing `buildId` values identify the measured build artifacts. Raw reports are committed in [the review gallery](design/pr-630/README.md).

| Desktop metric | Before follow-up | Final after | Change |
| --- | ---: | ---: | ---: |
| Home cold LCP | 820 ms | 788 ms | -3.9% |
| Home warm LCP | 316 ms | 236 ms | -25.3% |
| Services cold LCP | 672 ms | 780 ms | +16.1% |
| Home → services median transition | 803 ms | 987 ms | +22.9% |
| Home → services sampled p75 transition | 861 ms | 1116 ms | +29.7% |
| Home cold JS transfer | 277689 bytes | 277743 bytes | +54 bytes |

CLS remains zero on both routes; all measured transitions retained the client document. LCP attribution identifies the static H1, not an image. Transition records distinguish browser-click/render timing and fresh route resources. Navigation is not consistently faster: a candidate run before the final health-label correction measured 718 ms median, an earlier repeat measured 820 ms, and the final CI-fix build measured 987 ms. Timings are host-load-sensitive; retain the final result and slower-tail samples. The original three-run pre-redesign comparison is above and should not be mixed with this five-run experiment to claim a precise speedup. No field p75/INP claim or claim that all desktop regressions are solved.

Phase 2 is deferred until Phase 1 approval. It will be a separate effort for admin, tools, support, reviews and legal templates, with readable task-specific layouts rather than repeated generic card grids. No Phase 2 branch or PR has been created.

CI follow-up: run 38067594051 passed all build/unit/SEO/CRM gates but exposed two catalogue height failures on Linux (320px and 1024px) and a guide navigation timeout. Card padding and inter-row spacing were reduced without reducing font sizes, touch targets or the existing 440px assertion. The guide document returned HTTP 200 promptly; the trace isolated a pending cold Next image-optimizer request for the shared YouTube hero PNG. A 106KB pre-encoded WebP now renders that same visual directly, while original Open Graph, Twitter and Article schema image URLs remain unchanged. No test timeout, navigation wait condition, assertion or skip was loosened. CI now retains service-card traces as well.

Known unrelated check: an exploratory all-file unit invocation found a pre-existing `topical-authority.test.ts` six-platform expectation while `content-clusters.ts` includes Telegram. Those files match main and this test is outside the configured PR CI commands. It was not altered or suppressed to make this PR green. The exploratory command also omitted the path-alias loader; the configured 200-test invocation with its required loader passed.

Second Linux CI trace (run 38070199045): all catalogue widths passed; Facebook and Twitter guide navigation exposed the same pending image-optimizer request on two other shared PNGs. Those two assets now also have pre-encoded WebP rendering (110KB/83KB), retaining original SEO URLs. The YouTube asset returned HTTP 200 in 40ms; Next hydration normalized its `src` to an absolute URL, so the added regression now selects by exact accessible image name and asserts the resolved pathname plus successful decode, rather than a relative-only DOM attribute. Existing navigation, SEO and conversion checks remain intact. This blog-only follow-up does not change the measured homepage/catalogue source or their review images.

Run 38071797283 passed 248 browser cases and retained the same 51 existing skips; only the LinkedIn contextual guide still timed out. The recurring cold optimizer stalls move between shared PNG assets under the full Linux suite. The existing eight-guide regression group now uses pre-encoded versions of its eight shared hero assets (83–110KB each). Each guide additionally asserts exact accessible image name, resolved WebP pathname, successful decode and original PNG Open Graph URL. Source PNGs, article data, JSON-LD and original SEO metadata remain intact. This covers the affected regression group without a new full-site audit, timeout increase or coverage reduction.

Final CI-fix production build qCY3yQx2TSF4-F4WjsxVj: 73 affected browser checks and 14 targeted checkout/guide checks passed locally. All 22 review images and the 10-document rendered SEO comparison were regenerated from this build. The final five-run comparison supersedes earlier after-build numbers. Median browser click time was approximately unchanged (82→80ms), but observed render wait rose 730→915ms. The /services route-resource median rose only 134→148ms; the same two client chunks and existing router prefetch paths appear in both versions. This narrows the observation to render/post-response work without proving a causal root or estimating hydration time. No runtime instrumentation, animation or client dependency was added.


## Brand-consistency follow-up (pending new rendered review)

Following visual feedback, **retain the existing SocialRUSH dark charcoal/black and signature orange theme** rather than switching the website to a cream-led identity.

- Replaced the cream homepage workspace mockup with a charcoal command-center presentation and restrained orange borders, status accents and clear controls. The sample-data disclosure remains visible.
- Replaced the cream final CTA, login feature panel and Services selection guide with dark surfaces; aligned shared marketing, package, editorial and customer dashboard styles to the existing palette.
- Strengthened hierarchy on service-discovery cards, the active platform selector, search focus and the homepage platform rail, using CSS only.
- Kept the original hero H1, all page-specific metadata, schema, service data, live prices, auth, wallet, orders and checkout behavior.
- Added a dedicated unit regression test for forbidden cream values in premium templates and a rendered desktop palette check in Playwright.

**Review status:** These changes are in the same draft PR. Previously published screenshots and the five-run performance comparisons were captured **before** this brand-consistency revision and cannot establish its final visual quality or speed. Capture new rendered desktop/mobile comparisons and repeat matching performance checks before approval. The design PR intentionally disables Vercel Git deployments on this branch; do not merge or promote to production without review.
