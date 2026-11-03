# Phase 1.5 — active payment release verification

22 October 2026. Existing branch `feat/payment-revenue-safety-20261020`, draft PR #702. Starting head `2801cd60eb097705e40b4601d69acc2e55e54a81`. No deployment, live configuration changes, production access or remote migrations are authorized here.

## Cancellation investigation

Run [39770559066, attempt 2](https://github.com/rushal0803/socialrush-panel/actions/runs/39770559066/attempts/2), job `119799529550`, started 11:32:52 UTC and completed 11:48:14 UTC. GitHub check annotation explicitly states: **“The job has exceeded the maximum execution time of 15m0s.”** Build and Chromium installation succeeded. Smoke began 11:45:13 UTC, announced 329 tests with two workers at 11:45:17, then was cancelled at 11:48:07. This is an overall job deadline, not a demonstrated test failure or runner crash. Partial progress cannot certify all tests.

The workflow has no workflow/job concurrency group or `cancel-in-progress`. Repository workflow scan found no cross-workflow cancellation configuration. No later branch run overlapped this attempt; the paired performance workflow was skipped. The run's triggering actor identifies who requested the retry, not a cancellation actor. There is no evidence of a manual cancellation; the explicit timeout annotation identifies the cause. GitHub documents the [job timeout behavior](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#jobsjob_idtimeout-minutes).

Attempt 1 separately failed on Microsoft apt repository HTTP 403 while installing Chromium dependencies. Attempt 2 overcame it, but lengthy installation consumed the shared deadline. No tests are removed or made optional by the fix: job budget 35 minutes; browser installation 10 minutes; complete smoke step 12 minutes with an 11-minute Playwright global limit; focused customer fixture gate retains its existing 150-second limit. The job budget allows setup/build, browser setup, full smoke, focused tests and diagnostics. Existing test retries/assertions are unchanged.

Diagnostics artifact `12423142681` was downloaded locally for inspection (synthetic fixtures only). The cancelled run has partial logs and screenshots, no completed smoke summary. Future runs retain all `test-results/` and JSON summary, alongside server/browser logs. A timeout remains a failed gate, never a pass. Final head/results are recorded in draft PR #702 to avoid changing the verified commit merely to append CI results.

## Release matrix

Follow-up run `39776597724` at `7385ae867029fd32f2a270881a85fe3b9ea94034` passed TypeScript/regressions/build and both database jobs but exposed a separate infrastructure failure: Azure Ubuntu apt downloads repeatedly stalled (`Ign` entries for system packages), exhausting the 10-minute browser-install limit before tests started. The repair uses the [official Playwright image](https://playwright.dev/docs/docker), pinned to `v1.62.1-noble` to match the installed lockfile package. It includes browser system dependencies and avoids apt installation during the job. A package-version guard fails on future drift. The container uses the recommended init/shared-memory options; no tests are skipped. Job/Playwright limits and complete diagnostics remain in force. This changes the CI execution environment only; final results still require the new exact-head run.

| Gate | Status at preparation |
|---|---|
| Starting-head TypeScript, unit/finance, build, native wallet concurrency | PASS, as recorded in preceding verification |
| Starting-head full browser suite | FAIL to complete: job timeout; assertions not fully evaluated |
| Revised-head CI and full browser result | NOT TESTED until the new run completes; exact evidence in PR #702 |
| Razorpay/Cashfree integration, sandbox, keys/refund features | Not Applicable — retired |
| Full staging migration/Auth/PostgREST/RLS and active financial UI | BLOCKED — dedicated disposable target not approved |
| Real historical reconciliation | BLOCKED — no approved read-only source; counts unknown |

Active scope is wallet, manual UPI, bank transfer and conditional USDT TRC20. Historical records and shared accounting remain preserved. No payment implementation or schema changes are needed for this CI repair. See [active release scope and rollback](active-payment-release.md).

## Minimum owner setup before any remote migration

Container run `39778834702` at `e70e11707b5d31cf348789db58c800ec81afc0fa` completed the full smoke suite: **259 passed, 69 skipped, 1 failed**, in 4.8 minutes. The sole failure was an outdated response assertion telling users to use retired Cashfree; the actual endpoint correctly returned the approved wallet/manual retirement message. The regression now checks that message and also covers the retired Cashfree creation URL. The 410 assertion remains mandatory. Historical CSP allowances remain compatibility checks, not active provider certification. A fresh exact-head run is required after this test correction.

1. Create or identify an empty dedicated Supabase project; check plan/cost first, with separate approval for paid resources. Do not clone production or assume the existing Preview is disposable. Return only ref/name/region and written synthetic-only isolation confirmation. Migration execution requires explicit approval for that exact ref and reviewed replay plan; setup approval alone is insufficient.
2. Store the new project API URL, matching public/anon key, server-only service-role key and DB connection/password in a new private secret-manager entry. Share the entry/path only. Do not overwrite `.env.local`, inherit preview values or provide secrets in chat. Prove project identity against dashboard metadata and independently verify effective runtime/build configuration. Existing production-connected configurations stay untouched.
3. Prepare a contained runtime with default-deny egress. Before replay, verify no production origins, supplier calls, external webhooks, copied Vault secrets, replication/FDW links, mail delivery or enabled scheduled jobs. Hosted database egress must be contained independently of app egress; if this cannot be proven, replay stays blocked. An app-level flag is insufficient for SQL cron/HTTP jobs.
4. Review all 121 manifest entries and hashes. Resolve the nine cron migration files, production-origin HTTP jobs, fixed job-ID scheduling and independent Vault prerequisites in the approved isolated replay plan **before** running SQL. Preserve original migration bytes. Never run reset/replay on an existing unapproved project. Use synthetic-only backup/restore or reviewed forward fixes; no automatic historical repair. Full-history compatibility is still unverified.
5. Configure localhost-only Auth redirects and a controlled mail sink; disable inherited OAuth/integrations. After approved schema setup, create Admin, Customer A and Customer B with private test passwords. Promote Admin using the persisted profile role through a controlled admin process; never user-editable metadata. Verify `require-admin-api.ts` and actual RPC checks against those identities. Keep service-role credentials server-only.
6. Seed only approved synthetic services, balances, orders and receipt references. Use mock/non-routable UPI/bank/USDT receiver instructions; no transfer, real receipt or customer identifier. USDT is conditional on valid FX; test unavailable/invalid conversion too. Keep retired gateway routes/RPCs disabled; no provider keys are required.
7. Return exact project approval, private configuration location, account aliases and network/runtime owner. Then explicitly approve the reviewed remote migration/test scope. No app deployment is required or authorized.

## Execution matrix after approval

Use actual Auth JWTs through PostgREST and browser sessions, not only SQL role simulation. Record exact head/schema hashes, synthetic identities, sanitized IDs, before/after ledger invariants and screenshots privately.

| Flow | Required evidence |
|---|---|
| Wallet | Valid server quote, unknown/insufficient balance, repeated/concurrent payment; one legitimate order/debit, no negative balance |
| Manual UPI / bank / conditional USDT | Synthetic receipt submission, evidence review, one admin approval credit, replay rejection; pending never looks paid |
| References and refunds | Cross-account case-normalized duplicates denied; concurrent refund once; injected order/ledger failure rolls back every financial effect |
| Auth/RLS | Anonymous denied privileged access; A cannot read/mutate B by ID/filter/RPC; customer cannot approve/refund; admin still subject to evidence/state checks |
| Revenue | Deposits excluded; failed/duplicate/refunded cases correct; recognition dates, IST periods and verified costs; unknown margin unavailable |
| Mobile/history | 320/390px and desktop checkout/history/admin refund states, pending/errors/retry and CSV match server records without cross-account leakage |

Stop on unexplained funds, permission or reconciliation differences. Preserve evidence; never repair balances automatically. Actual staging gates remain BLOCKED until completed, regardless of fixture CI success.
