-- CRM lead acquisition Autopilot v2
-- Connects official-site discovery -> candidate qualification -> lead promotion -> fit scoring -> outreach enrollment.

create or replace function public.promote_qualified_crm_candidates(p_limit integer default 20)
returns integer
language plpgsql
set search_path to 'public'
as $function$
declare
  v_candidate public.crm_lead_candidates%rowtype;
  v_lead_id uuid;
  v_existing_lead_id uuid;
  v_promoted integer := 0;
begin
  if p_limit is null or p_limit < 1 or p_limit > 100 then
    raise exception 'p_limit must be between 1 and 100';
  end if;

  for v_candidate in
    select c.*
    from public.crm_lead_candidates c
    where c.promoted_lead_id is null
      and c.qualification_status in ('new','researching','qualified','ready')
      and c.fit_score >= 60
      and c.fit_grade in ('good_fit','high_fit')
      and c.compliance_status = 'eligible'
      and c.email_verification_status = 'valid'
      and c.email_type in ('business','role')
      and nullif(btrim(c.business_email),'') is not null
      and nullif(btrim(c.domain),'') is not null
      and nullif(btrim(c.website_url),'') is not null
      and nullif(btrim(c.recommended_service),'') is not null
      and (c.duplicate_lead_id is null or coalesce(c.duplicate_override,false))
      and coalesce(c.source_name,'') <> 'Internal Resend E2E Test'
      and coalesce(c.business_name,'') <> 'SocialRUSH Internal Test'
      and (
        lower(split_part(btrim(c.business_email),'@',2)) = lower(btrim(c.domain))
        or lower(split_part(btrim(c.business_email),'@',2)) like '%.' || lower(btrim(c.domain))
      )
      and not exists (
        select 1
        from public.crm_suppression_list s
        where lower(btrim(s.email)) = lower(btrim(c.business_email))
      )
    order by c.fit_score desc, c.discovered_at asc nulls last, c.created_at asc
    for update skip locked
    limit p_limit
  loop
    v_existing_lead_id := null;

    select l.id
    into v_existing_lead_id
    from public.crm_leads l
    where lower(btrim(coalesce(l.domain,''))) = lower(btrim(v_candidate.domain))
       or exists (
         select 1
         from public.crm_lead_contacts lc
         where lc.lead_id = l.id
           and lower(btrim(lc.email)) = lower(btrim(v_candidate.business_email))
       )
    limit 1;

    if v_existing_lead_id is not null then
      update public.crm_lead_candidates
      set duplicate_lead_id = v_existing_lead_id,
          duplicate_kind = 'exact',
          qualification_status = 'duplicate',
          updated_at = now()
      where id = v_candidate.id;

      insert into public.crm_candidate_activities(candidate_id,activity_type,details,created_by)
      values (
        v_candidate.id,
        'duplicate_detected',
        jsonb_build_object('lead_id',v_existing_lead_id,'automation','autopilot_v2'),
        v_candidate.created_by
      );
      continue;
    end if;

    begin
      insert into public.crm_leads(
        business_name,domain,website_url,country,city,industry,company_type,employee_range,
        instagram_url,linkedin_url,youtube_url,tiktok_url,
        source,source_name,source_url,status,priority,score,fit_summary,recommended_service,
        discovered_at,created_by,updated_at
      )
      values (
        v_candidate.business_name,
        lower(btrim(v_candidate.domain)),
        v_candidate.website_url,
        v_candidate.country,
        v_candidate.city,
        v_candidate.industry,
        case
          when lower(coalesce(v_candidate.company_type,'')) like '%agency%' then 'agency'
          when lower(coalesce(v_candidate.company_type,'')) like '%creator%' then 'creator'
          when lower(coalesce(v_candidate.company_type,'')) like '%startup%' then 'startup'
          else 'business'
        end,
        v_candidate.employee_range,
        v_candidate.instagram_url,
        v_candidate.linkedin_url,
        v_candidate.youtube_url,
        v_candidate.tiktok_url,
        'web',
        v_candidate.source_name,
        coalesce(v_candidate.source_url,v_candidate.website_url),
        'ready',
        case when v_candidate.fit_score >= 80 then 'high' else 'normal' end,
        v_candidate.fit_score,
        coalesce(
          nullif(btrim(v_candidate.recommendation_reason),''),
          'Automated ICP fit score ' || v_candidate.fit_score::text
        ),
        v_candidate.recommended_service,
        coalesce(v_candidate.discovered_at,v_candidate.created_at,now()),
        v_candidate.created_by,
        now()
      )
      returning id into v_lead_id;

      insert into public.crm_lead_contacts(
        lead_id,full_name,job_title,email,email_type,verification_status,compliance_status,
        contact_basis,is_primary,source_url,discovered_at,updated_at
      )
      values (
        v_lead_id,
        nullif(btrim(v_candidate.contact_name),''),
        nullif(btrim(v_candidate.contact_role),''),
        lower(btrim(v_candidate.business_email)),
        'business',
        'valid',
        'eligible',
        'public_business_contact',
        true,
        coalesce(v_candidate.source_url,v_candidate.website_url),
        coalesce(v_candidate.discovered_at,v_candidate.created_at,now()),
        now()
      );

      update public.crm_lead_candidates
      set qualification_status = 'promoted',
          research_status = 'complete',
          promoted_lead_id = v_lead_id,
          promoted_at = now(),
          updated_at = now()
      where id = v_candidate.id;

      insert into public.crm_candidate_activities(candidate_id,activity_type,details,created_by)
      values (
        v_candidate.id,
        'promoted',
        jsonb_build_object(
          'lead_id',v_lead_id,
          'fit_score',v_candidate.fit_score,
          'recommended_service',v_candidate.recommended_service,
          'automation','autopilot_v2'
        ),
        v_candidate.created_by
      );

      insert into public.crm_lead_activities(lead_id,activity_type,details,created_by)
      values
        (
          v_lead_id,
          'discovered',
          jsonb_build_object('source','candidate_promotion','candidate_id',v_candidate.id,'automation','autopilot_v2'),
          v_candidate.created_by
        ),
        (
          v_lead_id,
          'contact_added',
          jsonb_build_object('source','official_business_website','email_verified',true,'automation','autopilot_v2'),
          v_candidate.created_by
        ),
        (
          v_lead_id,
          'qualified',
          jsonb_build_object('fit_score',v_candidate.fit_score,'automation','autopilot_v2'),
          v_candidate.created_by
        );

      v_promoted := v_promoted + 1;
    exception
      when unique_violation then
        select l.id
        into v_existing_lead_id
        from public.crm_leads l
        left join public.crm_lead_contacts lc on lc.lead_id = l.id
        where lower(btrim(coalesce(l.domain,''))) = lower(btrim(v_candidate.domain))
           or lower(btrim(coalesce(lc.email,''))) = lower(btrim(v_candidate.business_email))
        limit 1;

        update public.crm_lead_candidates
        set duplicate_lead_id = v_existing_lead_id,
            duplicate_kind = case when v_existing_lead_id is not null then 'exact' else duplicate_kind end,
            qualification_status = case when v_existing_lead_id is not null then 'duplicate' else qualification_status end,
            updated_at = now()
        where id = v_candidate.id;
    end;
  end loop;

  return v_promoted;
end
$function$;

create or replace function public.refresh_crm_lead_fit_scores()
returns integer
language plpgsql
set search_path to 'public'
as $function$
declare
  v_count integer := 0;
begin
  insert into public.crm_lead_scores(
    lead_id,score,grade,score_reasons,calculated_at,updated_at
  )
  select
    l.id,
    least(100,greatest(0,coalesce(l.score,0))),
    case
      when coalesce(l.score,0) >= 80 then 'hot'
      when coalesce(l.score,0) >= 60 then 'warm'
      when coalesce(l.score,0) >= 30 then 'nurture'
      else 'low'
    end,
    jsonb_build_array(
      jsonb_build_object(
        'points',least(100,greatest(0,coalesce(l.score,0))),
        'reason','Verified prospect fit baseline'
      )
    ),
    now(),
    now()
  from public.crm_leads l
  where l.status <> 'do_not_contact'
    and not public.crm_is_internal_operational_test_lead(l.source_name,l.business_name)
    and not exists (
      select 1
      from public.crm_inbound_messages i
      where i.lead_id = l.id
    )
  on conflict (lead_id) do update
  set score = excluded.score,
      grade = excluded.grade,
      score_reasons = excluded.score_reasons,
      calculated_at = excluded.calculated_at,
      updated_at = excluded.updated_at;

  get diagnostics v_count = row_count;
  return v_count;
end
$function$;

create or replace function public.refresh_crm_prospecting_pipeline()
returns integer
language plpgsql
set search_path to 'public'
as $function$
declare
  v_promoted integer := 0;
begin
  perform public.refresh_crm_prospecting_intelligence();
  v_promoted := public.promote_qualified_crm_candidates(20);
  perform public.refresh_crm_lead_fit_scores();
  return v_promoted;
end
$function$;

-- Keep automated outreach tightly aligned to the configured ICP country.
create or replace function public.refresh_crm_outreach_autopilot()
returns integer
language plpgsql
set search_path to 'public'
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
      and exists (
        select 1
        from public.crm_icp_config icp,
             unnest(icp.target_countries) target_country
        where icp.id = true
          and lower(btrim(target_country)) = lower(btrim(coalesce(l.country,'')))
      )
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

-- Explicitly enforce the requested caps.
update public.crm_outreach_settings
set autopilot_daily_enroll_limit = 5,
    global_daily_send_limit = 10,
    updated_at = now()
where id = 1;

-- Give discovery enough search budget to realistically produce up to five qualified leads.
update public.crm_prospect_discovery_settings
set daily_search_limit = greatest(daily_search_limit,8),
    updated_at = now()
where id = true;

do $do$
declare
  v_job_id bigint;
begin
  select jobid into v_job_id
  from cron.job
  where jobname = 'socialrush-crm-prospecting-daily';

  if v_job_id is not null then
    perform cron.alter_job(
      job_id := v_job_id,
      command := 'select public.refresh_crm_prospecting_pipeline(); select public.refresh_crm_prospecting_brief();'
    );
  end if;
end
$do$;

revoke all on function public.promote_qualified_crm_candidates(integer) from public;
revoke all on function public.refresh_crm_lead_fit_scores() from public;
revoke all on function public.refresh_crm_prospecting_pipeline() from public;
revoke all on function public.refresh_crm_outreach_autopilot() from public;

grant execute on function public.promote_qualified_crm_candidates(integer) to service_role;
grant execute on function public.refresh_crm_lead_fit_scores() to service_role;
grant execute on function public.refresh_crm_prospecting_pipeline() to service_role;
grant execute on function public.refresh_crm_outreach_autopilot() to service_role;
