alter function public.set_order_updated_at() set search_path = '';
alter function public.crm_is_internal_operational_test_lead(text, text) set search_path = '';

alter view public.users set (security_invoker = true);
revoke all on table public.users from public, anon, authenticated, service_role;
grant select on table public.users to authenticated, service_role;

alter view public.wallet_transactions set (security_invoker = true);
revoke all on table public.wallet_transactions from public, anon, authenticated, service_role;
grant select on table public.wallet_transactions to authenticated, service_role;
