alter table public.crm_outreach_settings
  add column if not exists autopilot_min_score integer not null default 60,
  add column if not exists autopilot_daily_enroll_limit integer not null default 5,
  add column if not exists autopilot_max_sends_per_run integer not null default 3,
  add column if not exists autopilot_pause_on_complaint boolean not null default true,
  add column if not exists autopilot_bounce_rate_threshold numeric not null default 0.10;

alter table public.crm_outreach_settings
  drop constraint if exists crm_outreach_settings_autopilot_min_score_check,
  add constraint crm_outreach_settings_autopilot_min_score_check check (autopilot_min_score between 0 and 100),
  drop constraint if exists crm_outreach_settings_autopilot_daily_enroll_limit_check,
  add constraint crm_outreach_settings_autopilot_daily_enroll_limit_check check (autopilot_daily_enroll_limit between 1 and 50),
  drop constraint if exists crm_outreach_settings_autopilot_max_sends_per_run_check,
  add constraint crm_outreach_settings_autopilot_max_sends_per_run_check check (autopilot_max_sends_per_run between 1 and 10),
  drop constraint if exists crm_outreach_settings_autopilot_bounce_rate_threshold_check,
  add constraint crm_outreach_settings_autopilot_bounce_rate_threshold_check check (autopilot_bounce_rate_threshold > 0 and autopilot_bounce_rate_threshold <= 1);

alter table public.crm_lead_enrollments
  add column if not exists automation_source text not null default 'manual';

alter table public.crm_lead_enrollments
  drop constraint if exists crm_lead_enrollments_automation_source_check,
  add constraint crm_lead_enrollments_automation_source_check check (automation_source in ('manual','autopilot'));

alter table public.crm_outreach_messages
  add column if not exists attempt_count integer not null default 0,
  add column if not exists processing_started_at timestamptz,
  add column if not exists automation_source text not null default 'manual';

alter table public.crm_outreach_messages
  drop constraint if exists crm_outreach_messages_attempt_count_check,
  add constraint crm_outreach_messages_attempt_count_check check (attempt_count between 0 and 20),
  drop constraint if exists crm_outreach_messages_automation_source_check,
  add constraint crm_outreach_messages_automation_source_check check (automation_source in ('manual','autopilot'));

create unique index if not exists crm_outreach_messages_enrollment_step_unique
  on public.crm_outreach_messages(enrollment_id, step_number)
  where enrollment_id is not null and step_number is not null;

create or replace function public.refresh_crm_outreach_autopilot()
returns integer
language plpgsql
security invoker
set search_path = 'public'
as $function$
declare
  cfg public.crm_outreach_settings%rowtype;
  seq public.crm_outreach_sequences%rowtype;
  active_sequence_count integer;
  enrolled_today integer;
  slots integer;
  inserted_count integer := 0;
  day_start timestamptz;
begin
  select * into cfg from public.crm_outreach_settings where id = 1;
  if not found or not cfg.enabled or not cfg.auto_send or cfg.provider <> 'resend' then
    return 0;
  end if;

  select count(*) into active_sequence_count
  from public.crm_outreach_sequences
  where status = 'active';

  if active_sequence_count <> 1 then
    return 0;
  end if;

  select * into seq
  from public.crm_outreach_sequences
  where status = 'active'
  limit 1;

  day_start := date_trunc('day', now() at time zone coalesce(cfg.default_timezone,'Asia/Kolkata'))
               at time zone coalesce(cfg.default_timezone,'Asia/Kolkata');

  select count(*) into enrolled_today
  from public.crm_lead_enrollments
  where automation_source = 'autopilot'
    and created_at >= day_start;

  slots := greatest(0, cfg.autopilot_daily_enroll_limit - enrolled_today);
  if slots <= 0 then
    return 0;
  end if;

  with ranked_candidates as (
    select
      l.id as lead_id,
      c.id as contact_id,
      row_number() over (
        partition by l.id
        order by c.is_primary desc, c.discovered_at asc nulls last, c.created_at asc
      ) as contact_rank,
      s.score
    from public.crm_leads l
    join public.crm_lead_scores s on s.lead_id = l.id
    join public.crm_lead_contacts c on c.lead_id = l.id
    where s.score >= cfg.autopilot_min_score
      and s.grade in ('warm','hot')
      and l.status in ('new','researching','ready')
      and nullif(btrim(l.recommended_service),'') is not null
      and not public.crm_is_internal_operational_test_lead(l.source_name,l.business_name)
      and c.verification_status = 'valid'
      and c.email_type = 'business'
      and c.compliance_status = 'eligible'
      and c.contact_basis in ('public_business_contact','existing_relationship','consent')
      and c.opted_out_at is null
      and not exists (
        select 1 from public.crm_suppression_list x
        where lower(btrim(x.email)) = lower(btrim(c.email))
      )
      and not exists (
        select 1 from public.crm_inbound_messages i
        where i.contact_id = c.id
      )
      and not exists (
        select 1 from public.crm_lead_enrollments e
        where e.lead_id = l.id
          and e.contact_id = c.id
          and e.sequence_id = seq.id
      )
      and not exists (
        select 1 from public.crm_outreach_messages m
        where m.contact_id = c.id
          and m.direction = 'outbound'
          and m.status in ('sent','delivered','replied')
          and m.sent_at >= now() - interval '90 days'
      )
  ),
  chosen as (
    select lead_id, contact_id
    from ranked_candidates
    where contact_rank = 1
    order by score desc, lead_id
    limit slots
  ),
  inserted as (
    insert into public.crm_lead_enrollments(
      lead_id,contact_id,sequence_id,status,current_step,next_send_at,automation_source
    )
    select lead_id,contact_id,seq.id,'active',0,now(),'autopilot'
    from chosen
    on conflict (lead_id,contact_id,sequence_id) do nothing
    returning lead_id,sequence_id
  )
  insert into public.crm_lead_activities(lead_id,activity_type,details)
  select lead_id,'outreach_queued',jsonb_build_object(
    'automation','autopilot',
    'sequence_id',sequence_id,
    'status','enrolled'
  )
  from inserted;

  get diagnostics inserted_count = row_count;
  return inserted_count;
end
$function$;

create or replace function public.enqueue_due_crm_outreach_messages()
returns integer
language plpgsql
security invoker
set search_path = 'public'
as $function$
declare
  cfg public.crm_outreach_settings%rowtype;
  seq public.crm_outreach_sequences%rowtype;
  active_sequence_count integer;
  global_sent_today integer;
  sequence_sent_today integer;
  remaining integer;
  local_now time;
  within_window boolean;
  day_start timestamptz;
  inserted_count integer := 0;
begin
  select * into cfg from public.crm_outreach_settings where id = 1;
  if not found or not cfg.enabled or not cfg.auto_send or cfg.provider <> 'resend' then
    return 0;
  end if;

  select count(*) into active_sequence_count
  from public.crm_outreach_sequences
  where status = 'active';
  if active_sequence_count <> 1 then
    return 0;
  end if;

  select * into seq from public.crm_outreach_sequences where status = 'active' limit 1;

  local_now := (now() at time zone coalesce(seq.timezone,cfg.default_timezone,'Asia/Kolkata'))::time;
  within_window := case
    when seq.send_window_start < seq.send_window_end
      then local_now >= seq.send_window_start and local_now < seq.send_window_end
    else local_now >= seq.send_window_start or local_now < seq.send_window_end
  end;
  if not within_window then
    return 0;
  end if;

  day_start := date_trunc('day', now() at time zone coalesce(seq.timezone,cfg.default_timezone,'Asia/Kolkata'))
               at time zone coalesce(seq.timezone,cfg.default_timezone,'Asia/Kolkata');

  select count(*) into global_sent_today
  from public.crm_outreach_messages
  where automation_source = 'autopilot'
    and provider_message_id is not null
    and sent_at >= day_start;

  select count(*) into sequence_sent_today
  from public.crm_outreach_messages
  where automation_source = 'autopilot'
    and sequence_id = seq.id
    and provider_message_id is not null
    and sent_at >= day_start;

  remaining := least(
    greatest(0,cfg.global_daily_send_limit-global_sent_today),
    greatest(0,seq.daily_send_limit-sequence_sent_today)
  );

  if remaining <= 0 then
    return 0;
  end if;

  insert into public.crm_outreach_messages(
    enrollment_id,lead_id,contact_id,sequence_id,step_number,direction,
    subject,body,status,provider,scheduled_at,automation_source
  )
  select
    e.id,e.lead_id,e.contact_id,e.sequence_id,st.step_number,'outbound',
    st.subject_template,st.body_template,'queued','resend',now(),'autopilot'
  from public.crm_lead_enrollments e
  join public.crm_leads l on l.id = e.lead_id
  join public.crm_lead_contacts c on c.id = e.contact_id
  join public.crm_lead_scores ls on ls.lead_id = e.lead_id
  join public.crm_outreach_sequence_steps st
    on st.sequence_id = e.sequence_id
   and st.step_number = e.current_step + 1
  where e.sequence_id = seq.id
    and e.automation_source = 'autopilot'
    and e.status = 'active'
    and e.next_send_at is not null
    and e.next_send_at <= now()
    and l.status in ('new','researching','ready','contacted')
    and ls.score >= cfg.autopilot_min_score
    and ls.grade in ('warm','hot')
    and c.verification_status = 'valid'
    and c.email_type = 'business'
    and c.compliance_status = 'eligible'
    and c.contact_basis in ('public_business_contact','existing_relationship','consent')
    and c.opted_out_at is null
    and not exists (
      select 1 from public.crm_suppression_list x
      where lower(btrim(x.email)) = lower(btrim(c.email))
    )
    and not exists (
      select 1 from public.crm_inbound_messages i
      where i.contact_id = c.id
        and i.received_at >= e.created_at
    )
  order by e.next_send_at,e.created_at
  limit remaining
  on conflict (enrollment_id,step_number)
    where enrollment_id is not null and step_number is not null
  do nothing;

  get diagnostics inserted_count = row_count;
  return inserted_count;
end
$function$;

create or replace function public.claim_next_crm_outreach_message()
returns setof public.crm_outreach_messages
language plpgsql
security invoker
set search_path = 'public'
as $function$
declare
  cfg public.crm_outreach_settings%rowtype;
  picked uuid;
  sent_today integer;
  day_start timestamptz;
begin
  select * into cfg from public.crm_outreach_settings where id = 1;
  if not found or not cfg.enabled or not cfg.auto_send or cfg.provider <> 'resend' then
    return;
  end if;

  day_start := date_trunc('day', now() at time zone coalesce(cfg.default_timezone,'Asia/Kolkata'))
               at time zone coalesce(cfg.default_timezone,'Asia/Kolkata');

  select count(*) into sent_today
  from public.crm_outreach_messages
  where automation_source = 'autopilot'
    and provider_message_id is not null
    and sent_at >= day_start;

  if sent_today >= cfg.global_daily_send_limit then
    return;
  end if;

  select m.id into picked
  from public.crm_outreach_messages m
  join public.crm_lead_enrollments e on e.id = m.enrollment_id
  join public.crm_outreach_sequences s on s.id = m.sequence_id
  where m.automation_source = 'autopilot'
    and m.direction = 'outbound'
    and m.provider = 'resend'
    and m.provider_message_id is null
    and e.automation_source = 'autopilot'
    and e.status = 'active'
    and s.status = 'active'
    and (
      case
        when s.send_window_start < s.send_window_end
          then (now() at time zone coalesce(s.timezone,cfg.default_timezone,'Asia/Kolkata'))::time >= s.send_window_start
           and (now() at time zone coalesce(s.timezone,cfg.default_timezone,'Asia/Kolkata'))::time < s.send_window_end
        else (now() at time zone coalesce(s.timezone,cfg.default_timezone,'Asia/Kolkata'))::time >= s.send_window_start
          or (now() at time zone coalesce(s.timezone,cfg.default_timezone,'Asia/Kolkata'))::time < s.send_window_end
      end
    )
    and (
      m.status = 'queued'
      or (m.status = 'failed' and m.attempt_count < 3 and m.updated_at <= now() - interval '15 minutes')
      or (m.status = 'sending' and m.processing_started_at < now() - interval '15 minutes')
    )
  order by
    case when m.status = 'queued' then 0 when m.status = 'sending' then 1 else 2 end,
    coalesce(m.scheduled_at,m.created_at),
    m.created_at
  for update of m skip locked
  limit 1;

  if picked is null then
    return;
  end if;

  return query
  update public.crm_outreach_messages
  set status = 'sending',
      attempt_count = attempt_count + 1,
      processing_started_at = now(),
      error_message = null,
      updated_at = now()
  where id = picked
  returning *;
end
$function$;

revoke all on function public.refresh_crm_outreach_autopilot() from public, anon, authenticated;
revoke all on function public.enqueue_due_crm_outreach_messages() from public, anon, authenticated;
revoke all on function public.claim_next_crm_outreach_message() from public, anon, authenticated;
grant execute on function public.refresh_crm_outreach_autopilot() to service_role;
grant execute on function public.enqueue_due_crm_outreach_messages() to service_role;
grant execute on function public.claim_next_crm_outreach_message() to service_role;

do $block$
declare
  existing_job record;
begin
  for existing_job in
    select jobid from cron.job where jobname = 'socialrush-crm-outreach-autopilot'
  loop
    perform cron.unschedule(existing_job.jobid);
  end loop;
end
$block$;

select cron.schedule(
  'socialrush-crm-outreach-autopilot',
  '*/15 * * * *',
  $cron$
    select net.http_get(
      url := 'https://www.getsocialrush.com/api/cron/crm-outreach',
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
  $cron$
);

update public.crm_outreach_settings
set
  auto_send = false,
  autopilot_min_score = 60,
  autopilot_daily_enroll_limit = 5,
  autopilot_max_sends_per_run = 3,
  autopilot_pause_on_complaint = true,
  autopilot_bounce_rate_threshold = 0.10,
  updated_at = now()
where id = 1;
