-- Recover rows where Resend already accepted the message but a later retry was recorded as failed.
update public.customer_email_events
set status='sent',
    sent_at=coalesce(sent_at, updated_at, now()),
    processing_started_at=null,
    error_message='Recovered: provider had already accepted this email',
    updated_at=now()
where status='failed'
  and provider_message_id is not null;

-- Prevent one transiently failing event from being reclaimed repeatedly in the same run.
create or replace function public.claim_next_customer_email_event()
returns setof public.customer_email_events
language plpgsql
security definer
set search_path=public
as $$
declare
  picked uuid;
  cfg customer_email_automation_config%rowtype;
begin
  select id into picked
  from customer_email_events
  where (
      status='queued'
      or (status='failed' and updated_at < now()-interval '10 minutes')
      or (status='processing' and processing_started_at < now()-interval '15 minutes')
    )
    and event_type not in ('first_order_reminder','inactive_7d')
  order by created_at
  for update skip locked
  limit 1;

  if picked is not null then
    return query
    update customer_email_events
    set status='processing',
        attempt_count=attempt_count+1,
        processing_started_at=now(),
        updated_at=now(),
        error_message=null
    where id=picked
    returning *;
    return;
  end if;

  select * into cfg
  from customer_email_automation_config
  where id=true
  for update;

  if not found or not cfg.lifecycle_enabled then
    return;
  end if;

  if (
    select count(*)
    from customer_email_events x
    where x.event_type in ('first_order_reminder','inactive_7d')
      and (
        (x.status='sent' and x.provider_message_id is not null and x.sent_at>=date_trunc('day',now()))
        or (x.status='processing' and x.processing_started_at>=date_trunc('day',now()))
      )
  ) >= cfg.lifecycle_daily_limit then
    return;
  end if;

  select id into picked
  from customer_email_events
  where (
      status='queued'
      or (status='failed' and updated_at < now()-interval '10 minutes')
      or (status='processing' and processing_started_at < now()-interval '15 minutes')
    )
    and event_type in ('first_order_reminder','inactive_7d')
  order by created_at
  for update skip locked
  limit 1;

  if picked is not null then
    return query
    update customer_email_events
    set status='processing',
        attempt_count=attempt_count+1,
        processing_started_at=now(),
        updated_at=now(),
        error_message=null
    where id=picked
    returning *;
  end if;
end
$$;

revoke all on function public.claim_next_customer_email_event() from public;
grant execute on function public.claim_next_customer_email_event() to service_role;

-- Smaller application batches now run frequently; allow enough HTTP time for a normal batch.
select cron.alter_job(
  job_id := 1,
  schedule := '*/5 * * * *',
  command := $cmd$
    select net.http_get(
      url := 'https://www.getsocialrush.com/api/cron/email',
      headers := jsonb_build_object(
        'Authorization',
        'Bearer ' || (
          select decrypted_secret
          from vault.decrypted_secrets
          where name = 'socialrush_email_cron_secret'
        )
      ),
      timeout_milliseconds := 20000
    );
  $cmd$,
  active := true
);
