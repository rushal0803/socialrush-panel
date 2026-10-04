# Final service-page blocker resolution

This report supersedes the earlier upgrade/verification readiness reports. No merge or deployment is authorized or performed.

## Git evidence

Initial branch: `feat/service-pages-cro-trust-upgrade`. Initial HEAD and verified remote main: `a493c541f53b8f385f680f2890f750d3f7612518`.

Initial state is **C: an older base commit with the upgrade entirely uncommitted**. No staged files; 37 tracked files had unstaged changes; 14 new intended source/test/report files were untracked, plus generated review artifacts. No upgrade commit existed. The initial 51-file manifest is in `service-page-final-verification.md`. The latest five initial commits were:

1. `a493c541` — Phase 27 completion: remaining platform content-gap maps
2. `f041815d` — Phase 21 completion: revoke direct privileged RPC execution
3. `e1340fa0` — Phase 21 completion: server-only admin RPC hardening
4. `a0c5e672` — Phase 23 completion: reduce homepage startup work
5. `1ce67270` — Phase 22 completion: full responsive coverage

`git ls-remote origin refs/heads/main` independently confirmed the same remote base. Work was preserved. Generated artifacts are ignored, retained locally for review and excluded from the commit. No credentials, debug logs, screenshots or baseline build files are intended commit content.

## Authenticated-flow limit

Repository inspection covered smoke tests, fixtures, setup scripts, Supabase files, CI, setup/runbook documentation and local tool availability. No seeded customer, local Supabase project configuration, safe account credentials, authenticated storage-state file, auth setup fixture or development wallet/order mode was found. CI explicitly exercises unauthenticated UI with placeholder Supabase configuration. Those placeholders are not an authenticated testing mechanism.

No credentials were invented, no production secrets were used to authenticate, and no authentication bypass was added. Source review is not a runtime pass. Instagram, YouTube and LinkedIn real signed-in flows remain unverified on desktop and mobile: session, actual database service ID/name/rate, actual wallet loading, review UI, named-package applicability and authenticated payload consistency. The public quantity preset is a custom-quantity choice; it does not create a fixed package ID. The dashboard recomputes current price instead of freezing the landing estimate. A safe existing test account/session is required, and any subsequent verification must intercept/stop before checkout-intent, final order or payment mutation.

## Hydration investigation and repair

Exact homepage component: `components/marketing/PremiumHomepage.tsx`, the maximum quantity in the product preview. Node's default locale is `en-IN`; Playwright Chromium's default is `en-US`. The original `.toLocaleString()` produced server text `10,00,000` and client text `1,000,000`, triggering React #418. An `en-IN` browser retained `10,00,000` and produced no error.

Main was archived into an isolated temporary directory, built separately with non-secret Supabase placeholders and inspected in Chromium. It reproduced the same #418/text mismatch in `en-US`, and no page error in `en-IN`. The unmodified branch homepage initially reproduced exactly the same behavior. The new service frame/card/journey do not render on the homepage; the implicated component was initially byte-identical to main. This is a pre-existing, locale-dependent defect rather than a service-component contribution. A failed first baseline navigation waited on deferred network traffic; the successful isolated comparison stubs unrelated health/analytics requests and does not stub rendering.

The small technical repair explicitly supplies `en-IN` to the three homepage quantity calls. Server copy, metadata and layout are unchanged. The subsequent public-routes trace identified the same pre-existing default-locale calls in `components/marketing/services/ServicesPageContent.tsx`; its four numeric calls now use `en-IN` as well. Existing server numeric presentation is preserved. No SEO wording was edited.

Regression coverage checks SSR quantity text, client quantity text and a working hydrated FAQ interaction for `en-US`, `en-IN` and `de-DE`. This checks hydration directly rather than making it depend on deferred network idleness.

## Browser-runner shutdown

The old Playwright configuration reproduced a hang immediately after `pw:webserver Terminating the WebServer`, after its test assertion passed. Installed Playwright's Windows launcher uses a shell process and `taskkill /pid ... /T /F`, then waits for process cleanup. A probe against an owned disposable Node child returned exit code 1 and `ERROR: Access denied`. Direct `child.kill()` succeeded. No browser/context leak was required to reproduce the hang.

`scripts/playwright-server-setup.cjs` now owns a single Next production process with `shell: false`, redirects server logs to ignored artifacts, waits for readiness, and returns a bounded cleanup function. It terminates only that child and waits for its exit; failure to exit within ten seconds fails teardown. Startup failure also cleans up. External test servers remain caller-owned. A targeted test returned exit code 0 with the owned-process exit message. The browser base URL uses `localhost` to match Next's local redirect authority and avoid cross-origin CSP noise from private-link prefetches to `localhost` while the page was opened on `127.0.0.1`.

Production CSP also upgrades redirected local prefetches to HTTPS, while the smoke server only serves HTTP. This caused `ERR_SSL_PROTOCOL_ERROR`, not a hydration error. Only loopback HTTP navigation responses in the browser fixture omit the `upgrade-insecure-requests` directive. Every other directive, HTML body and application response remains intact. The direct APIRequestContext CSP assertion sees the unmodified response and explicitly verifies that production retains the upgrade directive. External HTTPS/staging runs receive no such override. These are local browser checks, not TLS deployment verification. Chromium logging is redirected to ignored artifacts; its generated additions to the initially clean tracked `debug.log` were restored.

## CRO runner and SEO baseline

Issue #1: `tests/unit/cro-personalization.test.ts` previously aborted because the plain Node runner did not resolve `@/lib/reseller/monthly-plan` in `saved-monthly-plan.ts`. Production imports remain untouched. `scripts/test-path-aliases.mjs`, preloaded only by `test:cro`, implements the existing `@/*` mapping. All 22 tests pass. No dependency or production command changed. The hook requires Node 22.15+; repository CI selects Node 22. See [Node module hooks](https://nodejs.org/api/module.html#moduleregisterhooksoptions).

Issue #2: **PRE-EXISTING SEO BASELINE FAILURE — NOT INTRODUCED BY THIS BRANCH.** Main and branch both return eight passing tests and one failed assertion in `tests/unit/country-service-seo.test.ts:81`, requiring descriptions at most 180 characters. All 22 country descriptions remain 192–214 characters. Test and source `lib/seo/international.ts` are identical to main. Neither descriptions nor assertions were changed; no formal baseline mechanism was found. The current pre-merge workflow does not invoke this particular test, but it remains a documented broader-suite failure.

## Analytics isolation

Rate-limit noise came from real same-origin `/api/analytics` beacon traffic generated by repeated automated visits from one IP. This endpoint can persist events in Supabase; it is not merely a harmless browser-local counter. Production analytics already respects `navigator.doNotTrack === "1"`. The shared smoke fixture sets that existing privacy preference before scripts run. Production tracking semantics, listeners and rate limits are unchanged. An isolated opt-in run is still possible with `SMOKE_ANALYTICS_ENABLED=1`; no live opt-in analytics run is necessary for the order/visual regression suite. Authentication-completed analytics cannot fire in the unsigned test journey because no account is created or logged in.

## SEO comparison

The source guard now compares with the merge base of `origin/main`, including after commit, instead of comparing only with HEAD. New additive files do not pretend to have baseline contracts. The only contract normalization allows explicit `en-IN` for numeric presentation in the two repaired components; it does not ignore copy changes. The protected-source checker compares 114 files; its only test-only exception validates the exact `test:cro` command and requires every other package field to remain identical.

URLs, slugs, metadata/titles/descriptions, canonicals, robots, sitemap, H1s, existing SEO/country copy, schema/FAQ schema, internal SEO destinations, hreflang and indexability are retained. Server-rendered SEO contracts are compared for 94 compiled service paths. All 22 long country descriptions remain untouched. No dependencies, lockfile, production pricing, API/auth, middleware, database or dashboard-order implementation changed.

## Final validation

The pre-merge static CRO check expected four primitive names to occur directly in each wrapper. Shared-card delegation made that source-shape assertion obsolete. The check now follows an actual `ServiceOrderCard` import/render and verifies the same quantity, readiness, view-tracking and valid-handoff contracts in that implementation. Legacy inline builders retain their original assertions, and browser tests still exercise quantity changes, readiness and links. No SEO assertion was weakened. All 64 phase 16–28 pre-merge unit checks pass.

Manual hero review covered all seven platforms at 390/1440px, including forms, rate/minimum facts, trust hierarchy and primary/secondary actions. The floating support pill visibly covered right-hand delivery/rate details. A service-only CSS rule places that global action after the footer in normal flow with a 44px minimum target; existing hero/order-card help remains accessible. Other routes retain their original widget behavior. Final representative tests require a static support position and zero analytics requests under the existing privacy opt-out. Sticky ordering remains dismissible and is tested separately.

Final outcomes and the complete commit manifest are recorded below after validation. Authenticated runtime remains an explicit incomplete gate regardless of passing public tests.

Production build: PASS (313 pages); TypeScript: PASS; lint: PASS with existing warnings; diff whitespace check: PASS. Full smoke/responsive suite: 135/135 PASS, process exit 0, owned Next server terminated cleanly. The suite includes 752 responsive matrix checks, 14 representative desktop/mobile runtime checks, and all three homepage locale hydration checks. CRO unit tests: 22 PASS; phase 16-28 pre-merge unit checks: 64 PASS; relevant pricing/currency/trust/payment/related checks: 13 PASS. Rendered SEO contracts: 94 PASS. Protected source comparisons: 114 checked with only the exact test-command exception described above.

Final representative results: zero console/page errors, zero horizontal overflow, zero analytics requests, initial CLS 0 and maximum inspection CLS 0.005573. Mobile sticky dismissal/visibility and service support positioning pass. Local HTTP browser navigation uses the documented CSP harness adjustment; this is not a deployed HTTPS validation.

Additional public handoff checks passed for Instagram, YouTube and LinkedIn at 390px and 1440px: quantity 1000, valid destination link, selected service code and encoded login return selection preserved. No financial mutations occurred. These are logged-out handoff checks, not authenticated payload verification. Authenticated order review and final order payload remain unverified because no authorized safe account/session is available. No real order was submitted.

The country SEO suite remains 8 PASS / 1 FAIL on both this branch and actual main: PRE-EXISTING SEO BASELINE FAILURE — NOT INTRODUCED BY THIS BRANCH. Country descriptions and the baseline test were left unchanged.

Merge/deploy readiness: NO pending safe authenticated desktop/mobile Instagram, YouTube and LinkedIn verification through order review/payload interception. Commit and push are limited to the feature branch; no merge or deployment is performed. Generated screenshots, logs, diagnostic scripts and baseline archives remain outside the commit.

## Complete intended commit manifest (69 files)
- `.gitignore`
- `app/(india-seo-services)/buy-instagram-likes-india/page.tsx`
- `app/(india-seo-services)/buy-instagram-views-india/page.tsx`
- `app/(india-seo-services)/buy-youtube-watch-hours-india/page.tsx`
- `app/buy-instagram-comments-india/page.tsx`
- `app/buy-instagram-followers-india/page.tsx`
- `app/services/[slug]/page.tsx`
- `app/youtube-watch-hours/page.tsx`
- `components/marketing/FacebookFollowersLanding.tsx`
- `components/marketing/FacebookLikesLanding.tsx`
- `components/marketing/FacebookViewsLanding.tsx`
- `components/marketing/InstagramFollowersOrderPanel.tsx`
- `components/marketing/InstagramLikesOrderPanel.tsx`
- `components/marketing/InstagramViewsOrderPanel.tsx`
- `components/marketing/LinkedInFollowersLanding.tsx`
- `components/marketing/LinkedInLikesLanding.tsx`
- `components/marketing/LinkedInUsaConnectionsLanding.tsx`
- `components/marketing/LinkedInUsaCustomCommentsLanding.tsx`
- `components/marketing/LinkedInUsaEndorsementsLanding.tsx`
- `components/marketing/LinkedInUsaFollowersLanding.tsx`
- `components/marketing/LinkedInUsaGroupMembersLanding.tsx`
- `components/marketing/LinkedInUsaPostLikesLanding.tsx`
- `components/marketing/LinkedInUsaRepostsLanding.tsx`
- `components/marketing/PremiumHomepage.tsx`
- `components/marketing/PublicShell.tsx`
- `components/marketing/services/CountryServiceLandingPage.tsx`
- `components/marketing/services/IndiaServiceLandingPage.tsx`
- `components/marketing/services/InstagramSavesLanding.tsx`
- `components/marketing/services/PremiumCatalogServiceLanding.tsx`
- `components/marketing/services/SeoServiceLandingPage.tsx`
- `components/marketing/services/ServiceExperience.module.css`
- `components/marketing/services/ServiceExperienceFrame.tsx`
- `components/marketing/services/ServiceJourney.tsx`
- `components/marketing/services/ServiceLandingOrderBuilder.tsx`
- `components/marketing/services/ServiceOrderCard.tsx`
- `components/marketing/services/ServiceOrderStickyCta.tsx`
- `components/marketing/services/ServicesPageContent.tsx`
- `components/marketing/TelegramFollowersLanding.tsx`
- `components/marketing/TikTokFollowersLanding.tsx`
- `components/marketing/TwitterFollowersLanding.tsx`
- `components/marketing/YouTubeLikesLanding.tsx`
- `components/marketing/YouTubeSubscribersLanding.tsx`
- `components/marketing/YouTubeSubscribersOrderPanel.tsx`
- `components/marketing/YouTubeViewsLanding.tsx`
- `docs/service-page-final-verification.md`
- `docs/service-page-merge-gate.md`
- `docs/service-page-upgrade.md`
- `lib/cro/service-order-preview.ts`
- `package.json`
- `playwright.config.ts`
- `scripts/playwright-server-setup.cjs`
- `scripts/service-final-source-review.cjs`
- `scripts/service-page-inventory.cjs`
- `scripts/service-rendered-seo-check.cjs`
- `scripts/service-seo-lock-check.cjs`
- `scripts/test-path-aliases.mjs`
- `tests/smoke/cashfree-customer.spec.ts`
- `tests/smoke/cashfree-direct-status.spec.ts`
- `tests/smoke/fixtures.ts`
- `tests/smoke/homepage-hydration.spec.ts`
- `tests/smoke/phase12-mobile-a11y.spec.ts`
- `tests/smoke/phase19-instagram-mobile-ux.spec.ts`
- `tests/smoke/phase20-instagram-cro.spec.ts`
- `tests/smoke/phase22-responsive-completion.spec.ts`
- `tests/smoke/production-safety.spec.ts`
- `tests/smoke/service-experience.spec.ts`
- `tests/smoke/service-final-verification.spec.ts`
- `tests/unit/phase20-instagram-cro.test.ts`
- `tests/unit/service-order-preview.test.ts`
