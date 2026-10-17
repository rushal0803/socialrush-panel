-- Phase 2: auditable, admin-only SEO/GEO recovery queue.
-- Apply only after preview QA. This migration does not schedule jobs, crawl URLs,
-- send outreach emails, update SEO metadata, or modify payments.

create table if not exists public.growth_search_work_items (
  id uuid primary key default gen_random_uuid(),
  canonical_path text not null
    check (char_length(canonical_path) <= 180 and canonical_path ~ '^/[a-z0-9/-]*$' and canonical_path !~ '//'),
  workstream text not null check (workstream in ('seo','geo')),
  issue_type text not null check (issue_type in (
    'discovered_not_indexed','crawled_not_indexed','canonical_conflict',
    'technical_error','content_gap','ai_answer_readiness'
  )),
  priority text not null default 'high'
    check (priority in ('critical','high','normal','low')),
  status text not null default 'open'
    check (status in ('open','in_progress','blocked','verified','closed')),
  title text not null check (char_length(title) between 8 and 160),
  details text check (char_length(details) <= 2000),
  evidence_source text not null default 'manual'
    check (evidence_source in ('search_console','site_audit','geo_audit','manual')),
  evidence_date date,
  resolution_note text check (char_length(resolution_note) <= 2000),
  constraint growth_search_resolution_evidence_check check (
    status not in ('verified','closed') or char_length(btrim(coalesce(resolution_note,''))) >= 12
  ),
  verified_at timestamptz,
  created_by uuid not null references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One unresolved work item per search issue type per canonical URL.
create unique index if not exists growth_search_work_items_active_unique
  on public.growth_search_work_items(canonical_path, workstream, issue_type)
  where status in ('open','in_progress','blocked');

create index if not exists growth_search_work_items_queue_idx
  on public.growth_search_work_items(status, priority, updated_at desc);

alter table public.growth_search_work_items enable row level security;

-- Never expose work items to visitors or ordinary logged-in customers.
revoke all on public.growth_search_work_items from anon, authenticated;
grant select, insert, update on public.growth_search_work_items to authenticated;

create policy "Admins can read growth search work items"
  on public.growth_search_work_items for select to authenticated
  using (
    exists (select 1 from public.profiles p
            where p.id = (select auth.uid()) and p.role = 'admin')
  );

create policy "Admins can add growth search work items"
  on public.growth_search_work_items for insert to authenticated
  with check (
    created_by = (select auth.uid()) and
    exists (select 1 from public.profiles p
            where p.id = (select auth.uid()) and p.role = 'admin')
  );

create policy "Admins can update growth search work items"
  on public.growth_search_work_items for update to authenticated
  using (
    exists (select 1 from public.profiles p
            where p.id = (select auth.uid()) and p.role = 'admin')
  )
  with check (
    exists (select 1 from public.profiles p
            where p.id = (select auth.uid()) and p.role = 'admin')
  );

comment on table public.growth_search_work_items is
  'Admin-only review queue. Rows represent evidence and decisions, not a direct Google indexing verdict.';
