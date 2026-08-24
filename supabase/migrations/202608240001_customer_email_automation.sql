-- Durable, server-dispatched customer email outbox. Events are created by the
-- database so every existing successful order creation path is covered.
alter table public.profiles
  alter column notification_preferences set default '{"orders":true,"payments":true,"support":true,"marketing":true,"security":true}'::jsonb;

create table if not exists public.customer_email_automation_config (
  id boolean primary key default true check (id),
  launch_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
insert into public.customer_email_automation_config (id) values (true) on conflict (id) do nothing;

create table if not exists public.customer_email_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  order_id uuid references public.orders(id) on delete cascade,
  event_type text not null check (event_type in ('signup_no_order','order_created','order_completed')),
  recipient text not null,
  status text not null default 'queued' check (status in ('queued','processing','sent','failed')),
  provider_message_id text,
  error_message text,
  attempt_count integer not null default 0,
  sent_at timestamptz,
  processing_started_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint customer_email_events_event_target check (
    (event_type = 'signup_no_order' and order_id is null) or
    (event_type in ('order_created','order_completed') and order_id is not null)
  )
);
create unique index if not exists customer_email_events_signup_once on public.customer_email_events(user_id,event_type) where event_type='signup_no_order';
create unique index if not exists customer_email_events_order_once on public.customer_email_events(order_id,event_type) where event_type in ('order_created','order_completed');
create index if not exists customer_email_events_dispatch_idx on public.customer_email_events(status,created_at) where status in ('queued','failed','processing');
alter table public.customer_email_events enable row level security;
-- No policies: normal users cannot read or mutate operational email records.

create or replace function public.queue_customer_order_email()
returns trigger language plpgsql security definer set search_path=public as $$
declare v_email text;
begin
  if tg_op='INSERT' then
    select email into v_email from public.profiles where id=new.user_id;
    if nullif(trim(v_email),'') is not null then
      insert into public.customer_email_events(user_id,order_id,event_type,recipient)
      values(new.user_id,new.id,'order_created',lower(trim(v_email)))
      on conflict do nothing;
    end if;
  elsif old.status is distinct from 'completed' and new.status='completed' then
    select email into v_email from public.profiles where id=new.user_id;
    if nullif(trim(v_email),'') is not null then
      insert into public.customer_email_events(user_id,order_id,event_type,recipient)
      values(new.user_id,new.id,'order_completed',lower(trim(v_email)))
      on conflict do nothing;
    end if;
  end if;
  return new;
end $$;
drop trigger if exists customer_order_email_events on public.orders;
create trigger customer_order_email_events after insert or update of status on public.orders
for each row execute function public.queue_customer_order_email();

-- Claims a single event atomically; stale claims are safely retried.
create or replace function public.claim_customer_email_event()
returns setof public.customer_email_events language plpgsql security definer set search_path=public as $$
begin
  return query
  with candidate as (
    select id from public.customer_email_events
    where (status in ('queued','failed') or (status='processing' and processing_started_at < now()-interval '15 minutes'))
    order by created_at for update skip locked limit 1
  )
  update public.customer_email_events e set status='processing',attempt_count=e.attempt_count+1,processing_started_at=now(),updated_at=now(),error_message=null
  from candidate where e.id=candidate.id returning e.*;
end $$;
revoke all on function public.claim_customer_email_event() from public;
grant execute on function public.claim_customer_email_event() to service_role;

-- Enqueue only accounts created after launch. This intentionally prevents a
-- deployment from contacting historical accounts with no orders.
create or replace function public.enqueue_signup_no_order_email_events()
returns integer language plpgsql security definer set search_path=public as $$
declare v_count integer;
begin
  insert into public.customer_email_events(user_id,event_type,recipient)
  select p.id,'signup_no_order',lower(trim(p.email))
  from public.profiles p cross join public.customer_email_automation_config c
  where p.created_at >= c.launch_at and p.created_at <= now()-interval '8 hours'
    and nullif(trim(p.email),'') is not null
    and coalesce((p.notification_preferences->>'marketing')::boolean,true)
    and not exists(select 1 from public.orders o where o.user_id=p.id)
  on conflict do nothing;
  get diagnostics v_count = row_count;
  return v_count;
end $$;
revoke all on function public.enqueue_signup_no_order_email_events() from public;
grant execute on function public.enqueue_signup_no_order_email_events() to service_role;
