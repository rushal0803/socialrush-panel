# Third service/platform batch — 9 November 2026 IST

Draft work on top of #750, source e37a6b2fadf8994ed579a5d0b51afc205848aa07. No production deployment, PR merge, paid subscription, database mutation, indexing submission or preview bypass link was performed. UTC capture timestamps are retained in machine evidence; the report date uses the owner's client timezone.

## Inventory and implemented scope

Fresh public GET crawl: all 172 sitemap URLs returned 200. The 69 distinct service/platform URLs recorded in the earlier inventory are still present in that sitemap. This verifies the recorded cohort, not the completeness of every non-sitemap route or its suitability for indexing. HTTP 200, an index directive and a declared canonical do not prove Google/Bing indexing. No search-demand query evidence is available.

Earlier detailed batches cover 20 distinct URLs; their diffs and reports record 18 improved and two retained without a change. This batch audits and improves ten additional, distinct URLs. Detailed coverage is now 30 of the recorded 69; 39 inventory candidates remain for detailed eligibility/content review. The historical phrase “49 remaining eligible pages” is not independent proof that every remaining catalog page should be indexed. Retain catalog-only restrictions.

| Page | Intent and confirmed gap | Implementation |
|---|---|---|
| /instagram-growth-india | Compare profile followers with post/Reel activity; existing overview does not explain what purchased saves/shares can establish | Original destination, authenticity, geography, live-terms guidance and refund link |
| /facebook-growth-india | Page/post/video/group comparison; clarify approval and full-watch assumptions | Original group-destination, view-retention and interested-customer distinctions with terms link |
| /youtube-growth-india | Channel subscriptions versus video activity and watch time | Distinguish valid YPP watch time, Shorts compatibility and unresolved billed-unit confirmation; no invented watch-hour rate |
| /linkedin-growth-india | Profile/Page eligibility versus post likes | Explain company-Page confirmation, professional endorsement and industry/geographic limits |
| /tiktok-growth-india | Public-profile eligibility and local access | Explain local-access checks without asserting current availability or a workaround; separate follower destination from catalog engagement |
| /x-growth-india | Profile followers versus post likes/views/reposts and niche services | Original terminology, unique-reader limitations and crypto-label cautions |
| /services/twitter-likes | Public-post likes; live title is generic despite tailored dedicated route metadata | Restore dedicated prerender ownership and its existing title/description; distinct likes-versus-reposts and retention questions |
| /services/twitter-views | Public-post view counts; same route collision | Restore dedicated metadata; distinct unique-viewer/full-watch and website-conversion questions |
| /services/twitter-retweets | Post repost action; same route collision | Restore dedicated metadata; distinguish quote posts/comments and distribution assumptions |
| /services/twitter-crypto-followers | Profile followers with a catalog niche label; same route collision | Restore dedicated metadata; no investor/expertise inference or post-engagement promise |

Hubs keep their existing metadata, canonical, schemas and related service links. New sections render on the server with H2/H3 structure, readable stacked mobile cards and a crawlable refund link. Each platform has distinct buyer decisions. Four service FAQs are inserted into the existing single FAQ data array, which renders both visible answers and FAQPage: no second FAQ graph is added. No ratings/reviews, geographic promises, new offers, prices, delivery guarantees or outcome claims are introduced.

## Confirmed route ownership defect

`/services/[slug]` generates every active catalog code even when a dedicated route file exists. All four public X service pages currently render lowercase generic titles instead of their existing dedicated metadata. This batch excludes only these four audited codes from both catch-all parameter sources. The local production prerender manifest now has each exact dedicated path as srcRoute; the raw HTML has the intended title, description, Service, BreadcrumbList and single FAQPage.

This restores an existing dedicated page implementation, including its existing live-only order card, rather than changing order arithmetic or APIs. It is a material rendering-path change and requires conversion regression coverage. No other catalog owner or catalog-only eligibility is changed. Further X crypto route collisions remain outside this batch.

## Pricing, schema and conversion gates

The hubs quote no new rates. Four services retain the existing live-catalog availability gate and no Offer graph. This run does not claim fresh production vendor/catalog price verification. The isolated existing fixture supplies likes=₹499, views=₹49, reposts=₹599 and crypto followers=₹4,999 per 1,000. Browser tests verify the 1,000-unit total and exact service/quantity/public-link parameters carried to the existing order-review route. These are fixture consistency results, not current production quotations.

Semantic checks parse actual JSON-LD, require one Service/BreadcrumbList/FAQPage on each restored service page, and verify every new FAQ answer matches visible content. This is local/schema consistency validation, not an official Google Rich Results Test or evidence of FAQ rich-result eligibility. Initial response HTML is checked independently of hydration. Earlier twenty service pages retain their schema/precision checks. Existing checkout/login selection regressions are included. No paid order is placed.

## Search, robots and discovery

The fresh robots response explicitly allows OAI-SearchBot on public paths and permits Googlebot/Bingbot under the wildcard policy, while excluding private/auth/API/checkout paths. No crawler/training policy was edited. All ten batch URLs have 200 responses, matching declared canonicals, index/follow meta directives and no response noindex in the captured production baseline.

The sitemap-only response-anchor graph still cannot reach /press, /partners or /tools/social-media-growth-planner from the homepage. #747 supplies the pending footer fix; it has not reached production. This does not prove no other non-sitemap page links to them. Full crawl evidence is in site-crawl-20261109.json. No orphan claim is made from routes outside the fetched graph. No sitemap/indexing expansion was performed. Existing international targeting is retained; this batch introduces no country variants.

GSC Wizard get_account_info was retried and returned payment_required / subscription_required. No plan was purchased and no further paid-gated calls were retried. Google/Bing indexing, clicks, impressions, CTR, position and selected canonicals remain UNKNOWN. Use the free official exports below.

## Exact free search evidence required

From the verified URL-prefix https://www.getsocialrush.com/ or equivalent domain property, export Web Search performance for 11 October–7 November 2026 and 13 September–10 October 2026 (two complete 28-day windows ending before the latest two UTC dates). Preserve property, timezone, filters and preliminary-data indicators. Repeat all-country and India-filtered views.

- Search Performance → Pages and Queries, with Clicks, Impressions, CTR and Average position; include Dates, Countries, Devices and Search appearance tabs and export caps/row counts.
- For each exact canonical in this batch, apply an exact Page filter and export Queries and Dates for both windows. Aggregate Pages/Queries tabs do not reconstruct query-to-page pairs. Privacy-omitted or truncated rows are unknown, not zero demand.
- Page Indexing report: reasons, affected example URLs, last-updated date and scope. Example lists are incomplete.
- URL Inspection indexed-page results for all ten: verdict, coverage/index state, last crawl, robots permission, user-declared and Google-selected canonical. Preserve indexed evidence separately from a Live Test.
- Sitemap status: submitted/read dates, success/errors/warnings, discovered counts and the exact sitemap URL.
- Bing Webmaster Tools: equivalent performance exports and URL Inspection evidence for the same canonical URLs and dates. No indexing submission is authorized by this checklist.

The dates are a reproducible initial comparison, not a claim that all reported data is settled. Retain actual export dates, Google/Bing reporting timezone and any lag. Do not send credentials or customer records.

## AI discovery and INP

No observed AI answer citations were collected. Keep actual clickable citations, retrieval results and crawler fetches as separate dated evidence. Evaluate service-eligibility, destination-link, pricing-unit, geography and outcome-limit questions. Record engine/product, query, locale, signed-in state, date, referenced URL, supporting quote and citation accuracy. No schema or crawler allowance guarantees a citation.

The preserved React/CPU profiles were reanalyzed in inp-profile-attribution-20261109.md. The first slow early trial spends 308.7ms in pointerdown processing; ordinary click processing is 20.4ms versus 20.9ms in the mounted control. Initial mount overlaps the early event. Missing original profiling bundles/source maps and a common CPU/Event Timing clock anchor prevent reliable component attribution. No application performance optimization or field-INP improvement is claimed. The historical 208ms field baseline was not independently refreshed here.

## Analytics and release limits

#745's attribution fixes remain included in #747 and this stack. Source-classification/duplicate/privacy regressions and the verified-revenue/checkout tests were rerun. No historical event rewrite, revenue estimate or production financial query was performed. Organic sessions, verified paid organic orders, abandonment and service conversion rates remain UNKNOWN in this report. This batch does not complete the broader analytics workstream; production/preview collection exclusions and reporting reconciliation need a separate reviewed change.

All seven earlier PRs are still draft/open/unmerged. Their exact heads and complete returned CI job/step summaries are preserved in release-pr-verification-20261109.json. Main build/browser/customer fixture and isolated PostgreSQL jobs pass; optional performance jobs and six visual screenshot steps are skipped. Latest matching #747–#750 previews are READY, not proof of hosted QA. A local unreferenced merge-tree simulation found no conflicts in #748 → #747 → #749 → #750; see release-merge-simulation-20261109.json. #747 is a squash of #744–#746; do not merge those source PRs as well. After owner approval and each merge, retarget/rebase and reverify all remaining heads. No PR is approved for release by this report.

Protected hosted/mobile QA remains BLOCKED. The Vercel web-fetch tool explicitly creates/reuses a temporary share link, so it was not used under the owner's prohibition. No share/bypass or protection change was attempted. Local mobile screenshots are fixture evidence only. This draft must remain unmerged until hosted QA and exact-head release checks are complete and the owner explicitly approves.

## Before/after rendered metadata

Production baseline versus local fixture build; six hub values remain unchanged.

| Path | Before title | After title | Before description | After description |
|---|---|---|---|---|
| /instagram-growth-india | Instagram Growth Services in India  /  SocialRUSH | Instagram Growth Services in India  /  SocialRUSH | Explore Instagram growth services in India for followers, likes, views, comments, saves and shares. Compare goals and choose the right option. | Explore Instagram growth services in India for followers, likes, views, comments, saves and shares. Compare goals and choose the right option. |
| /facebook-growth-india | Facebook Growth India  /  Followers, Likes, Views & Shares  /  SocialRUSH | Facebook Growth India  /  Followers, Likes, Views & Shares  /  SocialRUSH | Explore Facebook growth services in India for followers, likes, views, shares and group members. Compare goals and choose the right SocialRUSH option. | Explore Facebook growth services in India for followers, likes, views, shares and group members. Compare goals and choose the right SocialRUSH option. |
| /youtube-growth-india | YouTube Growth Services India  /  Subscribers, Views & Watch Hours  /  SocialRUSH | YouTube Growth Services India  /  Subscribers, Views & Watch Hours  /  SocialRUSH | Compare YouTube growth services in India for subscribers, views, likes, comments and watch hours. Choose by goal, review live details and compare the right service before ordering. | Compare YouTube growth services in India for subscribers, views, likes, comments and watch hours. Choose by goal, review live details and compare the right service before ordering. |
| /linkedin-growth-india | LinkedIn Growth Services India  /  SocialRUSH | LinkedIn Growth Services India  /  SocialRUSH | Explore LinkedIn growth services in India for followers and likes. Compare professional audience and engagement goals to choose the right option. | Explore LinkedIn growth services in India for followers and likes. Compare professional audience and engagement goals to choose the right option. |
| /tiktok-growth-india | TikTok Growth Resources in India  /  SocialRUSH | TikTok Growth Resources in India  /  SocialRUSH | Explore practical TikTok growth resources and relevant follower and engagement options for Indian creators, brands and agencies. | Explore practical TikTok growth resources and relevant follower and engagement options for Indian creators, brands and agencies. |
| /x-growth-india | Twitter / X Growth Services India  /  Followers, Likes, Reposts & Views  /  SocialRUSH | Twitter / X Growth Services India  /  Followers, Likes, Reposts & Views  /  SocialRUSH | Compare Twitter / X growth services in India for followers, likes, reposts and views. Match account growth or post engagement to the right public-link service. | Compare Twitter / X growth services in India for followers, likes, reposts and views. Match account growth or post engagement to the right public-link service. |
| /services/twitter-likes | twitter likes  /  SocialRUSH | Buy Twitter (X) Likes  /  X Likes Service  /  SocialRUSH | Order twitter / x likes from SocialRUSH with current service facts loaded in the secure order flow, dashboard tracking, and public-link guidance. | Buy Twitter (X) likes for eligible public posts with transparent pricing, clear service requirements and dashboard order tracking from SocialRUSH. |
| /services/twitter-views | twitter views  /  SocialRUSH | Buy Twitter (X) Views  /  X Views Service  /  SocialRUSH | Order twitter / x views from SocialRUSH with current service facts loaded in the secure order flow, dashboard tracking, and public-link guidance. | Buy Twitter (X) views for eligible public posts with transparent pricing, public-link ordering, clear requirements and dashboard tracking. |
| /services/twitter-retweets | twitter retweets  /  SocialRUSH | Buy Twitter Retweets / X Reposts  /  SocialRUSH | Order twitter / x retweets from SocialRUSH with current service facts loaded in the secure order flow, dashboard tracking, and public-link guidance. | Order Twitter retweets, now commonly called X reposts, for eligible public posts with transparent pricing, clear requirements and dashboard tracking. |
| /services/twitter-crypto-followers | twitter crypto followers  /  SocialRUSH | Twitter (X) Crypto Followers Service  /  SocialRUSH | Order twitter / x crypto-based followers from SocialRUSH with current service facts loaded in the secure order flow, dashboard tracking, and public-link guidance. | Explore the Twitter (X) crypto followers service with current pricing, quantity limits, public-profile requirements and dashboard order tracking. |

All seven historical exact heads also have matching READY preview deployments from Vercel list_deployments filtered by SHA; see vercel-head-verification-20261109.json. No READY record is treated as authenticated content or mobile QA.

Source overlap was verified byte-for-byte: every file changed by #744, #745 and #746 has identical content at #747's recorded head (including their tests and workflow/package changes). See foundation-source-overlap-20261109.json. This is stronger evidence of inclusion than ancestry, since #747 uses a squash commit.

## Local verification result

249 unit tests passed; TypeScript and lint passed (existing warnings). Production builds passed both without a live backend and with the isolated active catalog fixture. Ten new mobile/schema/initial-HTML tests passed. Four additional required-active-fixture runs passed, verifying all four X service totals and exact order-review parameters; no inactive fallback was allowed in that run. Thirty-four existing browser checks passed in the earlier combined run, including all twenty previous service pages and fourteen order/responsive regressions. Four initial screenshot-scroll failures were test-harness stability issues after the assertions; the unnecessary scroll before full-page capture was removed, and the ten new tests were rerun successfully. The stronger pricing check initially exposed missing build-time fixture setup; an isolated preloaded-backend build supplied active facts and all four required-active checks passed.

Local mobile screenshots are test attachments; TikTok guidance was manually inspected and its text/cards/refund link fit the mobile viewport. Other pages have automated visibility/content/overflow checks, not a claim of protected hosted visual approval. Hosted QA remains BLOCKED. Remote CI and preview status at the final committed head are recorded in the draft PR after publication.
