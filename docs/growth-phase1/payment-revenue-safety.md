> **SUPERSEDED PAYMENT SCOPE — 22 October 2026:** Razorpay/Cashfree development, configuration and sandbox work are stopped. Provider release gates are **Not Applicable**, not Passed. Provider instructions below are historical only; do not execute them. Use [the current active-payment release scope](active-payment-release.md). Wallet/manual flows, historical records and shared safety dependencies remain in scope.

# Phase 1.1 — payment and revenue safety

Branch: `feat/payment-revenue-safety-20261020`. Baseline: `36c08504`. Started 20 October; continued 22 October 2026 (India). This implements the financial priorities in the Phase 1 audit. No production database was queried or changed, no real payment/refund was sent, and no migration, merge or deployment was executed.

## Changes and exact paths

| Area | Files | Result |
|---|---|---|
| Database | `supabase/migrations/20261019214002_payment_revenue_safety.sql` | Atomic cancellation/refund trigger; optimistic admin update RPC; durable gateway reservation, claim, settlement and audit; admin revenue aggregate; hardened wallet RPCs; verified-cost table and scoped indexes. |
| Admin order writes | `lib/admin/refund-order.ts`, `app/admin/actions.ts`, `app/api/admin/orders/[id]/route.ts`, `app/api/admin/orders/[id]/status/route.ts` | All three callers use the authenticated, admin-checked transactional RPC. No balance/ledger mutation occurs after updating an order. APIs also check JSON and same origin. |
| Gateway refunds | `lib/payments/gateway-refund.ts`, `app/api/payments/razorpay/refund/route.ts` | At most one external POST per request, durable balance reservation, identity/amount preflight, reconciliation by receipt/refund ID, bounded provider calls and manual-review responses. |
| Wallet verification and quotes | `lib/payments/wallet-validation.ts`, Razorpay webhook/verify routes, `app/api/checkout/intent/route.ts`, `app/api/orders/manual-upi/route.ts` | Exact captured INR amount/identity/funding-type checks; active database quote pricing; atomic manual split submission and shared receipt-claim locking. |
| Revenue | `lib/analytics/financial-report.ts`, `revenue-dashboard.ts`, `revenue-audit.ts`, both admin revenue pages, `components/admin/RevenueIntelligencePanel.tsx` | Completed-order recognition, linked service refunds, signed net values, IST calendar periods, complete database aggregation, explicit missing-cost/reconciliation warnings. Unverified Day 30 baseline comparisons removed. |
| Wallet statement | `lib/payments/wallet-ledger.ts`, `components/wallet/WalletDashboard.tsx`, `WalletTransactionDialog.tsx` | External bank refunds have zero extra wallet effect after the reservation; CSV and details distinguish them from wallet credits. Legacy direct gateway deductions keep their original negative wallet effect. Pending payments have zero completed balance impact. |
| Tests | `tests/database/payment-safety-fixture.sql`, `payment-safety.test.mjs`, `tests/unit/payment-revenue-safety.test.ts`; four existing financial/security contract tests | Executable PostgreSQL transaction/RLS/rollback tests plus gateway uncertainty/concurrency and amount/date regression coverage. Existing contracts updated for the new admin-checked RPCs. |
| Local verification and review controls | `scripts/finance-test-network.cjs`, `finance-safe-build.cjs`, `package.json`, lockfile, `.env.example`, pre-merge workflow, `vercel.json` | Pinned development-only PGlite dependency; repeatable isolated build/tests; CI finance suite; disabled review-branch deployment; default-off gateway flag. |

The Phase 1 report/inventory files already existed locally as untracked deliverables from the previous task. They are supporting documentation, not financial-data fixtures. Other historical business features and customer order/payment snapshots are retained.

## Atomic order refunds

`admin_update_order_financial` verifies `auth.uid()` and the persisted admin role, locks the order and compares expected status/payment state. Only supported operational fields are accepted. A `BEFORE UPDATE` trigger handles cancellation/refund in the same transaction as the status change, refund ledger insert and wallet credit. Any exception rolls everything back, including order status.

`transactions.ledger_entry_key` is nullable for history and unique for new business effects. `order-refund:<order UUID>` makes the new refund unique. Repeating a terminal update does not credit again, and refunded/cancelled orders cannot be reopened. Owner and historical charge cannot be changed. Responses include the refund receipt returned from the same transaction.

Paid orders receive the existing full-cancellation refund policy. An unverified manual split order receives only the wallet funds actually reserved for its linked intent, never the unpaid external portion. Existing completed legacy refunds are checked before crediting again; amount disagreement fails for manual review. Already cancelled historical orders with missing/incomplete refund records are **not automatically repaired**. Existing unidentified credits from old partial failures need human reconciliation before any corrective transaction.

Rejecting the external receipt on an unverified split order also returns the reserved wallet portion atomically; the rejected external amount was never credited. A refunded payment cannot be reopened for fulfilment.

This does not add proportional partial-delivery refund policy. Full cancellation of a partially delivered paid order still returns the recorded order charge, as the prior cancellation policy did; review that business policy separately.

## Recoverable gateway refunds

`GATEWAY_REFUNDS_ENABLED=false` is the default. No provider call is made unless an authenticated admin enables the separately approved rollout configuration. The new endpoint accepts the existing `transactionId` contract and returns `requestId`, provider `refundId` where known, `status`, and `manualReviewRequired`. Pending/manual-review responses use HTTP 202; they are not claims of a completed refund.

Only a completed, unrefunded Razorpay wallet deposit can be reserved. Direct-checkout funding is rejected. `transaction_id` is unique in `gateway_refund_requests`. Reservation locks the source transaction and conditionally deducts available wallet funds with a unique reservation debit. That debit prevents the customer spending the funds while the provider result is uncertain. The source payment record remains unchanged.

State transitions:

| Current | Action / confirmed evidence | Result |
|---|---|---|
| none | Admin requests an eligible deposit refund with sufficient available funds | `reserved`; debit + request + audit commit together |
| reserved | One worker wins the conditional claim | `submitting`; only that worker may POST |
| submitting | Captured INR payment, exact deposit amount, no prior refunded amount; one provider POST with request UUID in receipt/notes | Provider ID recorded as `pending` before final local settlement |
| submitting/pending/manual_review | Unique matching provider refund is `processed` | `completed`; one external-refund ledger entry; no second wallet deduction |
| submitting/pending/manual_review | Matching provider refund is explicitly `failed` | `failed`; one reservation-release credit |
| submitting/pending/manual_review | Timeout, no match, multiple matches, unknown status, identity mismatch, truncated lookup, unavailable reconciliation | `manual_review`; keep reservation, do not reissue |
| completed/failed | Any repeated request | Same terminal outcome; no financial side effect |

Automatic retries never repeat the POST after a committed claim, including a process crash before POST or a lost response after POST. This deliberately favors manual review over the possibility of duplicate external refunds. No unverified provider idempotency-header guarantee is assumed. Receipt/notes identify this request during reconciliation; they are not assumed to deduplicate provider POSTs.

The old `admin_refund_wallet_payment` execution grants are revoked so the old post-provider debit cannot bypass the reservation model. All new request/audit tables have RLS and admin-only SELECT, no frontend mutation grants. Mutations are via explicit admin-checked RPCs. Audit records retain transition, actor, provider reference and safe review reason; no payment secret/payload is logged.

The completed external-refund ledger record is informational for wallet balance: the reservation debit already removed those funds. Wallet CSV/details use that classification instead of treating every `refund` row as a positive wallet credit. Failed refunds release the reservation exactly once; order cancellation refunds remain positive wallet credits.

Manual recovery: inspect the request/audit and provider dashboard using the request UUID/known refund ID. Retry the **same transaction ID** through the endpoint to reconcile a uniquely confirmed processed/failed refund. Do not create another provider refund or manually edit balances. If no definitive provider result exists, the reservation remains and an audited human decision/reconciliation tool is required; this phase intentionally offers no unaudited “release anyway” or “send again” button. Refunds made independently in the provider dashboard can race application operations; staff must use this request workflow and reconcile preexisting dashboard refunds before rollout.

## Wallet and payment validation

The existing intent row lock, conditional `balance >= charge` deduction, transaction rollback and request uniqueness remain. Null-safe payload checks prevent direct RPC callers using null fields to bypass intent matching. Paused/inactive services are rejected. Manual split flow protection remains, and new intent prices/min/max come from the active database service; server-approved package discounts remain server-side.

`submit_manual_checkout_atomic` now commits the manual order, wallet deduction, intent completion and normalized reference claim together. An order-insert failure rolls the split debit back. The old standalone split-debit helper loses client execution grants and is only called internally by the transactional wrapper. A shared advisory lock/reference guard serializes order submissions against manual wallet deposits, including case variants of a UTR/TxID; no historical receipt rows are rewritten. The new reference table is readable only by its owner/admin, with no frontend writes. Previously orphaned reservations require explicit reconciliation; they are not silently credited or deleted.

Quoted intents keep their immutable server-created total until expiry; a subsequent rate change does not silently reprice an existing quote or historical order. The legacy wallet campaign RPC now resolves the requested service ID/code to an active catalog row instead of a hardcoded price list, validates quantity and serializes retries with a transaction-scoped advisory lock. Same-key service/quantity/link conflicts fail. Nonfinite amount/balance guardrails fail closed rather than propagating a corrupted amount.

Razorpay wallet verification and signed webhooks require provider order identity, exact amount in paise, captured status, INR, an eligible funding credit and consistent stored provider payment ID before settlement. Existing database provider-ID uniqueness and row locking handle replay. Cashfree, manual UPI/bank/crypto receipt workflows and customer wallet endpoints remain in place; no new gateway orders are enabled.

## Revenue recognition and limitations

`admin_revenue_report(since, until)` is admin-only and aggregates within PostgreSQL, so financial totals are not truncated by the REST row-return cap. Periods are half-open and bounded to 366 days; UI periods use IST midnight/month boundaries. Financial query failure stops rendering partial totals. Browser analytics remain diagnostic and are not substituted for financial records.

- Recognition policy: verified paid/completed payment plus an explicit `orders.completed_at`. That timestamp is used as the recognition date. Partial/uncompleted orders, deposits and orders with missing completion evidence are not earned revenue. This is an operational assumption for finance review, not a claim of independently audited accounting compliance.
- A previously completed order later refunded/cancelled keeps its original gross recognition; a linked completed service refund reverses it on the refund date. Removing the order from gross and subtracting the refund again is avoided. Net can be negative.
- Refunds of wallet deposits and reservation/release entries do not reduce earned service revenue. Refund rows without a reliable order link/recognition date are counted as unclassified, not silently deducted. Historical refunded orders lacking a linked refund are flagged. These flags suppress scale recommendations and margin figures.
- Gross margin uses only `order_supplier_costs.cost_inr` with recorded verification/evidence. No supplier-cost import or estimate was invented. Missing any relevant cost makes margin unavailable; unknown refund/completion records also suppress margin. Payment fees, tax, FX, chargeback expenses, partial-fulfilment accruals and supplier reimbursements are not inferred. This is not operating profit.
- `orders.completed_at` and existing historical payment status are available evidence, not an immutable accounting event store. No speculative historic backfill was performed. A future audited recognition ledger and cost reconciliation import remain advisable.
- Main analytics AOV/customer contribution now describes recognized orders within the selected range. The separate aggregate event funnel remains diagnostic, not a reconciled payment-success cohort or lifetime retention metric.

## Verification and rollout

Commands: `npm run test:finance`, `npm run test:unit`, `npm run lint`, `node node_modules/typescript/bin/tsc --noEmit --incremental false`, `npm run build:finance-safe`.

The SQL tests use a new in-memory PGlite PostgreSQL database on every fixture. They apply relevant existing checkout/settlement migrations and this exact migration against isolated table shapes. Existing ownership/read-only intent policy expressions and new RLS/execute grants are exercised as anon/authenticated/admin, without service-role bypass. Tests do not load local database credentials or access any project.

PGlite has one database session: concurrent client submissions test idempotent transaction effects but do **not** establish independent-session lock interleavings/deadlock behavior. There is no Docker/native PostgreSQL installation on this machine. Full Supabase Auth/PostgREST integration, a complete replay of all historical migrations, native multi-session contention/deadlock tests and provider sandbox contract tests remain blocked/unperformed. This is a release gate, not a production readiness claim.

The safe-build wrapper performs an ordinary Next production build (including lint and type validation) with placeholder Supabase credentials, the existing catalog fixture transport, an external-fetch deny rule and one local generation worker. Its output is local verification only, not a deployable release artifact. It must never be uploaded/deployed. Existing lint/Edge Runtime dependency warnings are recorded separately from new errors.

`vercel.json` disables Git deployment for this exact review branch, following the documented [branch deployment control](https://vercel.com/docs/project-configuration/git-configuration#git.deploymentenabled). Existing PR workflows run local checks; no deployment step is added. No merge/deploy command is part of this work.

Recommended next phase: native PostgreSQL/Supabase sandbox verification with two or more sessions, provider test-mode refund reconciliation, staff manual-review tooling, and read-only historical ledger/cost reconciliation. Then request explicit rollout approval. Gate gateway refunds off throughout verification. Before any eventual rollout, stop the legacy gateway-refund endpoint in a maintenance window; deploy the default-off/fail-closed app code first, apply the migration only with approval, verify grants/reconciliation and then deliberately enable the new gateway path. Do not apply the migration while the old unreserved gateway handler can still send refunds. Keep additive ledger/audit tables on rollback; reverting to the old handler is unsafe after reservations exist.

Final command outcomes and PR publication are recorded in `payment-revenue-safety-validation.md`. The exact changed-file list is in [payment-revenue-safety-files.md](payment-revenue-safety-files.md).
