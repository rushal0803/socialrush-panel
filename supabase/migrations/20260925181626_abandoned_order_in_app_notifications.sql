begin;

alter table public.customer_notifications
  drop constraint if exists customer_notifications_type_check;

alter table public.customer_notifications
  add constraint customer_notifications_type_check
  check (type = any (array[
    'order_created'::text,
    'order_status'::text,
    'order_completed'::text,
    'refund'::text,
    'refill'::text,
    'support_reply'::text,
    'account_action'::text,
    'abandoned_order'::text
  ]));

create or replace function private.enqueue_abandoned_order_notifications()
returns integer
language plpgsql
security invoker
set search_path to 'public','private'
as $function$
declare
  inserted_count integer := 0;
begin
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

  insert into public.customer_notifications(user_id,type,title,message,href,order_id)
  select
    d.user_id,
    'abandoned_order',
    'Your saved order is waiting',
    'Your ' ||
      initcap(replace(d.service_code,'-',' ')) ||
      ' order for ' || to_char(d.quantity,'FM999G999G999') ||
      ' is saved. Review the current price and continue when you are ready.',
    '/dashboard/new-order?draft=1',
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

revoke all on function private.enqueue_abandoned_order_notifications() from public;
revoke all on function private.enqueue_abandoned_order_notifications() from anon;
revoke all on function private.enqueue_abandoned_order_notifications() from authenticated;

select cron.unschedule(jobid)
from cron.job
where jobname='socialrush-abandoned-order-notifications';

select cron.schedule(
  'socialrush-abandoned-order-notifications',
  '*/15 * * * *',
  'select private.enqueue_abandoned_order_notifications();'
);

commit;
