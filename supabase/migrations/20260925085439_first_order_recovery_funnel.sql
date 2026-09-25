alter table public.customer_email_automation_config
  add column if not exists first_order_sequence_enabled boolean not null default false,
  add column if not exists first_order_sequence_activation_at timestamptz;

alter table public.customer_email_events drop constraint if exists customer_email_events_event_type_check;
alter table public.customer_email_events
  add constraint customer_email_events_event_type_check
  check (event_type = any (array[
    'signup_no_order'::text,
    'order_created'::text,
    'order_completed'::text,
    'first_order_reminder'::text,
    'first_order_nudge_2h'::text,
    'first_order_trust_24h'::text,
    'first_order_reminder_3d'::text,
    'first_order_final_7d'::text,
    'never_ordered_reactivation'::text,
    'inactive_7d'::text
  ]));

alter table public.customer_email_events drop constraint if exists customer_email_events_event_target;
alter table public.customer_email_events
  add constraint customer_email_events_event_target
  check (
    (
      event_type = any (array[
        'signup_no_order'::text,
        'first_order_reminder'::text,
        'first_order_nudge_2h'::text,
        'first_order_trust_24h'::text,
        'first_order_reminder_3d'::text,
        'first_order_final_7d'::text,
        'never_ordered_reactivation'::text,
        'inactive_7d'::text
      ])
      and order_id is null
    )
    or
    (
      event_type = any (array['order_created'::text,'order_completed'::text])
      and order_id is not null
    )
  );

create or replace function public.enqueue_customer_lifecycle_email_events()
returns integer
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_count integer := 0;
  v_inserted integer := 0;
begin
  insert into customer_email_events(user_id,event_type,recipient,lifecycle_key)
  select p.id,'first_order_reminder',lower(trim(p.email)),'first_order_reminder:'||p.id::text||':'||(p.created_at at time zone 'UTC')::date
  from profiles p cross join customer_email_automation_config c
  where c.lifecycle_enabled
    and not c.first_order_sequence_enabled
    and c.lifecycle_activation_at is not null
    and p.created_at >= c.lifecycle_activation_at
    and p.role <> 'admin'
    and p.created_at <= now()-make_interval(hours=>c.first_order_delay_hours)
    and coalesce((p.notification_preferences->>'marketing')::boolean,false)
    and nullif(trim(p.email),'') is not null
    and p.email !~* '(^|[+.])(test|internal)([+.@]|$)'
    and not exists(
      select 1 from orders o
      where o.user_id=p.id
        and o.status not in ('cancelled','refunded','failed')
        and coalesce(o.payment_status,'paid') not in ('cancelled','refunded','failed')
    )
    and not exists(select 1 from crm_suppression_list s where lower(trim(s.email))=lower(trim(p.email)))
    and not exists(select 1 from support_tickets st where st.user_id=p.id and st.status not in ('resolved','closed'))
    and not exists(select 1 from order_refill_requests rr where rr.customer_id=p.id and rr.status not in ('completed','rejected','cancelled'))
  on conflict (lifecycle_key) where lifecycle_key is not null do nothing;
  get diagnostics v_inserted=row_count;
  v_count := v_count + v_inserted;

  insert into customer_email_events(user_id,event_type,recipient,lifecycle_key)
  select p.id,'first_order_nudge_2h',lower(trim(p.email)),'first_order_nudge_2h:'||p.id::text||':'||(p.created_at at time zone 'UTC')::date
  from profiles p cross join customer_email_automation_config c
  where c.lifecycle_enabled and c.first_order_sequence_enabled and c.first_order_sequence_activation_at is not null
    and p.created_at >= c.first_order_sequence_activation_at and p.created_at <= now()-interval '2 hours'
    and p.role <> 'admin' and coalesce((p.notification_preferences->>'marketing')::boolean,false)
    and nullif(trim(p.email),'') is not null and p.email !~* '(^|[+.])(test|internal)([+.@]|$)'
    and not exists(select 1 from orders o where o.user_id=p.id and o.status not in ('cancelled','refunded','failed') and coalesce(o.payment_status,'paid') not in ('cancelled','refunded','failed'))
    and not exists(select 1 from crm_suppression_list s where lower(trim(s.email))=lower(trim(p.email)))
    and not exists(select 1 from support_tickets st where st.user_id=p.id and st.status not in ('resolved','closed'))
    and not exists(select 1 from order_refill_requests rr where rr.customer_id=p.id and rr.status not in ('completed','rejected','cancelled'))
  on conflict (lifecycle_key) where lifecycle_key is not null do nothing;
  get diagnostics v_inserted=row_count; v_count := v_count + v_inserted;

  insert into customer_email_events(user_id,event_type,recipient,lifecycle_key)
  select p.id,'first_order_trust_24h',lower(trim(p.email)),'first_order_trust_24h:'||p.id::text||':'||(p.created_at at time zone 'UTC')::date
  from profiles p cross join customer_email_automation_config c
  where c.lifecycle_enabled and c.first_order_sequence_enabled and c.first_order_sequence_activation_at is not null
    and p.created_at >= c.first_order_sequence_activation_at and p.created_at <= now()-interval '24 hours'
    and p.role <> 'admin' and coalesce((p.notification_preferences->>'marketing')::boolean,false)
    and nullif(trim(p.email),'') is not null and p.email !~* '(^|[+.])(test|internal)([+.@]|$)'
    and not exists(select 1 from orders o where o.user_id=p.id and o.status not in ('cancelled','refunded','failed') and coalesce(o.payment_status,'paid') not in ('cancelled','refunded','failed'))
    and not exists(select 1 from crm_suppression_list s where lower(trim(s.email))=lower(trim(p.email)))
    and not exists(select 1 from support_tickets st where st.user_id=p.id and st.status not in ('resolved','closed'))
    and not exists(select 1 from order_refill_requests rr where rr.customer_id=p.id and rr.status not in ('completed','rejected','cancelled'))
  on conflict (lifecycle_key) where lifecycle_key is not null do nothing;
  get diagnostics v_inserted=row_count; v_count := v_count + v_inserted;

  insert into customer_email_events(user_id,event_type,recipient,lifecycle_key)
  select p.id,'first_order_reminder_3d',lower(trim(p.email)),'first_order_reminder_3d:'||p.id::text||':'||(p.created_at at time zone 'UTC')::date
  from profiles p cross join customer_email_automation_config c
  where c.lifecycle_enabled and c.first_order_sequence_enabled and c.first_order_sequence_activation_at is not null
    and p.created_at >= c.first_order_sequence_activation_at and p.created_at <= now()-interval '72 hours'
    and p.role <> 'admin' and coalesce((p.notification_preferences->>'marketing')::boolean,false)
    and nullif(trim(p.email),'') is not null and p.email !~* '(^|[+.])(test|internal)([+.@]|$)'
    and not exists(select 1 from orders o where o.user_id=p.id and o.status not in ('cancelled','refunded','failed') and coalesce(o.payment_status,'paid') not in ('cancelled','refunded','failed'))
    and not exists(select 1 from crm_suppression_list s where lower(trim(s.email))=lower(trim(p.email)))
    and not exists(select 1 from support_tickets st where st.user_id=p.id and st.status not in ('resolved','closed'))
    and not exists(select 1 from order_refill_requests rr where rr.customer_id=p.id and rr.status not in ('completed','rejected','cancelled'))
  on conflict (lifecycle_key) where lifecycle_key is not null do nothing;
  get diagnostics v_inserted=row_count; v_count := v_count + v_inserted;

  insert into customer_email_events(user_id,event_type,recipient,lifecycle_key)
  select p.id,'first_order_final_7d',lower(trim(p.email)),'first_order_final_7d:'||p.id::text||':'||(p.created_at at time zone 'UTC')::date
  from profiles p cross join customer_email_automation_config c
  where c.lifecycle_enabled and c.first_order_sequence_enabled and c.first_order_sequence_activation_at is not null
    and p.created_at >= c.first_order_sequence_activation_at and p.created_at <= now()-interval '168 hours'
    and p.role <> 'admin' and coalesce((p.notification_preferences->>'marketing')::boolean,false)
    and nullif(trim(p.email),'') is not null and p.email !~* '(^|[+.])(test|internal)([+.@]|$)'
    and not exists(select 1 from orders o where o.user_id=p.id and o.status not in ('cancelled','refunded','failed') and coalesce(o.payment_status,'paid') not in ('cancelled','refunded','failed'))
    and not exists(select 1 from crm_suppression_list s where lower(trim(s.email))=lower(trim(p.email)))
    and not exists(select 1 from support_tickets st where st.user_id=p.id and st.status not in ('resolved','closed'))
    and not exists(select 1 from order_refill_requests rr where rr.customer_id=p.id and rr.status not in ('completed','rejected','cancelled'))
  on conflict (lifecycle_key) where lifecycle_key is not null do nothing;
  get diagnostics v_inserted=row_count; v_count := v_count + v_inserted;

  insert into customer_email_events(user_id,event_type,recipient,lifecycle_key)
  select p.id,'never_ordered_reactivation',lower(trim(p.email)),'never_ordered_reactivation:'||p.id::text||':v1'
  from profiles p cross join customer_email_automation_config c
  where c.lifecycle_enabled and c.first_order_sequence_enabled and c.first_order_sequence_activation_at is not null
    and p.created_at < c.first_order_sequence_activation_at and p.created_at <= now()-interval '24 hours'
    and p.role <> 'admin' and coalesce((p.notification_preferences->>'marketing')::boolean,false)
    and nullif(trim(p.email),'') is not null and p.email !~* '(^|[+.])(test|internal)([+.@]|$)'
    and not exists(select 1 from orders o where o.user_id=p.id and o.status not in ('cancelled','refunded','failed') and coalesce(o.payment_status,'paid') not in ('cancelled','refunded','failed'))
    and not exists(select 1 from crm_suppression_list s where lower(trim(s.email))=lower(trim(p.email)))
    and not exists(select 1 from support_tickets st where st.user_id=p.id and st.status not in ('resolved','closed'))
    and not exists(select 1 from order_refill_requests rr where rr.customer_id=p.id and rr.status not in ('completed','rejected','cancelled'))
  on conflict (lifecycle_key) where lifecycle_key is not null do nothing;
  get diagnostics v_inserted=row_count; v_count := v_count + v_inserted;

  insert into customer_email_events(user_id,event_type,recipient,lifecycle_key)
  select q.user_id,'inactive_7d',q.email,'inactive_7d:'||q.user_id::text||':'||(q.last_order at time zone 'UTC')::date
  from (
    select p.id user_id, lower(trim(p.email)) email, max(o.created_at) last_order, c.inactive_days, c.lifecycle_activation_at
    from profiles p join orders o on o.user_id=p.id cross join customer_email_automation_config c
    where c.lifecycle_enabled and c.lifecycle_activation_at is not null and p.role <> 'admin'
      and coalesce((p.notification_preferences->>'marketing')::boolean,false)
      and nullif(trim(p.email),'') is not null
      and p.email !~* '(^|[+.])(test|internal)([+.@]|$)'
      and o.status not in ('cancelled','refunded','failed')
      and coalesce(o.payment_status,'paid') not in ('cancelled','refunded','failed')
      and not exists(select 1 from crm_suppression_list s where lower(trim(s.email))=lower(trim(p.email)))
      and not exists(select 1 from support_tickets st where st.user_id=p.id and st.status not in ('resolved','closed'))
      and not exists(select 1 from order_refill_requests rr where rr.customer_id=p.id and rr.status not in ('completed','rejected','cancelled'))
    group by p.id,p.email,c.inactive_days,c.lifecycle_activation_at
    having max(o.created_at) >= c.lifecycle_activation_at
       and max(o.created_at) <= now()-make_interval(days=>c.inactive_days)
  ) q
  on conflict (lifecycle_key) where lifecycle_key is not null do nothing;
  get diagnostics v_inserted=row_count;
  v_count := v_count + v_inserted;
  return v_count;
end
$function$;

create or replace function public.claim_next_customer_email_event()
returns setof public.customer_email_events
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  picked uuid;
  cfg public.customer_email_automation_config%rowtype;
begin
  select id into picked
  from public.customer_email_events
  where event_type not in ('first_order_reminder','first_order_nudge_2h','first_order_trust_24h','first_order_reminder_3d','first_order_final_7d','never_ordered_reactivation','inactive_7d')
    and (
      status='queued'
      or (status='failed' and attempt_count < 5 and (
        (coalesce(error_message,'') ilike '%idempotency key%' and updated_at <= now()-interval '24 hours')
        or (coalesce(error_message,'') not ilike '%idempotency key%' and updated_at <= now()-interval '15 minutes')
      ))
      or (status='processing' and processing_started_at < now()-interval '15 minutes')
    )
  order by case when status='queued' then 0 when status='processing' then 1 else 2 end, created_at
  for update skip locked limit 1;

  if picked is not null then
    return query
    update public.customer_email_events
    set status='processing', attempt_count=attempt_count+1, processing_started_at=now(), updated_at=now(), error_message=null
    where id=picked returning *;
    return;
  end if;

  select * into cfg from public.customer_email_automation_config where id=true for update;
  if not found or not cfg.lifecycle_enabled then return; end if;

  if (
    select count(*) from public.customer_email_events x
    where x.event_type in ('first_order_reminder','first_order_nudge_2h','first_order_trust_24h','first_order_reminder_3d','first_order_final_7d','never_ordered_reactivation','inactive_7d')
      and (
        (x.status='sent' and x.provider_message_id is not null and x.sent_at >= date_trunc('day',now()))
        or (x.status='processing' and x.processing_started_at >= date_trunc('day',now()))
      )
  ) >= cfg.lifecycle_daily_limit then return; end if;

  select id into picked
  from public.customer_email_events
  where event_type in ('first_order_reminder','first_order_nudge_2h','first_order_trust_24h','first_order_reminder_3d','first_order_final_7d','never_ordered_reactivation','inactive_7d')
    and (
      status='queued'
      or (status='failed' and attempt_count < 5 and (
        (coalesce(error_message,'') ilike '%idempotency key%' and updated_at <= now()-interval '24 hours')
        or (coalesce(error_message,'') not ilike '%idempotency key%' and updated_at <= now()-interval '15 minutes')
      ))
      or (status='processing' and processing_started_at < now()-interval '15 minutes')
    )
  order by case when status='queued' then 0 when status='processing' then 1 else 2 end, created_at
  for update skip locked limit 1;

  if picked is not null then
    return query
    update public.customer_email_events
    set status='processing', attempt_count=attempt_count+1, processing_started_at=now(), updated_at=now(), error_message=null
    where id=picked returning *;
  end if;
end
$function$;

revoke all on function public.enqueue_customer_lifecycle_email_events() from public;
grant execute on function public.enqueue_customer_lifecycle_email_events() to service_role;
revoke all on function public.claim_next_customer_email_event() from public;
grant execute on function public.claim_next_customer_email_event() to service_role;
