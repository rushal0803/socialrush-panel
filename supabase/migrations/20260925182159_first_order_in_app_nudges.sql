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
    'abandoned_order'::text,
    'first_order_nudge'::text
  ]));

create or replace function private.enqueue_first_order_nudge_notifications()
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

  insert into public.customer_notifications(user_id,type,title,message,href,order_id)
  select
    p.id,
    'first_order_nudge',
    'Ready to place your first order?',
    'Your SocialRUSH account is ready. Choose a platform, select a service, and review the exact price before paying.',
    '/dashboard/new-order',
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
      where st.user_id=p.id
        and st.status not in ('resolved','closed')
    )
    and not exists (
      select 1 from public.order_refill_requests rr
      where rr.customer_id=p.id
        and rr.status not in ('completed','rejected','cancelled')
    )
    and not exists (
      select 1 from public.customer_notifications n
      where n.user_id=p.id
        and n.type='first_order_nudge'
    );

  get diagnostics inserted_count = row_count;
  return inserted_count;
end
$function$;

revoke all on function private.enqueue_first_order_nudge_notifications() from public;
revoke all on function private.enqueue_first_order_nudge_notifications() from anon;
revoke all on function private.enqueue_first_order_nudge_notifications() from authenticated;

select cron.unschedule(jobid)
from cron.job
where jobname='socialrush-first-order-nudge-notifications';

select cron.schedule(
  'socialrush-first-order-nudge-notifications',
  '0 */6 * * *',
  'select private.enqueue_first_order_nudge_notifications();'
);

select private.enqueue_first_order_nudge_notifications();

commit;
