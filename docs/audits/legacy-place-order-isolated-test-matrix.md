# Legacy order checkout: isolated PostgreSQL acceptance matrix

Status: TEST SPECIFICATION ONLY. No production execution or migration authorization.

## Verified production trigger dependencies (read-only, 2026-11-05)
- BEFORE INSERT: reject_paused_service_order_trigger -> reject_paused_service_order()
- AFTER INSERT: customer_order_email_events -> queue_customer_order_email()
- AFTER INSERT: customer_order_notification -> notify_customer_order_event()
- AFTER INSERT: orders_first_order_wallet_bonus_insert -> apply_first_order_wallet_bonus()
- Other triggers also exist; inspect the complete production list before building a faithful fixture.

## Required isolated tests
1. **Valid purchase**: fixture authenticated user, active service and sufficient wallet balance. Assert one order with correct non-null charge, one completed debit transaction, and exact wallet reduction.
2. **Insufficient balance**: assert exception and unchanged balance, orders and transactions.
3. **Quantity bounds and null**: reject below-minimum, above-maximum and NULL quantities; verify all side effects remain unchanged. The current function uses a three-valued SQL comparison, so NULL needs explicit review.
4. **Inactive/paused service**: assert no order or debit, including the BEFORE INSERT trigger.
5. **Missing authentication**: assert rejection without data mutation.
6. **Trigger side effects**: verify notification/email outbox behavior with outbound delivery disabled, first-order bonus rules and order status history. Never send actual email.
7. **Concurrent requests**: two wallet purchases competing for insufficient combined funds must not overspend; inspect row locking and any retries.
8. **Repeated request/idempotency**: determine whether the public legacy RPC is still callable and whether repeated requests can create duplicate paid orders; document mitigation.
9. **Rollback after downstream trigger error**: force an isolated trigger exception; assert order, wallet and transaction all roll back.
10. **Authorization and grants**: verify authenticated user can affect only their own wallet; anonymous access denied; do not assume SECURITY DEFINER is safe.

## Release gate
Use isolated Postgres with disposable fixture users, services, balances and notification outboxes. Preserve production trigger behavior but disable all external effects. Do not copy personal customer data. Compare the full current function definition, ownership and EXECUTE grants before writing a migration. Require green tests, manual review, CI and separate production approval.

This document is not proof that any scenario has passed.
