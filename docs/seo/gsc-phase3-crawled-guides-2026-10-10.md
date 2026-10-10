# GSC Phase 3: Crawled-but-not-indexed blog guides

Date: 2026-10-10. Source: the site owner's `getsocialrush.com-Coverage-Drilldown-2026-10-10 (1).zip`, especially `Table.csv` and `Metadata.csv`, plus the `main` branch code at `710bd8e694e42ffd52393982a56a82bc2a7361e5`.

## Search Console evidence (not a fresh Google crawl)

| URL after `/blog/` | GSC last crawl | Current code assessment |
| --- | --- | --- |
| `best-time-to-post-on-instagram-india` | 2026-07-19 | Article still present; not in the main Instagram hub guide list before this sprint |
| `how-to-get-1000-youtube-subscribers` | 2026-07-19 | Article still present; not in the main YouTube hub guide list before this sprint |
| `facebook-page-growth-tips-for-local-businesses` | 2026-07-17 | Article still present and linked from Facebook hub |
| `social-media-growth-strategy-indian-creators` | 2026-07-03 | Article still present and linked from TikTok hub |
| `how-to-grow-fast-on-instagram` | 2026-07-01 | Article still present; consider content overlap with other Instagram guides before promoting more broadly |
| `linkedin-growth-tips-for-personal-brands` | 2026-06-30 | Historical path already redirects to `/blog/linkedin-growth-tips-personal-brands`; do not attempt independent indexing |

The separate `favicon.ico` example is not an editorial article and is not an indexing priority.

**Interpretation:** Search Console's examples are from crawls in June/July. They do not prove the current HTML is unindexable or that Google has penalized the content. Google may simply have deferred indexing, seen older content, or consolidated a duplicate URL. No ranking or indexing outcome is guaranteed.

## One-commit, low-usage change

- Add a relevant direct internal link to each of the first two articles from its corresponding platform hub's existing guide list.
- Add a regression test confirming both guides are published and linked.
- No new pages, no mass page generation, no content rewrites, no edited timestamps, no changes to meta robots/canonicals/sitemap.
- **No payment, order, wallet, checkout, pricing, Supabase, or Vercel configuration changes.**

## Validation and later decisions

Run the repository's existing CI checks on the single draft PR. Do **not** merge automatically; merging to main would trigger a new Vercel production build. If a preview build is triggered by the PR, do not produce iterative builds for cosmetic changes.

Separately, use GSC URL Inspection's Google-selected canonical, rendered HTML and latest crawl date to decide whether the five current articles need content improvements. Recheck after Google has had time to crawl the updated hub links. Do not re-request indexing repeatedly.

Success is measured by real GSC indexing state, relevant search impressions, qualified clicks, and conversions—not by reducing every exclusion count to zero.
