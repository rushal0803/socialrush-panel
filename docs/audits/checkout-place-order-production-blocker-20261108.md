# Checkout release blocker — production read-only verification (2026-11-08)

## Confirmed in production Supabase project

Read-only introspection of `pg_get_functiondef` for `public.place_order(bigint,text,integer)` confirms:

- The function computes `v_charge := round((p_quantity::numeric / 1000) * v_service.rate, 2)`.
- It checks wallet balance and updates `public.profiles.balance` by subtracting `v_charge`.
- Its order insertion lists `(user_id, service_id, link, quantity, charge)` but the `VALUES` clause supplies only `(v_user_id, p_service_id, trim(p_link), p_quantity)` — **five target columns, four values**.
- `public.orders.charge` is `NOT NULL`, has no default, and is constrained to nonnegative values.
- This mismatch makes the INSERT invalid when reached. In PostgreSQL, the statement's transaction is atomic, so an error should roll back the earlier wallet update; do not claim a permanent wallet deduction from this error without independent evidence.

## Proposed correction (review only)

Replace the malformed VALUES clause with:
```sql
values (v_user_id, p_service_id, trim(p_link), p_quantity, v_charge)
```

Do **not** apply a standalone SQL replacement based only on this snippet. Review full function security, permissions, existing migration history, and dependencies, and test the exact replacement in an isolated database with positive, insufficient-balance, invalid-quantity and concurrency scenarios.

## Release decision

**Blocking:** Production `place_order` function is not verified safe for this order path. Require explicit owner approval for any production migration. Do not merge PR #743 or change production database as part of this review.

This document contains no credentials or customer records. No production data was modified.
