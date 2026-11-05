# Checkout wallet RPC body review — 2026-11-06, read-only

Inspected live definitions of `checkout_campaign_with_wallet`, `checkout_custom_intent_with_wallet` and `apply_wallet_to_manual_checkout`. No production writes.

## Findings
1. `checkout_campaign_with_wallet` requires auth and a non-null UUID request ID. It checks an existing order for the same user/key and returns it with `duplicate=true`, but **does not compare the incoming service ID, service code, link or quantity** against the existing order before returning. A caller reusing a key with different payload may receive an unrelated earlier order result.
2. Campaign wallet checkout debits via a conditional `UPDATE profiles ... WHERE balance >= charge` and then inserts an order with `client_request_id`. The partial unique index on `(user_id, client_request_id)` prevents duplicate committed rows with non-null keys; if a competing transaction hits that constraint, the transaction should roll back, but the API may return a uniqueness error rather than an idempotent duplicate response. Test concurrent same-key calls in a disposable database.
3. Campaign checkout embeds fixed campaign rate values in the function body. Review these against current service catalog pricing before changing code; do not assume all campaigns are charged at live catalog rates.
4. `checkout_custom_intent_with_wallet` locks the intent, validates ownership and input match, and returns the existing order for a completed intent. It checks service availability, wallet-split transaction existence and client/campaign ownership. Its `client_request_id::uuid` conversion and status transitions merit invalid-input and retry tests.
5. `apply_wallet_to_manual_checkout` locks the matching intent, checks auth and expected wallet amount, looks for a prior `wallet-split:<intent>` transaction, locks the profile, and debits only when a positive remainder requires manual payment. Its repeated-call behavior should be tested against status transitions and completion callbacks.
6. The legacy `place_order` remains independently broken (missing `v_charge` in INSERT values) and does not accept an idempotency key.

## Safe implementation gates
- Add regression tests for same-key/different-payload rejection, simultaneous same-key requests, and insufficient funds in a disposable database.
- Map all live callers before changing function grants, signatures or status behavior.
- Do not reactivate retired Cashfree or Razorpay paths.
- No production SQL, real orders, PR merge or production deployment without explicit approval.
