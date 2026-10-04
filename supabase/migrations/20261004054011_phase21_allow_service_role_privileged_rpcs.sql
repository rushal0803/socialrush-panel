-- Phase 21 completion rollout step 1.
-- Backward-compatible: allow trusted service_role calls while preserving
-- the existing authenticated admin/user path until the application deploy is live.

do $$
declare
  r record;
  v_definition text;
  v_old_guard constant text := 'if not public.is_admin() then';
  v_new_guard constant text := 'if coalesce(auth.jwt()->>''role'', '''') <> ''service_role'' and not public.is_admin() then';
  v_old_owner_filter constant text := 'where id = p_order_id and user_id = auth.uid();';
  v_new_owner_filter constant text := 'where id = p_order_id and (coalesce(auth.jwt()->>''role'', '''') = ''service_role'' or user_id = auth.uid());';
begin
  for r in
    select p.oid, p.proname
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in (
        'admin_adjust_balance',
        'admin_credit_reward',
        'admin_refund_wallet_payment',
        'admin_review_payment',
        'admin_run_crm_automation',
        'admin_set_user_blocked'
      )
  loop
    v_definition := pg_get_functiondef(r.oid);
    if position(v_old_guard in v_definition) = 0 then
      raise exception 'Expected admin guard not found in %', r.proname;
    end if;
    v_definition := replace(v_definition, v_old_guard, v_new_guard);
    execute v_definition;
  end loop;

  select pg_get_functiondef(p.oid)
  into v_definition
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.proname = 'set_initial_order_count'
    and pg_get_function_identity_arguments(p.oid) =
      'p_order_id uuid, p_starting_count bigint, p_status text, p_source text, p_message text, p_customer_note text';

  if v_definition is null or position(v_old_owner_filter in v_definition) = 0 then
    raise exception 'Expected set_initial_order_count owner filter not found';
  end if;

  v_definition := replace(v_definition, v_old_owner_filter, v_new_owner_filter);
  execute v_definition;
end
$$;
