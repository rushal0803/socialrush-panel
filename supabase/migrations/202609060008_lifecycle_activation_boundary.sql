-- Lifecycle marketing starts prospectively. Existing customers and orders must
-- never be picked up merely because an administrator enables the feature.
alter table public.customer_email_automation_config
  add column if not exists lifecycle_activation_at timestamptz;

create or replace function public.set_customer_lifecycle_activation_at()
returns trigger language plpgsql set search_path=public as $$
begin
  if not old.lifecycle_enabled and new.lifecycle_enabled then
    new.lifecycle_activation_at := now();
  end if;
  return new;
end $$;

drop trigger if exists customer_lifecycle_activation_boundary on public.customer_email_automation_config;
create trigger customer_lifecycle_activation_boundary
before update of lifecycle_enabled on public.customer_email_automation_config
for each row execute function public.set_customer_lifecycle_activation_at();

create or replace function public.enqueue_customer_lifecycle_email_events() returns integer language plpgsql security definer set search_path=public as $$
declare v_count integer := 0; v_inserted integer := 0;
begin
  insert into customer_email_events(user_id,event_type,recipient,lifecycle_key)
  select p.id,'first_order_reminder',lower(trim(p.email)),'first_order_reminder:'||p.id::text||':'||(p.created_at at time zone 'UTC')::date
  from profiles p cross join customer_email_automation_config c
  where c.lifecycle_enabled and c.lifecycle_activation_at is not null
    and p.created_at >= c.lifecycle_activation_at
    and p.role <> 'admin' and p.created_at <= now()-make_interval(hours=>c.first_order_delay_hours)
    and coalesce((p.notification_preferences->>'marketing')::boolean,false) and nullif(trim(p.email),'') is not null
    and p.email !~* '(^|[+.])(test|internal)([+.@]|$)' and not exists(select 1 from orders o where o.user_id=p.id and o.status not in ('cancelled','refunded','failed') and coalesce(o.payment_status,'paid') not in ('cancelled','refunded','failed'))
    and not exists(select 1 from crm_suppression_list s where lower(trim(s.email))=lower(trim(p.email)))
  on conflict (lifecycle_key) where lifecycle_key is not null do nothing;
  get diagnostics v_inserted=row_count; v_count := v_count + v_inserted;

  insert into customer_email_events(user_id,event_type,recipient,lifecycle_key)
  select q.user_id,'inactive_7d',q.email,'inactive_7d:'||q.user_id::text||':'||(q.last_order at time zone 'UTC')::date
  from (
    select p.id user_id, lower(trim(p.email)) email, max(o.created_at) last_order, c.inactive_days, c.lifecycle_activation_at
    from profiles p join orders o on o.user_id=p.id cross join customer_email_automation_config c
    where c.lifecycle_enabled and c.lifecycle_activation_at is not null and p.role <> 'admin'
      and coalesce((p.notification_preferences->>'marketing')::boolean,false) and nullif(trim(p.email),'') is not null
      and p.email !~* '(^|[+.])(test|internal)([+.@]|$)' and o.status not in ('cancelled','refunded','failed') and coalesce(o.payment_status,'paid') not in ('cancelled','refunded','failed')
    group by p.id,p.email,c.inactive_days,c.lifecycle_activation_at
    having max(o.created_at) >= c.lifecycle_activation_at and max(o.created_at) <= now()-make_interval(days=>c.inactive_days)
  ) q where not exists(select 1 from crm_suppression_list s where lower(trim(s.email))=q.email)
  on conflict (lifecycle_key) where lifecycle_key is not null do nothing;
  get diagnostics v_inserted=row_count; v_count := v_count + v_inserted;
  return v_count;
end $$;

revoke all on function public.enqueue_customer_lifecycle_email_events() from public;
grant execute on function public.enqueue_customer_lifecycle_email_events() to service_role;
