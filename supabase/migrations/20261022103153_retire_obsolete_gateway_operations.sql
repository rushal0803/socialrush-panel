-- Additive retirement only: retain historical rows, audit tables and original migrations.
-- No remote execution authorized; apply only after active-flow staging approval.
begin;
create or replace function public.request_wallet_gateway_refund(p_transaction_id uuid)
returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
begin raise exception 'Gateway refund operations are retired'; end $$;
create or replace function public.claim_wallet_gateway_refund(p_request_id uuid)
returns boolean language plpgsql security invoker set search_path=public,pg_temp as $$
begin raise exception 'Gateway refund operations are retired'; end $$;
create or replace function public.record_wallet_gateway_refund(p_request_id uuid,p_status text,
  p_provider_refund_id text default null,p_reason text default null)
returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
begin raise exception 'Gateway refund operations are retired'; end $$;
revoke all on function public.request_wallet_gateway_refund(uuid),public.claim_wallet_gateway_refund(uuid),
  public.record_wallet_gateway_refund(uuid,text,text,text) from public,anon,authenticated,service_role;
revoke all on function public.admin_refund_wallet_payment(uuid,text) from public,anon,authenticated,service_role;
-- Manual funding uses its own reviewed transaction insertion, not this gateway helper.
revoke all on function public.create_wallet_payment(numeric,text,text) from public,anon,authenticated,service_role;
-- Never release prior reservations or rewrite provider outcomes during retirement.
commit;
