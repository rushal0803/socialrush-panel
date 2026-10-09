# SocialRUSH — Search Console indexing baseline (10 October 2026)

## Source and limitations

Evidence: owner-exported Google Search Console page-indexing drilldowns (10 October 2026), sitemap screen, URL Inspection for `/buy-youtube-watch-hours-india`, and crawl-stat exports. GSC data lags production changes. **This is not a fresh Google crawl and is not proof that every excluded URL has a technical defect.**

## Recorded baseline

- 64 indexed URLs; 165 not indexed (Search Console summary last updated 4 October 2026).
- Excluded URL examples: **100 discovered / not indexed**, **7 crawled / not indexed** (six articles plus favicon), **4 duplicate without user-selected canonical**, **14 blocked by robots.txt**, **29 redirects**, **11 alternate canonical URLs**.
- Sitemap: `https://www.getsocialrush.com/sitemap.xml`; submitted 29 August 2026, successfully read 8 October 2026.
- Watch-hours URL Inspection: `/buy-youtube-watch-hours-india` is **Discovered – currently not indexed**, with last crawl `N/A` and no referring page detected in Google's report. The 10 October live test said **URL is available to Google**. Indexing was requested by the site owner; this is not an indexing guarantee.
- Crawl stats: 4,179 requests across `www` and apex in the export; both hosts show “No problems.” Response shares: 200 = 92.68%, 404 = 4.16%, 301 = 3.16%; discovery purpose = 1.63% of crawl requests. Discovery share alone does **not** establish a crawl-budget defect.
- The 404 samples contain older `/_next/static/` chunks and image filenames; no evidence in that sample alone proves a current service-page 404.

## What Phase 1 changes

1. Fix the currently broken static blog image reference in `blogData.ts`: `instagram-followers-price-in-india.png` is absent from `public/images/blog/`; the existing `instagram-followers-price-india.png` file is referenced instead.
2. Guard against repeated regressions by checking the static `/images/blog/...` references in blog source files during weekly SEO monitoring.
3. No edits to service pricing, checkout, customer accounts, payment, wallet, Supabase, canonicals, redirects, robots.txt, or sitemap generation.

## Next evidence-led tasks (separate PRs)

1. **Discovered / not indexed (100):** inspect sample URLs from each group in Search Console after allowing time for Google to process submitted URLs. Prioritize canonical India services, then country pages, tools, and articles. Cross-check rendered internal links, HTTP response, meta robots, canonical and content value before changing code.
2. **Crawled / not indexed (six articles):** inspect Google-selected canonical and content quality; evaluate whether they add distinct value. Favicon indexing is not an SEO target.
3. **Historical 404 resources:** distinguish outdated hashed Next.js assets from missing files that are still used in current HTML. Do not recreate stale deployment assets without current references.
4. **Service availability:** test representative service pages when live catalog facts are unavailable; identify real 404s before changing business or checkout behavior. Do not publish purchasable rates for unavailable services.
5. **Rankings:** use actual GSC query/page impressions and click data to prioritize commercial improvements. Technical eligibility and a submitted sitemap do not guarantee indexing or a #1 ranking.

## Validation after merge and production deployment

- Run `node scripts/seo-blog-assets-check.mjs` and the existing `npm run seo:technical` against production/preview where accessible.
- Verify affected blog article's image loads with HTTP 200, and its canonical/robots stay unchanged.
- Review GSC URL Inspection, sitemap status and Page indexing at 7, 14 and 28 days (accounting for reporting lag), and measure actual non-branded impressions and clicks. Do **not** repeatedly request indexing for the same URL.
- Track only meaningful, indexable public URLs. Exclude intentional private routes, redirects, and query/canonical duplicates from the success metric.
