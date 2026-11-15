# Phase 3 — release readiness and measurement foundation

**Release HOLD. Draft only.** Base: #764 at `c77f6bded9e9c34252494930daf0eb1a3f7e4819`. The exact published Phase 3 head and current CI are in its PR body. No merge, deployment, production data/configuration, real transaction/account test, email or indexing action is authorized or performed.

## Outcome and boundaries

This proposal audits both stacks, prepares an object-only integration simulation, corrects an accessibility test's cumulative timeout, and provides offline analytics-policy and profit-report prototypes. It does **not** claim the production capture path is now consent compliant, install a consent manager, create a database migration, expose a new admin endpoint, or certify a release. Existing design, authentication, payment, catalog/prices and SEO source are unchanged from #764. No dependency or paid service is added.

- [Exact dependency heads, CI and review evidence](baseline-evidence.json)
- [Integration strategy and conflict decisions](integration.md), [machine-readable simulation](integration-simulation.json)
- [Hosted isolation and GO/HOLD gates](release-readiness.md)
- [Accessibility, navigation and performance findings](accessibility-performance.md)
- [Analytics audit, consent funnel and report specifications](measurement-design.md)
- [Synthetic financial demonstration](synthetic-report.json)
- [Acceptance statuses](acceptance.csv)

## Safe implementation

`lib/intelligence/measurement-policy.ts` is a pure policy prototype: explicit optional-analytics consent, DNT/GPC, deployment/origin, internal and synthetic checks; fixed categorical dimensions; trusted-only auth/paid-order outcomes; session-sequential cohort counts and ID-replay handling. It has no capture sink and is not wired to browser/server analytics. A caller's flags are **not** independent proof; the future adapter must obtain authoritative runtime identity, consent and ledger outcomes. Synthetic and production datasets cannot be mixed. The demo/test labels are never a production opt-in.

`lib/intelligence/profit-report.ts` reconciles supplied earned ex-indirect-tax facts in safe integer INR paise. It counts earned paid orders once, applies refunds in their occurrence window (including prior-period orders), deducts nine explicit cost classes and returns null net profit if revenue/refund/cost coverage is missing. It excludes wrong-dataset, internal and unverified entries. Unknown customer history withholds retention/CAC. Service direct contribution excludes shared costs and is never labeled service net profit. Coverage flags require accountant-approved reconciliation; COMPLETE_INPUTS_NOT_AUDITED is not audit certification.

The synthetic-only CLI reads the committed fixture and emits complete/incomplete examples. It imports neither Supabase nor payment/email clients. Existing accounting records are never rewritten; credits, reversals, installments, indirect-tax treatment and expense allocation require normalization/reconciliation before a future adapter may supply facts. Wallet deposits are liabilities, not earned sales. A paid order that is not yet earned cannot be booked as earned revenue simply because its payment verified.

The original four-route axe test shared one 30s budget. The retained failed log explicitly says timeout before aborting the final LinkedIn navigation. Each route now has a separate test with the same default budget and identical assertions; no retry, timeout increase, CSP relaxation or application navigation change. See the investigation for limits.

## Reproduce without production

```sh
node --experimental-strip-types --test tests/unit/phase3-intelligence.test.ts
node --experimental-strip-types scripts/phase3-synthetic-report.ts
node --test tests/unit/phase1-security.test.cjs tests/unit/profit-scenario-model.test.mjs
npm run test:unit
npx tsc --noEmit --incremental false
node scripts/phase2-isolated.cjs build
node scripts/phase2-isolated.cjs serve 3107
# Separate shell; existing offline fixture server only:
PLAYWRIGHT_BASE_URL=http://localhost:3107 \
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:3001 \
CHROMIUM_EXECUTABLE=/usr/bin/chromium \
npx playwright test --config playwright.phase3.config.ts
```

Local browser evidence was gathered on the already optimized #764 build because no Phase 3 application presentation/runtime source is changed; only the test harness and unused pure modules change. The separate Phase 3 build verifies compatibility. This is not hosted QA. `localhost` is deliberate: Next's redirect authority differs from 127.0.0.1; app CSP is preserved. Existing fixtures remove only the upgrade-insecure-requests response directive for loopback HTTP and deny external/non-GET browser traffic; server transport denies outbound connections with synthetic keys and a cleared inherited environment.

## Remaining risk and rollback

Independent review, exact hosted runtime isolation, authorized authenticated mobile/desktop QA, human assistive-technology/keyboard review, contrast incompletes and performance field data remain unresolved. The partial CI integration simulation is not an integrated release. The new prototype must not become a production capture or financial adapter without authorization, consent/retention design review, ledger reconciliation and access-control tests.

Before release, recheck every exact head and run full integrated CI and the safety gates. Keep the new branch's deployment opt-out. Rollback before release is to leave/close this draft; an eventual reviewed revert must preserve #762 finance, #763 security, #764 UI and all transaction records. Reverting the test split restores the known cumulative timeout risk. **No GO is issued.**
