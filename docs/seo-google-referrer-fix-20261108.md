# Google referral classification — 8 November 2026

## Confirmed problem

The previous search-source matcher `/(^|\.)google\./` accepted accounts.google.com, mail.google.com, docs.google.com and even google.com.evil.example as Google organic search. Both the organic landing predicate and first-touch attribution used it. The previous read-only 28-day audit found 122 organic_landing_view events with accounts.google.com attribution; this is measurement evidence, not a claim that all 122 were caused by this matcher.

## Change

Recognize Google root/country-domain shapes and the explicit images/news/search surfaces, with an anchored hostname. Treat other Google app subdomains as referrals for new first-touch attribution. Keep India and other country-domain forms, capitalization normalization, other existing search-provider rules, campaign overrides, paid click attribution and privacy guardrails.

This is a hostname heuristic, not proof of a visit's intent or Google ownership. Full referral URLs are still not transmitted. This patch does not reprocess historical data. Existing tab attribution persists during ordinary navigation; an explicit new campaign or paid-search click marker refreshes it, consistent with existing UTM campaign behavior. Direct/Vercel attribution inconsistencies and other providers' classification remain separate follow-ups.

## Regression evidence

Two added executable tests fail on the previous matcher and pass after the fix. Cover account/mail/drive/docs/calendar/translate/ads domains, deceptive suffixes, root/country/image/news search hosts, first-touch stored source/medium, explicit email UTM and paid-click preservation. Existing phase45 tests continue to protect consent, session correlation and once-per-document organic landing behavior. The existing PR workflow already runs this test file.

## Release boundaries

Independent branch from production main; does not depend on draft PR #744. No catalog rates, checkout, wallet, order, database, robots, metadata, sitemap, content, production configuration or existing analytics rows changed. Draft only; require CI, preview verification and owner approval before merge. Search Console remains unavailable through the subscription-blocked connector; no ranking or organic-revenue improvement is claimed.

## Paid-search landing follow-up

The organic landing event originally considered only the document referrer and public path. A Google/Bing ad visit could therefore emit organic_landing_view even when its attribution was paid. Separately, getFirstTouchAttribution returned stored attribution before checking Google/Bing click markers, retaining an old organic source in an existing tab.

Add a pure landing-eligibility predicate that combines the search referrer, public path, paid-search markers and declared UTM source/medium. Recognized Google/Bing click markers always exclude the organic event. Non-organic UTM media or a competing UTM source also exclude it. A direct/referral visit cannot become organic merely by supplying UTM parameters. Current URL query values are read locally for classification only.

Share paid-search source recognition between landing eligibility and attribution. A fresh gclid/gbraid/wbraid/dclid/msclkid marker refreshes stored attribution as an explicit new campaign; ordinary navigation preserves it. Explicit UTM overrides keep their existing precedence. No click identifier values or full referrer/query URLs are added to storage or beacons.

Regressions cover paid markers (including empty marker presence and contradictory organic UTM), email/paid media, competing source, valid organic source/medium, private/auth/direct destinations, stale organic attribution replaced by paid source, identifier non-retention and ordinary-navigation preservation. Both previous Google-app tests and existing privacy/deduplication tests remain in the suite.
