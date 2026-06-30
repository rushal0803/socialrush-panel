-- Synchronize production service rates with lib/service-pricing.ts.

update public.services s
set rate = pricing.rate
from (
  values
    ('instagram real followers', 599.0000),
    ('instagram followers', 599.0000),
    ('instagram likes', 249.0000),
    ('instagram views', 30.0000),
    ('instagram video views', 30.0000),
    ('youtube subscribers', 3999.0000),
    ('youtube likes', 499.0000),
    ('youtube views', 249.0000),
    ('facebook followers', 299.0000),
    ('facebook likes', 149.0000),
    ('facebook post likes', 149.0000),
    ('facebook views', 99.0000),
    ('facebook video views', 99.0000),
    ('facebook shares', 499.0000),
    ('linkedin profile followers', 2999.0000),
    ('linkedin followers', 2999.0000),
    ('linkedin likes', 2499.0000),
    ('telegram members', 799.0000),
    ('telegram premium members', 799.0000),
    ('tiktok followers', 499.0000),
    ('tiktok likes', 150.0000),
    ('tiktok views', 15.0000),
    ('x followers', 799.0000),
    ('twitter/x followers', 799.0000)
) as pricing(name, rate)
where lower(s.name) = pricing.name;

update public.services
set name = 'Telegram Premium Members'
where lower(name) = 'telegram members'
  and not exists (
    select 1 from public.services existing
    where lower(existing.name) = 'telegram premium members'
  );

update public.services
set status = 'inactive', is_active = false
where lower(name) in ('x likes', 'twitter/x likes');

insert into public.services (
  category_id, name, rate, min, max, description, status, platform,
  delivery_time, refill_policy, quality_type, important_instruction, is_active
)
select
  c.id,
  'Facebook Shares',
  499.0000,
  100,
  1000000,
  'Expand post distribution with quality share activity.',
  'active',
  'facebook',
  '1-5 days',
  'Refill eligible',
  'Premium',
  'Use a public Facebook post URL.',
  true
from public.categories c
where c.name = 'Facebook Page Growth'
  and not exists (
    select 1 from public.services s where lower(s.name) = 'facebook shares'
  )
limit 1;

create or replace function public.checkout_campaign_with_wallet(
  p_service_id bigint,
  p_service_code text,
  p_link text,
  p_quantity integer,
  p_request_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
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

  select * into v_existing
  from public.orders
  where user_id = v_user_id and client_request_id = p_request_id;

  if found then
    select balance into v_balance from public.profiles where id = v_user_id;
    return jsonb_build_object(
      'id', v_existing.id,
      'charge', v_existing.charge,
      'balance', v_balance,
      'duplicate', true
    );
  end if;

  select x.name, x.platform, x.rate, x.min_qty, x.max_qty
  into v_name, v_platform, v_rate, v_min, v_max
  from (
    values
      ('ig-followers', 'Instagram Real Followers', 'instagram', 599.0000, 100, 1000000),
      ('ig-likes', 'Instagram Likes', 'instagram', 249.0000, 100, 1000000),
      ('ig-views', 'Instagram Views', 'instagram', 30.0000, 100, 1000000),
      ('yt-subscribers', 'YouTube Subscribers', 'youtube', 3999.0000, 100, 1000000),
      ('yt-likes', 'YouTube Likes', 'youtube', 499.0000, 100, 1000000),
      ('yt-views', 'YouTube Views', 'youtube', 249.0000, 100, 1000000),
      ('fb-followers', 'Facebook Followers', 'facebook', 299.0000, 100, 1000000),
      ('fb-likes', 'Facebook Likes', 'facebook', 149.0000, 100, 1000000),
      ('fb-views', 'Facebook Views', 'facebook', 99.0000, 100, 1000000),
      ('fb-shares', 'Facebook Shares', 'facebook', 499.0000, 100, 1000000),
      ('li-followers', 'LinkedIn Followers', 'linkedin', 2999.0000, 100, 1000000),
      ('li-likes', 'LinkedIn Likes', 'linkedin', 2499.0000, 100, 1000000),
      ('tg-members', 'Telegram Premium Members', 'telegram', 799.0000, 100, 1000000),
      ('tt-followers', 'TikTok Followers', 'tiktok', 499.0000, 100, 1000000),
      ('tt-likes', 'TikTok Likes', 'tiktok', 150.0000, 100, 1000000),
      ('tt-views', 'TikTok Views', 'tiktok', 15.0000, 100, 1000000),
      ('x-followers', 'Twitter/X Followers', 'twitter', 799.0000, 100, 1000000)
  ) as x(code, name, platform, rate, min_qty, max_qty)
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
  )
  values (
    v_user_id, p_service_id, v_name, v_platform, trim(p_link), p_quantity,
    v_rate, v_charge, 'pending', p_request_id
  )
  returning id into v_order_id;

  insert into public.transactions (
    user_id, amount, type, status, payment_method, description, metadata
  )
  values (
    v_user_id,
    v_charge,
    'debit',
    'completed',
    'wallet',
    'Campaign checkout: ' || v_name,
    jsonb_build_object(
      'order_id', v_order_id,
      'service_code', p_service_code,
      'quantity', p_quantity
    )
  );

  return jsonb_build_object(
    'id', v_order_id,
    'charge', v_charge,
    'balance', v_balance,
    'duplicate', false
  );
end;
$$;

revoke all on function public.checkout_campaign_with_wallet(bigint, text, text, integer, uuid) from public;
grant execute on function public.checkout_campaign_with_wallet(bigint, text, text, integer, uuid) to authenticated;
