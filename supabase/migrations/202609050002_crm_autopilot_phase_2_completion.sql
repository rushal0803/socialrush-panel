-- Explicit admin decisions preserve source history and prevent repeated duplicate blocking.
alter table public.crm_lead_candidates add column if not exists duplicate_override boolean not null default false;
alter table public.crm_lead_candidates add column if not exists duplicate_resolution text check(duplicate_resolution in ('approved_separate','merged_existing','ignored'));
create index if not exists crm_candidates_research_idx on public.crm_lead_candidates(research_status, created_at desc);
create index if not exists crm_candidates_source_idx on public.crm_lead_candidates(source, source_external_id);

-- Extend (never replace) the Phase 1 brief with derived prospecting counts.
create or replace function public.refresh_crm_prospecting_brief() returns void language plpgsql set search_path=public as $$
declare d date := (now() at time zone 'Asia/Kolkata')::date; extra jsonb;
begin
 select jsonb_build_object('high_fit_prospects',count(*) filter(where fit_grade='high_fit'),'new_qualified_candidates',count(*) filter(where qualification_status in ('qualified','ready') and created_at >= now()-interval '24 hours'),'research_needed',count(*) filter(where research_status='needed'),'duplicate_candidates',count(*) filter(where duplicate_lead_id is not null and not duplicate_override),'suppressed_candidates',count(*) filter(where blocked_reason ilike 'Suppressed:%')) into extra from crm_lead_candidates where not public.crm_is_internal_operational_test_lead(source_name,business_name);
 extra:=extra||jsonb_build_object('qualified_leads_awaiting_action',(select count(*) from crm_leads l join crm_lead_intelligence i on i.lead_id=l.id where l.status='qualified' and i.next_best_action is not null and not public.crm_is_internal_operational_test_lead(l.source_name,l.business_name)),'stale_opportunities',(select count(*) from crm_leads l join crm_lead_intelligence i on i.lead_id=l.id where i.stale and not public.crm_is_internal_operational_test_lead(l.source_name,l.business_name)));
 update crm_daily_briefs set summary=summary||extra,generated_at=now() where brief_date=d;
end $$;
do $$ begin if exists(select 1 from cron.job where jobname='socialrush-crm-prospecting-daily') then perform cron.unschedule('socialrush-crm-prospecting-daily'); end if; end $$;
select cron.schedule('socialrush-crm-prospecting-daily', '45 2 * * *', 'select public.refresh_crm_prospecting_intelligence(); select public.refresh_crm_prospecting_brief();');
