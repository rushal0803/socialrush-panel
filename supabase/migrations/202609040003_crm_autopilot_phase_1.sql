-- SocialRUSH Autopilot Phase 1: derived, admin-only operational intelligence.
-- This migration never sends outreach and never changes lead/customer source data.

create table if not exists public.crm_lead_scores (
  lead_id uuid primary key references public.crm_leads(id) on delete cascade,
  score integer not null check (score between 0 and 100),
  grade text not null check (grade in ('hot', 'warm', 'nurture', 'low', 'do_not_contact')),
  score_reasons jsonb not null default '[]'::jsonb,
  calculated_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists crm_lead_scores_rank_idx on public.crm_lead_scores (grade, score desc, calculated_at desc);

create table if not exists public.crm_daily_briefs (
  id uuid primary key default gen_random_uuid(),
  brief_date date not null unique,
  generated_at timestamptz not null default now(),
  summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.crm_automation_health_snapshots (
  id uuid primary key default gen_random_uuid(),
  captured_at timestamptz not null default now(),
  status text not null check (status in ('healthy', 'warning', 'critical')),
  summary jsonb not null default '{}'::jsonb
);
create index if not exists crm_automation_health_snapshots_captured_idx on public.crm_automation_health_snapshots (captured_at desc);

alter table public.crm_lead_scores enable row level security;
alter table public.crm_daily_briefs enable row level security;
alter table public.crm_automation_health_snapshots enable row level security;
create policy "admins read lead scores" on public.crm_lead_scores for select to authenticated using (public.is_admin());
create policy "admins read daily briefs" on public.crm_daily_briefs for select to authenticated using (public.is_admin());
create policy "admins read health snapshots" on public.crm_automation_health_snapshots for select to authenticated using (public.is_admin());

-- The function is intentionally derived-data only and is safe to run repeatedly.
create or replace function public.refresh_crm_autopilot()
returns void language plpgsql set search_path = public as $$
declare
  today_ist date := (now() at time zone 'Asia/Kolkata')::date;
  health jsonb;
  brief jsonb;
begin
  insert into crm_lead_scores (lead_id, score, grade, score_reasons, calculated_at, updated_at)
  select l.id,
    case when blockers.blocked then 0 else least(100, greatest(0, signals.score)) end,
    case when blockers.blocked then 'do_not_contact'
         when signals.score >= 80 then 'hot' when signals.score >= 60 then 'warm'
         when signals.score >= 30 then 'nurture' else 'low' end,
    case when blockers.blocked then jsonb_build_array(jsonb_build_object('points', -100, 'reason', blockers.reason)) else signals.reasons end,
    now(), now()
  from crm_leads l
  left join lateral (
    select exists(select 1 from crm_lead_contacts c where c.lead_id=l.id and (c.opted_out_at is not null or c.verification_status='invalid' or c.compliance_status='blocked')) as blocked,
      coalesce((select case when c.opted_out_at is not null then 'Unsubscribed' when c.verification_status='invalid' then 'Invalid or bounced email' else 'Suppressed or blocked contact' end from crm_lead_contacts c where c.lead_id=l.id and (c.opted_out_at is not null or c.verification_status='invalid' or c.compliance_status='blocked') limit 1), 'Do not contact') as reason
  ) blockers on true
  left join lateral (
    select coalesce(sum(points), 0)::int as score, coalesce(jsonb_agg(jsonb_build_object('points', points, 'reason', reason) order by points desc) filter(where points <> 0), '[]'::jsonb) as reasons
    from (
      select case max(m.classification) filter(where m.classification='meeting_request') when 'meeting_request' then 30 else 0 end points, 'Meeting request' reason from crm_inbound_messages m where m.lead_id=l.id
      union all select case max(m.classification) filter(where m.classification='interested') when 'interested' then 30 else 0 end, 'Interested reply' from crm_inbound_messages m where m.lead_id=l.id
      union all select case max(m.classification) filter(where m.classification='needs_information') when 'needs_information' then 20 else 0 end, 'Needs information' from crm_inbound_messages m where m.lead_id=l.id
      union all select case when exists(select 1 from crm_lead_contacts c where c.lead_id=l.id and c.verification_status='valid' and c.email_type='business') then 15 else 0 end, 'Verified business email'
      union all select case when l.recommended_service is not null and btrim(l.recommended_service) <> '' then 10 else 0 end, 'Recommended service available'
      union all select case when (select count(*) from crm_lead_contacts c where c.lead_id=l.id and c.verification_status <> 'invalid') > 1 then 10 else 0 end, 'Multiple useful contacts'
      union all select case when exists(select 1 from crm_outreach_messages o where o.lead_id=l.id and o.status in ('sent','delivered','replied')) then 10 else 0 end, 'Previous outbound engagement'
      union all select case max(m.classification) filter(where m.classification='negative_reply') when 'negative_reply' then -40 else 0 end, 'Negative reply' from crm_inbound_messages m where m.lead_id=l.id
      union all select case max(m.classification) filter(where m.classification='not_now') when 'not_now' then -25 else 0 end, 'Not now' from crm_inbound_messages m where m.lead_id=l.id
      union all select case max(m.classification) filter(where m.classification='wrong_person') when 'wrong_person' then -20 else 0 end, 'Wrong person' from crm_inbound_messages m where m.lead_id=l.id
      union all select case when l.status in ('qualified','replied') and coalesce(l.updated_at,l.created_at) < now() - interval '3 days' then -20 else 0 end, 'Stale without engagement'
    ) score_rows
  ) signals on true
  on conflict (lead_id) do update set score=excluded.score, grade=excluded.grade, score_reasons=excluded.score_reasons, calculated_at=excluded.calculated_at, updated_at=excluded.updated_at;

  select jsonb_build_object(
    'processed_24h', count(*) filter(where status='processed' and processed_at >= now()-interval '24 hours'),
    'failed_24h', count(*) filter(where status='failed' and updated_at >= now()-interval '24 hours'),
    'current_failures', count(*) filter(where status='failed'),
    'stuck_events', count(*) filter(where status='processing' and updated_at < now()-interval '15 minutes'),
    'latest_success_at', max(processed_at) filter(where status='processed'),
    'latest_failure_at', max(updated_at) filter(where status='failed')
  ) into health from crm_resend_webhook_events;
  insert into crm_automation_health_snapshots(status, summary) values (
    case when coalesce((health->>'current_failures')::int,0) > 0 or coalesce((health->>'stuck_events')::int,0) > 0 then 'critical'
         when coalesce((health->>'failed_24h')::int,0) > 0 then 'warning' else 'healthy' end, health);

  select jsonb_build_object(
    'hot_leads', (select count(*) from crm_lead_scores where grade='hot'),
    'interested_replies', (select count(*) from crm_inbound_messages where received_at >= date_trunc('day', now() at time zone 'Asia/Kolkata') at time zone 'Asia/Kolkata' and classification in ('interested','meeting_request')),
    'replies_needing_review', (select count(*) from crm_inbound_messages where received_at >= now()-interval '24 hours' and (needs_admin_review or classification='other')),
    'lead_followups_due', (select count(*) from crm_lead_reply_followups where status='pending' and due_at <= now()),
    'customer_followups_due', (select count(*) from crm_follow_ups where status='pending' and due_at <= now()),
    'automation_health', health
  ) into brief;
  insert into crm_daily_briefs(brief_date, generated_at, summary) values(today_ist, now(), brief)
  on conflict(brief_date) do update set generated_at=excluded.generated_at, summary=excluded.summary;
end $$;

create extension if not exists pg_cron with schema extensions;
do $$ begin
  if exists(select 1 from cron.job where jobname='socialrush-crm-autopilot-daily') then perform cron.unschedule('socialrush-crm-autopilot-daily'); end if;
end $$;
select cron.schedule('socialrush-crm-autopilot-daily', '30 2 * * *', 'select public.refresh_crm_autopilot();');
