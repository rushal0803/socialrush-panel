-- Atomic, quantity-priced campaign checkout with idempotency.
alter table public.orders add column if not exists service_name text;
alter table public.orders add column if not exists platform text;
alter table public.orders add column if not exists unit_price numeric(14,4);
alter table public.orders add column if not exists client_request_id uuid;
create unique index if not exists orders_user_request_unique
  on public.orders(user_id, client_request_id)
  where client_request_id is not null;

create or replace function public.checkout_campaign_with_wallet(
  p_service_id bigint,
  p_service_code text,
  p_link text,
  p_quantity integer,
  p_request_id uuid
)
returns jsonb
language plpgsql
security definer set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_name text;
  v_platform text;
  v_rate numeric(14,4);
  v_min integer;
  v_max integer;
  v_charge numeric(14,2);
  v_balance numeric(14,2);
  v_order_id uuid;
  v_existing public.orders%rowtype;
begin
  if v_user_id is null then raise exception 'Authentication required'; end if;
  if p_request_id is null then raise exception 'Checkout request ID is required'; end if;
  if nullif(trim(p_link), '') is null then raise exception 'A valid campaign link is required'; end if;
  if not exists (select 1 from public.services where id = p_service_id and status = 'active') then
    raise exception 'Selected service is unavailable';
  end if;

  select * into v_existing from public.orders
    where user_id = v_user_id and client_request_id = p_request_id;
  if found then
    select balance into v_balance from public.profiles where id = v_user_id;
    return jsonb_build_object('id', v_existing.id, 'charge', v_existing.charge, 'balance', v_balance, 'duplicate', true);
  end if;

  select x.name, x.platform, x.rate, x.min_qty, x.max_qty
    into v_name, v_platform, v_rate, v_min, v_max
  from (values
    ('ig-followers','Instagram Real Followers','instagram',599.0000,100,100000),
    ('ig-likes','Instagram Real Likes','instagram',299.0000,100,50000),
    ('ig-views','Instagram Video Views','instagram',49.0000,500,500000),
    ('yt-subscribers','YouTube Subscribers','youtube',3999.0000,100,50000),
    ('yt-likes','YouTube Likes','youtube',899.0000,100,50000),
    ('yt-views','YouTube Views','youtube',499.0000,500,500000),
    ('fb-followers','Facebook Followers','facebook',499.0000,100,100000),
    ('fb-likes','Facebook Post Likes','facebook',299.0000,100,50000),
    ('fb-views','Facebook Video Views','facebook',199.0000,500,500000),
    ('x-followers','Twitter/X Followers','twitter',999.0000,100,100000)
  ) as x(code,name,platform,rate,min_qty,max_qty)
  where x.code = p_service_code;
  if not found then raise exception 'Unknown campaign service'; end if;
  if p_quantity < v_min or p_quantity > v_max then
    raise exception 'Quantity must be between % and %', v_min, v_max;
  end if;

  v_charge := round((p_quantity::numeric / 1000) * v_rate, 2);
  if v_charge <= 0 then raise exception 'Campaign total must be greater than zero'; end if;

  update public.profiles
    set balance = balance - v_charge
    where id = v_user_id and balance >= v_charge
    returning balance into v_balance;
  if not found then raise exception 'Insufficient campaign budget'; end if;

  insert into public.orders (
    user_id, service_id, service_name, platform, link, quantity,
    unit_price, charge, status, client_request_id
  ) values (
    v_user_id, p_service_id, v_name, v_platform, trim(p_link), p_quantity,
    v_rate, v_charge, 'pending', p_request_id
  ) returning id into v_order_id;

  insert into public.transactions (user_id, amount, type, status, description, metadata)
  values (
    v_user_id, v_charge, 'debit', 'completed',
    'Campaign checkout: ' || v_name,
    jsonb_build_object('order_id', v_order_id, 'service_code', p_service_code, 'quantity', p_quantity)
  );

  return jsonb_build_object('id', v_order_id, 'charge', v_charge, 'balance', v_balance, 'duplicate', false);
end;
$$;

revoke all on function public.checkout_campaign_with_wallet(bigint,text,text,integer,uuid) from public;
grant execute on function public.checkout_campaign_with_wallet(bigint,text,text,integer,uuid) to authenticated;
