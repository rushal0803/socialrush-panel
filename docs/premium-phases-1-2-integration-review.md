# SocialRUSH combined premium design — integration review only

Integration branch started from Phase 1 PR #630 head `38f2c61143ba8ebf6146f6e4480d100916497162`, plus the 14 non-overlapping source/test/doc files from Phase 2 PR #631 head `4b2c1b1dc5bb349499ab7d4b8d61f75f28d173c2`. Conflicts were confined to `package.json` test scripts and the GitHub Actions workflow. Both sets of checks and visual evidence scripts are preserved.

**Brand lock:** retain #07080D, #0C0E14, #101219, #FF7600 and #FF9A2E. No cream, pastel or alternate accent theme.

**Final checks:** SEO headings, canonical routes, admin authorization, wallet/checkout and service pricing regressions, responsive screenshots at 390px/1440px for both phase templates, 1280/1440/1920 desktop header labels, admin UI authenticated fixture, and paired local lab speed measurements on the same host.

**Release policy:** all three PRs remain draft pending visual review. Do not merge/deploy. No production DB, payment/order, customer, CRM or financial actions should be performed. This is an isolated integration preview branch.
