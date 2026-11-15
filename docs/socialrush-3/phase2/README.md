# Phase 2 — premium UI/UX implementation

**Release HOLD. Draft only.** This is a local, synthetic-data UI implementation, not an approved release or authenticated hosted QA result. No production change, merge, deployment, account test, real payment, email or indexing request was performed.

> **Full-CI follow-up:** initial head `e2a6ee1a` later failed five broader browser tests. See [failure analysis and correction](ci-followup.md). Earlier focused PASS results below retain their original scope; they were not full CI approval.

## Verified starting point and dependency chain

Fresh GitHub reads on 15 November 2026 (Asia/Calcutta) confirmed all four PRs draft and unmerged:

| PR | Exact head | Base | CI at that head |
|---|---|---|---|
| #760 | `04affabe4287cfa79eab6696ec53825c94714227` | main `35fcaf731447a948b69a9ae917b5af596d22711e` | Smoke/build/unit and PostgreSQL SUCCESS; optional performance SKIPPED |
| #761 | `b07b484a3d24dd84f4047708d563e176efc9aaf2` | #760 branch | Vercel comment SUCCESS; main-target smoke/SQL NOT RUN |
| #762 | `eecbe2b6fe3a35b62728ecdbfb6a9ee4700b323d` | main | Both CI jobs SUCCESS; optional performance SKIPPED |
| #763 | `94a2b39ff64bb6c81a7ed96396f8d19e92c6d6d0` | #762 branch | Both CI jobs now SUCCESS, including previously pending browser smoke; performance SKIPPED |

This branch starts from exact #763 and targets its branch. It retains #762 financial corrections and #763 auth/payment safeguards. #763 selected auth source from #761; it did not merge the complete #760/#761 SEO stack. The #760 early-input DOM adoption fix was absent from #763 and is ported narrowly into the shared form here, retaining invalid input for explicit validation. Other #760 changes remain separate. Do not independently merge overlapping stacks without a fresh integration review.

The exact final proposal head, CI links and changed-file count are recorded in the draft PR body. Source files are frozen before the visual/test evidence below; report/screenshot additions do not alter runtime code. Current PR CI must be read at that exact head rather than inferred from predecessor checks.

## What changed and why

**Homepage:** keep the SocialRUSH wordmark, charcoal/black surfaces and orange actions. Discovery becomes the primary hero action; price configuration remains a visible alternative with existing event names. Tighten hero spacing and copy; retain the labeled sample workspace on desktop and prioritize discovery on narrow screens. Remove repeated workspace previews, duplicated benefit/trust grids and the repeated order summary. Retain ordering guidance, the existing price planner, full FAQ answers, Trust Center, real policy/support information, genuine reviews/empty state, educational links and canonical destinations. FAQs use native details/summary so closed answers are not focusable or misleadingly exposed.

**Discovery:** add locally filtered search, category selection, platform filters, result count, query retention across filters and a recoverable no-results state. Default cards are explicitly labeled catalog examples, not best sellers or profit leaders. All platform/category counts refer to catalog services, never customers. Reuse ServiceCard and the existing health/currency hooks rather than create a parallel card system. Canonical detail destinations are extracted unchanged to one shared map for homepage/directory use.

**Cards:** show a rate per1,000 units plus minimum quantity/estimated minimum total; distinguish catalog rate from final order authority. Show destination instructions, delivery as an estimate, the existing refill terms, detail links and expandable requirements. Services requiring protected live facts do not show a stale static price as current. Existing availability comes from the health hook; a screenshot's synthetic status is not independent proof of live fulfillment health.

**Representative service pages:** Instagram Followers, YouTube Subscribers and LinkedIn Followers share ServiceOrderCard presentation. LinkedIn's separate builder is replaced while keeping `#order`, original page heading/content and its analytics surface name. Existing shared form improvements apply to Instagram/YouTube and other consumers consistently: readable labels and inputs, explicit rate/summary, public-link validation, refill/delivery information, policy links, keyboard focus, responsive choices and a mobile order bar that hides while the form is focused. Platform icons remain recognizable; form accents use the existing brand orange.

**Quantity:** adopt quantity/link edits made before hydration, keep typed invalid/blank/fractional text for validation instead of stripping it into a different integer, and prevent invalid handoff. Summary arithmetic still uses the unchanged preview helper/catalog; server-side recalculation remains authoritative. Browser tests inspect the encoded order handoff without placing an order or testing a live account.

## Boundaries preserved

Local git comparison confirms byte-identical auth, security, API, payment, schema, service-pricing and catalog source against #763. No metadata route, canonical ownership definition, redirect configuration, actual price, enabled payment flag, SDK dependency or lockfile was changed. Shared service destination mapping values remain identical; route coverage tests still pass. Titles/canonicals were compared across eight before/after page+viewport samples and are unchanged.

The only build/release configuration changes are a branch-specific Vercel deployment opt-out, CI activation for the #763 base branch, and retention of Phase2 browser diagnostics. No production configuration or branch protection was edited. Publishing this branch must not create a preview. Verify zero deployments after publication; the opt-out does not prove backend isolation.

## Isolation and reproducibility

Before screenshots use the built #763 source; after screenshots use this implementation. Both use the same existing synthetic backend fixture transport, synthetic keys, INR display and loopback-only local servers. No customer records are copied. Local build/server processes deny outbound fetch, HTTP and socket connections, then install the existing in-memory backend transport. Browser test contexts deny non-loopback requests and all non-GET requests. Native zoom uses a disposable Chromium profile and Chrome's own default-zoom setting, not a customer's browser profile or a viewport-only simulation.

```sh
# After installing the repository's existing locked dependencies:
node scripts/phase2-isolated.cjs build
node scripts/phase2-isolated.cjs serve 3105
# In another terminal:
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3105 CHROMIUM_EXECUTABLE=/usr/bin/chromium \
  npx playwright test --config playwright.phase2.config.ts
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3105 CHROMIUM_EXECUTABLE=/usr/bin/chromium \
  node scripts/phase2-native-zoom.cjs
npx tsc --noEmit --incremental false
npm run test:unit
node --test tests/unit/phase1-security.test.cjs
```

The Chromium executable path is local/tooling-specific. The native zoom helper uses Chrome internal settings only inside its disposable local profile. The initial extension-based zoom harness did not start on this Chromium build; it was replaced, not counted as an application PASS. The launcher/server is local-only and never invokes a deployment tool. The isolated launcher was smoke-checked on another loopback port with HTTP200. No paid tool or new dependency was introduced; axe-core is already present in the existing dependency graph.

## Actual acceptance results

See [acceptance.csv](acceptance.csv), [browser summary](browser-summary.json), [native zoom measurements](native-zoom.json) and retained logs.

| Scope | Result | Evidence / limit |
|---|---|---|
| Existing unit suite | **PASS 237/237** | unit.log; no skipped tests in that run |
| Focused UI/SEO contracts | **PASS 27/27** | Brand/layout, service route coverage and updated component contracts; overlaps existing suite |
| Phase1 security regressions | **PASS 15/15** | security.log; source-executing synthetic auth/provider/financial fixtures |
| TypeScript | **PASS** | Explicit `tsc --noEmit --incremental false` exit0; test option type corrected before final verification |
| Changed-file lint | **PASS** | No errors/warnings in the targeted changed TSX/test set; repository-wide historical warnings remain |
| Optimized local build | **PASS** | Network-denied synthetic build; existing non-blocking lint/Supabase Edge warnings retained in build-summary.txt |
| Dedicated browser suite | **PASS 16/16** |12 page/viewport cases at320/390/1440 plus discovery, invalid-input/summary, gated hydration and scoped axe cases |
| Native 200% zoom | **PASS 4/4** | Chrome reported2; CSS viewport1440→720, scrollWidth720 on all four routes |
| Title/canonical samples | **PASS 8/8** | Before/after titles and canonical values match at390/1440 |
| Screenshots | **PASS, bounded visual review** | Gallery at390/1440 plus320 and native200%; actual component/CSS, synthetic data |
| Automated accessibility | **PASS for scoped violation checks** | No WCAG2A/AA/2.1AA violations reported in discovery/shared forms. Axe color-contrast incompletes remain for manual review. Not full AA certification. |
| Protected hosted QA | **BLOCKED** | No independently verified immutable-preview client/server/DB/provider/worker isolation or authorized test account |
| Real checkout / production accounts / email / merge / deploy / indexing | **NOT RUN** | Explicitly prohibited |
| Field CWV / conversion uplift / full assistive-technology certification | **NOT RUN** | No RUM/experiment data; manual screen-reader and all composited contrast checks remain outstanding |

Earlier diagnostic browser run: four failures (three homepage overflows from a legacy decorative pseudo-element and one selector accessible-name issue). Both causes were fixed; the final16-case run has0 failures/skips/flaky results. The glow is removed rather than masking the document with blanket overflow clipping. An old source-contract test was updated for LinkedIn's shared builder while preserving the analytics surface and blocked-click/privacy checks. These are not ignored failures.

The screenshot matrix proves selected local layouts and component states, not authenticated hosted behavior, all navigation paths, real mobile keyboards or server-side checkout execution. Axe is scoped to changed discovery/forms. Reduced-motion is exercised in browser contexts; the remaining page and global navigation still need complete manual keyboard/screen-reader review before release.

## Visual review and screenshots

[Before/after gallery](visual-review.md) links original viewport captures and the discovery/form details. Baseline is exact #763, not a different production release. Synthetic health/status/catalog values must not be treated as live-business evidence. Viewport screenshots do not imply every below-fold pixel was visually approved. Existing helpful service-page editorial content and SEO route files are retained.

## Measurement opportunities — hypotheses, not gains

1. Measure service discovery task completion/time, no-results frequency and search-to-detail rate using consent-aware, privacy-safe aggregate events. Do not record typed public URLs, emails, tokens or payment references.
2. Compare eligible landing→valid review→verified paid-order cohorts. Keep existing hero/decision-rail event identities; note that discovery is now the primary hero path. AOV alone is insufficient; use contribution per eligible visitor with refund/support/error guardrails.
3. Monitor quantity validation errors, login-return selection retention and successful authoritative price reviews. UI handoff tests do not prove payment conversion.
4. Collect separate lab and field performance evidence by device. Targets remain applicable p75 LCP≤2.5s, INP≤200ms, CLS≤0.1; no CWV or conversion improvement is claimed here.

Pre-register baseline period, eligibility, assignment unit, sample size/MDE, guardrails and rollback. Current customer conversion, profit and channel performance are unavailable in this task. There is no fabricated percentage uplift, revenue forecast, review or customer count.

## Risks, rollback and remaining work

Risks: shared form/card presentation affects other consumers, so use the broad existing CI smoke suite; code-point invariants and representative tests do not exhaust every service. The primary homepage action changes emphasis and requires measurement. Search is local client state, not a new indexed route or server query. Platform-specific delivery/refill facts remain catalog-driven and must be validated operationally. Color-contrast incompletes and full manual assistive-technology review remain unresolved.

Rollback before release is to leave/close the draft; no deployed state exists. Any later approved rollback must use a separate reviewed revert of Phase2, preserve #763 security/#762 finance and all transaction records, and record that reverting the early-input adoption may restore a known UI regression. Do not remove this branch's deployment opt-out while publishing it.

Before any release: refresh exact head/base/dependency CI; independently establish immutable-preview browser/server/direct-DB identity and synthetic fixture ownership; demonstrate payment/fulfillment/email/cron isolation; then run authorized390/1440 authenticated login/logout/recovery/quantity/checkout QA and complete accessibility/performance gates. If that requires a new build/configuration, obtain separate approval. This task authorizes neither deployment nor changes to live business processes. **Release remains HOLD.**
