# Service-page evidence sprint — 8 November 2026

This is a draft, not a production release. Scope: ten existing eligible canonical service pages. Search visibility, rankings and AI citations are unknown unless separately evidenced. No checkout, order logic, catalog rates, authentication, database records or crawler permissions change.

## Existing PR verification and proposed merge sequence

All five PRs are OPEN, draft and mergeable against unchanged main 35fcaf731447a948b69a9ae917b5af596d22711e. On their exact heads, the full pre-merge workflow executed build, browser smoke, final customer fixture checks and isolated PostgreSQL checks successfully. Optional comparison/visual/performance jobs were SKIPPED, not successful visual QA.

| PR | Exact source SHA | Successful full workflow | READY preview deployment |
|---|---|---|---|
| 744 | 2736c825f92970f1bfbbf410f6f781ad8bf2d9be | 42465642518 | dpl_5pEgXQiNU2fd7zTdnMwHLdYdhCSD |
| 745 | f09f7e6199e2dea0ad4c8921f5cc002c1393d409 | 42468248676 | dpl_83sPTr3Gg2F9ck121BAAbcvCwtS1 |
| 746 | d72bb3d8ba65b5ca46c42c011a3f835c389493f2 | 42469801592 | dpl_7RLXG4sBrUou9hqsvxsVfRNW8sZF |
| 747 | cc12b5a746e330dc8689b6e05dbba12edc29090b | 42473476960 | dpl_Bxpnf9tzvHrjZXyVhqakpXpqSxrz |
| 748 | 94a0c1a5754faef41aeb1408fc9604c1727caab7 | 42483936058 | dpl_GQ2V2bUCUFGucKspfS2qZNAyNJAC |

Vercel metadata matched each SHA and target was preview (null), not production. #748's complete monitor also passed run 42483943410. Branch-protection administration returned 403 in the preceding audit; observed successful checks do not establish every owner-configured release requirement.

#747 is a squashed combination, so ancestry alone does not prove inclusion. Compared each changed application/doc file in #744–#746 against #747: identical. Shared package.json and pre-merge workflow contain the combined regression wiring. Do not merge source PRs #744–#746 in addition to #747. They are alternative delivery paths for the same changes. No source PR was closed or altered.

Proposed owner-approved order: #748 independently, then #747, then this service-page draft stacked on #747. Git merge-tree combined #747 and #748 without conflict (tree e5b85cbb7f485ec32736291432d73d76df1edd2d). Conflict-free composition is not a combined runtime pass. After any merge, rebase/retarget the remaining draft and rerun its exact-head checks and previews. No merge is authorized by this document.

Protected hosted mobile visual QA remains BLOCKED: auto-review rejected a request for one-hour share links because link holders could access protected deployments. Explicit approval was requested; no bypass was created after the rejection. Shared desktop is enabled/state unknown for environment ccarenv_b64_Y2NhcmVudl9hZjkxY2MwMGE2MzQ4MTkxOTcyNWIyMjE0OWZmNDcxMQ, but no desktop js/computer-use tool is offered. Existing authenticated browser access could not be verified. Do not relabel public/local screenshots as protected hosted QA. Prior authenticated HTML observations remain historical evidence, not newly completed visual checks.

## Selection and indexing eligibility

The first four pages are user-selected. Remaining six are the highest-count eligible service pages in a read-only, last-28-day organic_landing_view aggregation restricted to medium=organic and Google/Bing root search referrers. Counts are events/distinct stored session IDs, not validated organic sessions, unique people, Google impressions or query demand. Historic attribution contamination remains; no business forecast uses these counts.

All ten freshly fetched public pages returned HTTP 200, one H1, matching production canonical, index/follow meta robots and no response noindex. All occur in the 172-URL sitemap. Titles are distinct; descriptions exist. All expose server-rendered Service JSON-LD and crawlable service/research links. Public robot rules allow Googlebot/Bingbot and OAI-SearchBot; no training-bot rules changed. These establish technical eligibility, not actual indexing. Google/Bing indexing and selected canonicals are UNKNOWN for every page.

| Page | Filtered landing events / session IDs | Content and intent findings | Targeted change |
|---|---:|---|---|
| /buy-instagram-followers-india | 1965 / 1624 | Profile follower packages; no-refill condition and no engagement/retention guarantee already explicit; precise price examples supplied by #747 | Preserve two decimals in quick answer; no new Offer or checkout change |
| /instagram-likes | 535 / 440 | Post/Reel intent, quantity, geographic caveat and platform-removal risk already clear | Explicit per-1000 unit in existing Offer |
| /youtube-subscribers | 1885 / 1606 | Channel-link intent and YPP/monetization limits present; original guidance distinguishes subscribers from watch time | Existing Offer unit and consistent quick-answer currency |
| /youtube-views | 14 / 11 | Video/Short intent; visible demo labelled illustrative; no ranking/watch-hours/monetization promises | Existing Offer unit |
| /buy-facebook-followers-india | 295 / 243 | Follower intent distinct from post likes; existing FAQ and service requirements remain | Existing Offer unit |
| /instagram-views | 243 / 211 | Reel/video intent; catalog listing labelled; live-only availability deliberately withholds Offer | Retain existing content and schema; do not fabricate availability |
| /linkedin-followers | 240 / 213 | Profile eligibility vs company-page uncertainty explicit; no lead guarantee; route-owned breadcrumb corrected by #747 | Existing Offer unit and quick-answer grammar/currency |
| /facebook-likes | 70 / 52 | Public-post intent, India caveat and Meta/inauthentic-engagement limits already present; #742 is a separate older draft, not included here | Existing Offer unit only; no duplicate rewrite |
| /twitter-followers | 54 / 39 | One X/Twitter intent; public profile, geographic and engagement limits explicit; live-only Offer withheld | Consistent quick-answer currency; no new Offer |
| /telegram-members | 33 / 28 | Public channel/group distinctions and access conditions present; member-count language needs clearer authenticity/region limits; visible FAQ has no FAQPage | Clarify count vs authentic interest, add geography and platform-risk answers, share visible FAQ source with SSR schema, existing Offer unit |

Existing titles, descriptions, canonicals, rates, order links and intent ownership are retained where the audit found no defect. No doorway/locality variants or generic ten-page content dump are added. Reference-quantity schema is limited to seven existing offers in this batch. Missing/live-only offers stay absent. FAQPage is not a promise of Google rich-result eligibility. [Schema.org referenceQuantity](https://schema.org/referenceQuantity) explicitly describes the quantity for which a price applies; UnitPriceSpecification pairs the unchanged INR price with 1000 likes/views/followers/subscribers/members.

## Mobile performance and Instagram INP investigation

Read-only first-party cohort: created within last 28 days, mobile, release 35fcaf731447, navigation_type=navigate. Values are p75; parentheses are event counts, not independent users. Small samples are diagnostic only, not sufficient for a CWV pass.

| Page | LCP ms (n) | TTFB ms (n) | INP ms (n) | CLS (n) |
|---|---:|---:|---:|---:|
| Instagram Followers | 2164 (267) | 981 (281) | 208 (138) | .0002 (219) |
| Instagram Likes | 2342 (116) | 1153.25 (124) | 168 (63) | .0001 (95) |
| YouTube Subscribers | 2380 (365) | 1022.5 (387) | 184 (227) | .0001 (328) |
| YouTube Views | 1650 (8) | 703 (9) | 162 (8) | .01205 (8) |
| Facebook Followers | 2141 (86) | 881 (90) | 164 (59) | .0002 (71) |
| Instagram Views | 2343 (88) | 796.5 (91) | 208 (51) | .0003 (69) |
| LinkedIn Followers | 1918 (12) | 544 (13) | 120 (6) | 0 (9) |
| Facebook Likes | 2678 (15) | 886 (15) | 218 (8) | .0002 (12) |
| X/Twitter Followers | 1657 (4) | 876 (4) | 94 (2) | .01285 (4) |
| Telegram Members | 4645 (4) | 1150.25 (6) | 132 (3) | .08975 (2) |

Instagram Followers current-release INP: median 128ms, p75 208ms, p95 402.8ms, 138 events / 132 distinct stored session IDs. The historical 137-event reading is not a fixed constant; fresh events change sample sizes. Previous release 36c085044cd7 has p75 232ms (207 events); differing release windows are observational and do not prove improvement caused by code.

Stored INP metadata has only metric/value/release/page_template/navigation_type/landing_path/attribution_model. It does not retain interaction target, Event Timing input delay, processing or presentation attribution. Therefore it cannot identify the cause of 208ms. Prior five 4x-CPU quantity/stepper trials observed 40–64ms; a new trace also exercises early-load inputs and FAQ expansion at 4x/6x CPU. Report trace results separately; neither lab non-reproduction nor a single slow lab interaction establishes the field cause. No speculative INP fix, checkout edits or production telemetry writes are included. Next: opt-in interaction attribution evidence or reproducible trace identifying the responsible long task, followed by a focused tested fix.

## Exact free Search Console exports required

GSC Wizard get_account_info currently returns payment_required/subscription_required. No subscription was purchased. No first-party GSC table/export was found in the earlier repository/database inventory. To proceed without a paid connector, supply exports from the verified https://www.getsocialrush.com/ URL-prefix property (or equivalent domain property):

1. Search results, search type Web: export the last 28 complete days and preceding 28 complete days with explicit start/end dates; repeat India-only and all-country views. Include Pages, Queries, Dates, Countries, Devices and Search appearance CSV tabs with Clicks, Impressions, CTR and Average position. Preserve the Filters tab/property identity and note preliminary data.
2. For each of these ten exact URLs, apply an exact Page filter and export Queries and Dates for the same windows, India and all countries. Standard aggregate Queries and Pages exports cannot reconstruct query-to-page pairs; page-filtered query exports are required. Also export 3-month/16-month daily histories for seasonality if available.
3. Page indexing report: export indexed/not-indexed reasons, affected example URLs and last-updated date. Example lists are incomplete and cannot establish all ten URLs' status.
4. URL Inspection of each exact canonical: retain the indexed-page verdict, coverage/indexing state, last crawl, robots/indexing permission, user-declared canonical and Google-selected canonical. Export official API JSON where authorized or the corresponding inspection evidence. Keep indexed evidence separate from a Live Test, which does not prove indexing.
5. Core Web Vitals mobile report and linked CrUX examples if available, retaining field window/date and URL grouping. These do not replace per-page interaction attribution.

Do not send credentials, OAuth tokens or customer records. Bing Webmaster evidence, if available: Search Performance page/query exports for the same dates and URL Inspection canonical/index status for the ten URLs. Until official evidence arrives, leave search clicks, impressions, CTR, position, queries and indexing UNKNOWN.

## AI visibility evaluation and validation

For each dated evaluation, preserve engine/product/model if shown, country/locale, exact non-personal query, signed-in/personalized state and a screenshot/export. Record (a) URL fetched by a crawler, (b) surfaced in search retrieval, (c) actual answer citation with clickable SocialRUSH URL and supporting quote as separate observations. Test buyer questions about service eligibility, pricing units, link types, geography and outcome limitations. Repeat identical prompts over time; do not treat an llms file, schema pass, search appearance or crawler visit as an actual citation. No live citation result is claimed in this sprint.

New behavioral unit tests cover reference quantities, exact/fractional rates, invalid rates, withheld offers and FAQ/JSON-LD parity. Ten mobile browser tests cover direct response, H1/canonical, offer units, Telegram visible answers, precision and horizontal overflow, with screenshots retained as CI artifacts. Existing full unit/SEO/type/lint/build/browser/customer/wallet tests remain. The pre-merge workflow now also targets this draft's foundation base so stacked PR CI actually executes. Protected hosted QA remains a separate gate.

Latest exact-head CI, preview, screenshots and trace results are recorded in the draft PR description after execution. No production release, historical event rewrite or database mutation is authorized.

### Additional confirmed build defect and trace result

The first new mobile browser pass caught a deterministic missing Service schema on Facebook Followers in the local production build. Its prerender manifest identified srcRoute=/[service], whose Facebook branch returned the bare landing component, even though a dedicated static route supplied Service/FAQ data. Catch-all static generation overlapped dedicated canonical route files. Canonical route generation now excludes dedicated /buy-... owners and the dedicated /tiktok-followers owner; a behavioral test reconciles every generated canonical against real app files. This changes route ownership only, not URL, redirects, metadata intent, catalog or order behavior. The audit also exposed existing duplicate route ownership on adjacent service canonicals; those owners now remain authoritative rather than being overwritten by the catch-all. New ten-page runtime checks enforce Service schema; withheld offers remain withheld.

Read-only catalog verification found all ten active, order-accepting rows and matched the displayed rates, quantities, delivery and refill facts; no database record changed. New early-load trace maxima were 56/64/88ms at 4x CPU and 104/264/112ms at 6x CPU. The one slow 6x trial included a stepper icon interaction (264ms; pointerdown processing 154.8ms, click input delay 195.7ms) and FAQ SUMMARY interaction (232ms). Other trials did not reproduce these durations. Event targets and timings alone do not identify the JavaScript/style/layout cause, or establish that it caused field p75; no performance fix is claimed. Preserve this trace as a lead for controlled profiling before any fix.
