# SEO Phase 1 — Free baseline and protection

## Goal

Establish a reliable no-cost SEO baseline before making ranking-sensitive changes. This phase protects existing commercial URLs and adds stronger automated checks for the pages that matter most for traffic and sales.

## Live-search findings

- The canonical Instagram followers India page is discoverable in current search results and is being crawled.
- The pricing page is discoverable and exposes live catalog pricing.
- Recent Instagram educational articles are also being crawled, which confirms that the blog/content layer is discoverable.
- No evidence from the repository audit supports a sitewide deindexing issue.

## Technical foundation confirmed

- `app/robots.txt/route.ts` advertises the canonical sitemap and blocks private/auth/dashboard/API routes.
- `app/sitemap.xml/route.ts` includes core commercial routes, India service canonicals, platform hubs, articles, tools, case studies, country hubs, and approved international pages.
- Existing SEO architecture deliberately protects one preferred target per commercial intent to reduce cannibalization.
- Canonical India money-page URLs should not be renamed or redirected without performance evidence.

## Phase 1 implementation

The free SEO health monitor now verifies:

1. robots.txt returns successfully, advertises the canonical sitemap, and retains important private-route disallow rules;
2. sitemap.xml contains homepage, Services, Pricing, Packages, six India platform-growth hubs, all canonical India service pages, and priority creator tools;
3. every priority commercial/indexable page returns HTTP 200;
4. every priority page is indexable (not `noindex`);
5. every priority page has a title tag;
6. every priority page has a meta description;
7. every priority page declares the expected canonical URL;
8. important legacy URLs still permanently redirect to the protected canonical target.

## Content consistency finding for the next patch

Some shared service-page copy still refers to wallet funding/add-funds language even though the current conversion path prioritizes direct UPI when wallet balance is insufficient. This should be aligned carefully because it affects trust and conversion, but it should be handled separately from the technical baseline so ranking-sensitive page changes remain easy to review and roll back.

The Instagram followers India page also uses an “Indian Audience” visual label while its FAQ correctly clarifies that INR/India pricing does not guarantee that every delivered account is India-based. A future trust-content patch should replace ambiguous audience claims with precise wording such as INR pricing or India customer support unless the underlying service explicitly guarantees geo-targeted delivery.

## What this phase deliberately does not change

- titles/H1s of established India money pages;
- canonical URLs;
- service prices, minimums, maximums, or delivery rules;
- sitemap route ownership;
- redirects between established ranking pages;
- new thin country/service pages;
- checkout or payment logic.

## Next SEO phase

Use the protected baseline to improve the highest-value pages in small, reviewable batches: trust-copy alignment, internal linking from informational content to mapped money pages, platform hub-to-service linking, and only then title/content experiments where search-performance evidence supports them.
