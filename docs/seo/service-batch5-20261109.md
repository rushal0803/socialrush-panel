# Fifth existing-service batch — 9 November 2026 IST

Draft based on the composed application SHA `0a218e05bc34c8448eec6d382f383ec09c7425c4`, incorporating #748/#747/#749/#750/#751/#752/#753. Base PR is the composed release candidate #754. It must be reviewed as a follow-up to that candidate, not in parallel with a second merge of its constituents. No production, database, payment, pricing, crawler-policy or indexing changes.

## Ten individual existing-page reviews

| Path | Confirmed weakness and change |
|---|---|
| `/us/buy-linkedin-followers` | USD is a display estimate, not US follower location; distinguish followers from connections/endorsements and verify profile/Page support. |
| `/uk/buy-linkedin-followers` | GBP estimates do not verify UK professional audiences; explicit destination, earned-recommendation and conditional-refill guidance. |
| `/ca/buy-linkedin-followers` | CAD estimates do not establish Canadian follower identity or leads; verify the selected destination and current refill conditions. |
| `/au/buy-linkedin-followers` | AUD planning does not guarantee Australian followers; remove credibility implication and explain separate LinkedIn actions. |
| `/ae/buy-linkedin-followers` | AED planning does not verify UAE follower location or occupation; public visibility alone is not destination eligibility. |
| `/sg/buy-linkedin-followers` | SGD planning does not establish Singapore targeting or purchasing authority; explicit action scope, current support and refund guidance. |
| `/us/buy-youtube-views` | USD estimates do not target US viewers; distinguish view counts from valid watch hours and check video format. |
| `/uk/buy-youtube-views` | GBP estimates do not target UK viewers; purchased views are not monetization eligibility or verified retention. |
| `/ca/buy-youtube-views` | CAD estimates do not target Canadian viewers; confirm Shorts/live/unlisted compatibility before payment. |
| `/au/buy-youtube-views` | AUD estimates do not target Australian viewers; clarify unique-viewer/full-watch limits and conditional refill/refund. |

Each route was individually fetched from production: HTTP 200, one H1, unique title, self canonical, index/follow, no response noindex and existing sitemap membership. [Baseline](service-batch5-baseline-20261109.json). These are technical eligibility observations, not proof of indexing, demand or permission to add new country pages. Existing market-specific title, H1, copy, payment currency and reciprocal hreflang are retained. No new country targeting or country-specific delivery promise is invented. Guidance is shared by service family, localized only for existing currency/market facts; it is not ten independent articles or new landing pages.

Three useful service-specific FAQs are added to each existing visible FAQ and the same FAQPage source. LinkedIn instructions now require explicit personal-profile/company-Page support; public visibility alone is insufficient. The vague professional-credibility implication is removed. YouTube instructions distinguish views from valid public watch hours and require format/visibility confirmation. Both groups explain country-label limits and refer to current refill/refund terms without inventing delivery/refill promises. Scoped crawlable links to service terms, refund conditions and support are added only on these ten pages. Existing order form, price/unit arithmetic, schema Offer amount/currency, metadata, canonical owners and eligibility flags are unchanged.

## Validation

New meaningful unit regression checks the ten-page scope, visible/structured FAQ data, existing INR offer authority, reciprocal variant counts, explicit destination eligibility and metric limitations. Twenty new browser checks cover all ten pages at 390px and 1440px: initial HTML, one H1, canonical/hreflang, single Service/FAQ/Breadcrumb graphs, price/currency preservation, keyboard opening of each FAQ, support-link responses and overflow. Mobile screenshots are retained in test results. Existing country, pricing, wallet, login and checkout regressions remain required. Final exact-head local/CI/build/preview results belong in the draft PR body; no result is inferred before completion.

Coverage after this batch: **50 distinct URLs reviewed**, 49 in the original 69 cohort and `/x-growth-india` outside it; **20 original-cohort candidates remain**. This batch improves ten pages. Earlier four batches reported 38 improvements and two unchanged; that improvement count remains a historical report, separate from this session’s ten confirmed changes. [Remaining manifest](service-batch5-remaining-20261109.json). No candidate is automatically approved for indexing.

## Remaining evidence and release gates

Protected hosted QA is BLOCKED. Automatic approval rejected protected connector fetch because it creates/reuses a temporary share link prohibited by the owner; no workaround was attempted. Use an authenticated no-share browser channel for both mobile and desktop. Preview READY is build evidence only. Branch-protection read returned 403. Supabase preview is inactive; checkout tests use disposable localhost fixtures. All work stays draft pending explicit owner merge/production approval.

Google/Bing selected indexing and search performance are UNKNOWN pending free official console exports (Pages, Queries, exclusions, indexed URL Inspection, sitemap status, Mobile CWV). AI citations/mentions/retrieval are UNKNOWN; crawler access and ChatGPT referral labels cannot verify citations. Fresh first-party mixed-release mobile event p75 INP is 208ms for the canonical Instagram buyer page; it is not a release improvement or a source-map-aligned cause. No speculative performance change is made. Organic revenue remains UNVERIFIED pending payment/debit/refund and valid session-attribution reconciliation; event counts are not revenue.
