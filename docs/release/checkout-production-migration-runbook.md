# SocialRUSH checkout security — production migration preflight (HOLD)

Status: **NOT APPROVED FOR PRODUCTION EXECUTION**. This is a read-only release plan attached to draft PR #770, stacked on #769. No migration, payment, order or provider action is authorized by this document.

## Verified evidence (22 Nov 2026)

- QA project: `imcysruvfjsexdppxcwc`; production: `valclbfoassmfyixwnyv`.
- QA has the `submit_manual_payment_order_atomic` RPC executable by `service_role` only. Production has no such function.
- QA: `apply_wallet_to_manual_checkout`, `checkout_campaign_with_wallet`, `place_campaign`, `place_order` are **not** executable by `authenticated` or `anon`. Production currently allows `authenticated` to execute those four functions.
- Both environments allow the current wallet-only RPC `checkout_custom_intent_with_wallet` to `authenticated` (required by the existing customer flow). QA has a blocked-user guard; production does not yet have the vetted QA replacement.
- Recorded migration counts differ (QA 155, production 119). **Do not run an unreviewed `supabase db push` or bulk replay history.**
- Offline source guard and PostgreSQL wallet fixtures passed in CI, but these do not establish isolated hosted end-to-end transaction safety.

## Mandatory release gates

1. Confirm current production owner, approved rollback contacts and a restorable production backup/PITR snapshot **with tested restore**, retaining evidence and timestamp. Don't assume backups are active from a dashboard label.
2. Confirm exact target code commit, PR review, required GitHub CI checks, and compatible production schema/function signatures. Staged application must be *forward-only* and narrowly scoped to two reviewed QA migration bodies, not the entire divergent history. Confirm application ordering and naming with the operator.
3. Reconcile any downstream code or external client that still invokes legacy RPCs. Revoking those four permissions may break unrecognized consumers; check access logs and callsites before applying.
4. Verify independently that the protected QA runtime points to the isolated QA database, using a harmless authenticated read and independently checking the corresponding QA-only fixture. No production or payment tokens in evidence.
5. Hosted QA test with explicitly synthetic user/service/order and no real payment, provider, webhook, email or cron egress. Verify partial wallet split, exact idempotent retry, mismatched UTR/reference/method conflict, blocked user, duplicate transaction, and forced rollback, then restore/delete fixtures. SQL rollback-only tests are separate evidence.
6. Review security-definer function grants, RLS, backup, migration rollback/restore, customer-impact window and GO sign-off.

## Read-only SQL preflight — run separately in QA and production

```sql
select current_database() as database_name,
  (select count(*) from supabase_migrations.schema_migrations) as migration_count;

select n.nspname || '.' || p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ')' as signature,
 has_function_privilege('authenticated',p.oid,'EXECUTE') as authenticated_execute,
 has_function_privilege('anon',p.oid,'EXECUTE') as anon_execute,
 has_function_privilege('service_role',p.oid,'EXECUTE') as service_execute
from pg_proc p
join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public'
  and p.proname in (
    'submit_manual_payment_order_atomic',
    'apply_wallet_to_manual_checkout',
    'checkout_campaign_with_wallet',
    'place_order',
    'place_campaign',
    'checkout_custom_intent_with_wallet'
  )
order by signature;

select version,name from supabase_migrations.schema_migrations
where name ilike '%atomic_manual%' or name ilike '%blocked_wallet%' or name ilike '%legacy_checkout%'
order by version;
```

## Migration candidates for an operator to review (do NOT apply automatically)

- `supabase/migrations/202611210001_secure_legacy_checkout_and_atomic_manual_submission.sql`: atomic manual order and restricted legacy RPC grants.
- `supabase/migrations/202611220001_reject_blocked_wallet_checkout_rpc.sql`: blocked-user protection in the wallet-only RPC.

Before any execution: manually inspect both scripts against the **actual production schema** and current code release dependency; confirm precise privileges, defaults, ownership, dependent objects, recorded migration mapping, and whether replacement semantics preserve existing legitimate wallet-only checkout.

## Post-migration verification (only after later authorized deployment)

- Exactly the expected signature/grant diff and no unrelated schema changes.
- Authenticated customers cannot execute four obsolete RPCs; service role can execute the atomic RPC.
- Approved wallet-only checkout still works for eligible users and denies blocked accounts.
- No duplicate wallet debit; consistent idempotency and order state; reconcile balances with actual ledger.
- No unintended customer orders, payments, fulfillment calls, analytics or notifications during smoke testing.
- Monitor live errors and reconciliation; use verified restore/runbook if a regression is found.

**GO/HOLD**: HOLD until *all* gates are documented and owner approval covers the exact candidate. No automatic production merge, deploy or DB writes.
