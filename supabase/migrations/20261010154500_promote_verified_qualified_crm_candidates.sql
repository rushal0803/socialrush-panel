create or replace function public.promote_ready_crm_lead_candidates()
returns integer
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  candidate record;
  new_lead_id uuid;
  promoted_count integer := 0;
begin
  for candidate in
    select c.*
    from public.crm_lead_candidates c
    where c.qualification_status not in ('blocked','rejected','promoted','duplicate')
      and c.compliance_status='eligible'
      and c.email_verification_status='valid'
      and c.email_type in ('business','role')
      and nullif(btrim(c.business_email),'') is not null
      and coalesce(c.fit_score,0) >= 60
      and c.fit_grade in ('good_fit','high_fit')
      and nullif(btrim(c.recommended_service),'') is not null
      and c.duplicate_lead_id is null
      and c.blocked_reason is null
      and not public.crm_is_internal_operational_test_lead(c.source_name,c.business_name)
      and not exists (
        select 1 from public.crm_suppression_list s
        where lower(btrim(s.email))=lower(btrim(c.business_email))
      )
      and not exists (
        select 1 from public.crm_leads l
        where c.domain is not null
          and lower(coalesce(l.domain,''))=lower(c.domain)
      )
      and not exists (
        select 1 from public.crm_lead_contacts x
        where lower(btrim(x.email))=lower(btrim(c.business_email))
      )
    order by coalesce(c.fit_score,0) desc, c.discovered_at asc
  loop
    insert into public.crm_leads(
      business_name,domain,website_url,country,city,industry,company_type,employee_range,
      instagram_url,linkedin_url,youtube_url,tiktok_url,
      source,source_name,source_url,status,score,fit_summary,recommended_service,
      discovered_at,created_by,priority,created_at,updated_at
    )
    values(
      candidate.business_name,candidate.domain,candidate.website_url,candidate.country,candidate.city,
      candidate.industry,
      case
        when lower(coalesce(candidate.company_type,'')) like '%agency%' then 'agency'
        when lower(coalesce(candidate.company_type,'')) like '%startup%' then 'startup'
        when lower(coalesce(candidate.company_type,'')) like '%creator%' then 'creator'
        else 'business'
      end,
      candidate.employee_range,candidate.instagram_url,candidate.linkedin_url,candidate.youtube_url,
      candidate.tiktok_url,'web',candidate.source_name,candidate.source_url,'ready',
      coalesce(candidate.fit_score,60),
      coalesce(nullif(btrim(candidate.recommendation_reason),''),'Qualified discovery candidate with verified public business contact'),
      candidate.recommended_service,coalesce(candidate.discovered_at,now()),candidate.created_by,
      case when coalesce(candidate.fit_score,0)>=80 then 'high' else 'normal' end,
      now(),now()
    )
    returning id into new_lead_id;

    insert into public.crm_lead_contacts(
      lead_id,full_name,job_title,email,email_type,verification_status,compliance_status,
      contact_basis,is_primary,source_url,discovered_at,created_at,updated_at
    )
    values(
      new_lead_id,nullif(btrim(candidate.contact_name),''),nullif(btrim(candidate.contact_role),''),
      lower(btrim(candidate.business_email)),'business','valid','eligible','public_business_contact',
      true,candidate.source_url,coalesce(candidate.discovered_at,now()),now(),now()
    );

    insert into public.crm_lead_scores(lead_id,score,grade,score_reasons,calculated_at,updated_at)
    values(
      new_lead_id,coalesce(candidate.fit_score,60),
      case when coalesce(candidate.fit_score,0)>=80 then 'hot' else 'warm' end,
      coalesce(candidate.fit_reasons,'[]'::jsonb),now(),now()
    )
    on conflict (lead_id) do update
    set score=excluded.score,grade=excluded.grade,score_reasons=excluded.score_reasons,
        calculated_at=excluded.calculated_at,updated_at=excluded.updated_at;

    insert into public.crm_lead_activities(lead_id,activity_type,details,created_by,created_at)
    values(
      new_lead_id,'lead_promoted',
      jsonb_build_object('automation','qualified_candidate_promotion','candidate_id',candidate.id,
        'fit_score',candidate.fit_score,'fit_grade',candidate.fit_grade,
        'recommended_service',candidate.recommended_service),
      candidate.created_by,now()
    );

    update public.crm_lead_candidates
    set qualification_status='promoted',promoted_lead_id=new_lead_id,promoted_at=now(),updated_at=now()
    where id=candidate.id;

    promoted_count := promoted_count + 1;
  end loop;
  return promoted_count;
end
$function$;

revoke all on function public.promote_ready_crm_lead_candidates() from public;
grant execute on function public.promote_ready_crm_lead_candidates() to service_role;
