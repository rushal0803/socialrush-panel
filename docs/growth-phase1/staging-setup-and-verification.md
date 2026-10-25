> **SUPERSEDED PAYMENT SCOPE — 22 October 2026:** Razorpay/Cashfree development, configuration and sandbox work are stopped. Provider release gates are **Not Applicable**, not Passed. Provider instructions below are historical only; do not execute them. Use [the current active-payment release scope](active-payment-release.md). Wallet/manual flows, historical records and shared safety dependencies remain in scope.

# Disposable financial staging setup and execution runbook

Prepared 22 October 2026. **Instructions only; not executed on a remote database.** Start with [resource discovery and release gates](staging-readiness.md). Never reuse the existing local environment or inherited preview settings. No production access, exports, migrations or real-money transactions are authorized.

## Owner checklist — manual setup required

These are the actions needed from the owner. Existing Preview remains unapproved; do not change it or any production configuration. Do not create a hosting deployment.

1. **Create or identify a dedicated empty Supabase staging project.** In the Supabase dashboard select an appropriate organization and New project; use a distinct name such as `socialrush-finance-staging`. Verify the displayed plan/cost before creating it. If it would add a charge, approve that cost explicitly first; no paid resource is created by the agent. Generate a new private database password. Do not restore a production backup, import customer data, include production data in a branch, or connect Git auto-migration/deployment integrations.
2. **Provide the nonsecret identity and written scope.** Send only its project ref/name, region, and confirmation: “This exact project is disposable, empty/synthetic-only, has no production integrations, and is approved for staging migrations and synthetic tests.” This confirmation is not authorization to touch any other project. Until it arrives, no remote replay/test will run.
3. **Place new project credentials in an approved private secret location.** Obtain that project's API URL, matching public/anon key, server-only service-role key, and dedicated DB credential/connection details from its dashboard. Store them under a new staging-only secret set, with the variables listed below. Share only the secret-manager entry name or private local configuration path in chat. Do not paste keys/passwords, reuse existing keys, overwrite `.env.local`, or pull production/undifferentiated preview settings. Give the agent scoped access to the approved location when ready.
4. **Configure Auth isolation.** Use only an approved localhost/staging site URL and redirect allowlist. Keep real Google/OAuth connections disabled unless separately configured for test. Select a test mail sink or controlled test inbox; do not send to customer addresses. After the schema is replayed and approved, provision three synthetic accounts (admin/A/B); record passwords privately. Admin promotion must be a controlled persisted profile-role change after schema setup, not user-editable metadata. Account creation/promotion is not requested against the existing projects.
5. **Prepare an independent Razorpay test configuration.** Open the merchant dashboard and switch explicitly to Test mode; create/access a test key pair in its API-key settings. Confirm the key ID begins `rzp_test_`; store its secret only in the private staging secret set. Set both server/public key IDs to that same test ID. Never use live keys or process a real payment. Keep `GATEWAY_REFUNDS_ENABLED=false` in the supplied defaults.
6. **Prepare webhook/test-payment inputs without deploying.** Use a new test webhook signing secret and record the test events needed for captured payment/refund status. A provider webhook requires an approved reachable test callback; do not configure a production callback or create a public tunnel/deployment now. Locally signed webhook fixtures can be prepared first, but do not count as actual provider delivery evidence. Captured payments must later be created with the provider's documented test methods only. Scenarios the sandbox cannot produce remain explicitly untested.
7. **Approve a contained local stack or staging network plan.** Supply a Docker-capable isolated host (Docker/psql are unavailable on this workstation) or a hosted policy that proves scheduling/egress containment before replay. Create an independent test cron/Vault secret, email sink and supplier stub; never copy the existing shared secrets. Review the cron hazards below. Hosted replay stays blocked if it cannot prevent production-origin jobs from running. No app deployment or integration calls are part of these manual preparation steps.
8. **Optional historical-data authorization is separate.** To reconcile real history, identify an approved read-only snapshot/replica, scope, complete SELECT-only role, private output destination and finance reviewer. Do not export production records or send them to the agent/chat until separately authorized. Synthetic reconciliation can proceed without this permission.

Return only: approved project ref/scope, private secret-location name, test account aliases, isolated runtime/network owner, and whether a test callback or historical source is separately approved. Never return secret values. Once confirmed, the next execution phase rechecks identity and effective configuration before any write or provider request; it does not assume the current task permits a deployment.

## 1. Establish the isolation boundary

- Record owner approval, project ref, tenant/team, synthetic-only provenance, allowed operations, expiry and budget. If the resource costs money and approval is absent, stop. A Supabase branch is an option only after approval; separately verify inherited configuration/Edge Functions even when it starts without data. See [Supabase branching](https://supabase.com/docs/guides/deployment/branching).
- Record an allowlist of staging database/API/runtime/callback origins and a denylist of protected production origins. Reject the primary listed project and `www.getsocialrush.com` as integration destinations. Do not infer safety from a hostname containing “preview”.
- Confirm no production data clone, linked credentials, FDWs/dblink, replication subscriptions, object-storage copies, Auth/OAuth integrations, Edge Function forwarders, webhooks, cron jobs or live SMM supplier endpoints. Use metadata-only checks first. Stop on unknowns.
- Default-deny database/runtime egress before migration replay; permit only the staging services, controlled sinks, and later the required provider sandbox. Razorpay test/live use the same API origin, so an origin allowlist alone cannot distinguish money mode: credential mode must be independently verified.
- Separate test secrets at the provider, backend and app. Scope all Vercel overrides to the exact branch if Vercel is eventually approved; do not enable this branch's deployment as part of setup. A clean local runtime is sufficient initially. Do not inherit shared `DATABASE_URL`, `CRON_SECRET`, email/OAuth or server-role credentials.
- Verify effective process environment privately, including URL/key project identity and public/server Razorpay key equality. Check browser bundle origin separately: `NEXT_PUBLIC_*` variables are embedded during build, so changing runtime variables does not repair an artifact built against another backend. Never deploy the fixture-backed safe-build output. [Next.js environment behavior](https://nextjs.org/docs/app/guides/environment-variables).

## 2. Minimum configuration and fixtures

| Input | Requirement / handling |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Exact approved disposable ref or loopback stack URL; no primary project. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Matching staging public/anon key. Supabase is the authority for JWT verification; decoding a JWT is not proof of its authenticity. |
| `SUPABASE_SERVICE_ROLE_KEY` | Matching staging server-only key, available only to test setup/trusted routes. Never a browser, screenshot or PR value. |
| Database migration credential | Staging-only, privileged only during replay; separate SELECT-only principal for reconciliation. Store in a private PostgreSQL service/password file or approved secret manager, never CLI arguments. |
| `NEXT_PUBLIC_SITE_URL` | Isolated runtime origin; staging Auth site URL and redirect allowlist contain only staging/loopback callbacks. Disable real OAuth unless separate test OAuth credentials are supplied. |
| `RAZORPAY_KEY_ID`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Dedicated test pair; both IDs equal and start `rzp_test_`; private provider-account mode confirmation. No live key fallback. |
| `RAZORPAY_WEBHOOK_SECRET` | Independent test signing secret and test-only event endpoint. Reject missing/invalid signatures and wrong payment identities. |
| `GATEWAY_REFUNDS_ENABLED` | Keep false by default, including every production/shared environment. To exercise the existing gated endpoint, a deliberately scoped temporary true value is needed **only in the approved isolated sandbox process**, after key/ref checks. Restore false immediately. If that sandbox exception is not approved, endpoint verification stays blocked. No flags changed in this task. |
| `CRON_SECRET` and Vault secret | Independent nonproduction values; `socialrush_email_cron_secret` is required by migration history. Insert only through approved secret tooling. Do not copy existing production secrets. |
| Notifications and external services | Order notifications disabled; email intercepted by test sink; no production Resend key; supplier/network adapter stub; manual UPI/bank/crypto receivers mocked/non-routable. No real recipient or external order placement. |
| Accounts | Admin, customer A, customer B, all synthetic and session-isolated; anonymous context with no cookies. Use Auth APIs/Studio and normal profile bootstrap, not manually forged JWTs. Private credentials only. |
| Data | Synthetic active/paused catalog services, known quote totals, balance=100/low/zero cases, paid/unpaid/manual-split/completed orders, verified/unverified supplier-cost evidence and test deposits. Keep provider IDs from actual sandbox responses separate from mock IDs. |

Do not set `NODE_ENV=staging`. Current `razorpayConfig()` accepts test keys in development but rejects them in a production build. Run dev-only sandbox checks only after isolation approval, and label them as dev evidence. Production-build parity needs a reviewed explicit deployment-mode guard with negative production tests; do not remove the current live-key protection or use live keys to bypass it.

## 3. Full migration compatibility and replay

Input is all **120** ordered SQL files in [the normalized SHA256 manifest](staging-migration-manifest.json), pinned to the unchanged migration tree at `aecf1bcb66a2ac9e218231203dbb1c3c8cd091e3`. Compare filename order, versions and LF-normalized hashes before execution. The manifest is a static inventory, **not full replay certification**. `supabase/schema.sql` points to the initial migration; it is not a complete current-schema snapshot.

Required history includes the initial Auth/profile bootstrap, catalog/fulfilment changes, wallet settlement privilege hardening, checkout intents/agency attribution/split safety, all later policy definitions, and `20261019214002_payment_revenue_safety.sql`. Applying only the last migration to an empty project is invalid. Do not use the minimal PGlite/native fixture schema as a hosted baseline, copy production rows, mark missing migrations applied, or use `migration repair` to hide drift.

Static hazards to resolve **before** execution:

| Source | Required staging control |
|---|---|
| `202608250001_schedule_customer_email_dispatch.sql` | Requires `pg_cron`, `pg_net`, Vault, and the named secret; creates a production-origin HTTP job. |
| `20260914032325_harden_customer_email_dispatch_retries.sql` | Changes cron job ID 1 and sets it active; confirm fresh-cluster job ordering, not a guessed existing job identity. |
| `20261002093000_crm_autonomous_outreach_phase4.sql` | Schedules a production-origin CRM HTTP request using Vault credentials. |
| Other manifest `cron` entries | In-app/CRM jobs may change fixture data; keep scheduling disabled throughout deterministic tests. |

For an operator-controlled disposable PostgreSQL stack, configure `cron.launch_active_jobs=off` before replay, reload and confirm it remains off; keep default-deny egress as a second barrier. [pg_cron documents](https://github.com/citusdata/pg_cron#extension-settings) that this setting prevents active jobs launching and supports configuration reload. Do not assume a hosted project's permissions let you change it. If neither a verified scheduling barrier nor equivalent enforceable containment is available, stop before replay; disabling jobs afterwards leaves a race window.

Use a fresh, non-linked staging workspace with its own Supabase configuration. Do not copy `supabase/.temp` or another project's Auth/database credentials. The present checkout has no `config.toml`; an operator must generate and review a staging-only config first. Enable required extensions and independent Vault prerequisite within the controlled stack. Never display `vault.decrypted_secrets` or CLI environment output in shared logs.

CLI 2.108.0 version/help was checked. After resource/network/config approval, these are **operator commands for the fresh local disposable workspace only**, not commands executed here:

```powershell
supabase init
# No application migrations copied yet. Review config, Auth redirects and egress containment.
supabase start
# Establish/verify scheduler containment and independent Vault prerequisite privately.
# Only now copy the 120 unchanged, hash-verified application migrations into this workspace.
supabase db push --local --dry-run
supabase db push --local
supabase migration list --local
```

`supabase start` can initialize migrations; establish network containment **before** starting it. Bootstrap the empty controlled stack first, disable/verify scheduler execution and create the independent Vault prerequisite privately, then introduce the unchanged migration files and replay. Capture the exact bootstrap/config procedure for reproducibility; do not skip failing migrations. No remote `link`, `db push`, `db reset` or `--include-all` shortcut is prescribed here. A hosted run requires a separately reviewed plan bound to the approved project ref.

Run the complete history from an empty stack; retain sanitized failure/version evidence. Compare local/applied migration versions, constraints, triggers, function signatures and grants. Check all required columns (`orders.completed_at`, payment/status/intent fields, provider reference/metadata fields, ledger business key) and the four new financial tables. Run Supabase security advisors and review findings, Data API exposure/grants and RLS before test accounts operate. Repeat on a fresh disposable stack after resolving any genuine dependency issue. Do not edit applied historical SQL in place or overwrite deployed history. [Supabase migration workflow](https://supabase.com/docs/guides/local-development/database-migrations).

## 4. Integration execution and evidence

Use a private evidence ledger per case: exact app SHA, schema versions/hashes, approved project ref/origin, runtime mode, synthetic account alias, request/correlation IDs, observed HTTP result, SQL invariant, screenshot/trace location and PASS/FAIL/BLOCKED/NOT TESTED. Never include passwords, cookies, JWTs, API keys, webhook secrets, real PII or card data. Provider reference IDs must be from sandbox, not invented success evidence.

| Case | Action and expected invariant |
|---|---|
| AUTH-01 | Sign in admin/A/B through Supabase Auth; server verifies identity and profile role. Expired/no/invalid session fails. Attempt user-metadata admin promotion remains denied. Anonymous customer/admin pages redirect or deny. |
| RLS-01 | Real anonymous/A/B JWTs call PostgREST tables and RPCs. A sees only own orders/transactions/intents/reference claims; B cannot read/change A by ID or filters. Zero-row reads can be correct for RLS; unauthorized mutations must have no side effects. |
| RLS-02 | Anon/customer direct calls to wallet settlement/internal helpers/admin refund/revenue RPCs denied; no balance/order/ledger changes. Admin can perform the new admin-checked RPC but cannot bypass receipt/state checks. Internal privileged functions remain inaccessible to browser roles. Compare live effective grants to migration expectations. |
| WALLET-01 | Fresh server quote; spoof price/service/quantity/link, paused service, expired intent, zero/insufficient funds and parallel submissions. One valid order/debit per request; no negative balance. Native session tests supplement, not replace, REST checks. |
| MANUAL-01 | Synthetic manual split submission and duplicate UTR across A/B/deposit/order flows. Order/reference/intent/debit atomic; rejected/failed receipt returns only actual split wallet amount, never unpaid external value. No actual UPI transfer. |
| REFUND-01 | Admin cancellation via each API/action caller; repeated/concurrent updates and injected DB failure. Status/ledger/balance commit together or all roll back. No reopening or owner/charge mutation. UI shows actual receipt and state. |
| GW-01 | Privately verify test credentials and capture synthetic provider payment. Verify exact INR amount/captured identity and webhook signature; mismatch/replay causes zero extra wallet effects. Retain sanitized provider contract sample. |
| GW-02 | Test captured deposit refund: one reservation, one winning claim, at most one external POST, retained provider ID, one settlement. Two concurrent admin requests and retries do not issue another refund. Compare provider refund list with DB audit, not HTTP status alone. |
| GW-03 | Pending/delayed/processed/failed, timeout before/after provider response and local persistence failure. Reconcile same request ID by verified provider evidence; uncertain/ambiguous/truncated/no-match stays manual review with funds reserved. Confirm failed provider refund releases once. Use controlled proxy/fault injection only on sandbox. Scenarios not supported by provider sandbox remain NOT TESTED; mocked behavior alone is insufficient. |
| UI-01 | Desktop 1440px and mobile 320/390px: wallet/history, full/split checkout, confirmation, order details, admin management and refund status. Verify keyboard focus, visible controls, no clipped totals, retry behavior and persistent pending/manual-review/errors; no optimistic payment success. |
| CSV-01 | Download actual A/admin staging exports; compare source rows and signed wallet effects. Pending and informational external-refund records have zero completed wallet effect; reservation debit/release/order refund effects match the ledger. No cross-customer data, truncation or duplicate events. |
| REV-01 | Known synthetic completed/unfulfilled/failed/refunded orders, >1,000 rows, IST boundary and negative-net periods. Deposits excluded, completed-then-refunded gross/reversal correct, missing cost/evidence suppresses margin. Reconciliation candidates match injected anomalies; no automatic repair. |
| STOP-01 | Disable test refund flag and demonstrate gated response/no provider POST. Verify test events/keys cannot route to production resources. Sign out/revoke test sessions and retain sanitized evidence. |

Cashfree sandbox/manual workflows are additional compatibility coverage where configured; never silently substitute Razorpay mocks for them. A successful dev-mode flow does not close the production-build parity gate. Run full units, native concurrency, TypeScript, lint, safe local build and relevant browser tests after fixes; recheck exact-head CI. Keep all external gates open until evidence passes.

## 5. Read-only historical financial reconciliation

No production record access/export is authorized. Use the existing [read-only query](../../scripts/finance-reconciliation-readonly.sql) and [execution instructions](financial-staging-verification.md#read-only-historical-reconciliation-instructions) only after owner approval of source, time window, retention and complete SELECT-only visibility. Do not run the native destructive fixture runner on the approved source. Do not send query output, including opaque record IDs, to this public PR.

Record the candidate counts for orphan credits, unmatched service/gateway refunds, duplicate ledger/payment references, repeated order refunds, incomplete payment references, missing recognition dates/verified supplier costs, refunded orders missing ledger and unresolved/mismatched gateway settlement. Current real-data counts: **unknown, not queried**, not zero. Query candidates are not conclusions; multiple partial refunds/manual credits may be legitimate.

Privately match each candidate to order/intent linkage, opening balance, bank/provider statement and supplier invoice/evidence. The existing query is not a whole-ledger opening-balance or provider-statement attestation. Finance signs off exceptions and any separate corrective proposal. No balance edits, order rewrites, speculative cost imports or “repair all” script is included.

## 6. Rollback and deployment prerequisites

**Before staging replay:** create a schema/config inventory and private synthetic-only backup, verify restore on a fresh isolated stack, record retention and cleanup authority. Never create a production backup/export as a shortcut.

**On staging migration/test failure:** stop writes and test gateway submission, leave schedules disabled, retain the error/version and all sandbox request IDs; reconcile any pending provider operation before resetting local state. PostgreSQL rollback only reverses uncommitted database writes; it cannot undo an external refund. Do not reset away the only request/audit evidence while a sandbox response is uncertain.

**Staging recovery:** after evidence is preserved and the operator reconfirms the exact disposable target, restore the synthetic baseline to a fresh isolated stack or rebuild it under the same preflight. Retire the failed stack and revoke test sessions/keys when appropriate. No automatic reset command or downgrade SQL is provided. For a previously used candidate project, owner-approved restore/rebuild scope is mandatory.

**Later production contingency, not authorized execution:** disable new submissions, pause relevant financial writes, preserve additive tables/ledger/reference IDs/reservations and reconcile in-flight requests. Use a compatible default-off application version and reviewed forward fix. Do not revert to the old unreserved handler, drop the trigger/tables, regrant revoked RPCs or restore a stale database backup over live external refund outcomes. Full database restore requires a separately approved incident plan and provider reconciliation.

Deployment prerequisites: every mandatory gate passed for reviewed SHA/schema, approved accounting policy/cost evidence, dry-run migration/advisor/grant review, maintenance and restore rehearsal, no active legacy refund path, monitoring/manual-review ownership, reviewed clean staging-origin build, and explicit separate authorization for merge/deploy/migrations/enablement. Financial safety approval does not itself authorize Phase 2 rollout.
