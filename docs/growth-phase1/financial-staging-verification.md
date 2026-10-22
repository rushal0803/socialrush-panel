# Phase 1.2 financial staging verification — 22 October 2026

**Current staging preparation:** [Phase 1.3 readiness](staging-readiness.md) adds current environment-scope evidence, replay hazards, resource requirements and the execution/rollback runbook. Existing fixture passes below do not close the remote integration gates.

Release decision: **BLOCKED — do not merge, deploy or enable live gateway refunds.**
Continue branch `feat/payment-revenue-safety-20261020`, draft PR [#702](https://github.com/rushal0803/socialrush-panel/pull/702).

## Evidence and release readiness

| Mandatory gate | Status | Evidence / remaining scope |
|---|---|---|
| Original exact PR head and CI | PASS | `ee1ac986903dffb78373aa75aa380fbd795356d1`; [smoke run 39656937259](https://github.com/rushal0803/socialrush-panel/actions/runs/39656937259) succeeded. Paired-performance workflow skipped by its PR-specific condition; combined commit statuses empty, not a missing-check success assertion. PR open, draft, unmerged. |
| Native PostgreSQL independent-session concurrency | PASS | Head `28b5ccc9d3a5c16406d2fd3afa5d4e0110c3566b`, [job 119426484484](https://github.com/rushal0803/socialrush-panel/actions/runs/39658922044/job/119426484484), PostgreSQL **17.11**, disposable service container. Exact financial migration and relevant predecessor migrations replayed over a minimal fixture schema. Subsequent coverage also replays the existing wallet-settlement privilege-hardening migration and denies direct anon/customer settlement. |
| Full Supabase migration history replay | BLOCKED | No confirmed disposable Supabase stack. Native minimal-schema replay does not certify the complete historical migration chain. No remote migration was applied. |
| SQL grants / RLS / ownership | PASS | Native anonymous denial, customer/admin RPC denial and cross-customer order invisibility; broader PGlite owner/admin/read-only table/function tests also pass. This is SQL role coverage, not JWT verification. |
| Supabase Auth / PostgREST / cross-customer integration | BLOCKED | Connected “SocialRUSH Preview” is not yet confirmed disposable/synthetic. No safe Auth test identities or dedicated configuration supplied. No production substitute used. |
| Provider fault and retry behavior with mocks | PASS | Concurrent worker, lost response, delayed/pending result, ambiguous/mismatched reconciliation and local settlement failure regression tests in `payment-revenue-safety.test.ts`. |
| Gateway test-mode API contracts | BLOCKED | No identified Razorpay sandbox/test credential configuration available. No live or test provider calls sent. Mock tests cannot certify provider contracts, pagination or delayed real statuses. |
| Read-only reconciliation tool | PASS | `scripts/finance-reconciliation-readonly.sql`; tested on synthetic anomaly fixtures, exact candidate counts and unchanged balances/row counts. |
| Historical source reconciliation | BLOCKED | Production data access not explicitly authorized; no approved historical export or snapshot supplied. No production financial query executed. |
| Authenticated browser-to-database financial QA | BLOCKED | No approved isolated Auth accounts/stack. Fixture-only browser results must not close this gate. |
| Admin refund UI / CSV against staging records | NOT TESTED | Requires the isolated staging environment and reviewed test identities. |
| Complete local unit discovery | PASS | `npm run test:unit:all`: 104 files, 615 tests. Initial expanded run exposed pre-existing harness/source-contract failures; corrected test-only server marker resolution, current catalog CTA target and Telegram/nested-hub/descriptive-link assumptions. No product behavior weakened or changed. |
| Finance / dashboard regressions | PASS | Finance: 31 application + 13 SQL tests; dashboard: 37. Includes new read-only reconciliation regression. Counts overlap other suites. |
| Local TypeScript / lint / production build | PASS | Full standalone TypeScript, lint (existing warnings) and fixture-backed local production build exit 0. No production credentials or deployment. Final rerun status recorded below. |
| Local browser fixture checks | PASS | Seven selected customer funding/order/history checks plus rerun of wallet-details test passed in Chromium. The latter verifies mobile focus/pending state, downloaded CSV pending impact = 0, 1440px table/overflow, and pending confirmation. Updated stale expected dialog wording to current wallet statement wording. Synthetic sessions/mocked transport, not Auth certification. |
| Published-head CI snapshot | PASS | Full [run 39658922044](https://github.com/rushal0803/socialrush-panel/actions/runs/39658922044) passed for `28b5ccc9`; new native [job 119433534470](https://github.com/rushal0803/socialrush-panel/actions/runs/39660967496/job/119433534470) passed for `ff1bfe9b`. Later evidence/tool-only changes require a fresh head check; the final PR description records that exact result without changing the commit being checked. |

## Native concurrency evidence

`tests/database/native-payment-concurrency.py` starts independent `psql` processes. A third session holds a transaction open; the runner queries `pg_stat_activity` and requires every competing request to be observed waiting for a lock before releasing the holder. It does not infer concurrency merely from simultaneous client promises.

- Two INR 60 purchases against INR 100: one succeeds, one rejects insufficient funds; INR 40 remains, one order and debit exist. Six successful retries of the winning intent have no additional effect.
- Six simultaneous cancellation calls plus four later retries: INR 30 credited once, one refund ledger entry.
- Injected balance-update failure during refund: both transactions fail, original order/balance remain and no ledger row commits. Retrying after removing the test-only failure credits once.
- Four gateway reservation requests: one request and INR 40 reservation. Six claims: exactly one `true` permit. Four settlement retries: one external-refund ledger event and no second wallet debit. This proves database submission gating, not an actual provider refund.
- Three conflicting manual-reference submissions across two orders and a wallet deposit, with case variation: one winner, no extra order or balance effect.
- Deliberately injected opposite-order transaction cycle around two refunds: PostgreSQL detects one deadlock and aborts its victim. The survivor plus subsequent retries leave precisely two refunds and INR 160 from the original INR 100. Ordinary contention scenarios reject unexpected deadlocks.

These are bounded regression proofs for tested interleavings, not exhaustive verification of all schedules or a claim that deadlocks can never occur. Deadlock/timeout errors require retry of the whole request; do not retry a partially remembered external payment operation.

The dedicated CI job uses no repository/application secrets and cannot accept a remote DSN. The runner requires the dedicated fixture database and loopback host. It creates/truncates **synthetic fixture tables only** inside the disposable container; never run it on staging or production data.

## Read-only historical reconciliation instructions

Do not run against production without explicit approval of the source and scope. Use a reviewed snapshot/replica or a SELECT-only service entry configured outside the repository. Use a complete read-only role with reviewed RLS visibility; a customer JWT's restricted result is not a complete reconciliation. The source must contain the Phase 1.1 schema (including cost/refund tables); missing schema fails rather than silently omitting checks.

After approval, from the repository root, using an installed `psql` client:

```powershell
psql --dbname=service=approved_finance_readonly --no-password -X -qAt -v ON_ERROR_STOP=1 -f scripts/finance-reconciliation-readonly.sql > artifacts/finance-reconciliation-private.json
if ($LASTEXITCODE -ne 0) { throw 'Reconciliation failed; do not use partial output' }
```

Configure the service and password through PostgreSQL's local service/password files, never in command arguments, git, screenshots or PR logs. Retain results privately; output includes opaque financial record IDs. Check exit status, complete row visibility and snapshot provenance before review. No automatic follow-up writes are included.

The SQL uses a repeatable-read, read-only transaction, bounded statement/lock timeouts and rollback. It returns counts and at most 20 IDs per category: provenance-free credits, unmatched service and gateway refunds, duplicate ledger/payment references, multiple refunds per order, incomplete gateway references, missing recognition dates/cost evidence, refunded orders without ledger events and unresolved/mismatched gateway settlements.

Flags are **candidates**. Manual credits or multiple partial refunds may be legitimate. No opening-balance attestation, bank/provider statement match, tax/fee audit or historical balance correction is implied. An empty result only clears these checks for that source and visibility.

## How to unblock the remaining gates

1. Confirm a disposable synthetic Supabase environment and provision isolated admin/two-customer/anonymous test identities. Replay the full schema/history there, run advisors, then test REST/RPC and Auth with each identity, including service-role/internal-function denial and cross-owner IDs. Do not reset the connected Preview project based on its name alone.
2. Supply a secret-managed test-only Razorpay configuration; reject credentials unless the public key ID is `rzp_test_*`. Create synthetic test payments and exercise processed/pending/delayed/timeouts/reconciliation/duplicate workers, retaining sanitized provider request IDs and POST counts. An unsupported sandbox scenario remains NOT TESTED rather than passed. Keep production configuration disabled.
3. Approve a historical snapshot and SELECT-only source; run the provided tool and manually review candidates against bank/provider/order evidence. Obtain verified supplier costs and an approved revenue-recognition policy.
4. Run authenticated mobile and desktop browser flows against that stack: wallet history and CSV effects, order confirmation, admin cancellation/review, pending/manual-review/error displays, focus/overflow and retries. Attach sanitized screenshots and request/database evidence. Test failures must retain pending records and show recoverable outcomes.
5. Re-run release gates after any fix, then seek separate rollout review. This phase does not authorize production deployment or enabling live refunds.

Final local evidence: standalone TypeScript and lint exit 0; lint retains existing warnings. `npm run build:finance-safe` exits 0 and generates 315/315 pages. All 615 unit tests pass; finance checks are 31 application plus 13 SQL; dashboard checks are 37. Seven initial browser fixture checks and the wallet-detail/CSV rerun pass. Local logs are ignored under `artifacts/phase12-*`; they are not production data or deployment artifacts. Final exact-head CI evidence is maintained in PR #702, avoiding a self-referential report-only commit/retest loop.
