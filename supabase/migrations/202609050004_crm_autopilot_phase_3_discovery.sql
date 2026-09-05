-- SocialRUSH Autopilot Phase 3
-- Automated prospect discovery foundation.
-- IMPORTANT: this only stages prospects. It never sends outreach.

create table if not exists public.crm_prospect_discovery_settings (
  id boolean primary key default true check (id),

  enabled boolean not null default true,

  provider text not null default 'brave',

  daily_search_limit integer not null default 4
    check (daily_search_limit between 1 and 20),

  results_per_search integer not null default 10
    check (results_per_search between 1 and 20),

  target_countries text[] not null default
  array['IN'],
  
  segment_rotation text[] not null default array[
    'marketing agency',
    'e-commerce brand',
    'startup',
    'creator business',
    'professional services'
  ],

  updated_at timestamptz not null default now()
);

insert into public.crm_prospect_discovery_settings(id)
values (true)
on conflict (id) do nothing;


create table if not exists public.crm_prospect_discovery_runs (
  id uuid primary key default gen_random_uuid(),

  provider text not null,

  trigger text not null
    check (trigger in ('cron','manual')),

  status text not null
    check (
      status in (
        'running',
        'completed',
        'partial',
        'failed',
        'skipped'
      )
    ),

  started_at timestamptz not null default now(),

  finished_at timestamptz,

  search_count integer not null default 0
    check (search_count >= 0),

  discovered_count integer not null default 0
    check (discovered_count >= 0),

  staged_count integer not null default 0
    check (staged_count >= 0),

  duplicate_count integer not null default 0
    check (duplicate_count >= 0),

  invalid_count integer not null default 0
    check (invalid_count >= 0),

  error_count integer not null default 0
    check (error_count >= 0),

  error_message text,

  metadata jsonb not null default '{}'::jsonb,

  created_by uuid references public.profiles(id)
    on delete set null
);


create index if not exists
crm_prospect_discovery_runs_started_idx
on public.crm_prospect_discovery_runs(started_at desc);

create index if not exists
crm_prospect_discovery_runs_status_idx
on public.crm_prospect_discovery_runs(status, started_at desc);


alter table public.crm_prospect_discovery_settings
enable row level security;

alter table public.crm_prospect_discovery_runs
enable row level security;


create policy
"admins manage prospect discovery settings"
on public.crm_prospect_discovery_settings
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());


create policy
"admins read prospect discovery runs"
on public.crm_prospect_discovery_runs
for select
to authenticated
using (public.is_admin());