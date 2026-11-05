# Legacy checkout duplicate-request protection — design review only

## Verified scope (2026-11-05)
The disposable PostgreSQL fixture demonstrates that two sequential requests with identical service, link and quantity each create an order and debit the wallet. This is **not** evidence of duplicate production orders. The fixture is intentionally simplified and does not reproduce production triggers, external callers or all authorization checks.

## Why identical inputs alone cannot identify a retry
A customer may intentionally buy the same service and quantity for the same target twice. Do not reject based only on matching inputs, a time window or a target-link hash. A retry must carry a stable client-generated request key, reused across network retries but different for a new intentional purchase.

## Proposed server-side contract (not implemented)
1. Introduce a per-user idempotency key to the *supported* checkout entry point, with a unique database constraint on (authenticated user, key). Do not silently change the existing public.place_order(bigint,text,integer) signature or its grants.
2. Persist a canonical request fingerprint covering service, normalized target, quantity, payment source and price basis. A reused key with a different fingerprint must fail without a debit.
3. Reserve or claim the key atomically in the same database transaction as wallet debit, order insert and transaction record. Competing requests for the same key must serialize; only one may create a charge.
4. After a successful commit, retrying the same key returns the original order ID and does not repeat notifications or wallet changes. If the transaction rolls back, the reservation must roll back too.
5. Avoid holding a database transaction open while calling external providers. Use a transactional outbox and deduplicated delivery for external effects.
6. Validate the authenticated user inside the trusted server/RPC boundary; never accept an arbitrary user ID from the client. Limit who can execute any SECURITY DEFINER RPC.
7. Establish retention and archival rules for request keys; prevent premature key reuse for active orders.

## Required isolated tests before implementation
- First request creates exactly one order, debit and outbox event.
- Same key + same request returns the same order ID without a new debit.
- Same key + different request fails without changing records.
- Two concurrent requests with the same key create one order.
- Two concurrent requests with different keys cannot overspend the wallet.
- A failed order trigger rolls back key reservation and wallet mutation.
- Missing auth and cross-user key reuse cannot expose or modify another user's order.
- Client retry after timeout safely recovers the original result.
- Outbox retry does not duplicate notifications or bonuses.

## Rollout constraints
Confirm actual production checkout call paths, existing order/payment idempotency tables, triggers and permissions before choosing a schema or endpoint. Implement behind a reviewed, backwards-compatible migration and test with disposable data. The legacy 3-argument RPC remains a separate security decision; adding a new idempotent entry point does not automatically protect direct callers of the old RPC.

**No SQL in this document is approved for production execution. No checkout flow is enabled or changed.**
