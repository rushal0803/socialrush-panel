# Phase 13 SEO audit and implementation map

## Scope and protection

This audit was performed from the repository, not from Search Console. Existing India transactional canonicals in `lib/seo/india-service-pages.ts` are protected assets. No India titles, H1s, canonical URLs, prices, service codes, order handoff, payments, wallet, CRM, dashboard, or lifecycle code was changed in this phase.

## Route and technical inventory

Indexable public inventory is assembled by `app/sitemap.xml/route.ts`: core commercial routes, platform hubs, canonical India services, published articles, approved case studies, tools, country hubs, and the explicit international service allowlist. Private account, dashboard, admin, auth, API, checkout, order-summary, and currency-selection flows are excluded from the sitemap and are blocked by route metadata and/or `X-Robots-Tag` in middleware. Query parameters are not sitemap entries and metadata canonicals are path-based.

Canonical URLs are absolute `https://www.getsocialrush.com` URLs. `robots.txt` exposes one sitemap and blocks private/machine routes. Organization and WebSite schema are global; breadcrumbs, FAQPage, Article/BlogPosting, and Service schema are applied only on relevant pages. International Service offers retain INR price currency; display currency is not represented as an authoritative foreign-currency offer.

## Intent and cannibalization map

`lib/seo/architecture.ts` is the deterministic map. It assigns one preferred target to each intentionally targeted platform-growth, transactional, comparison, and country-transactional intent. Keyword variants must improve the mapped target rather than create a competing URL.

Known historical aliases are retained as middleware redirects and are not replaced. The lowest-risk action for existing overlaps is to keep the established canonical/redirect arrangement and avoid redirects or deletions in this phase. No new cannibalization redirect was added.

## International review and decision

Country hubs: `/us`, `/uk`, `/ca`, `/au`, `/ae`, `/sg`. Transactional pages remain the existing explicit eight-page allowlist: US Instagram followers, YouTube subscribers, YouTube views, LinkedIn followers; UK Instagram followers and YouTube subscribers; Canada Instagram followers; Australia Instagram followers.

No new international pages were published. UAE and Singapore transactional variants, and all other country × service combinations, deliberately remain absent: repository evidence supports neither sufficiently distinct local content nor a reason to expand beyond the existing catalog-backed allowlist. Unknown dynamic country service routes return 404 through `getPublishedCountryServicePage` and are absent from the sitemap.

Hreflang groups only contain actual published equivalents: hub alternates are hub-to-hub; service alternates are grouped by the same catalog service code. India root pages are intentionally not advertised as international equivalents.

## Content and internal linking findings

Platform hubs provide the educational-to-transactional path. India transactional templates already provide related services, FAQs, breadcrumbs, and links to relevant articles where implemented. Country hubs link only to allowed country services; country service pages link to their hub and actual equivalent markets. The blog has a slug-deduplication safeguard before sitemap output. No thin pages or new blog posts were added.

## Opportunity priority

| Priority | Finding | Action |
| --- | --- | --- |
| P0 | No repository-evidenced indexation defect | No speculative change |
| P1 | Protect existing India money-page canonicals | Added deterministic protection assertions |
| P2 | Prevent future intent and international-route drift | Added typed intent map and allowlist assertions |
| P3 | New country service pages | Deferred pending Search Console demand and unique local value |
| P4 | Content consolidation/backlinks | Requires performance/query data and editorial review |

## Limitations

Search Console, crawl logs, backlink data, real user geo demand, rendered-production schema validation, and live Core Web Vitals are not available in the repository. Those inputs are required before changing a ranking page, consolidating content, or creating more international transactional pages.
