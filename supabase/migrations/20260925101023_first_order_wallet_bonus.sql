create unique index if not exists customer_reward_first_order_bonus_once_idx
  on public.customer_reward_events(user_id)
  where event_type='promotional_credit' and source='first_order_bonus';

create or replace function public.apply_first_order_wallet_bonus()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  r public.reward_programme_rules%rowtype;
  first_order_id uuid;
  reward_event_id uuid;
  transaction_id uuid;
begin
  if new.status <> 'completed'
     or coalesce(new.payment_status,'paid') not in ('paid','completed') then
    return new;
  end if;

  select * into r
  from public.reward_programme_rules
  where id=true;

  if not found
     or not r.enabled
     or r.manual_approval
     or coalesce(r.new_customer_reward,0) <= 0
     or coalesce(new.charge,0) < r.minimum_order_amount
     or new.created_at < r.updated_at then
    return new;
  end if;

  select o.id into first_order_id
  from public.orders o
  where o.user_id=new.user_id
    and o.status not in ('cancelled','refunded','failed')
    and coalesce(o.payment_status,'paid') not in ('cancelled','refunded','failed')
  order by o.created_at asc,o.id asc
  limit 1;

  if first_order_id is distinct from new.id then
    return new;
  end if;

  insert into public.customer_reward_events(
    user_id,event_type,qualifying_order_id,amount,status,source,internal_note
  )
  values(
    new.user_id,'promotional_credit',new.id,r.new_customer_reward,'pending',
    'first_order_bonus',
    'Automatic first-order wallet bonus after qualifying completed order'
  )
  on conflict do nothing
  returning id into reward_event_id;

  if reward_event_id is null then
    return new;
  end if;

  update public.profiles
  set balance=coalesce(balance,0)+r.new_customer_reward
  where id=new.user_id;

  insert into public.transactions(
    user_id,amount,type,status,payment_method,description,metadata
  )
  values(
    new.user_id,
    r.new_customer_reward,
    'reward',
    'completed',
    'reward',
    'First order bonus',
    jsonb_build_object(
      'reward_event_id',reward_event_id,
      'qualifying_order_id',new.id,
      'reward_type','first_order_bonus'
    )
  )
  returning id into transaction_id;

  update public.customer_reward_events
  set status='credited',
      transaction_id=transaction_id,
      updated_at=now()
  where id=reward_event_id;

  return new;
end
$function$;

drop trigger if exists first_order_wallet_bonus_insert on public.orders;
create trigger first_order_wallet_bonus_insert
after insert on public.orders
for each row
execute function public.apply_first_order_wallet_bonus();

drop trigger if exists first_order_wallet_bonus_update on public.orders;
create trigger first_order_wallet_bonus_update
after update of status,payment_status on public.orders
for each row
when (
  new.status='completed'
  and coalesce(new.payment_status,'paid') in ('paid','completed')
  and (
    old.status is distinct from new.status
    or old.payment_status is distinct from new.payment_status
  )
)
execute function public.apply_first_order_wallet_bonus();

revoke all on function public.apply_first_order_wallet_bonus() from public;
