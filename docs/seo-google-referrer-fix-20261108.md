# Google referral classification — 8 November 2026

## Confirmed problem

The previous search-source matcher `/(^|\.)google\./` accepted accounts.google.com, mail.google.com, docs.google.com and even google.com.evil.example as Google organic search. Both the organic landing predicate and first-touch attribution used it. The previous read-only 28-day audit found 122 organic_landing_view events with accounts.google.com attribution; this is measurement evidence, not a claim that all 122 were caused by this matcher.

## Change

Recognize Google root/country-domain shapes and the explicit images/news/search surfaces, with an anchored hostname. Treat other Google app subdomains as referrals for new first-touch attribution. Keep India and other country-domain forms, capitalization normalization, other existing search-provider rules, campaign overrides, paid click attribution and privacy guardrails.

This is a hostname heuristic, not proof of a visit's intent or Google ownership. Full referral URLs are still not transmitted. This patch does not reprocess historical data or rewrite stored first-touch sessions; existing tab attribution can persist until a new session. Direct/Vercel attribution inconsistencies, paid-vs-organic landing-event semantics and other providers' classification remain separate follow-ups.

## Regression evidence

Two added executable tests fail on the previous matcher and pass after the fix. Cover account/mail/drive/docs/calendar/translate/ads domains, deceptive suffixes, root/country/image/news search hosts, first-touch stored source/medium, explicit email UTM and paid-click preservation. Existing phase45 tests continue to protect consent, session correlation and once-per-document organic landing behavior. The existing PR workflow already runs this test file.

## Release boundaries

Independent branch from production main; does not depend on draft PR #744. No catalog rates, checkout, wallet, order, database, robots, metadata, sitemap, content, production configuration or existing analytics rows changed. Draft only; require CI, preview verification and owner approval before merge. Search Console remains unavailable through the subscription-blocked connector; no ranking or organic-revenue improvement is claimed.
