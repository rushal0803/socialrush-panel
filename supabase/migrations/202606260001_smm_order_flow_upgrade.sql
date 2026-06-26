-- SMM order flow compatibility upgrade

alter table public.services add column if not exists platform text;
alter table public.services add column if not exists refill_policy text not null default 'Refill eligible';
alter table public.services add column if not exists is_active boolean not null default true;

update public.services
set platform = coalesce(
  platform,
  case
    when lower(name) like '%instagram%' then 'instagram'
    when lower(name) like '%youtube%' then 'youtube'
    when lower(name) like '%facebook%' then 'facebook'
    when lower(name) like '%linkedin%' then 'linkedin'
    when lower(name) like '%telegram%' then 'telegram'
    when lower(name) like '%tiktok%' then 'tiktok'
    when lower(name) like '%twitter%' or lower(name) like '%x/%' then 'twitter'
    else 'other'
  end
);

update public.services
set is_active = (status = 'active')
where is_active is distinct from (status = 'active');

alter table public.orders add column if not exists start_count bigint not null default 0;
alter table public.orders add column if not exists remains bigint;
alter table public.orders add column if not exists notes text;

update public.orders
set remains = coalesce(remains, quantity)
where remains is null;

create or replace view public.users as
select
  p.id,
  p.full_name as name,
  p.email,
  p.balance as wallet_balance,
  p.created_at
from public.profiles p;

create or replace view public.wallet_transactions as
select
  t.id,
  t.user_id,
  t.type,
  t.amount,
  t.status,
  t.payment_method,
  coalesce(t.provider_payment_id, t.provider_order_id, t.id::text) as transaction_id,
  t.created_at
from public.transactions t;
