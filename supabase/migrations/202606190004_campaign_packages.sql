-- Fixed-price campaign packages. Legacy fulfillment fields remain internal.

alter table public.orders add column if not exists package_name text;

create or replace function public.place_campaign(
  p_service_id bigint,
  p_link text,
  p_package text
)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_service public.services%rowtype;
  v_balance numeric(14, 2);
  v_charge numeric(14, 2);
  v_order_id uuid;
begin
  if v_user_id is null then raise exception 'Authentication required'; end if;
  if nullif(trim(p_link), '') is null then raise exception 'A campaign destination is required'; end if;
  if p_package not in ('starter', 'growth', 'professional', 'premium') then raise exception 'Select an available campaign package'; end if;

  select * into v_service from public.services where id = p_service_id and status = 'active';
  if not found then raise exception 'Campaign objective is unavailable'; end if;

  v_charge := case p_package
    when 'starter' then 999
    when 'growth' then 2999
    when 'professional' then 7999
    when 'premium' then 14999
  end;

  select balance into v_balance from public.profiles where id = v_user_id for update;
  if v_balance is null then raise exception 'Profile not found'; end if;
  if v_balance < v_charge then raise exception 'Insufficient campaign budget'; end if;

  update public.profiles set balance = balance - v_charge where id = v_user_id;
  insert into public.orders (user_id, service_id, link, quantity, charge, package_name)
  values (v_user_id, p_service_id, trim(p_link), v_service.min, v_charge, p_package)
  returning id into v_order_id;
  insert into public.transactions (user_id, amount, type, status)
  values (v_user_id, v_charge, 'debit', 'completed');
  return v_order_id;
end;
$$;

revoke all on function public.place_campaign(bigint, text, text) from public;
grant execute on function public.place_campaign(bigint, text, text) to authenticated;
