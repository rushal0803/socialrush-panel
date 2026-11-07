# Existing checkout idempotency RPC inventory — read-only, 2026-11-06

## Database evidence
The public.orders table has `client_request_id uuid NULL`, `charge numeric NOT NULL`, and `user_id uuid NOT NULL`. A partial unique index `orders_user_request_unique` enforces `(user_id, client_request_id)` uniqueness only when request ID is non-null.

A read-only search of public PostgreSQL function bodies for `client_request_id` found:
- `checkout_campaign_with_wallet(bigint,text,text,integer,uuid)`
- `checkout_custom_intent_with_wallet(uuid,text,text,integer,text)`
- `apply_wallet_to_manual_checkout(uuid,uuid,numeric)`
- `complete_checkout_intent_payment_system(uuid,text)`
- `settle_cashfree_checkout_intent_payment_system(text,text)` (historical; Cashfree is retired and must not be re-enabled)

The legacy `place_order(bigint,text,integer)` function still omits the charge value in its INSERT and has no request-key parameter. This audit did not inspect the bodies of the five functions above, and **does not** establish whether they are secure, idempotent, or actively called.

## Next safe steps
1. Read the full function bodies and access grants, especially for the manual wallet path and the custom-intent path.
2. Map current frontend/server checkout callers; default-branch GitHub code search returned no matches for `client_request_id` or `place_order`, which is inconclusive (branch, indexing, dynamic calls).
3. Inspect request-key validation, wallet row locking, duplicate-key response behavior, and outbox/trigger side effects.
4. Verify active payment methods remain Manual UPI, Bank Transfer and USDT TRC20; do not restore Cashfree or Razorpay.
5. Implement changes only in a reviewed branch with disposable database tests; require separate approval for production SQL and merge.

No production changes, real orders or merges.
