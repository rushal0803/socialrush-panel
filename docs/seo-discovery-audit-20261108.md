# SocialRUSH search discovery audit — 8 November 2026

## Executive summary

Baseline commit: `35fcaf731447a948b69a9ae917b5af596d22711e`; latest Vercel production deployment is READY at this commit. Public crawl on 8 November 2026 inspected all 172 sitemap URLs using GET without following redirects. All returned HTTP 200, had one H1, a title and a matching canonical (homepage slash normalized). No duplicate titles or meta-robots noindex found. This does not prove Google indexing, ranking, crawl frequency or AI recommendation eligibility. Response-header robots directives, complete internal-link graph, descriptions and semantic JSON-LD were not included in this pass.

There is no confirmed site-wide indexing blocker from these checks. Investigate indexing exclusions and selected canonicals using fresh Search Console evidence before attributing poor visibility to technical causes.

Confirmed issues:

| Issue | Severity | Evidence | Action |
|---|---|---|---|
| Inconsistent public quantity prices | Medium | Instagram Followers section shows ₹1,000 / ₹5,000 while live rate is ₹999.90/1K and calculated values are ₹999.90 / ₹4,999.50 | Preserve two decimal places in shared server-rendered planning section; regression test |
| Mobile LCP above target | High performance priority | First-party web_vital events, last 28 days, mobile p75 3464ms (5777 events) | Next sprint: segment by template, release and navigation before performance edits |
| Organic baseline contains misclassified events | High measurement priority | organic_landing_view includes accounts.google.com (122 events), direct (97), Vercel referral (5) | Audit referrer classification and deduplication before reporting organic growth |
| Search Console access unavailable | Measurement blocker | GSC Wizard returned payment_required | Use free manual Google Search Console exports and priority URL Inspection; do not purchase tools |

## Engineering delivery

Branch `fix/seo-discovery-pricing-audit-20261108`. Shared SearchDemandPriceSection uses a formatter preserving paise. Existing calculated totals, catalog rates, checkout, payments and database are unchanged. New precision tests cover the verified ₹999.90 rate, fractional rates, Indian grouping and invalid-rate omission; included in PR CI.

## Crawl inventory and provisional keyword map

These are sitemap-discovered service and platform landing pages. Keywords below are derived from page titles and are intent candidates, not verified search demand. SEO score deliberately omitted: this crawl does not support a meaningful overall score. Each row passed HTTP, canonical, title, one-H1 and meta-robots checks (5/5 technical checks only). Index status UNKNOWN for every URL. The homepage canonical trailing-slash difference is equivalent, not a defect.

### Facebook

| Service URL | Primary intent candidate | HTTP | Index status | Canonical | Technical checks | Problem | Severity | Recommended fix | Verification |
|---|---|---|---|---|---|---|---|---|---|
| https://www.getsocialrush.com/facebook-growth-india | Facebook Growth India — Followers, Likes, Views &amp; Shares — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |
| https://www.getsocialrush.com/buy-facebook-followers-india | Buy Facebook Followers India — Plans in ₹ — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |
| https://www.getsocialrush.com/buy-facebook-group-members-india | Buy Facebook Group Members India — Pricing — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |
| https://www.getsocialrush.com/facebook-likes | Buy Facebook Likes India — Live INR Plans — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |
| https://www.getsocialrush.com/facebook-views | Buy Facebook Views India — Live INR Plans — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |
| https://www.getsocialrush.com/buy-facebook-shares-india | Buy Facebook Shares India — Live INR Plans — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |

### Instagram

| Service URL | Primary intent candidate | HTTP | Index status | Canonical | Technical checks | Problem | Severity | Recommended fix | Verification |
|---|---|---|---|---|---|---|---|---|---|
| https://www.getsocialrush.com/instagram-growth-india | Instagram Growth Services in India — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |
| https://www.getsocialrush.com/us/buy-instagram-followers | Buy Instagram Followers in the USA — USD Estimates — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |
| https://www.getsocialrush.com/uk/buy-instagram-followers | Buy Instagram Followers in the UK — GBP Estimates — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |
| https://www.getsocialrush.com/ca/buy-instagram-followers | Buy Instagram Followers in Canada — CAD Estimates — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |
| https://www.getsocialrush.com/au/buy-instagram-followers | Buy Instagram Followers in Australia — AUD Estimates — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |
| https://www.getsocialrush.com/ae/buy-instagram-followers | Buy Instagram Followers in the UAE — AED Estimates — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |
| https://www.getsocialrush.com/sg/buy-instagram-followers | Buy Instagram Followers in Singapore — SGD Estimates — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |
| https://www.getsocialrush.com/buy-instagram-followers-india | Buy Instagram Followers India — Pricing &amp; Terms — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |
| https://www.getsocialrush.com/instagram-likes | Buy Instagram Likes in India — INR Pricing — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |
| https://www.getsocialrush.com/instagram-views | Buy Instagram Views India — Live INR Plans — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |
| https://www.getsocialrush.com/buy-instagram-comments-india | Buy Instagram Comments India — Posts &amp; Reels — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |
| https://www.getsocialrush.com/buy-instagram-saves-india | Buy Instagram Saves in India — INR Pricing — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |
| https://www.getsocialrush.com/buy-instagram-shares-india | Buy Instagram Shares in India — INR Pricing — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |

### Linkedin

| Service URL | Primary intent candidate | HTTP | Index status | Canonical | Technical checks | Problem | Severity | Recommended fix | Verification |
|---|---|---|---|---|---|---|---|---|---|
| https://www.getsocialrush.com/services/linkedin | LinkedIn Services Catalog — Followers, Likes &amp; USA Options — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |
| https://www.getsocialrush.com/linkedin-growth-india | LinkedIn Growth Services India — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |
| https://www.getsocialrush.com/services/linkedin-usa-connections | Buy LinkedIn USA Connections — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |
| https://www.getsocialrush.com/services/linkedin-usa-post-likes | Buy LinkedIn USA Post Likes — US LinkedIn Likes — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |
| https://www.getsocialrush.com/services/linkedin-usa-reposts | Buy LinkedIn USA Reposts — US LinkedIn Reposts — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |
| https://www.getsocialrush.com/services/linkedin-usa-endorsements | Buy LinkedIn USA Endorsements — US Skill Endorsements — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |
| https://www.getsocialrush.com/services/linkedin-usa-group-members | Buy LinkedIn USA Group Members — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |
| https://www.getsocialrush.com/services/linkedin-usa-followers | Buy LinkedIn USA Followers — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |
| https://www.getsocialrush.com/services/linkedin-usa-custom-comments | Buy LinkedIn USA Custom Comments — US LinkedIn Comments — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |
| https://www.getsocialrush.com/us/buy-linkedin-followers | Buy LinkedIn Followers in the USA — USD Estimates — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |
| https://www.getsocialrush.com/uk/buy-linkedin-followers | Buy LinkedIn Followers in the UK — GBP Estimates — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |
| https://www.getsocialrush.com/ca/buy-linkedin-followers | Buy LinkedIn Followers in Canada — CAD Estimates — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |
| https://www.getsocialrush.com/au/buy-linkedin-followers | Buy LinkedIn Followers in Australia — AUD Estimates — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |
| https://www.getsocialrush.com/ae/buy-linkedin-followers | Buy LinkedIn Followers in the UAE — AED Estimates — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |
| https://www.getsocialrush.com/sg/buy-linkedin-followers | Buy LinkedIn Followers in Singapore — SGD Estimates — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |
| https://www.getsocialrush.com/linkedin-followers | Buy LinkedIn Followers India — Live INR Packages — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |
| https://www.getsocialrush.com/linkedin-likes | Buy LinkedIn Likes India — Live INR Plans — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |

### Telegram

| Service URL | Primary intent candidate | HTTP | Index status | Canonical | Technical checks | Problem | Severity | Recommended fix | Verification |
|---|---|---|---|---|---|---|---|---|---|
| https://www.getsocialrush.com/services/telegram | Telegram Services Catalog — Members, Views, Reactions &amp; Poll Votes — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |
| https://www.getsocialrush.com/telegram-members | Buy Telegram Members India — Live INR Plans — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |
| https://www.getsocialrush.com/services/telegram-post-views | telegram post views — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |
| https://www.getsocialrush.com/services/telegram-post-reactions | telegram post reactions — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |
| https://www.getsocialrush.com/services/telegram-poll-votes | telegram poll votes — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |

### Tiktok

| Service URL | Primary intent candidate | HTTP | Index status | Canonical | Technical checks | Problem | Severity | Recommended fix | Verification |
|---|---|---|---|---|---|---|---|---|---|
| https://www.getsocialrush.com/services/tiktok | TikTok Services Catalog — Likes, Views, Comments &amp; Saves — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |
| https://www.getsocialrush.com/tiktok-growth-india | TikTok Growth Resources in India — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |
| https://www.getsocialrush.com/tiktok-followers | Buy TikTok Followers India — Live INR Plans — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |

### Twitter

| Service URL | Primary intent candidate | HTTP | Index status | Canonical | Technical checks | Problem | Severity | Recommended fix | Verification |
|---|---|---|---|---|---|---|---|---|---|
| https://www.getsocialrush.com/services/twitter-x | Twitter / X Services Catalog — Likes, Views, Reposts &amp; Crypto — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |
| https://www.getsocialrush.com/twitter-followers | Buy Twitter Followers India (X) — INR Plans — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |
| https://www.getsocialrush.com/services/twitter-likes | twitter likes — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |
| https://www.getsocialrush.com/services/twitter-views | twitter views — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |
| https://www.getsocialrush.com/services/twitter-retweets | twitter retweets — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |
| https://www.getsocialrush.com/services/twitter-crypto-followers | twitter crypto followers — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |
| https://www.getsocialrush.com/services/twitter-crypto-likes | twitter crypto likes — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |
| https://www.getsocialrush.com/services/twitter-crypto-retweets | twitter crypto retweets — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |
| https://www.getsocialrush.com/services/twitter-crypto-custom-comments | twitter crypto custom comments — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |

### Youtube

| Service URL | Primary intent candidate | HTTP | Index status | Canonical | Technical checks | Problem | Severity | Recommended fix | Verification |
|---|---|---|---|---|---|---|---|---|---|
| https://www.getsocialrush.com/youtube-growth-india | YouTube Growth Services India — Subscribers, Views &amp; Watch Hours — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |
| https://www.getsocialrush.com/buy-youtube-watch-hours-india | Buy YouTube Watch Hours India — INR Pricing — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |
| https://www.getsocialrush.com/us/buy-youtube-subscribers | Buy YouTube Subscribers in the USA — USD Estimates — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |
| https://www.getsocialrush.com/us/buy-youtube-views | Buy YouTube Views in the USA — USD Estimates — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |
| https://www.getsocialrush.com/uk/buy-youtube-subscribers | Buy YouTube Subscribers in the UK — GBP Estimates — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |
| https://www.getsocialrush.com/uk/buy-youtube-views | Buy YouTube Views in the UK — GBP Estimates — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |
| https://www.getsocialrush.com/ca/buy-youtube-subscribers | Buy YouTube Subscribers in Canada — CAD Estimates — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |
| https://www.getsocialrush.com/ca/buy-youtube-views | Buy YouTube Views in Canada — CAD Estimates — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |
| https://www.getsocialrush.com/au/buy-youtube-subscribers | Buy YouTube Subscribers in Australia — AUD Estimates — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |
| https://www.getsocialrush.com/au/buy-youtube-views | Buy YouTube Views in Australia — AUD Estimates — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |
| https://www.getsocialrush.com/ae/buy-youtube-subscribers | Buy YouTube Subscribers in the UAE — AED Estimates — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |
| https://www.getsocialrush.com/sg/buy-youtube-subscribers | Buy YouTube Subscribers in Singapore — SGD Estimates — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |
| https://www.getsocialrush.com/youtube-subscribers | Buy YouTube Subscribers India — Live INR Plans — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |
| https://www.getsocialrush.com/youtube-likes | Buy YouTube Likes India — Live INR Plans — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |
| https://www.getsocialrush.com/youtube-views | Buy YouTube Views India — Live INR Plans — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |
| https://www.getsocialrush.com/buy-youtube-comments-india | Buy YouTube Comments India — Videos &amp; Shorts — SocialRUSH | 200 | Unknown | Self | 5/5 | No failure in tested fields | — | Fresh URL Inspection | Live GET |

## Additional catalog pages

Repository contains `/services/tiktok-likes`, `/services/tiktok-views`, `/services/tiktok-custom-comments`, `/services/tiktok-story-views` and `/services/tiktok-saves`. Historical architecture explicitly excludes catalog-only TikTok pages from organic ownership. Their metadata and current inherited indexing rules need a separate rendered audit before changing eligibility; do not add them to the sitemap merely because a route exists. This inventory is not a complete crawl of every non-sitemap route or orphan URL.

## AI readiness

Live robots.txt explicitly allows OAI-SearchBot on `/` while disallowing private account/admin/API paths; wildcard group also allows public pages. No training-crawler permissions were changed. WAF/IP accessibility for real crawlers remains unverified; a custom User-Agent test cannot establish it. Search retrieval returned the Instagram Followers page with substantial readable content, FAQs, prices and internal links. This is retrieval evidence, not a verified AI answer citation. No citation or favorable recommendation count is available.

## First-party measurement baseline

Rolling 28 days at query time on 8 November 2026; event counts, not audited unique visitors. 19,792 page_viewed events (5,685 distinct non-null anonymous session IDs); 6,604 organic_landing_view events (4,759 sessions). Do not report the latter as clean organic traffic because classification inconsistencies were found. 422 order_created and 336 payment_completed events are instrumentation counts, not verified organic orders or revenue. Organic revenue, conversion rate, qualified traffic and repeat purchase attribution remain UNKNOWN pending order reconciliation and source validation.

| Metric | Mobile p75 | Desktop p75 |
|---|---:|---:|
| LCP | 3464ms | 2424ms |
| INP | 192ms | 96ms |
| CLS | 0.0026 | 0.003 |
| TTFB | 2424ms | 1111.25ms |

Values aggregate stored first-party web_vital events across site, without per-navigation deduplication; not CrUX or an official Core Web Vitals pass. Next compare service templates, releases, devices and navigation types.

## Competitor observations

On 8 November, search retrieval of https://digispeed.in/ returned a digital marketing, web development and training homepage. It cannot yet be treated as the leading follower-service competitor for every query. Validate its relevant commercial URLs and actual Google/Bing results for each target keyword. No keyword volumes, backlink counts, ranking superiority or relative conversion claims are established. SocialRUSH has visible public-link requirements, live pricing, delivery/refill conditions and limitations on the fetched Instagram page; accuracy and consistent pricing are concrete opportunities to retain.

## Prioritized 30 / 60 / 90 day roadmap

| Window | Priority and work | Effort / risk | Measurable acceptance |
|---|---|---|---|
| 0–30 days | Free GSC Performance Pages/Queries + indexing exports and URL Inspection for Instagram followers/likes, then YouTube/LinkedIn/Facebook | Low / read-only | Known indexing verdicts, selected canonicals, clicks, impressions and query baseline |
| 0–30 days | Reconcile organic classification, auth referrals and event dedupe; join paid orders using verified attribution | Medium / analytics | Exclude auth/test traffic and demonstrate one reconciled conversion path |
| 0–30 days | Segment mobile LCP/TTFB by service template and release; fix confirmed critical path bottleneck | Medium / rendering risk | Comparable mobile p75 and sample counts before/after; target LCP <=2500ms |
| 0–30 days | Complete headers, structured-data, internal-link/orphan and non-sitemap route audit | Medium / read-only | No unintentional noindex/header blocks; canonical eligible URLs linked in HTML |
| 31–60 days | Prioritize unique service copy and internal linking from actual GSC opportunities | Medium / content | Changes validated in preview; page/query trend against baseline |
| 31–60 days | Validate supported truthful schema and checkout usability | Medium / UI | Schema matches visible facts; fixture checkout checks pass |
| 61–90 days | Refine pages using search and conversion results; useful original guides and editorial outreach opportunities | Medium / reviewed publishing | Verified changes in non-branded clicks, qualified visits and reconciled organic orders |
| 61–90 days | AI discovery observations and controlled conversion experiments | Medium / attribution | Reproducible query/date/source observations; no invented citation or revenue claims |

Automated monitoring already exists in the repository. Review its current coverage before adding overlapping schedules or systems. No new scheduled tasks, content publishing, emails, submissions, database writes or production deployment were performed.

## Remaining verification

Full indexing coverage, manual actions, backlinks, Google/Bing keyword positions, official field CWV, site-wide semantic schema, browser mobile QA and organic revenue remain unverified. GSC access limitation does not establish indexing failure. This is the first bounded audit/accuracy sprint, not completion of the whole transformation.
