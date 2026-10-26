-- Dependent on 20261026060000_crm_website_enquiries.sql (PR #719).
-- Human-reviewed website enquiries can become CRM leads using one atomic SECURITY INVOKER RPC.
-- This does NOT create orders, send email, grant marketing consent or run outreach.
alter table public.crm_website_enquiries
  add column if not exists lead_id uuid references public.crm_leads(id) on delete set null;

create index if not exists crm_website_enquiries_lead_idx
  on public.crm_website_enquiries(lead_id)
  where lead_id is not null;

create or replace function public.promote_crm_website_enquiry(
  p_enquiry_id uuid,
  p_business_name text
)
returns table(crm_lead_id uuid, resolution text)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_enquiry public.crm_website_enquiries%rowtype;
  v_email text;
  v_company text := pg_catalog.btrim(pg_catalog.coalesce(p_business_name, ''));
  v_matched_leads uuid[];
  v_lead_id uuid;
begin
  if auth.uid() is null or not public.is_admin() then
    raise exception 'Admin access required';
  end if;
  if p_enquiry_id is null then
    raise exception 'A valid website enquiry ID is required';
  end if;

  -- Lock the enquiry first: repeat submissions cannot create multiple CRM leads.
  select * into v_enquiry
    from public.crm_website_enquiries
    where id = p_enquiry_id for update;
  if not found then
    raise exception 'Enquiry unavailable';
  end if;
  if v_enquiry.lead_id is not null then
    return query select v_enquiry.lead_id, 'already_linked'::text;
    return;
  end if;
  if v_enquiry.category not in ('bulk', 'guidance') or v_enquiry.status <> 'working' then
    raise exception 'Only reviewed sales or partnership enquiries may be promoted';
  end if;

  v_email := pg_catalog.lower(pg_catalog.btrim(v_enquiry.email));
  if v_email = '' then
    raise exception 'Enquiry email missing';
  end if;
  -- Serialize concurrent promotions from separate enquiries for the same email.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_email, 0));

  if exists (
    select 1 from public.crm_suppression_list s
    where pg_catalog.lower(pg_catalog.btrim(s.email)) = v_email
  ) then
    raise exception 'Suppressed contacts cannot be promoted';
  end if;
  if exists (
    select 1 from public.crm_lead_contacts c
    where pg_catalog.lower(pg_catalog.btrim(c.email)) = v_email
      and (c.opted_out_at is not null or c.compliance_status = 'blocked')
  ) then
    raise exception 'Blocked or opted-out contacts require manual review';
  end if;

  select pg_catalog.coalesce(pg_catalog.array_agg(distinct c.lead_id), array[]::uuid[])
    into v_matched_leads
    from public.crm_lead_contacts c
    where pg_catalog.lower(pg_catalog.btrim(c.email)) = v_email;

  if pg_catalog.cardinality(v_matched_leads) > 1 then
    raise exception 'Multiple CRM leads share this email; manual merge review required';
  elsif pg_catalog.cardinality(v_matched_leads) = 1 then
    v_lead_id := v_matched_leads[1];
    if exists (
      select 1 from public.crm_leads l
      where l.id = v_lead_id and l.status = 'do_not_contact'
    ) then
      raise exception 'Do-not-contact CRM leads cannot be linked by this action';
    end if;
    update public.crm_website_enquiries
       set lead_id = v_lead_id, updated_at = now()
     where id = p_enquiry_id;
    return query select v_lead_id, 'linked_existing'::text;
    return;
  end if;

  if pg_catalog.char_length(v_company) < 2 or pg_catalog.char_length(v_company) > 140 then
    raise exception 'Business or creator name must be 2 to 140 characters';
  end if;
  if exists (
    select 1 from public.crm_leads l
    where pg_catalog.lower(pg_catalog.btrim(l.business_name)) = pg_catalog.lower(v_company)
  ) then
    raise exception 'A lead with this business name exists; resolve duplication manually';
  end if;

  insert into public.crm_leads (
    business_name, company_type, source, source_name, source_url,
    status, priority, score, recommended_service, created_by
  ) values (
    v_company, 'business', 'web', 'Website inbound enquiry', v_enquiry.source,
    'new', 'normal', 0, v_enquiry.service, auth.uid()
  ) returning id into v_lead_id;

  -- Inbound enquiry is NOT marketing consent and is NOT inbox verification.
  -- Leave compliance in review so Autopilot cannot enrol this contact.
  insert into public.crm_lead_contacts (
    lead_id, full_name, email, email_type, verification_status,
    compliance_status, contact_basis, is_primary, source_url
  ) values (
    v_lead_id, v_enquiry.full_name, v_email, 'unknown', 'unverified',
    'review', 'existing_relationship', true, v_enquiry.source
  );

  update public.crm_website_enquiries
     set lead_id = v_lead_id, updated_at = now()
   where id = p_enquiry_id;
  return query select v_lead_id, 'created'::text;
end;
$$;

-- SECURITY INVOKER preserves existing RLS on the enquiry, lead, contact,
-- and suppression tables. Non-admin users cannot read or mutate these tables.
revoke all on function public.promote_crm_website_enquiry(uuid, text) from PUBLIC, anon, authenticated;
grant execute on function public.promote_crm_website_enquiry(uuid, text) to authenticated;
comment on function public.promote_crm_website_enquiry(uuid, text) is
  'Admin-only atomic website-enquiry-to-CRM linking. No marketing opt-in or outbound sending.';
