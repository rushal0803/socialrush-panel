# SocialRUSH SEO foundation release candidate — 8 November 2026

This candidate combines the exact reviewed changes from draft PRs #744–#746 on production base `35fcaf731447a948b69a9ae917b5af596d22711e`. It is a draft release candidate, not authorization to merge or deploy.

| Source PR | Verified source head | Included change |
|---|---|---|
| #744 | 2736c825f92970f1bfbbf410f6f781ad8bf2d9be | Preserve paise in public quantity-planning examples; initial discovery audit |
| #745 | f09f7e6199e2dea0ad4c8921f5cc002c1393d409 | Distinguish organic search from Google app referrals and paid campaigns; correct new paid-campaign attribution |
| #746 | d72bb3d8ba65b5ca46c42c011a3f835c389493f2 | Repair Telegram breadcrumb destination, align route-owned trails and link existing public resources from the footer |

All three source PRs were still draft, unmerged and mergeable when rechecked, with successful Pre-merge smoke tests workflows on their exact heads. Their changes merge together without conflicts. This combined candidate requires its own CI/build/preview evidence; individual passes are not a combined-release pass.

## Latest read-only facts audit

Compared 43 catalog service definitions with 42 code-matched database rows and a Facebook Group Members row resolved by its service name. All 15 services using ordinary catalog fallback facts matched current database rates, quantity limits, delivery and refill terms after numerical/whitespace/dash normalization. Protected live-only services deliberately retain placeholders until live facts are supplied; no placeholder was replaced with an invented price or availability claim. No database or service configuration was changed.

The previous public audit fetched 172 sitemap source pages and five additional public TikTok catalog destinations successfully. Those five correctly returned noindex,follow. Fresh Google indexing, selected canonicals, query performance and AI citations remain unverified because the connected Search Console service requires a subscription; use free Search Console evidence for that stage.

## Combined validation and review

Run the unit suite, focused pricing/acquisition regressions, TypeScript, lint and production build together. On the exact combined preview, verify the Instagram quantity examples, Telegram/LinkedIn breadcrumb graphs and the three footer discovery links. Require the full GitHub workflow, including browser/customer fixture checks and isolated PostgreSQL tests, to pass.

The PR description records current combined-head results and preview URL. Source audit documents describe their historical baselines; do not confuse those baselines with deployed fixes.

## Release scope

No database migration or mutation, catalog rate, payment method, wallet calculation, checkout payload, canonical URL, sitemap or training-crawler permission changes. Historical analytics are not rewritten. No actual order or payment is needed for fixture verification.

Keep this candidate draft and unmerged until explicit owner approval. Following approval, recheck its latest head and main, merge this combined candidate once, then verify the production deployment and critical public HTML. The source PRs should remain unmerged while this candidate is under review, to avoid duplicate releases. The broader SEO roadmap and verified search-performance measurement continue after this foundation release; no ranking or revenue outcome is promised.
