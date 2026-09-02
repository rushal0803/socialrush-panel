-- A webhook is only deduplicated after its application work completes.
-- Historical rows were written by the original one-shot dedupe implementation,
-- so they represent events that must remain treated as already processed.
alter table public.crm_resend_webhook_events
  add column if not exists status text,
  add column if not exists attempt_count integer not null default 0,
  add column if not exists processed_at timestamptz,
  add column if not exists last_error text,
  add column if not exists updated_at timestamptz not null default now();

update public.crm_resend_webhook_events
set status = 'processed',
    processed_at = coalesce(processed_at, created_at),
    updated_at = coalesce(updated_at, created_at)
where status is null;

alter table public.crm_resend_webhook_events
  alter column status set default 'received',
  alter column status set not null;

alter table public.crm_resend_webhook_events
  drop constraint if exists crm_resend_webhook_events_status_check;
alter table public.crm_resend_webhook_events
  add constraint crm_resend_webhook_events_status_check
  check (status in ('received', 'processing', 'processed', 'failed'));

create index if not exists crm_resend_webhook_events_retry_idx
  on public.crm_resend_webhook_events (status, updated_at);

-- Atomically claim an event so concurrent Resend deliveries cannot run the
-- application workflow twice. Failed and never-started events are retryable.
create or replace function public.claim_crm_resend_webhook_event(p_event_id text, p_event_type text)
returns text
language plpgsql
set search_path = public
as $$
declare
  claimed_status text;
begin
  insert into public.crm_resend_webhook_events (event_id, event_type, status, attempt_count, updated_at)
  values (p_event_id, p_event_type, 'processing', 1, now())
  on conflict (event_id) do update
    set event_type = excluded.event_type,
        status = 'processing',
        attempt_count = public.crm_resend_webhook_events.attempt_count + 1,
        last_error = null,
        updated_at = now()
    where public.crm_resend_webhook_events.status in ('received', 'failed')
  returning status into claimed_status;

  if found then return 'claimed'; end if;
  select status into claimed_status from public.crm_resend_webhook_events where event_id = p_event_id;
  if claimed_status = 'processed' then return 'duplicate'; end if;
  return 'in_progress';
end;
$$;
