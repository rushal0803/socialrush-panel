# Phase 13 — Instagram content gap analysis

Audit date: 1 October 2026.

## Rule

Create a new indexed article only when it answers a distinct user question, has low enough cannibalization risk, can provide unique information, and has a useful internal-link path to an existing canonical page. Phase 13 does not create extra transactional URLs for keyword variants.

## Evidence available

- Repository inventory of the current Instagram blog, tool, hub and money-page cluster.
- Live October 2026 SERP review for Instagram views vs reach, likes vs views, profile optimization and engagement-metric themes.
- Search Console data was unavailable because the connected GSC Wizard subscription is inactive.
- Semrush data was unavailable because the connected account has no remaining API units.

## Candidate decisions

| Topic | Decision | Why |
| --- | --- | --- |
| Instagram followers price in India | Covered | Existing price guide already owns the intent. |
| Organic Instagram follower growth in India | Covered | Existing organic-growth guide already owns it. |
| Instagram followers vs engagement | Covered | Existing comparison article already owns it. |
| Why Instagram followers drop | Covered | Existing troubleshooting article already owns it. |
| Instagram views vs reach | Implement | Distinct analytics intent, current SERP activity, low transaction-page cannibalization, strong links to views/hub/calculator. |
| Instagram likes vs views | Defer | Useful but overlaps several existing comparison and service assets; wait for query evidence. |
| Instagram profile optimization India | Defer | Existing hub and organic-growth content partially cover it; standalone value is not yet strong enough. |
| Story views / saves / shares meaning | Defer | Too broad as one page; split only if one metric earns distinct demand. |

## Implemented

One article: `/blog/instagram-views-vs-reach`.

It owns informational analytics intent and links to:

- `/instagram-views`
- `/instagram-growth-india`
- `/tools/instagram-engagement-rate-calculator`
- `/blog/instagram-followers-vs-engagement`
- `/instagram-likes`

The article explicitly separates exposure, unique-audience breadth, engagement and downstream outcomes. It does not claim that paid views guarantee organic reach, followers, engagement, ranking, leads or sales.

## Cannibalization protection

No new Instagram transactional route was created. Existing money-page canonicals, redirects, titles, H1s, pricing, checkout, payments and order flows are unchanged. The content-gap decision map in `lib/seo/instagram-content-gap.ts` documents covered, implemented and deferred themes so future SEO work does not create near-duplicate pages without evidence.
