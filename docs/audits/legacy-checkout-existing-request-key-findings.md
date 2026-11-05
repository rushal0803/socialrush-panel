# Existing order request-key protection — read-only production findings (2026-11-06)

## Verified
- public.orders has a partial unique index `orders_user_request_unique` on `(user_id, client_request_id)` where `client_request_id IS NOT NULL`.
- This **corrects** the earlier narrow naming scan, which searched for `idemp`, `request_key`, and `client_order` but missed `client_request_id`. Do not infer there is no existing idempotency infrastructure.
- The live `public.place_order(bigint,text,integer)` definition still inserts `(user_id,service_id,link,quantity,charge)` with only four values, and does not set `client_request_id`.
- This legacy RPC's signature has no idempotency key parameter. Its row lock protects concurrent wallet balance, but does not deduplicate identical retries.

## Implications
Do not create a redundant idempotency table or index until existing `client_request_id` consumers, uniqueness semantics, request fingerprints and retry responses are audited. The partial unique index only applies when the request ID is non-null. A duplicate key collision must not debit a wallet twice; the entire transaction must be atomic.

## Next checks
- Find current checkout code paths that populate `client_request_id`; determine whether those are already idempotent.
- Inspect actual order insert paths, RPC grants, relevant triggers and transaction writes.
- Test a keyed checkout contract with the existing index in a disposable database, including same-key retries, mismatched payloads, concurrency and rollback.
- Keep the legacy missing-charge correction separate and explicitly approved before production application.

No production modifications, merges, or real orders.
