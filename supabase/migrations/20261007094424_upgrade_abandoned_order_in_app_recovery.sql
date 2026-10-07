create or replace function private.enqueue_abandoned_order_notifications()
returns integer
language plpgsql
set search_path to 'public', 'private'
as $function$
declare
  inserted_count integer := 0;
  reward_enabled boolean := false;
  reward_amount numeric := 0;
  reward_minimum numeric := 0;
  reward_label text := '';
  minimum_label text := '';
begin
  select
    coalesce(r.enabled,false) and not coalesce(r.manual_approval,false),
    coalesce(r.new_customer_reward,0),
    coalesce(r.minimum_order_amount,0)
  into reward_enabled,reward_amount,reward_minimum
  from public.reward_programme_rules r
  where r.id=true;

  reward_enabled := coalesce(reward_enabled,false)
    and reward_amount > 0
    and reward_minimum > 0;

  reward_label := regexp_replace(trim(to_char(reward_amount,'FM999999990.00')), '\.00$', '');
  minimum_label := regexp_replace(trim(to_char(reward_minimum,'FM999999990.00')), '\.00$', '');

  update public.customer_notifications n
  set read_at = coalesce(n.read_at, now())
  where n.type='abandoned_order'
    and n.read_at is null
    and (
      n.created_at < now()-interval '7 days'
      or not exists (
        select 1 from public.order_drafts d
        where d.user_id=n.user_id
      )
      or exists (
        select 1 from public.orders o
        where o.user_id=n.user_id
          and o.created_at >= n.created_at
          and o.status not in ('cancelled','refunded','failed')
          and coalesce(o.payment_status,'paid') not in ('cancelled','refunded','failed')
      )
    );

  update public.customer_notifications n
  set
    title = case
      when reward_enabled and not exists (
        select 1 from public.orders o
        where o.user_id=n.user_id
          and o.status not in ('cancelled','refunded','failed')
          and coalesce(o.payment_status,'paid') not in ('cancelled','refunded','failed')
      )
      then 'Your saved first order can unlock ₹' || reward_label
      else 'Your saved order is waiting'
    end,
    message = case
      when reward_enabled and not exists (
        select 1 from public.orders o
        where o.user_id=n.user_id
          and o.status not in ('cancelled','refunded','failed')
          and coalesce(o.payment_status,'paid') not in ('cancelled','refunded','failed')
      )
      then 'Your ' || initcap(replace(d.service_code,'-',' ')) ||
           ' order for ' || to_char(d.quantity,'FM999G999G999') ||
           ' is saved. Complete an eligible first order of ₹' || minimum_label ||
           ' or more and receive ₹' || reward_label ||
           ' in your wallet after completion. Review the current price before continuing.'
      else 'Your ' || initcap(replace(d.service_code,'-',' ')) ||
           ' order for ' || to_char(d.quantity,'FM999G999G999') ||
           ' is saved. Review the current price and continue when you are ready.'
    end,
    href = '/dashboard/new-order?draft=1&source=email_recovery&campaign=in_app_abandoned_order'
  from public.order_drafts d
  where d.user_id=n.user_id
    and n.type='abandoned_order'
    and n.read_at is null
    and d.updated_at >= now()-interval '7 days';

  insert into public.customer_notifications(user_id,type,title,message,href,order_id)
  select
    d.user_id,
    'abandoned_order',
    case
      when reward_enabled and not exists (
        select 1 from public.orders prior
        where prior.user_id=d.user_id
          and prior.status not in ('cancelled','refunded','failed')
          and coalesce(prior.payment_status,'paid') not in ('cancelled','refunded','failed')
      )
      then 'Your saved first order can unlock ₹' || reward_label
      else 'Your saved order is waiting'
    end,
    case
      when reward_enabled and not exists (
        select 1 from public.orders prior
        where prior.user_id=d.user_id
          and prior.status not in ('cancelled','refunded','failed')
          and coalesce(prior.payment_status,'paid') not in ('cancelled','refunded','failed')
      )
      then 'Your ' || initcap(replace(d.service_code,'-',' ')) ||
           ' order for ' || to_char(d.quantity,'FM999G999G999') ||
           ' is saved. Complete an eligible first order of ₹' || minimum_label ||
           ' or more and receive ₹' || reward_label ||
           ' in your wallet after completion. Review the current price before continuing.'
      else 'Your ' || initcap(replace(d.service_code,'-',' ')) ||
           ' order for ' || to_char(d.quantity,'FM999G999G999') ||
           ' is saved. Review the current price and continue when you are ready.'
    end,
    '/dashboard/new-order?draft=1&source=email_recovery&campaign=in_app_abandoned_order',
    null
  from public.order_drafts d
  join public.profiles p on p.id=d.user_id
  where d.updated_at <= now()-interval '2 hours'
    and d.updated_at >= now()-interval '7 days'
    and d.target is not null
    and d.quantity > 0
    and p.role <> 'admin'
    and not exists (
      select 1 from public.orders o
      where o.user_id=d.user_id
        and o.created_at >= d.updated_at
        and o.status not in ('cancelled','refunded','failed')
        and coalesce(o.payment_status,'paid') not in ('cancelled','refunded','failed')
    )
    and not exists (
      select 1 from public.support_tickets st
      where st.user_id=d.user_id
        and st.status not in ('resolved','closed')
    )
    and not exists (
      select 1 from public.order_refill_requests rr
      where rr.customer_id=d.user_id
        and rr.status not in ('completed','rejected','cancelled')
    )
    and not exists (
      select 1 from public.customer_notifications n
      where n.user_id=d.user_id
        and n.type='abandoned_order'
        and (
          n.created_at >= d.updated_at
          or n.created_at >= now()-interval '24 hours'
        )
    );

  get diagnostics inserted_count = row_count;
  return inserted_count;
end
$function$;

select private.enqueue_abandoned_order_notifications();
