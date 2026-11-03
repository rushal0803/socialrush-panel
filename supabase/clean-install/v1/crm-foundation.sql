-- Clean-install CRM reconstruction v1, not an automatic production migration.
-- Current catalog-derived definitions minus replay-owned priority column/check.
-- Current-state reconstruction is not proof of an original historical before-image.
-- Fresh relations only; transactional and fails closed if either relation exists.
begin;
do $$ begin
  if current_setting('socialrush.clean_install', true) is distinct from 'v1' then
    raise exception 'Explicit clean-install v1 context required';
  end if;
  if to_regclass('public.crm_leads') is not null or to_regclass('public.crm_lead_contacts') is not null then
    raise exception 'CRM foundation requires absent relations; never apply to an existing project';
  end if;
end $$;

create table public."crm_leads" (
  "id" uuid default gen_random_uuid() not null,
  "business_name" text not null,
  "domain" text,
  "website_url" text,
  "country" text,
  "city" text,
  "industry" text,
  "company_type" text default 'business'::text not null,
  "employee_range" text,
  "instagram_url" text,
  "linkedin_url" text,
  "youtube_url" text,
  "tiktok_url" text,
  "source" text default 'manual'::text not null,
  "source_name" text,
  "source_url" text,
  "status" text default 'new'::text not null,
  "score" integer default 0 not null,
  "fit_summary" text,
  "recommended_service" text,
  "last_contacted_at" timestamp with time zone,
  "next_action_at" timestamp with time zone,
  "discovered_at" timestamp with time zone default now() not null,
  "created_by" uuid,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null,
  constraint "crm_leads_company_type_check" CHECK (company_type = ANY (ARRAY['business'::text, 'creator'::text, 'startup'::text, 'agency'::text, 'other'::text])),
  constraint "crm_leads_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL,
  constraint "crm_leads_pkey" PRIMARY KEY (id),
  constraint "crm_leads_score_check" CHECK (score >= 0 AND score <= 100),
  constraint "crm_leads_source_check" CHECK (source = ANY (ARRAY['manual'::text, 'web'::text, 'provider'::text, 'import'::text])),
  constraint "crm_leads_status_check" CHECK (status = ANY (ARRAY['new'::text, 'researching'::text, 'ready'::text, 'contacted'::text, 'replied'::text, 'qualified'::text, 'won'::text, 'lost'::text, 'do_not_contact'::text]))
);

CREATE UNIQUE INDEX crm_leads_domain_uidx ON public.crm_leads USING btree (lower(domain)) WHERE ((domain IS NOT NULL) AND (btrim(domain) <> ''::text));

CREATE INDEX crm_leads_status_score_idx ON public.crm_leads USING btree (status, score DESC);

CREATE INDEX crm_leads_next_action_idx ON public.crm_leads USING btree (next_action_at) WHERE (next_action_at IS NOT NULL);

alter table public."crm_leads" enable row level security;

create policy "crm_leads_admin_all" on public."crm_leads" for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Explicit clean-install security deviation: CRUD only; no non-RLS maintenance privileges for client roles.
revoke all privileges on table public."crm_leads" from public, anon, authenticated, service_role;
grant select, insert, update, delete on table public."crm_leads" to authenticated, service_role;

create table public."crm_lead_contacts" (
  "id" uuid default gen_random_uuid() not null,
  "lead_id" uuid not null,
  "full_name" text,
  "job_title" text,
  "email" text not null,
  "email_type" text default 'unknown'::text not null,
  "verification_status" text default 'unverified'::text not null,
  "compliance_status" text default 'review'::text not null,
  "contact_basis" text,
  "is_primary" boolean default false not null,
  "source_url" text,
  "discovered_at" timestamp with time zone default now() not null,
  "opted_out_at" timestamp with time zone,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null,
  constraint "crm_lead_contacts_compliance_status_check" CHECK (compliance_status = ANY (ARRAY['eligible'::text, 'review'::text, 'blocked'::text])),
  constraint "crm_lead_contacts_contact_basis_check" CHECK (contact_basis = ANY (ARRAY['public_business_contact'::text, 'existing_relationship'::text, 'consent'::text, 'other'::text])),
  constraint "crm_lead_contacts_email_type_check" CHECK (email_type = ANY (ARRAY['business'::text, 'generic'::text, 'personal'::text, 'unknown'::text])),
  constraint "crm_lead_contacts_lead_id_fkey" FOREIGN KEY (lead_id) REFERENCES public.crm_leads(id) ON DELETE CASCADE,
  constraint "crm_lead_contacts_pkey" PRIMARY KEY (id),
  constraint "crm_lead_contacts_verification_status_check" CHECK (verification_status = ANY (ARRAY['unverified'::text, 'valid'::text, 'risky'::text, 'invalid'::text]))
);

CREATE UNIQUE INDEX crm_lead_contacts_email_uidx ON public.crm_lead_contacts USING btree (lower(email));

CREATE INDEX crm_lead_contacts_lead_idx ON public.crm_lead_contacts USING btree (lead_id);

CREATE INDEX crm_lead_contacts_eligibility_idx ON public.crm_lead_contacts USING btree (verification_status, compliance_status);

alter table public."crm_lead_contacts" enable row level security;

create policy "crm_lead_contacts_admin_all" on public."crm_lead_contacts" for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Explicit clean-install security deviation: CRUD only; no non-RLS maintenance privileges for client roles.
revoke all privileges on table public."crm_lead_contacts" from public, anon, authenticated, service_role;
grant select, insert, update, delete on table public."crm_lead_contacts" to authenticated, service_role;

commit;
