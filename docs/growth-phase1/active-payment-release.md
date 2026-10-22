# Revised payment scope — active flows only

22 October 2026. User strategy supersedes earlier Razorpay/Cashfree planning. Existing branch `feat/payment-revenue-safety-20261020`, draft [PR #702](https://github.com/rushal0803/socialrush-panel/pull/702). **No merge, deployment, production migration or real payment authorized.**

## Verified method inventory

Production deployment metadata identifies `main` commit `36c085044cd785dfee5679dcd10a51f33626c484`. The active UI/adapters below were compared with that source; public website inspection does not bypass authentication. No customer session, financial record, real transfer, provider API or remote SQL was used. Actual authenticated production journeys and receipt settlement remain unverified; enabling UI is not proof a transfer reached the intended beneficiary.

| Method | Verified code paths / availability | Active verification required |
|---|---|---|
| Existing INR wallet | `app/api/orders/route.ts`, checkout intents and wallet RPCs; selectable when balance covers the quote, otherwise manual split | Guarded balance, server price, legitimate order, concurrent retry/rollback, authorization and wallet cancellation refund. |
| Manual UPI | `app/dashboard/add-funds/page.tsx` → `DesktopUpiQrCheckout`; `app/dashboard/direct-upi/page.tsx` → `DirectUpiPaymentClient`; `/api/wallet/manual-upi` and `/api/orders/manual-upi` | Pending receipt submission; admin verification before credit/paid status; reference uniqueness, original INR amount, no credit from browser return. No actual UPI transfer for testing. |
| Bank transfer (IMPS/NEFT) | Active components contain beneficiary instructions and direct page passes `bankTransfer.enabled=true`; manual APIs accept bank receipts | Same evidence/approval rules as UPI. The old `.env.example` bank-enable flag is not the authority for these active hardcoded UI paths. Beneficiary details must be independently confirmed by owner, not inferred from source. |
| USDT TRC20 | Active manual UI and API support; displayed amount requires a positive FX result, otherwise unavailable/fallback | Reference/TxID, network and credited INR amount independently reviewed by admin. USD-to-USDT parity and conversion/rounding are assumptions requiring finance approval. Never send crypto for testing. |
| Cards/net banking/international cards through gateways | Legacy method helper explicitly disables all gateway funding methods; no new provider checkout is in scope | **Not Applicable** to active release. Bank transfer is not the disabled gateway net-banking method. |

`ManualUpiAddFunds` is an older component with similar options; the actual current add-funds page renders `DesktopUpiQrCheckout`. `lib/payments/methods.ts` has stale gateway-era comments: its disabled `upi` flag describes gateway funding, not the active manual UPI APIs. No active payment method was disabled or enabled by this scope change.

## Obsolete changes and safe exclusion

| PR area | Decision |
|---|---|
| New `lib/payments/gateway-refund.ts` orchestrator | Removed from release tree after checking all consumers. Its new provider retry/POST feature is no longer required. No historical module or data was blindly deleted. |
| `/api/payments/razorpay/refund` | Inert 410 compatibility response; no provider/DB import, reservation, settlement or flag-based reactivation. |
| `/api/payments/cashfree/order` | Inert 410 response replaces an obsolete but callable source endpoint that could POST a new provider order. No dependency on old credentials. |
| `/api/checkout/cashfree/order` | **Retained:** despite its name, this is the active manual-UPI intent/redirect adapter. It does not POST provider orders. Regression coverage protects this shared dependency. |
| Earlier financial migration / gateway tables / audit / reference IDs | Retained unchanged. New additive `20261022103153_retire_obsolete_gateway_operations.sql` freezes new reserve/claim/settle RPCs and revokes gateway creation/refund execution. No rows/balances/statuses are modified, no reservations released, no tables/functions dropped. Apply only in approved staging, not remotely in this task. |
| Historical verify/webhook handlers and `wallet-validation.ts` | Security hardening retained as historical compatibility/defense. No further provider development, sandbox configuration or provider execution. A separate approved legacy in-flight audit is needed before removing callbacks or credentials; this task does not silently strand historical receipts. |
| Wallet statement/revenue classification/read-only reconciliation | Retained because old deposits/refunds still affect correct historical display and reporting. Deposit refunds are not earned service-revenue reversals. Historical candidate checks do not create new provider operations. |
| Gateway success/concurrency feature tests and provider setup instructions | Removed from active regression blocks or explicitly N/A; historical documentation marked superseded. Retired-operation denial checks remain security tests, not provider integration passes. |

The frozen functions raise a retirement error even for direct owner execution. Public/anon/authenticated/service roles have no execution grants for gateway reservation/claim/settlement or old gateway wallet creation/refund helpers. They remain named for compatibility and auditability. Existing unresolved reservations, if any, require approved read-only accounting review; retirement never assumes they are zero or releases them automatically.

The retained manual adapter now uses the protected, unexpired server quote total for every service instead of rejecting it against static/current prices. Current catalog availability/quantity and wallet sufficiency still apply; foreign owners, invalid totals/states and paused services fail. Missing/failed/nonfinite wallet reads return 503 rather than treating an unknown balance as zero and prompting an unnecessary external transfer. Request-level tests exercise these cases with no provider dependency.

## Revised release checklist

| Gate | Status / required evidence |
|---|---|
| Razorpay/Cashfree test credentials, sandbox refunds, retries, callbacks and production-build test-key parity | **Not Applicable — retired providers**, not Passed. Do not provision resources, enable flags, alter runtime guards or run provider tests to close this release. |
| Native independent-session wallet purchase/refund concurrency | Required; existing coverage retained, current retirement revision must pass CI. |
| UPI/bank/USDT manual deposit approval | Required; wrong receipt/evidence/role denied, four competing approvals produce one completed credit, replay cannot credit again. Staging must verify server-admin authorization plus actual Auth/PostgREST, not only SQL role simulation. |
| Manual order/split and shared receipt claims | Required; cross-customer, case-insensitive duplicate reference and order-insert failure tested; reject receipt/cancellation returns only wallet actually debited. |
| Retirement guard | Required; obsolete creation/refund endpoints return 410 with no financial dependencies; obsolete RPCs cannot lock spendable funds or alter history. |
| Full disposable Supabase history replay / Auth / RLS / PostgREST | **BLOCKED**: no approved disposable target or independent key set; existing resources are potentially production-connected. Shared production/preview database credentials and cron/production-origin migration hazards remain relevant to active flows. |
| Desktop/mobile/admin active financial journeys and CSV | **BLOCKED** on approved synthetic accounts/backend. Fixture wallet/history/pending/CSV tests remain useful but are not actual staging proof. |
| Historical unmatched credits/refunds, costs and recognition | **BLOCKED** on source approval. Counts are unknown, not zero. Use the existing read-only candidate query; no automatic repair or production export. |
| Revenue / costs / ₹10,00,000 monthly target | Required: recognized service revenue and linked refunds; wallet deposits excluded; missing supplier costs/recognition suppress margin. Define business target using approved refund-adjusted monthly recognized revenue, not funding volume or projected profit. |
| TypeScript, lint, full units, finance tests, native CI and local production build | Required for final revised head; results recorded in PR #702. Historical gateway success passes do not certify active flows. |

## Active-only staging priority and exact owner inputs

1. Confirm a separate disposable synthetic-only Supabase ref and allowed migration/test scope; provide its private URL/public/server/DB credential location. Do not reuse current local or inherited preview credentials; no provider credential setup is requested.
2. Supply an isolated local stack/host and scheduler/egress containment before replay. All **121** migrations are inventoried: original 120 plus additive retirement. Do not edit history, copy production rows, enable production-origin cron/email/supplier requests or reset an unapproved project. Required independent Vault prerequisite and full-history compatibility remain to be verified.
3. Provision admin + customers A/B and anonymous contexts, private credentials, test mail sink, synthetic catalog/balances/receipt references and mock/non-routable UPI/bank/USDT receivers. Test receipt submission/approval entirely with synthetic evidence; no real bank/UPI/crypto transfer.
4. Run Auth/ownership/role matrix first, then manual approval and wallet concurrency, split-order failure/retry, cancellation/refund, desktop/mobile/admin receipt status and CSV; reconcile SQL invariants after every case. Retain exact app/schema version, test account aliases, sanitized request IDs and screenshots privately.
5. Review recognition/cost/cancellation policy and approved read-only historical candidates. Keep actual money reconciliation separate from synthetic tests; never run destructive fixture tests on a historical snapshot or production.

## Migration rollout and rollback prerequisites

No remote migration was applied. Preserve the original migration bytes and apply the retirement migration after its definitions in the approved full staging chain. Keep financial mutations unavailable during a future migration batch; do not expose interim old gateway grants between migration commits. Verify effective final privileges and inactive endpoints before reopening writes. Production execution still needs separate explicit approval.

Rollback retains ledger/refund/audit/reference data and compatible atomic wallet/order handling. Do not undo retirement by restoring provider order/refund handlers or regranting obsolete RPCs. Freeze affected writes on failure, preserve any historical reservation/evidence, and use a reviewed forward fix or synthetic-only restore. No data deletion, automatic balance repair, gateway credential rotation or historical provider callback retirement was executed.

Phase 2 remains specification-only in [the growth implementation plan](../growth-phase2/implementation-specification.md), now anchored to the ₹10,00,000/month objective and the verified active manual/wallet methods. No growth UI, offer or price changes are part of this financial safety update.
