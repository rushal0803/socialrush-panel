-- Fix Phase 2 refresh SQL after production validation exposed invalid
-- target-table references in UPDATE ... FROM LATERAL.

create or replace function public.refresh_crm_prospecting_intelligence()
returns void
language plpgsql
set search_path=public
as $$
declare
  cfg public.crm_icp_config%rowtype;
begin
  select * into cfg
  from public.crm_icp_config
  where id=true;

  update public.crm_lead_candidates c
  set
    domain = nullif(
      split_part(
        regexp_replace(
          regexp_replace(
            lower(coalesce(c.domain,c.website_url,'')),
            '^https?://',
            ''
          ),
          '^www\.',
          ''
        ),
        '/',
        1
      ),
      ''
    ),
    business_email = nullif(lower(trim(c.business_email)), ''),
    updated_at = now();

  with matches as (
    select
      c2.id as candidate_id,
      (
        select l.id
        from public.crm_leads l
        left join public.crm_lead_contacts x
          on x.lead_id=l.id
        where
          (
            c2.domain is not null
            and lower(coalesce(l.domain,''))=lower(c2.domain)
          )
          or
          (
            c2.business_email is not null
            and lower(trim(coalesce(x.email,'')))=
                lower(trim(c2.business_email))
          )
        limit 1
      ) as lead_id
    from public.crm_lead_candidates c2
    where c2.qualification_status <> 'promoted'
  )
  update public.crm_lead_candidates c
  set
    duplicate_lead_id=m.lead_id,
    duplicate_kind=case
      when m.lead_id is not null then 'exact'
      else null
    end,
    qualification_status=case
      when m.lead_id is not null
        and not coalesce(c.duplicate_override,false)
        and c.qualification_status not in ('blocked','rejected','promoted')
      then 'duplicate'
      else c.qualification_status
    end,
    updated_at=now()
  from matches m
  where c.id=m.candidate_id;

  with blockers as (
    select
      c2.id as candidate_id,
      coalesce(
        (
          select
            'Suppressed: ' ||
            coalesce(nullif(trim(s.reason),''),'suppression list')
          from public.crm_suppression_list s
          where lower(trim(s.email))=
                lower(trim(c2.business_email))
          limit 1
        ),
        case
          when c2.email_verification_status in ('invalid','bounced')
            then 'Invalid or bounced email'
          when c2.compliance_status='blocked'
            then coalesce(c2.blocked_reason,'Compliance blocked')
        end
      ) as reason
    from public.crm_lead_candidates c2
    where c2.qualification_status <> 'promoted'
  )
  update public.crm_lead_candidates c
  set
    blocked_reason=b.reason,
    compliance_status=case
      when b.reason is not null then 'blocked'
      else c.compliance_status
    end,
    qualification_status=case
      when b.reason is not null
        and c.qualification_status not in ('rejected','promoted')
      then 'blocked'
      else c.qualification_status
    end,
    fit_score=case when b.reason is not null then 0 else c.fit_score end,
    fit_grade=case
      when b.reason is not null then 'do_not_contact'
      else c.fit_grade
    end,
    updated_at=now()
  from blockers b
  where c.id=b.candidate_id;

  update public.crm_lead_candidates c
  set
    recommended_service=case
      when
        (
          case when c.instagram_url is not null then 1 else 0 end +
          case when c.linkedin_url is not null then 1 else 0 end +
          case when c.youtube_url is not null then 1 else 0 end +
          case when c.tiktok_url is not null then 1 else 0 end
        ) >= 2
        and lower(coalesce(c.company_type,'')) like '%agency%'
        then 'Agency / multi-platform opportunity'

      when c.youtube_url is not null
        then 'YouTube growth'

      when c.linkedin_url is not null
        and lower(
          coalesce(c.company_type,'') || ' ' ||
          coalesce(c.industry,'')
        ) similar to '%(b2b|agency|professional)%'
        then 'LinkedIn growth'

      when c.tiktok_url is not null
        then 'TikTok growth'

      when c.instagram_url is not null
        then 'Instagram growth'

      when c.linkedin_url is not null
        then 'LinkedIn growth'

      else null
    end,

    recommendation_reason=case
      when
        (
          case when c.instagram_url is not null then 1 else 0 end +
          case when c.linkedin_url is not null then 1 else 0 end +
          case when c.youtube_url is not null then 1 else 0 end +
          case when c.tiktok_url is not null then 1 else 0 end
        ) >= 2
        and lower(coalesce(c.company_type,'')) like '%agency%'
        then 'Multiple relevant social channels detected for an agency'

      when c.youtube_url is not null
        then 'Active YouTube channel detected'

      when c.linkedin_url is not null
        and lower(
          coalesce(c.company_type,'') || ' ' ||
          coalesce(c.industry,'')
        ) similar to '%(b2b|agency|professional)%'
        then 'LinkedIn-heavy business signal'

      when c.tiktok_url is not null
        then 'TikTok presence detected'

      when c.instagram_url is not null
        then 'Instagram presence detected'

      when c.linkedin_url is not null
        then 'LinkedIn presence detected'

      else 'More research required'
    end,

    recommendation_confidence=case
      when
        c.youtube_url is not null
        or c.instagram_url is not null
        or c.linkedin_url is not null
        or c.tiktok_url is not null
      then 70
      else 0
    end,

    updated_at=now()

  where c.qualification_status <> 'promoted';

  with signals as (
    select
      c2.id,

      c2.compliance_status='blocked'
      or c2.email_verification_status in ('invalid','bounced')
        as blocked,

      exists(
        select 1
        from unnest(cfg.target_countries) x
        where lower(x)=lower(coalesce(c2.country,''))
      ) as target_country,

      c2.employee_range=any(cfg.employee_ranges)
        as target_size,

      exists(
        select 1
        from unnest(cfg.decision_roles) x
        where lower(x)=lower(coalesce(c2.contact_role,''))
      ) as decision_role,

      c2.email_type in ('business','role')
      and c2.email_verification_status='valid'
        as verified_business_email,

      c2.website_url is not null
        as has_website,

      c2.instagram_url is not null
      or c2.linkedin_url is not null
      or c2.youtube_url is not null
      or c2.tiktok_url is not null
        as has_social,

      c2.recommended_service is not null
        as has_service_fit,

      (
        case when c2.instagram_url is not null then 1 else 0 end +
        case when c2.linkedin_url is not null then 1 else 0 end +
        case when c2.youtube_url is not null then 1 else 0 end +
        case when c2.tiktok_url is not null then 1 else 0 end
      ) >= 2 as multi_social

    from public.crm_lead_candidates c2
    where c2.qualification_status <> 'promoted'
  ),

  scored as (
    select
      s.*,
      case
        when s.blocked then 0
        else least(
          100,
          greatest(
            0,
            (case when s.target_country then 20 else -20 end) +
            (case when s.target_size then 15 else 0 end) +
            (case when s.decision_role then 15 else 0 end) +
            (case when s.verified_business_email then 15 else 0 end) +
            (case when s.has_website then 10 else -20 end) +
            (case when s.has_social then 10 else 0 end) +
            (case when s.has_service_fit then 10 else 0 end) +
            (case when s.multi_social then 5 else 0 end)
          )
        )
      end as score
    from signals s
  )

  update public.crm_lead_candidates c
  set
    fit_score=s.score,

    fit_grade=case
      when s.blocked then 'do_not_contact'
      when s.score>=80 then 'high_fit'
      when s.score>=60 then 'good_fit'
      when s.score>=40 then 'research'
      else 'low_fit'
    end,

    fit_reasons=jsonb_build_array(
      jsonb_build_object(
        'reason','Target country',
        'points',case when s.target_country then 20 else -20 end
      ),
      jsonb_build_object(
        'reason','Target company size',
        'points',case when s.target_size then 15 else 0 end
      ),
      jsonb_build_object(
        'reason','Decision maker available',
        'points',case when s.decision_role then 15 else 0 end
      ),
      jsonb_build_object(
        'reason','Verified public business email',
        'points',case when s.verified_business_email then 15 else 0 end
      ),
      jsonb_build_object(
        'reason','Business website',
        'points',case when s.has_website then 10 else -20 end
      ),
      jsonb_build_object(
        'reason','Relevant social presence',
        'points',case when s.has_social then 10 else 0 end
      ),
      jsonb_build_object(
        'reason','Service fit',
        'points',case when s.has_service_fit then 10 else 0 end
      ),
      jsonb_build_object(
        'reason','Multiple social profiles',
        'points',case when s.multi_social then 5 else 0 end
      )
    ),

    research_status=case
      when s.score>=40 and s.score<60 then 'needed'
      else c.research_status
    end,

    updated_at=now()

  from scored s
  where c.id=s.id;

  insert into public.crm_lead_intelligence(
    lead_id,
    next_best_action,
    action_reason,
    action_priority,
    stale,
    days_inactive,
    updated_at
  )

  select
    l.id,

    case
      when exists(
        select 1
        from public.crm_lead_contacts c
        where c.lead_id=l.id
          and (
            c.opted_out_at is not null
            or c.verification_status='invalid'
            or c.compliance_status='blocked'
            or exists(
              select 1
              from public.crm_suppression_list s
              where lower(trim(s.email))=lower(trim(c.email))
            )
          )
      )
        then 'Do not contact'

      when exists(
        select 1
        from public.crm_inbound_messages r
        where r.lead_id=l.id
          and r.classification in ('interested','meeting_request')
      )
        then 'Review interested reply'

      when l.status in ('qualified','replied')
        and coalesce(l.updated_at,l.created_at)
            < now()-interval '3 days'
        then 'Re-engage qualified lead'

      when l.status='contacted'
        and coalesce(l.updated_at,l.created_at)
            < now()-interval '5 days'
        then 'Review contacted lead'

      when l.status='ready'
        and coalesce(l.updated_at,l.created_at)
            < now()-interval '3 days'
        then 'Review outreach readiness'

      when not exists(
        select 1
        from public.crm_lead_contacts c
        where c.lead_id=l.id
          and c.verification_status='valid'
          and c.email_type='business'
      )
        then 'Verify business email'

      when l.recommended_service is null
        then 'Review service recommendation'

      else 'Schedule follow-up'
    end,

    case
      when l.status in ('qualified','replied')
        and coalesce(l.updated_at,l.created_at)
            < now()-interval '3 days'
        then 'Qualified or replied lead is stale'

      when l.status='contacted'
        and coalesce(l.updated_at,l.created_at)
            < now()-interval '5 days'
        then 'Contacted lead has had no recent activity'

      when l.status='ready'
        and coalesce(l.updated_at,l.created_at)
            < now()-interval '3 days'
        then 'Ready lead has not been actioned recently'

      else 'Deterministic operational review'
    end,

    case
      when l.status in ('qualified','replied')
        and coalesce(l.updated_at,l.created_at)
            < now()-interval '3 days'
        then 'high'
      else 'normal'
    end,

    case
      when l.status in ('qualified','replied')
        then coalesce(l.updated_at,l.created_at)
             < now()-interval '3 days'

      when l.status='contacted'
        then coalesce(l.updated_at,l.created_at)
             < now()-interval '5 days'

      when l.status='ready'
        then coalesce(l.updated_at,l.created_at)
             < now()-interval '3 days'

      else false
    end,

    floor(
      extract(
        epoch from
        now()-coalesce(l.updated_at,l.created_at)
      ) / 86400
    )::int,

    now()

  from public.crm_leads l

  where not public.crm_is_internal_operational_test_lead(
    l.source_name,
    l.business_name
  )

  on conflict(lead_id)
  do update set
    next_best_action=excluded.next_best_action,
    action_reason=excluded.action_reason,
    action_priority=excluded.action_priority,
    stale=excluded.stale,
    days_inactive=excluded.days_inactive,
    updated_at=excluded.updated_at;

end $$;