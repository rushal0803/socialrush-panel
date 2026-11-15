# Phase 4 — privacy-safe integrated candidate

16 November 2026 (Asia/Calcutta). **Release HOLD. Draft only.** Base #765: `408584e95d4620dae7ce83c4a7e6d685b508ef93`. Exact published candidate head, changed-file manifest and completed CI are recorded in the draft PR body. Moving CI status is updated there without rewriting the tested commit.

## Scope and implementation

This branch combines the #760/#761 source stack with #762–#765 in an isolated, single-parent candidate. No existing PR is merged or branch rewritten. Seven original overlapping paths yield the same five text conflicts. The four recovery/shared-form conflicts retain exact #765 source. The workflow retains #765 checks, then adds Phase 4 fixtures and the #765 target trigger. Automatic SEO resolutions add 152 paths against #765; all are provisional review material, not independently approved release changes. [Resolution inputs and imported manifest](integration-resolution.json), [heads/CI/reviews](baseline-evidence.json).

The actual browser, client-event API, auth-event API and trusted analytics writer now enforce fail-closed optional collection. Required boundaries include explicit consent, supported DNT/GPC choices, exact production origin and activation/dataset/deployment settings, authoritative public-activity classification and atomic consent/replay checks. Defaults are **disabled**. `consentRepository()` deliberately returns null: no live consent backend, activation flag, consent prompt, production configuration or new analytics service is enabled. Installing a durable adapter and activating preferences/capture require separate authorization and retention/security review. This restriction cannot be bypassed merely by setting an environment flag.

The consent API and browser preference helper implement explicit grant/withdrawal, HttpOnly/Secure receipts, local immediate stop and honest acknowledgement of durable revocation failures. Positive cases use only an injected in-memory test fixture. There is no runtime memory-store fallback, test bypass endpoint or public “QA=true” opt-in. Browser globals forged by unit fixtures cannot authorize the server endpoint.

Raw URLs, destinations, credentials, auth tokens, free-text campaigns/referrers, raw customer IDs and raw order-event IDs are not emitted by the candidate analytics path. Paths become buckets; metadata uses finite categories/bounded numerics; identifiers for trusted outcomes are hashed and optional account linkage is removed. The legitimate catalog codes remain allowlisted. Existing operational orders, payments, security logs and accounting are independent of optional analytics; no order/payment/auth business behavior is gated on consent.

The offline financial extension adds signed posted-period revenue/cost corrections and a separate wallet-liability reconciliation. It preserves losses, unknown coverage, historical earned facts and refund occurrence periods. It rejects overlapping/replayed corrections and withholds service allocation when corrections have not been allocated by a reviewed policy. Wallet deposits never become earned revenue. [Synthetic demonstration](synthetic-report.json).

## Evidence and limits

- [Privacy audit, acceptance and activation gates](privacy-audit.md)
- [QA metadata and runtime isolation gaps](qa-isolation.md), [scrubbed metadata](qa-metadata.json)
- [Business measurement and admin dashboard roadmap](business-roadmap.md)
- [PASS/FAIL/BLOCKED/NOT RUN acceptance matrix](acceptance.csv)
- [Original Phase 3 evidence](../phase3/README.md); its historical screenshots and CI retain their original-head attribution.

Local and GitHub regression results are recorded separately. Source-contract fixtures that previously assumed unconsented collection were updated to grant **synthetic** consent and assert redaction, unique event IDs, repeat actions and DNT suppression. The stable trusted-event test now checks authorized hashed identity and retains the partial unique-index/duplicate handling assertions. No timeout or browser assertion is relaxed to obtain a pass.

The local launcher now prevents Next from loading any tracked/ambient dotenv values, in addition to denying outbound transport and setting synthetic backend keys in a cleared environment. A fixture regression checks this even with forced reload. Only payment-recipient key names were inspected; values were not copied or used. The preload follows the locked Next 15.5.26 API shape and must be reverified on upgrades. No production dotenv/configuration is changed.

The integrated smoke inventory has 460 cases versus 350 in the predecessor. CI's job budget increases to 25 minutes; individual browser assertions/timeouts are unchanged. The sitemap CLI is run after the isolated build/server with the existing validated canonical-host-over-loopback transport. Its first offline diagnostic attempt was blocked when the legacy default targeted production; no request was allowed. All retained canonical/sitemap checks now target only the owned local build. The new fixture guard blocks external browser destinations, and readiness probes do not follow redirects.

```sh
node --test tests/unit/phase4-consent.test.cjs tests/unit/phase4-isolation.test.cjs
node --experimental-strip-types --test tests/unit/phase4-profit.test.ts tests/unit/phase3-intelligence.test.ts
node --experimental-strip-types scripts/phase4-synthetic-report.ts
npm run test:unit
npx tsc --noEmit --incremental false
node scripts/phase2-isolated.cjs build 3108
node scripts/phase2-isolated.cjs serve 3108
# Another shell: complete existing smoke suite, synthetic loopback only
PLAYWRIGHT_BASE_URL=http://localhost:3108 NEXT_PUBLIC_SUPABASE_URL=http://localhost:3108 \
NODE_OPTIONS=--require=./scripts/phase4-no-dotenv.cjs CHROMIUM_EXECUTABLE=/usr/bin/chromium npx playwright test --config playwright.phase4.config.ts
```

No provision, deployment, credential change, production/customer mutation, real transaction/account test, live email, indexing or security bypass is performed. No paid tool or dependency is added. Source imports do not authorize the older SEO stack's operational/indexing scripts to run.

## Remaining gates and rollback

Independent review is absent, so the candidate is not approved integration. Exact hosted client/server/direct-DB identities, fixture ownership, payment/fulfillment/worker/notification egress and authenticated checkout remain **BLOCKED**. Manual assistive-technology/contrast and field performance/business gains remain **NOT RUN**. The older dedicated QA project name and healthy status do not close those gates.

Before activating anything: review the complete integration diff, durable consent/replay/retention adapter, authoritative internal/synthetic classification, preference UI and financial reconciliation/authorization. Then obtain separate authorization for any hosted infrastructure or stateful QA. Keep deployment disabled. Rollback before release is to keep/close this draft; an eventual approved revert must preserve all Phase 1 security, Phase 2 UI, Phase 3 finance and transaction records. Reverting consent enforcement would restore a known privacy gap and needs explicit review.

## Diagnostic harness history

An initial complete-suite attempt was stopped after synthetic dashboard calls hit CSP: the compiled backend was 127.0.0.1:3001 while the browser origin was localhost:3108. The launcher now compiles and serves matching localhost ports (3108 locally;3001 in CI), with production CSP unchanged. Dotenv is also disabled in browser workers. The interrupted attempt is retained as diagnostic history and is not a complete regression PASS. Final results supersede it only at the tested head; assertions are unchanged.
