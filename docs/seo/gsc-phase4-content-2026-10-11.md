# GSC Phase 4 — practical editorial improvements (2026-10-11)

The owner's October 10 Search Console export reports several blog URLs as `Crawled - currently not indexed`, with last crawls in June–July. These are **historical** observations, not proof of a current technical block or a content quality penalty.

This batched PR retains Phase 3's two guide links and improves two additional existing guides with real reader value:

- `/blog/facebook-page-growth-tips-for-local-businesses`: an example two-week posting calendar, a mobile-first contact audit, and a measurement distinction between impressions, follows, contacts and actual bookings.
- `/blog/social-media-growth-strategy-indian-creators`: primary/support channel decision examples, a Monday–Sunday creation/distribution routine, and a scorecard separating discovery, engagement and qualified outcomes.

The original article sections and URLs are preserved. Nothing claims fabricated client results, specific guaranteed improvement, or Google indexing. No changes to transactional pages, prices, payment, wallet, orders, Supabase, robots, sitemap or canonical settings.

**Hold for one batch release:** Production usage is limited. PR #628 is still a draft pending release authorization; GitHub CI and Vercel preview will rerun once after the single updated branch commit. Do not initiate repeated previews or merge to production without approval.

The older LinkedIn blog alias should remain a redirect. The short Instagram fast-growth guide needs query/page overlap data before changing its intent or redirect (tracked in issue #434). See issue #629 for editorial intent and follow-up validation.
