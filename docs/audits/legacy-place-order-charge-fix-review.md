# Legacy place_order SQL correction — review only

## Evidence (read-only, 2026-11-04)
Production public.orders.charge is NOT NULL with no default. The current public.place_order function calculates v_charge but omits charge from its INSERT column/value lists. public.place_campaign already includes charge.

## Minimal proposed change
In the existing public.place_order function definition, replace only:

```sql
insert into public.orders (user_id, service_id, link, quantity, charge)
values (v_user_id, p_service_id, trim(p_link), p_quantity)
```

with:

```sql
insert into public.orders (user_id, service_id, link, quantity, charge)
values (v_user_id, p_service_id, trim(p_link), p_quantity, v_charge)
```

This preserves the existing SECURITY DEFINER ownership, grants, function signature, balance checks and wallet debit ordering. It does **not** approve those behaviors as secure. Do not execute this fragment alone; generate a full reviewed CREATE OR REPLACE FUNCTION from the current definition and apply only through a separately approved migration.

## Release gates
1. Check current production function definition and any intervening migrations again immediately before creating the migration.
2. Check all triggers, RLS and caller paths; the legacy scanner detects literal references only and cannot exclude dynamic or external callers.
3. In isolated PostgreSQL fixtures, verify: valid order writes correct charge; insufficient balance leaves orders, balance and transactions unchanged; inactive service, invalid quantity, missing auth and repeated requests are handled safely.
4. Audit idempotency and concurrency before enabling any legacy checkout flow.
5. Re-run required CI and preview verification; obtain explicit production migration approval separately.

No real order, balance mutation, production SQL, privilege change or merge is authorized by this document.
