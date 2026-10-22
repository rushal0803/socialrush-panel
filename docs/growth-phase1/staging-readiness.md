# Phase 1.3 — financial staging readiness

22 October 2026 (Asia/Calcutta). Decision: **BLOCKED; no production release approval.**
Branch: `feat/payment-revenue-safety-20261020`; existing [draft PR #702](https://github.com/rushal0803/socialrush-panel/pull/702). No other branch/PR, infrastructure, deployment, remote migration, financial-data export or gateway transaction was created.

## Resource discovery and identity

Read-only discovery used project metadata, non-decrypted Vercel environment metadata, local variable names, source inspection and existing CI evidence. Secret values were not printed, committed, decrypted through Vercel, or used for requests. No remote SQL, Auth account creation or provider calls were made.

Owner response in this phase: existing Preview is **not confirmed disposable**, and no dedicated staging/test credential location is confirmed. Treat all existing Supabase/Razorpay configuration as potentially production-connected. Remote tests and migrations remain explicitly blocked. The owner will supply/approve a dedicated setup; no merge or deployment is authorized.

| Resource | Observed identity / configuration | Readiness |
|---|---|---|
| Primary listed Supabase project | `valclbfoassmfyixwnyv`, healthy PostgreSQL 17; local `.env.local` URL resolves to this project | Treat as protected. Existing local credentials are **not staging inputs**. No data queried. |
| Candidate Supabase project | “SocialRUSH Preview”, `gtlztholtjhafhvknnku`, ap-south-1, healthy PostgreSQL 17; branch inventory empty | Separate project identity confirmed. Disposable/synthetic ownership, integrations, credentials, migration state and access isolation **not confirmed**. No write/reset authorized by its name. |
| Vercel hosting | One matching `socialrush-panel` project in the connected team; no custom environments returned | No independently configured staging hosting resource identified. This review branch still has Git deployment disabled. |
| Vercel database scopes | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL` each have records targeting both production and preview | **FAIL isolation preflight** for this branch. Overrides for another branch (`cashfree-direct-order-checkout`) do not establish isolation here. Values were not decrypted; actual credential mode/content is not asserted. |
| Vercel payment/side-effect scopes | Razorpay key/secret/webhook and cron/email records include shared production/preview targets. Cashfree preview variable records exist | Presence does not certify test mode. No dedicated configuration or safe secret location for this branch established. `CASGFREE_CLIENT_ID` also exists as a misspelled metadata key; do not use it as proof of a configured client. |
| Local configuration | `.env.local` contains Supabase variables only; `.env.production` contains UPI payee variables only | No identified local Razorpay test keys, isolated Auth accounts, staging manifest or approved financial snapshot. Existing UPI payee configuration must not be used in tests. |
| Local runtime | Supabase CLI 2.108.0; no Docker or `psql` executable found on PATH; no `supabase/config.toml` | A complete local Supabase stack cannot currently be started here. CLI version/help succeeded after allowing its startup telemetry metadata write outside the workspace; no database command executed. |

Shared environment records demonstrate a configuration separation problem, not a finding that production data was accessed or that the keys are live. Vercel applies general preview values unless a matching branch override replaces them; see [environment scope and branch overrides](https://vercel.com/docs/environment-variables#preview-environment-variables).

## Passed, failed and blocked gates

| Gate | Status | Evidence / condition |
|---|---|---|
| Starting PR exact-head CI | PASS | `aecf1bcb66a2ac9e218231203dbb1c3c8cd091e3`; [run 39662040835](https://github.com/rushal0803/socialrush-panel/actions/runs/39662040835): three success checks; two conditional performance checks skipped; draft/unmerged. Final documentation-head status is recorded in PR #702. |
| Financial regressions, native sessions, SQL permissions, local build | PASS, carried evidence | Phase 1.2: 615 unit tests, 31 application + 13 SQL finance checks, 37 dashboard checks; native PostgreSQL 17.11 contention/deadlock/rollback tests; TypeScript/lint/build passed. CI: 262 broad smoke + 15 focused customer fixture checks; 67 opt-in smoke tests skipped. Counts overlap. No unchanged suite rerun was used to imply new staging evidence. |
| Separate candidate project identity | PASS | Project metadata confirms a distinct ref; it does not certify data or credentials. |
| Current branch environment isolation | FAIL (configuration) | Shared production/preview database/admin credential records; local URL points at primary listed project. Do not launch an integration session using inherited configuration. |
| Full-history replay safety as currently configured | FAIL (static preflight) | Nine migrations manage cron; three contain outbound calls to the production origin. Vault secret dependency and hardcoded `cron.alter_job(job_id := 1)` require a controlled replay plan. No migration execution failure or production incident is asserted. |
| Production-build gateway sandbox compatibility | FAIL (source compatibility) | `lib/payments/razorpay.ts` rejects `rzp_test_*` when `NODE_ENV=production`. Do not fix this by using live keys or changing the `NODE_ENV` of `next start`. Isolated dev-mode test execution is possible after resource approval; production-build sandbox parity needs an explicitly reviewed environment-mode change. |
| Full schema replay / Supabase Auth / PostgREST / actual RLS | BLOCKED | Requires approved disposable stack, independent keys, disabled side effects and complete migration replay. SQL fixture policies are not a substitute. |
| Actual wallet/checkout/admin refund flows | BLOCKED | Requires synthetic Auth accounts, catalog/payment fixtures and isolated backend. Customer fixture checks passed previously; administrator refund displays against staging remain NOT TESTED. |
| Actual gateway sandbox / reconciliation contracts | BLOCKED | Dedicated verified test keys, test-only webhook configuration and synthetic captured payments unavailable. Cashfree preview metadata is not proof of sandbox behavior. |
| Historical financial records / costs / recognition evidence | BLOCKED | No explicitly approved data source. No real unmatched/duplicate/cost counts can be reported. Read-only tooling and procedure are available. |
| New staging test evidence | NOT TESTED | No approved isolated execution target; no fabricated screenshots, Auth results or provider reference IDs. |

No executed financial check failed in this phase. The FAIL entries are concrete readiness defects; the BLOCKED entries remain unverified. None can be cleared by a green fixture CI run.

Local Phase 1.3 verification: `npm run test:finance` passed again (31 application + 13 SQL checks). A no-network configuration probe with in-memory placeholder credentials confirmed production-mode test-key rejection and development-mode acceptance; no provider authentication/request occurred. All 120 LF-normalized migration hashes and sorted filenames matched the manifest; three production-origin cron migrations were identified. No application/migration/configuration implementation changed. Full unit/build evidence above is carried from the unchanged application revision; the final PR checks identify the documentation head separately.

## Exact missing resources and next action

1. An owner-confirmed disposable Supabase ref (candidate above, or another approved project/local stack), with synthetic-only data and no production secrets, external database links, Edge Function forwarding, FDWs, webhooks or scheduled production requests. Written confirmation must identify the ref and permitted reset/replay scope. No paid project/branch may be created without cost approval.
2. A dedicated secret-managed configuration: that project's URL, publishable/anon key, server-only service-role key, and migration-only DB credential. Remove inheritance by creating branch-specific staging overrides or use a clean isolated local runtime. Do not edit production values or use an unqualified environment pull.
3. Three synthetic Auth identities: one persisted admin profile and customers A/B, with a private password/session store and a test mail sink; anonymous requests use no session. Admin role comes from protected persisted authorization, never editable user metadata.
4. A dedicated Razorpay test account/key pair (`rzp_test_*`, matching public/server key IDs), a unique test webhook signing secret, and captured synthetic test payments. Existing shared records must not be reused without privately verifying and separating them. Optional Cashfree coverage requires independent sandbox credentials and `CASHFREE_ENV=sandbox`; optional manual UPI/bank tests require a non-routable/mock receiver, never the existing payee.
5. An isolated runtime/network policy, independent cron/Vault secret, email sink and supplier stub. No production URLs, credentials, outbound email, real supplier placement or real-money manual transfer. No public callback endpoint or paid hosting is required until separately approved.
6. For historical verification only: source-owner authorization naming a synthetic/exported snapshot or read-only replica, approved scope/window, a complete SELECT-only principal, private output destination and accounting reviewer. Actual production access remains unauthorized.

**Recommended next action:** confirm the disposable project and a private staging-configuration location, then follow [the setup/replay/verification/rollback runbook](staging-setup-and-verification.md). Resolve isolation and replay hazards before running any integration command. The existing production-build test-key restriction is a separate compatibility prerequisite, not permission to weaken production checks.

## Remaining financial risks and release prerequisites

Provider contracts and real delayed/uncertain sandbox outcomes remain unverified. External refunds performed outside the durable request workflow can race it. Historical unidentified credits/refunds, incomplete recognition evidence and missing supplier costs need accounting review. Operational `completed_at` recognition, full cancellation of partially delivered orders, fees/tax/FX and supplier reimbursements still require an approved finance policy. Missing costs/margins must remain unknown; no automatic repairs or estimated profit claims.

Before any separately authorized production rollout: all mandatory staging gates must pass with exact commit/environment evidence; reviewers approve cost/recognition policy and reconciliation findings; backups/maintenance plan and default-off compatible application artifact are ready; old unreserved gateway handling is stopped before migration; migration/advisors/grants/monitoring are reviewed; restore/forward-recovery rehearsal passes; and explicit merge/deployment/migration/enablement authorization is obtained. This task authorizes none of those production actions.

Rollback keeps the additive ledger/refund/audit tables and all financial records. Disable new refund submissions; preserve reservations and provider references; reconcile uncertain requests before release. Never revert to the old unreserved refund handler after reservations exist. See the runbook for staging restore boundaries and the later production contingency.

Phase 2 is specification only in [the separate growth implementation document](../growth-phase2/implementation-specification.md). No service-page, checkout, bundle, retention or analytics feature implementation is included here.
