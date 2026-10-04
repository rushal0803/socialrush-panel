-- Phase 21 completion rollout step 2.
-- The application has already moved these privileged operations to the
-- server-only service-role client. Remove direct Data API execution for
-- anonymous and authenticated users, while preserving service_role access.

revoke execute on function public.admin_adjust_balance(uuid, numeric, text) from public, anon, authenticated;
grant execute on function public.admin_adjust_balance(uuid, numeric, text) to service_role;

revoke execute on function public.admin_credit_reward(uuid) from public, anon, authenticated;
grant execute on function public.admin_credit_reward(uuid) to service_role;

revoke execute on function public.admin_refund_wallet_payment(uuid, text) from public, anon, authenticated;
grant execute on function public.admin_refund_wallet_payment(uuid, text) to service_role;

revoke execute on function public.admin_review_payment(uuid, text) from public, anon, authenticated;
grant execute on function public.admin_review_payment(uuid, text) to service_role;

revoke execute on function public.admin_run_crm_automation() from public, anon, authenticated;
grant execute on function public.admin_run_crm_automation() to service_role;

revoke execute on function public.admin_set_user_blocked(uuid, boolean) from public, anon, authenticated;
grant execute on function public.admin_set_user_blocked(uuid, boolean) to service_role;

revoke execute on function public.set_initial_order_count(uuid, bigint, text, text, text, text) from public, anon, authenticated;
grant execute on function public.set_initial_order_count(uuid, bigint, text, text, text, text) to service_role;
