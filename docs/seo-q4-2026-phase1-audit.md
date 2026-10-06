# Q4 2026 SEO phase 1: public technical baseline

Date: 2026-10-06. Source main: `198f2ca0b0bfa9d01cd8dc1823469a9d285712fd`.
Branch: `fix/seo-q4-indexation-audit`. No merge or production deployment.

## Evidence and scope

Crawled 202 URL targets: all 168 live sitemap URLs, additional static public routes and discovered public link targets. Of the sitemap URLs, 167 returned HTTP 200 and one returned 404. No sitemap redirects, noindex leakage, duplicate locs, duplicate titles, duplicate descriptions or malformed JSON-LD were observed. Thirty-two URLs supplied hreflang; the fetched targets supplied reciprocal return links. These are public crawl checks, not Google indexing or rich-result eligibility verification.

Latest package.json uses Next.js 15.5.26 and React 19.2.8. Existing SEO systems include query ownership, permanent aliases, metadata helpers, live-service pricing with catalog fallbacks, topical clusters, international service inventories, technical audit scripts and an admin indexation command centre. They were retained.

## Changes

- Replace sitemap's 404 `/tools/social-media-growth-goal-planner` with the existing canonical `/tools/creator-growth-goal-planner`.
- Add existing self-canonical, indexable `/social-media-growth-india`, `/help-center` and `/partners` to sitemap discovery.
- Correct international subscriber pages' 404 calculator link to `/tools/youtube-subscriber-growth-rate-calculator`.
- Shorten descriptions of 22 international service pages while retaining market, display currency, exact public destination, INR checkout and password guidance. The existing 180-character regression check failed on main; shortened descriptions pass it.
- Keep the growth planner's heading, introductory copy, breadcrumbs and explanatory content outside its query-dependent Suspense boundary, so the static shell is available before JavaScript. Form initialization and calculations remain unchanged.

Prices, payment amounts, wallet calculations, order logic, Supabase migrations, service availability and private-page indexing rules were not changed. No real payment or order was submitted.

## Remaining work and limitations

- Actual Google indexation, last Google crawl, selected canonicals, clicks, impressions, CTR and positions: **GSC VERIFICATION REQUIRED**. The connected Search Console service returned `payment_required`. No account/subscription change was made.
- Required evidence: Pages/indexing export, sitemap status, Performance Pages/Queries CSVs for the last three months, and URL Inspection results for priority money pages. Manual actions, security, HTTPS and field CWV reports still need review.
- Complete price reconciliation requires authoritative catalog/database access. A legacy ₹2,999 LinkedIn phrase exists in an excluded `redirectTo` article in blogData.ts; it was not observed in crawled public HTML. Do not publish or replace it with an invented price.
- Potential missing incoming HTML links to partnerships and some platform catalog hubs need rendered-navigation review. The planner is linked after the interactive audit runs; absence from the initial HTML graph alone does not prove it is unreachable.
- Semantic structured-data checks, full mobile responsiveness, query-parameter rendering, field LCP/CLS/INP, lab performance and conversion attribution remain unverified.
- The broad SEO architecture suite is blocked by the current native Node runner's extensionless imports. The supplied alias hook then fails to resolve `searchDemandPriceGuides`. Targeted SEO tests execute independently.
- Older SEO_INVENTORY.md and SEO_SEARCH_CONSOLE_WORKFLOW.md describe earlier scope and must not be treated as current inventories.

## Search visibility and competitor work

Public search surfaced existing Instagram follower, LinkedIn follower and LinkedIn price-guide pages. This does not establish exact Google ranks or indexing status. Preliminary competitors surfaced include InstaBoost, FollowKart, Social King, SMM Orange and Indian panel providers. No search volumes, difficulty, backlinks, relative ranking claims or explanation of why a competitor outranks SocialRUSH have been invented. The complete competitor gap audit follows after establishing reliable query and authority evidence.

## Changelog / scoreboard

The companion audit workbook contains the master URL inventory, 53 exact query owners, crawl link graph, prioritized backlog, changelog, scoreboard and methodology notes. Green means tested public technical fields pass; it never means indexed or ranking. Changes are prepared on the dedicated branch only. Re-audit production after an explicitly authorized merge/deployment.

## Validation of final changes

TypeScript, lint (existing warnings), production build and `git diff --check` passed. Thirty existing targeted SEO tests passed. The final build generated all 313 static pages. Inspection of built output confirmed:

- Planner initial HTML contains one H1 plus static explanatory and FAQ text.
- Built sitemap contains 171 unique URLs, includes the four corrected/added destinations, and excludes the wrong goal-planner URL.
- All six international YouTube subscriber pages link to the valid existing calculator.
- Live production has not yet received these changes; baseline findings remain until release.

Full mobile and interactive query-prefill verification remain release checks. No all-device pass is claimed.
