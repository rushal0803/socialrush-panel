# SocialRUSH topical authority roadmap — India

## Audit summary (August 2026)

The public informational inventory is centred on `/blog`, `/tools`, `/creator-growth`, `/faq`, and platform service pages. Existing editorial coverage is strongest for Instagram and YouTube, followed by LinkedIn, Facebook, creator strategy, public-link safety, and service evaluation.

| Cluster | Existing assets | Assessment | Decision |
| --- | --- | --- | --- |
| Instagram | follower growth, safety, price, follower-vs-engagement, drops, posting time | Strong; several nearby intents already exist | Upgrade the follower-vs-engagement guide rather than create another generic Instagram growth post. |
| YouTube | first 1,000 subscribers, new-channel promotion, views, subscriber growth, pricing | Strong discovery coverage; readiness intent was missing | Add a channel-readiness guide that supports, rather than repeats, promotion and subscriber articles. |
| Facebook | page growth for local businesses, followers/likes/views services | Useful base but limited informational depth | Defer until Search Console shows a specific demand signal; do not manufacture a page family. |
| LinkedIn | personal-brand and business growth guides, follower/like services | Useful base | Defer company-page-versus-engagement content until demand validates a distinct intent. |
| X/Twitter, Telegram, TikTok | Commercial pages and some service context | Thin education coverage | Defer: no evidence in the repository that a new guide would be distinct or more valuable than strengthening the core clusters. |
| Creator strategy and safety | campaign mistakes, service evaluation, public-link safety, checklist, UTM and budget tools | Strong foundation | Add budget planning that is explicitly educational and measurement-led. |

## Candidate scoring

Scores use 1–5 for commercial relevance, India relevance, money-page authority, internal-link potential, distinct intent, user usefulness, and inverse cannibalization risk.

| Candidate | Score | Decision | Money-page relationship |
| --- | ---: | --- | --- |
| YouTube channel readiness checklist | 32/35 | Implemented | Supports `/youtube-subscribers` and `/youtube-views`; educational intent remains separate. |
| Social media campaign budget planning | 31/35 | Implemented | Supports `/pricing` and planning tools without presenting package prices as generic benchmarks. |
| Instagram followers vs engagement decision framework | 30/35 | Existing page upgraded | Supports `/buy-instagram-followers-india` and the engagement calculator. |
| Creator growth goal planner | 30/35 | Implemented tool | Links naturally from Instagram, YouTube and budgeting content; all calculations are browser-side/self-entered. |
| Facebook page credibility guide | 24/35 | Deferred | Existing local-business guide partially owns the intent. |
| LinkedIn company page comparison | 23/35 | Deferred | High overlap with existing business growth articles. |
| X, Telegram, TikTok education pages | 18–22/35 | Deferred | No validated gap; creating pages now would risk thin topical coverage. |

## Implemented in this sprint

- Expanded `/blog/instagram-followers-vs-engagement` with a signal-selection framework, a 30-day review model, and contextual links to the calculator, goal planner, and relevant service page.
- Added `/blog/youtube-channel-readiness-checklist`, with channel, video, measurement, public-link, and safety checks.
- Added `/blog/social-media-campaign-budget-planning-india`, with a four-bucket budget model, measurement design, and scale/pause decision process.
- Added `/tools/creator-growth-goal-planner`. It divides a user-entered goal into a weekly and per-post review rhythm. It does not access platform data or forecast outcomes.

## Internal linking and canonical decisions

New and expanded guides link to a relevant tool, related guide, and the appropriate money page using descriptive anchors. The existing metadata helper supplies absolute canonical URLs; dynamic blog and tool routes are already in the sitemap. The goal planner has been included in the sitemap. No commercial route, legacy redirect, noindex decision, checkout, payment, dashboard, API, catalogue, or pricing logic was changed.

## Technical follow-up

- Run Search Console queries and page data after indexing to validate whether deferred platform clusters deserve dedicated content.
- Check internal links periodically with a crawler; repository review found the sitemap and canonical path patterns are centralised.
- Continue using optimized local images for new editorial assets; both new guides reuse existing relevant project imagery rather than add unverified stock assets.
