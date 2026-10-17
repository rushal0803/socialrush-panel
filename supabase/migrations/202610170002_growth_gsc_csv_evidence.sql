-- Phase 3: manual evidence imports from first-party Google Search Console CSV exports.
-- No new cron, external API calls, email sends, or modifications to orders/payments.
create table if not exists public.growth_gsc_import_batches (
  id uuid primary key default gen_random_uuid(),
  fingerprint char(64) not null unique check (fingerprint ~ '^[0-9a-f]{64}$'),
  report_kind text not null check (report_kind in ('performance_pages','indexing_examples')),
  reason text check (reason in ('discovered_not_indexed','crawled_not_indexed','page_with_redirect',
     'alternate_canonical','blocked_robots','duplicate_no_canonical','other')),
  evidence_date date not null,
  period_start date,
  period_end date,
  filename text not null check (char_length(filename) between 1 and 160),
  row_count integer not null check (row_count between 1 and 300),
  status text not null default 'processing' check (status in ('processing','complete','failed')),
  created_by uuid not null references auth.users(id),
  imported_at timestamptz not null default now(),
  constraint gsc_import_type_contract check (
    (report_kind='indexing_examples' and reason is not null and period_start is null and period_end is null)
    or (report_kind='performance_pages' and reason is null and period_start is not null and period_end is not null and period_start<=period_end)
  )
);

create table if not exists public.growth_gsc_page_observations (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.growth_gsc_import_batches(id) on delete cascade,
  source_path text not null check (char_length(source_path)<=180 and source_path ~ '^/[a-z0-9/-]*$'),
  canonical_path text not null check (char_length(canonical_path)<=180 and canonical_path ~ '^/[a-z0-9/-]*$'),
  clicks bigint check (clicks >= 0),
  impressions bigint check (impressions >= 0),
  ctr numeric(8,6) check (ctr between 0 and 1),
  position numeric(9,3) check (position >= 1),
  created_by uuid not null references auth.users(id),
  imported_at timestamptz not null default now(),
  unique (batch_id, source_path)
);
create index if not exists growth_gsc_obs_path on public.growth_gsc_page_observations(canonical_path, imported_at desc);
create index if not exists growth_gsc_import_by_date on public.growth_gsc_import_batches(evidence_date desc, imported_at desc);

alter table public.growth_gsc_import_batches enable row level security;
alter table public.growth_gsc_page_observations enable row level security;
revoke all on public.growth_gsc_import_batches from anon, authenticated;
revoke all on public.growth_gsc_page_observations from anon, authenticated;
grant select, insert, update on public.growth_gsc_import_batches to authenticated;
grant select, insert on public.growth_gsc_page_observations to authenticated;

create policy "Admin read GSC imports" on public.growth_gsc_import_batches for select to authenticated
 using (exists (select 1 from public.profiles p where p.id=(select auth.uid()) and p.role='admin'));
create policy "Admin insert GSC imports" on public.growth_gsc_import_batches for insert to authenticated
 with check (created_by=(select auth.uid()) and exists (select 1 from public.profiles p where p.id=(select auth.uid()) and p.role='admin'));
create policy "Admin update own GSC import state" on public.growth_gsc_import_batches for update to authenticated
 using (created_by=(select auth.uid()) and exists (select 1 from public.profiles p where p.id=(select auth.uid()) and p.role='admin'))
 with check (created_by=(select auth.uid()) and exists (select 1 from public.profiles p where p.id=(select auth.uid()) and p.role='admin'));
create policy "Admin read GSC page evidence" on public.growth_gsc_page_observations for select to authenticated
 using (exists (select 1 from public.profiles p where p.id=(select auth.uid()) and p.role='admin'));
create policy "Admin insert GSC page evidence" on public.growth_gsc_page_observations for insert to authenticated
 with check (
 created_by=(select auth.uid()) and
 exists (select 1 from public.growth_gsc_import_batches b where b.id=batch_id and b.created_by=(select auth.uid()) and b.status='processing') and
 exists (select 1 from public.profiles p where p.id=(select auth.uid()) and p.role='admin')
 );

comment on table public.growth_gsc_import_batches is
'Provenance for manually uploaded Search Console exports; no claim of automatic Google API synchronization.';
comment on table public.growth_gsc_page_observations is
'Per-URL evidence within an export. No automated indexing verdict, ranking guarantee or modification of the recovery queue.';
