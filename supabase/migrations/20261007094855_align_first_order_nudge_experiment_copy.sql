create or replace function private.enqueue_first_order_nudge_notifications()
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
  where n.type='first_order_nudge'
    and n.read_at is null
    and (
      n.created_at < now()-interval '30 days'
      or exists (select 1 from public.order_drafts d where d.user_id=n.user_id)
      or exists (
        select 1 from public.orders o
        where o.user_id=n.user_id
          and o.status not in ('cancelled','refunded','failed')
          and coalesce(o.payment_status,'paid') not in ('cancelled','refunded','failed')
      )
    );

  update public.customer_notifications n
  set
    title = case
      when reward_enabled and exists (
        select 1 from public.first_order_bonus_experiment_assignments a
        where a.user_id=n.user_id and a.variant in ('bonus','legacy_bonus')
      )
      then '₹' || reward_label || ' wallet bonus on your first order'
      else 'Ready to place your first order?'
    end,
    message = case
      when reward_enabled and exists (
        select 1 from public.first_order_bonus_experiment_assignments a
        where a.user_id=n.user_id and a.variant in ('bonus','legacy_bonus')
      )
      then 'Complete your first SocialRUSH order of ₹' || minimum_label ||
           ' or more. After the order is completed, ₹' || reward_label ||
           ' is added to your wallet automatically.'
      else 'Your SocialRUSH account is ready. Choose a platform, select a service, and review the exact price before paying.'
    end,
    href='/dashboard/new-order?source=email_recovery&campaign=in_app_first_order_nudge'
  where n.type='first_order_nudge'
    and n.read_at is null
    and not exists (select 1 from public.order_drafts d where d.user_id=n.user_id)
    and not exists (
      select 1 from public.orders o
      where o.user_id=n.user_id
        and o.status not in ('cancelled','refunded','failed')
        and coalesce(o.payment_status,'paid') not in ('cancelled','refunded','failed')
    );

  insert into public.customer_notifications(user_id,type,title,message,href,order_id)
  select
    p.id,
    'first_order_nudge',
    case
      when reward_enabled and exists (
        select 1 from public.first_order_bonus_experiment_assignments a
        where a.user_id=p.id and a.variant in ('bonus','legacy_bonus')
      )
      then '₹' || reward_label || ' wallet bonus on your first order'
      else 'Ready to place your first order?'
    end,
    case
      when reward_enabled and exists (
        select 1 from public.first_order_bonus_experiment_assignments a
        where a.user_id=p.id and a.variant in ('bonus','legacy_bonus')
      )
      then 'Complete your first SocialRUSH order of ₹' || minimum_label ||
           ' or more. After the order is completed, ₹' || reward_label ||
           ' is added to your wallet automatically.'
      else 'Your SocialRUSH account is ready. Choose a platform, select a service, and review the exact price before paying.'
    end,
    '/dashboard/new-order?source=email_recovery&campaign=in_app_first_order_nudge',
    null
  from public.profiles p
  where p.role <> 'admin'
    and p.created_at <= now()-interval '24 hours'
    and p.created_at >= now()-interval '90 days'
    and not exists (
      select 1 from public.orders o
      where o.user_id=p.id
        and o.status not in ('cancelled','refunded','failed')
        and coalesce(o.payment_status,'paid') not in ('cancelled','refunded','failed')
    )
    and not exists (select 1 from public.order_drafts d where d.user_id=p.id)
    and not exists (
      select 1 from public.support_tickets st
      where st.user_id=p.id and st.status not in ('resolved','closed')
    )
    and not exists (
      select 1 from public.order_refill_requests rr
      where rr.customer_id=p.id and rr.status not in ('completed','rejected','cancelled')
    )
    and not exists (
      select 1 from public.customer_notifications n
      where n.user_id=p.id and n.type='first_order_nudge'
    );

  get diagnostics inserted_count = row_count;
  return inserted_count;
end
$function$;

select private.enqueue_first_order_nudge_notifications();
