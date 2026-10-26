-- Review-first migration: website enquiries are private CRM records, not outreach subscriptions.
-- Deploy with the corresponding contact route and admin inbox, after preview QA.
create table if not exists public.crm_website_enquiries (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 2 and 100),
  email text not null check (char_length(email) between 3 and 160),
  whatsapp text not null check (char_length(whatsapp) between 8 and 40),
  service text not null check (char_length(service) between 1 and 140),
  category text not null default 'general' check (category in ('order','payment','guidance','account','general','bulk')),
  message text not null check (char_length(message) between 10 and 2000),
  source text not null default '/contact' check (char_length(source) between 1 and 200),
  status text not null default 'new' check (status in ('new','working','replied','closed')),
  reply_draft text check (reply_draft is null or char_length(reply_draft) <= 4000),
  notification_status text not null default 'pending'
    check (notification_status in ('pending','sent','failed','skipped')),
  -- A support enquiry is not marketing consent. Marketing outreach is NOT activated.
  marketing_opt_in boolean not null default false,
  received_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists crm_website_enquiries_queue_idx
  on public.crm_website_enquiries (status, received_at desc);
create index if not exists crm_website_enquiries_source_idx
  on public.crm_website_enquiries (received_at desc, source);

alter table public.crm_website_enquiries enable row level security;

-- Public visitors must not use the Data API to read, insert, or modify enquiries.
revoke all on public.crm_website_enquiries from PUBLIC, anon, authenticated;
grant select, update on public.crm_website_enquiries to authenticated;
grant all on public.crm_website_enquiries to service_role;

create policy "Admins read website enquiries"
  on public.crm_website_enquiries for select to authenticated
  using ((select public.is_admin()));
create policy "Admins update website enquiries"
  on public.crm_website_enquiries for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

comment on table public.crm_website_enquiries is
  'Private website enquiry inbox. Writes through the server-only service role. Replies are drafts only and do not authorize marketing outreach.';
