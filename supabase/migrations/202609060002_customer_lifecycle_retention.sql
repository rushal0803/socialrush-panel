-- Customer lifecycle only. It deliberately does not use crm_leads or crm_lead_contacts.
alter table public.profiles alter column notification_preferences set default '{"orders":true,"payments":true,"support":true,"marketing":false,"security":true}'::jsonb;
alter table public.customer_email_automation_config add column if not exists lifecycle_enabled boolean not null default false;
alter table public.customer_email_automation_config add column if not exists first_order_delay_hours integer not null default 24 check(first_order_delay_hours between 1 and 720);
alter table public.customer_email_automation_config add column if not exists inactive_days integer not null default 7 check(inactive_days between 1 and 365);
alter table public.customer_email_automation_config add column if not exists lifecycle_daily_limit integer not null default 20 check(lifecycle_daily_limit between 1 and 500);
alter table public.customer_email_events drop constraint if exists customer_email_events_event_type_check;
alter table public.customer_email_events add constraint customer_email_events_event_type_check check (event_type in ('signup_no_order','order_created','order_completed','first_order_reminder','inactive_7d'));
alter table public.customer_email_events add column if not exists lifecycle_key text;
create unique index if not exists customer_email_events_lifecycle_once on public.customer_email_events(lifecycle_key) where lifecycle_key is not null;
create index if not exists customer_email_events_lifecycle_dispatch_idx on public.customer_email_events(event_type,status,created_at desc) where event_type in ('first_order_reminder','inactive_7d');

create or replace function public.enqueue_customer_lifecycle_email_events() returns integer language plpgsql security definer set search_path=public as $$
declare v_count integer;
begin
  insert into customer_email_events(user_id,event_type,recipient,lifecycle_key)
  select p.id,'first_order_reminder',lower(trim(p.email)),'first_order_reminder:'||p.id::text||':'||(p.created_at at time zone 'UTC')::date
  from profiles p cross join customer_email_automation_config c
  where c.lifecycle_enabled and p.role <> 'admin' and p.created_at <= now()-make_interval(hours=>c.first_order_delay_hours)
    and coalesce((p.notification_preferences->>'marketing')::boolean,false) and nullif(trim(p.email),'') is not null
    and p.email !~* '(^|[+.])(test|internal)([+.@]|$)' and not exists(select 1 from orders o where o.user_id=p.id and o.status not in ('cancelled','refunded','failed') and coalesce(o.payment_status,'paid') not in ('cancelled','refunded','failed'))
    and not exists(select 1 from crm_suppression_list s where lower(trim(s.email))=lower(trim(p.email)))
  on conflict (lifecycle_key) where lifecycle_key is not null do nothing;
  get diagnostics v_count=row_count;
  insert into customer_email_events(user_id,event_type,recipient,lifecycle_key)
  select q.user_id,'inactive_7d',q.email,'inactive_7d:'||q.user_id::text||':'||(q.last_order at time zone 'UTC')::date
  from (select p.id user_id,lower(trim(p.email)) email,max(o.created_at) last_order from profiles p join orders o on o.user_id=p.id cross join customer_email_automation_config c where c.lifecycle_enabled and p.role <> 'admin' and coalesce((p.notification_preferences->>'marketing')::boolean,false) and nullif(trim(p.email),'') is not null and p.email !~* '(^|[+.])(test|internal)([+.@]|$)' and o.status not in ('cancelled','refunded','failed') and coalesce(o.payment_status,'paid') not in ('cancelled','refunded','failed') group by p.id,p.email,c.inactive_days having max(o.created_at)<=now()-make_interval(days=>c.inactive_days)) q where not exists(select 1 from crm_suppression_list s where lower(trim(s.email))=q.email)
  on conflict (lifecycle_key) where lifecycle_key is not null do nothing;
  return v_count;
end $$;
revoke all on function public.enqueue_customer_lifecycle_email_events() from public; grant execute on function public.enqueue_customer_lifecycle_email_events() to service_role;

-- The earlier signup message is promotional too; preserve its durable outbox but gate it
-- behind the separate lifecycle switch and the same preference/suppression protections.
create or replace function public.enqueue_signup_no_order_email_events() returns integer language plpgsql security definer set search_path=public as $$
declare v_count integer;
begin
 insert into customer_email_events(user_id,event_type,recipient)
 select p.id,'signup_no_order',lower(trim(p.email)) from profiles p cross join customer_email_automation_config c
 where c.lifecycle_enabled and p.created_at >= c.launch_at and p.created_at <= now()-make_interval(hours=>c.first_order_delay_hours)
 and nullif(trim(p.email),'') is not null and coalesce((p.notification_preferences->>'marketing')::boolean,false)
 and p.role <> 'admin' and p.email !~* '(^|[+.])(test|internal)([+.@]|$)'
 and not exists(select 1 from orders o where o.user_id=p.id)
 and not exists(select 1 from crm_suppression_list s where lower(trim(s.email))=lower(trim(p.email))) on conflict do nothing;
 get diagnostics v_count=row_count; return v_count;
end $$;
revoke all on function public.enqueue_signup_no_order_email_events() from public; grant execute on function public.enqueue_signup_no_order_email_events() to service_role;
