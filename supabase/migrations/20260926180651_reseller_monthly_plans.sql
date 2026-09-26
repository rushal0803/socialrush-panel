create table if not exists public.reseller_monthly_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  client_id uuid references public.customer_clients(id) on delete set null,
  campaign_id uuid references public.campaigns(id) on delete set null,
  name text not null check (char_length(trim(name)) between 1 and 160),
  platform text not null check (platform in ('instagram','youtube','linkedin','x','tiktok','telegram')),
  bundle_id text not null check (char_length(bundle_id) between 1 and 120),
  markup_percent integer not null default 40 check (markup_percent between 0 and 200),
  baseline_fulfillment_cost numeric(14,2) not null check (baseline_fulfillment_cost >= 0),
  baseline_client_quote numeric(14,2) not null check (baseline_client_quote >= 0),
  baseline_gross_margin numeric(14,2) not null check (baseline_gross_margin >= 0),
  items_snapshot jsonb not null default '[]'::jsonb check (jsonb_typeof(items_snapshot) = 'array'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reseller_monthly_plans_user_id_idx
  on public.reseller_monthly_plans(user_id);
create index if not exists reseller_monthly_plans_user_client_idx
  on public.reseller_monthly_plans(user_id, client_id)
  where client_id is not null;
create index if not exists reseller_monthly_plans_user_campaign_idx
  on public.reseller_monthly_plans(user_id, campaign_id)
  where campaign_id is not null;

alter table public.reseller_monthly_plans enable row level security;

revoke all on table public.reseller_monthly_plans from anon;
revoke all on table public.reseller_monthly_plans from authenticated;
grant select, insert, update, delete on table public.reseller_monthly_plans to authenticated;

drop policy if exists reseller_monthly_plans_select_own on public.reseller_monthly_plans;
create policy reseller_monthly_plans_select_own
on public.reseller_monthly_plans
for select
to authenticated
using (
  (select auth.uid()) = user_id
  and (
    client_id is null
    or exists (
      select 1 from public.customer_clients c
      where c.id = reseller_monthly_plans.client_id
        and c.user_id = (select auth.uid())
    )
  )
  and (
    campaign_id is null
    or exists (
      select 1 from public.campaigns c
      where c.id = reseller_monthly_plans.campaign_id
        and c.user_id = (select auth.uid())
        and (c.client_id is null or c.client_id = reseller_monthly_plans.client_id)
    )
  )
);

drop policy if exists reseller_monthly_plans_insert_own on public.reseller_monthly_plans;
create policy reseller_monthly_plans_insert_own
on public.reseller_monthly_plans
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and (
    client_id is null
    or exists (
      select 1 from public.customer_clients c
      where c.id = reseller_monthly_plans.client_id
        and c.user_id = (select auth.uid())
        and c.archived_at is null
    )
  )
  and (
    campaign_id is null
    or exists (
      select 1 from public.campaigns c
      where c.id = reseller_monthly_plans.campaign_id
        and c.user_id = (select auth.uid())
        and (c.client_id is null or c.client_id = reseller_monthly_plans.client_id)
    )
  )
);

drop policy if exists reseller_monthly_plans_update_own on public.reseller_monthly_plans;
create policy reseller_monthly_plans_update_own
on public.reseller_monthly_plans
for update
to authenticated
using ((select auth.uid()) = user_id)
with check (
  (select auth.uid()) = user_id
  and (
    client_id is null
    or exists (
      select 1 from public.customer_clients c
      where c.id = reseller_monthly_plans.client_id
        and c.user_id = (select auth.uid())
        and c.archived_at is null
    )
  )
  and (
    campaign_id is null
    or exists (
      select 1 from public.campaigns c
      where c.id = reseller_monthly_plans.campaign_id
        and c.user_id = (select auth.uid())
        and (c.client_id is null or c.client_id = reseller_monthly_plans.client_id)
    )
  )
);

drop policy if exists reseller_monthly_plans_delete_own on public.reseller_monthly_plans;
create policy reseller_monthly_plans_delete_own
on public.reseller_monthly_plans
for delete
to authenticated
using ((select auth.uid()) = user_id);
