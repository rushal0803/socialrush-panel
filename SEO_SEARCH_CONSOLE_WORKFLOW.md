# Search Console SEO workflow

## Scope and indexability policy

Canonical production domain: `https://www.getsocialrush.com`.

Indexable pages are the homepage, Services, canonical active service landing pages, Packages, Blog and published articles, Creator Tools, and useful public policy or trust pages. Customer areas, authentication, checkout, payment callbacks, API routes, admin pages, dashboard pages, orders, wallet pages, saved profiles and support-ticket flows must remain `noindex` and out of the sitemap. Query parameters never form canonical URLs.

Country expansion is intentionally deferred. Do not create country pages or hreflang annotations until a page can provide approved, country-specific payment, support, delivery, legal or pricing information.

## Initial Search Console review

1. Verify the `https://www.getsocialrush.com/` Domain or URL-prefix property and submit `/sitemap.xml`.
2. Review Page indexing, especially Crawled – currently not indexed, Discovered – currently not indexed, Duplicate without user-selected canonical, Alternate page with proper canonical, Soft 404, Server error, Redirect error and Blocked by robots.txt.
3. Review Core Web Vitals, HTTPS, Manual actions and Security issues. Record findings; this project does not claim those reports have been reviewed without property access.
4. Check representative URLs after deployment: homepage, Services, one canonical service landing page, Packages, Blog, an article and a Creator Tool.

## Low-CTR workflow

Use at least 28 days of Search Console data. For a page with meaningful impressions but low clicks, inspect query intent, title, description, visible content match, average position, device and country splits, branded versus non-branded queries, and competing result wording. Make one accurate, non-clickbait change at a time, annotate the date, and compare a matching period before drawing conclusions. Impressions alone are not a reason to edit metadata.

## Monthly report template

Month: ______  |  Compared with: ______

| Metric | Current | Previous | Notes |
| --- | ---: | ---: | --- |
| Total clicks |  |  |  |
| Total impressions |  |  |  |
| Average CTR |  |  |  |
| Average position |  |  |  |
| Organic order starts |  |  | First-party analytics only |
| Organic paid orders |  |  | Trusted attribution only; otherwise mark unavailable |

Also record top pages and queries; pages with rising impressions; pages with declining clicks; low-CTR opportunities; indexing and Core Web Vitals issues; new content; internal-link improvements; branded/non-branded split where available; and recommended next actions. Label unavailable data rather than estimating it.

## Monthly maintenance checklist

- [ ] Review Search Console performance and indexing reports.
- [ ] Confirm sitemap status and canonical coverage.
- [ ] Review top landing pages, low-CTR opportunities, broken links and 404 traffic.
- [ ] Review Core Web Vitals and article freshness.
- [ ] Review service metadata, structured data and new internal links.
- [ ] Review organic conversions without storing search terms or customer target URLs.
- [ ] Confirm admin and dashboard routes remain out of the index.

## Content opportunity backlog (editorial review required)

- How social media service delivery works
- Public-link requirements
- Refill eligibility explained
- How to track a service order
- Instagram engagement rate guide
- YouTube thumbnail sizing guide
- Social media image dimensions
- UTM tracking basics
- Choosing between followers, likes and views
- Common ordering mistakes

Every article requires factual editorial review before publication. Avoid keyword permutations, unsupported country claims, copied content, guarantees and fabricated evidence.
