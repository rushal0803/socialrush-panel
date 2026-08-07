# SEO inventory — implementation baseline

## Public route inventory

- `/`, `/services`, canonical service landing pages, `/packages`, `/pricing`
- `/blog`, published `/blog/[slug]` pages, `/tools` and the five tool pages
- `/about`, `/contact`, `/support`, `/faq`, `/trust`, `/reviews`, `/case-studies`
- `/privacy-policy`, `/refund-policy`, `/terms-and-conditions`, comparison pages

## Audit findings and controls

| Area | Finding | Control |
| --- | --- | --- |
| Canonicals | Canonical helper provides absolute www URLs and ignores query strings. | Retained; service/article metadata uses it or fixed canonical URLs. |
| Legacy URLs | Service and blog aliases exist. | Permanent middleware/config redirects target canonical routes. |
| Private routes | Middleware had broad header protection but public `/support` was caught as a shortcut. | Public help page is indexable; admin and dashboard now also have route metadata noindex. |
| Sitemap | Static public inventory plus canonical services and published articles. | Added public Support; excludes dashboard, admin, authentication, checkout, drafts and query pages. |
| Structured data | Organization, WebSite, BreadcrumbList, BlogPosting, FAQPage and Service are used. | No Review or AggregateRating schema added; schemas must match visible content. |
| Metadata | Homepage, Services, Packages and Blog used inconsistent India-heavy title patterns. | Core title/description pattern now leads with user intent and ends with SocialRUSH. |

No country doorway pages were added. Prices, delivery/refill rules, checkout, wallet, authentication, payment processing, consent and AdSense metadata are outside this change.
