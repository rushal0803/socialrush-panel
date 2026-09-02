-- Provider-neutral inbound-reply foundation.  Mailbox delivery remains disabled
-- until a provider is explicitly connected and calls the authenticated endpoint.
create table if not exists public.crm_reply_automation_settings (
  id boolean primary key default true check (id),
  reply_detection_enabled boolean not null default false,
  auto_classify_replies boolean not null default true,
  auto_stop_sequence_on_reply boolean not null default true,
  auto_suppress_unsubscribes boolean not null default true,
  create_reply_followups boolean not null default true,
  generate_ai_reply_drafts boolean not null default false,
  updated_at timestamptz not null default now()
);
insert into public.crm_reply_automation_settings (id) values (true) on conflict (id) do nothing;
alter table public.crm_leads add column if not exists priority text not null default 'normal' check (priority in ('low','normal','high'));

create table if not exists public.crm_email_threads (
  id uuid primary key default gen_random_uuid(), lead_id uuid not null references public.crm_leads(id) on delete cascade,
  contact_id uuid references public.crm_lead_contacts(id) on delete set null,
  provider text not null, provider_thread_id text, subject text, last_message_at timestamptz not null default now(),
  last_direction text not null check (last_direction in ('inbound','outbound')), status text not null default 'open' check (status in ('open','closed','review')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(provider, provider_thread_id)
);
create index if not exists crm_email_threads_contact_idx on public.crm_email_threads(contact_id,last_message_at desc);

create table if not exists public.crm_inbound_messages (
  id uuid primary key default gen_random_uuid(), thread_id uuid not null references public.crm_email_threads(id) on delete cascade,
  lead_id uuid references public.crm_leads(id) on delete set null, contact_id uuid references public.crm_lead_contacts(id) on delete set null,
  provider text not null, provider_message_id text not null, from_email text not null, to_email text, subject text, body_text text not null,
  received_at timestamptz not null, classification text, confidence numeric(4,3), needs_admin_review boolean not null default true,
  admin_classification text, admin_status text, suggested_reply_draft text, draft_status text check (draft_status in ('draft','approved','discarded')),
  created_at timestamptz not null default now(), unique(provider,provider_message_id)
);
create index if not exists crm_inbound_messages_received_idx on public.crm_inbound_messages(received_at desc);
create index if not exists crm_inbound_messages_contact_idx on public.crm_inbound_messages(contact_id);
create table if not exists public.crm_unmatched_inbound_events (
  id uuid primary key default gen_random_uuid(), provider text not null, provider_message_id text not null,
  from_email text not null, to_email text, subject text, body_text text not null, received_at timestamptz not null,
  reason text not null, created_at timestamptz not null default now(), unique(provider,provider_message_id)
);
alter table public.crm_unmatched_inbound_events enable row level security;
create policy "admins read unmatched inbound events" on public.crm_unmatched_inbound_events for select to authenticated using (public.is_admin());

create table if not exists public.crm_reply_classifications (
  id uuid primary key default gen_random_uuid(), inbound_message_id uuid not null unique references public.crm_inbound_messages(id) on delete cascade,
  classification text not null check (classification in ('interested','needs_information','not_now','meeting_request','positive_reply','negative_reply','unsubscribe','out_of_office','bounce','wrong_person','other')),
  confidence numeric(4,3) not null, reason text not null, suggested_next_action text not null, source text not null check (source in ('rules','ai','admin')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.crm_reply_audit_log (
  id uuid primary key default gen_random_uuid(), lead_id uuid references public.crm_leads(id) on delete set null,
  inbound_message_id uuid references public.crm_inbound_messages(id) on delete cascade, action text not null, details jsonb not null default '{}'::jsonb,
  actor_id uuid references public.profiles(id) on delete set null, created_at timestamptz not null default now()
);
create index if not exists crm_reply_audit_log_message_idx on public.crm_reply_audit_log(inbound_message_id,created_at);
create table if not exists public.crm_lead_reply_followups (
  id uuid primary key default gen_random_uuid(), lead_id uuid not null references public.crm_leads(id) on delete cascade,
  contact_id uuid references public.crm_lead_contacts(id) on delete set null, inbound_message_id uuid references public.crm_inbound_messages(id) on delete set null,
  title text not null, due_at timestamptz not null, priority text not null default 'normal' check (priority in ('low','normal','high')),
  status text not null default 'pending' check (status in ('pending','completed','cancelled')), created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(inbound_message_id)
);
alter table public.crm_lead_reply_followups enable row level security;
create policy "admins manage lead reply followups" on public.crm_lead_reply_followups for all to authenticated using (public.is_admin()) with check (public.is_admin());

alter table public.crm_reply_automation_settings enable row level security;
alter table public.crm_email_threads enable row level security;
alter table public.crm_inbound_messages enable row level security;
alter table public.crm_reply_classifications enable row level security;
alter table public.crm_reply_audit_log enable row level security;
create policy "admins manage reply automation settings" on public.crm_reply_automation_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins read reply threads" on public.crm_email_threads for select to authenticated using (public.is_admin());
create policy "admins read inbound replies" on public.crm_inbound_messages for select to authenticated using (public.is_admin());
create policy "admins read reply classifications" on public.crm_reply_classifications for select to authenticated using (public.is_admin());
create policy "admins read reply audit" on public.crm_reply_audit_log for select to authenticated using (public.is_admin());
