# SocialRUSH consolidated release readiness — 9 November 2026 IST

Status: **HOLD — draft work only; explicit owner approval required to merge or deploy.** No production release, indexing submission, database write, protection change or share/bypass link was performed.

## Dependency chain and exact-head evidence

Fresh GitHub/Vercel reads are preserved in [stack evidence](release-stack-batch4-20261109.json). Each row below has a completed successful Pre-merge smoke workflow at the full SHA and a matching READY preview. READY proves a build, not protected rendering. All nine remain open, draft and unmerged.

| PR | Exact head | Base | Successful smoke run |
|---|---|---|---|
| #744 | `2736c825f92970f1bfbbf410f6f781ad8bf2d9be` | `main` | [42465642518](https://github.com/rushal0803/socialrush-panel/actions/runs/42465642518) |
| #745 | `f09f7e6199e2dea0ad4c8921f5cc002c1393d409` | `main` | [42468248676](https://github.com/rushal0803/socialrush-panel/actions/runs/42468248676) |
| #746 | `d72bb3d8ba65b5ca46c42c011a3f835c389493f2` | `main` | [42469801592](https://github.com/rushal0803/socialrush-panel/actions/runs/42469801592) |
| #747 | `cc12b5a746e330dc8689b6e05dbba12edc29090b` | `main` | [42473476960](https://github.com/rushal0803/socialrush-panel/actions/runs/42473476960) |
| #748 | `94a0c1a5754faef41aeb1408fc9604c1727caab7` | `main` | [42483936058](https://github.com/rushal0803/socialrush-panel/actions/runs/42483936058) |
| #749 | `caca5200b19a6bfc56e919f4df1a34ce570219a0` | `chore/seo-foundation-release-20261108` | [42486968421](https://github.com/rushal0803/socialrush-panel/actions/runs/42486968421) |
| #750 | `e37a6b2fadf8994ed579a5d0b51afc205848aa07` | `seo/service-evidence-batch1-20261108` | [42489917476](https://github.com/rushal0803/socialrush-panel/actions/runs/42489917476) |
| #751 | `68beb82ce2d61e43268461214d287f47abd3d88b` | `seo/service-evidence-batch2-20261108` | [42513860238](https://github.com/rushal0803/socialrush-panel/actions/runs/42513860238) |
| #752 | `da271e6cec45d69fca8ea2a2bc7f05858bfe866a` | `chore/seo-foundation-release-20261108` | [42513825026](https://github.com/rushal0803/socialrush-panel/actions/runs/42513825026) |

Proposed sequence after explicit approval: **#748 → #747 → #749 → #750 → #751 → #752 → batch four**. Batch four is based on #751; #752 is an independent sibling on #747 and must be composed before a final release gate. #747 already includes #744–#746: all 16 changed-file comparisons are byte-identical. Do not also merge those source PRs. Current main remains `35fcaf731447a948b69a9ae917b5af596d22711e`. A fresh unreferenced merge-tree simulation passes the sequence through #752; see [composition evidence](release-composition-batch4-20261109.json). This does not substitute for combined runtime checks. After every approved merge, retarget/rebase and reverify remaining exact heads, CI and matching previews.

Full CI includes unit/source/SEO and payment regressions, production build, browser checks, customer fixtures and isolated PostgreSQL checks. Job/step records are retained, including skips. Optional paired performance jobs, premium responsive opt-ins and visual screenshot steps are not passed QA. Branch-protection requirements have not been independently verified with administration access. The new draft’s final exact-head CI/preview evidence belongs in its PR description; no successful result is inferred before completion.

## Hosted QA remains blocked

The selected environment `ccarenv_b64_Y2NhcmVudl9jZTBmMWExNDQ2OTA4MTkxOTM1Njc2ODE2M2EwMWE2MA` reports remote_desktop enabled, state unknown. Tool discovery offers neither desktop JavaScript control nor open_in_codex. No authenticated browser session can be driven. Plain protected preview requests are checked separately; Vercel web-fetch/share and protection-bypass tools are deliberately unused under the owner’s explicit prohibition.

Required before release: authenticated desktop/mobile checks at the composed release SHA; six detail-page FAQs and handoffs; four catalog sections and links; earlier service price precision; quantity and destination validation; login return path; checkout/wallet review with approved test fixtures and no real charge. Verify 390px mobile layout, desktop, loading/error/unavailable states, keyboard navigation, and no preview conversion collection with #752 present. Local screenshots and CI fixtures are evidence of fixture behavior only.

## Fourth batch: ten existing candidates

Editorial selection from the previously reported remaining candidates, not a GSC demand ranking. The corrected inventory accounting appears below. All ten fresh public GETs return 200, one H1, self canonical, index/follow, no X-Robots-Tag noindex and sitemap membership. [Baseline](service-batch4-baseline-20261109.json). These do not establish actual indexing or Google-selected canonicals. No sitemap expansion or catalog-only eligibility change.

| Canonical path | Useful change |
|---|---|
| `/services/telegram-post-views` | Exact public message versus channel/invite; views versus unique readership. |
| `/services/telegram-post-reactions` | Supported emoji and post settings; reactions versus independent customer feedback. |
| `/services/telegram-poll-votes` | Poll, answer option and supported type checks; purchased tallies are biased research. |
| `/services/twitter-crypto-likes` | Post versus profile/token destinations; no investor-demand inference. |
| `/services/twitter-crypto-retweets` | Reposts versus quote-post commentary; no financial-credibility inference. |
| `/services/twitter-crypto-custom-comments` | Supplied-text accuracy and format checks; moderation and permanence limits. |
| `/services/telegram` | Compare members, message actions and polls with four destination-specific links. |
| `/services/twitter-x` | Compare profile/post actions and crypto labels with canonical detail links. |
| `/services/linkedin` | Personal profile/company Page/skill distinctions and professional-relevance limits. |
| `/services/tiktok` | Local-access uncertainty, catalog restrictions and voluntary metrics. |

Six service pages share their two new FAQs between visible server-rendered answers and the existing single FAQPage graph. Both route entry paths use the same metadata and guidance; the current renderer and live-only order handoff remain intact. Telegram metadata now names each exact action and useful checks. X crypto overrides are applied to the catch-all as well as the dedicated entry. Four catalog titles/descriptions are accurate and retained; existing ItemList/BreadcrumbList remain. New crawlable links connect comparison hubs, related requirements and refund conditions. FAQ consistency is not a promise of Google FAQ rich results. No prices, catalog facts, quantity arithmetic, payments, validators or checkout payloads are changed.

## Validation and preview evidence

Local production compilation, TypeScript and lint completed (existing warnings); 251 unit tests, six live-service regressions, 14 payment-confidence tests and 44 focused pricing/checkout/analytics contracts passed. The first 40-page browser pass passed; subsequent screenshot review found catalog guidance outside the main page shell. It was moved into the catalog main layout, and the final browser check now requires that placement. Final build/browser/CI results and exact SHA are recorded in this draft PR description so a documentation commit cannot invalidate its own recorded head. Full CI uploads all ten batch-four mobile screenshots in `playwright-smoke-diagnostics`.

[Representative local Telegram fixture screenshot](evidence/service-batch4-20261109/telegram-post-reactions.png) was visually reviewed; it shows visible FAQs, related links and the unchanged live-order handoff. It is fixture evidence only. Catalog screenshots from the earlier incorrect placement were discarded. Final CI artifacts and protected preview status must match the reviewed source SHA. [Plain protected-preview checks and desktop limitation](hosted-qa-batch4-20261109.json) remain blocked, separate from any local/CI pass.

## Exact free Google Search Console evidence required

Use the verified `https://www.getsocialrush.com/` URL-prefix property, or a domain property with an explicit HTTPS www filter covering these URLs. Use the official free Search Console UI; no paid SEO subscription or credential sharing is needed. Initial reproducible Web Search windows: **11 October–7 November 2026** and **13 September–10 October 2026**. Both have 28 days. Preserve actual export time, report timezone, all active filters and preliminary/fresh-data flags; dates are not a guarantee that Google has settled every row.

1. Performance → Search results → Web → Custom dates. For each window, export all report tabs: **Queries, Pages, Dates, Countries, Devices and Search appearance**, with Clicks, Impressions, CTR and Average position. Repeat with Country = India; retain all-country exports separately. Use Download CSV/Excel or Google Sheets export, retaining the original files, row counts, any 1,000-row UI cap and omitted/anonymized-data caveats. Suggested names: `gsc-web-{all|india}-{start}-{end}-{tab}.csv`.
2. For **each of the 40 reviewed exact canonical URLs**, apply **Page → Exact URL**, then export **Queries and Dates** for each window, all-country and India separately. For a minimal first delivery, send these ten batch-four exact URLs above, then earlier 30. Aggregated Pages and Queries tabs cannot reconstruct query-to-page pairs. Missing/privacy-omitted rows mean unknown, not zero demand. Include filter screenshots or a manifest with property, page, country and date settings.
3. Indexing → Pages: export summary/reason table and affected example URLs for every exclusion/error reason; retain report last-updated date, scope and validation status. Example lists are incomplete.
4. URL Inspection **indexed-page results** for the reviewed 40, initially these ten: exact inspected URL, overall verdict, page-indexing reason, last crawl, crawler type, crawl allowed, fetch result, indexing allowed, user-declared canonical, Google-selected canonical and referring sitemap when shown. Save screenshots/PDF or a structured sheet where there is no CSV export. Keep a Live Test separate: it does not prove indexed state.
5. Indexing → Sitemaps: screenshot/export the exact sitemap URL, submitted date, last read date, status/errors/warnings and discovered pages. Include `https://www.getsocialrush.com/sitemap.xml`. Do not submit or request indexing as part of this evidence collection.
6. Experience → Core Web Vitals → Mobile and Desktop: export each INP issue group with status, p75 value if shown, affected URL examples, validation status and report date. Preserve LCP/CLS separately and the reporting window/device. Use official PageSpeed Insights/CrUX field data where available to corroborate the origin/URL and 28-day period. Lab responsiveness is separate.

Optional free Bing Webmaster Tools evidence: equivalent performance and URL Inspection exports for the same dates and exact canonical URLs, plus sitemap/crawl errors. Actual Google/Bing index state, queries, clicks, impressions, CTR and ranking remain unknown until these records are supplied. Historical GSC Wizard calls were paid-gated; no paid subscription was purchased or retried here.

## Unresolved INP findings

[Preserved-profile attribution](inp-profile-attribution-20261109.md) and [original trials](inp-react-traces-20261108.md) remain the evidence. One 6× early lab interaction was 408ms: pointerdown processing 308.7ms, input delay 26.7ms; the subsequent click had 355.4ms delay but only 20.4ms processing. Mounted-control click processing was 20.9ms. Initial React mount overlaps the early event; this supports a scheduling/hydration hypothesis, not a quantity-arithmetic diagnosis. Nested profiler durations overlap and cannot be summed.

Original generated profiling chunks/source maps and a common CPU/Event Timing clock anchor are missing. Whole-capture minified CPU samples cannot identify a component responsible for the interaction. Next: capture exact profiling bundles/maps and source/build identity with one Chrome trace clock; add narrow card/provider profiler boundaries; repeat early versus mounted trials on the same device/backend before choosing a fix. Then retest quantities, totals, links, cart and checkout. The historical 208ms field value is not a refreshed p75 measurement; field INP, device/browser split and third-party contribution remain unverified. No INP improvement is claimed.

## Remaining SEO and release work

- Reconciliation corrects the historical count: the 69-row inventory omitted `/x-growth-india`, which batch three reviewed. Across all four batches there are **40 distinct reviewed URLs: 39 within the original 69 plus that one outside it**, leaving **30 original-cohort candidates**, rather than the inferred 29. The user’s prior “remaining 39” count inherited this one-page discrepancy; the ten new pages are distinct original-cohort candidates. See [remaining-path manifest](service-batch4-remaining-20261109.json). These remain for distinct-intent and indexing-eligibility review. This is coverage, not proof that every candidate deserves indexing. Catalog-only TikTok actions and other restricted services remain restricted.
- Obtain the free exports above, resolve canonical/indexing exclusions and prioritize future batches from actual queries. Reconcile catalog-only metadata where historical dedicated/catch-all ownership needs a separate rendered audit.
- Confirm YouTube Watch Hours billed delivery units before exposing a per-hour quote/Offer. Do not infer valid YPP watch time from purchased activity.
- Resolve authenticated hosted QA and run the full composed release checks before seeking release approval. Footer discovery fixes remain pending in #747. Review older overlapping drafts such as #704, #714, #721, #722 and #742 separately before any future merge; this batch does not incorporate or approve them.
- Complete the controlled INP investigation and obtain fresh field evidence.
- Apply #752 only through the reviewed release sequence, then reconcile first-party reporting with verified organic acquisition and paid-order records. Historical attribution remains contaminated; organic sessions, abandonment, conversion rates and organic paid revenue are unknown. Do not rewrite historical events or infer growth from event counts.
- Collect actual dated AI answer citations independently: engine/product, question, locale, signed-in state, date, cited URL, supporting quote and accuracy. Crawler permission and structured data do not verify citations or indexing. No AI citation, ranking or revenue growth is claimed.

No merge or deployment is approved by this report.
