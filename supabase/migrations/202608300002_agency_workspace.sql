-- Customer-owned organization layer. It is deliberately additive: underlying
-- orders, checkout, Cashfree and wallet settlement continue to work unchanged.
create table if not exists public.customer_clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 120),
  contact_name text check (char_length(contact_name) <= 120),
  email text check (char_length(email) <= 320),
  notes text check (char_length(notes) <= 2000),
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.client_social_profiles (
  client_id uuid not null references public.customer_clients(id) on delete cascade,
  saved_profile_id uuid not null references public.saved_social_profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (client_id, saved_profile_id)
);

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  client_id uuid references public.customer_clients(id) on delete set null,
  name text not null check (char_length(trim(name)) between 1 and 160),
  status text not null default 'draft' check (status in ('draft','active','partially_completed','completed','attention_required')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders add column if not exists client_id uuid references public.customer_clients(id) on delete set null;
alter table public.orders add column if not exists campaign_id uuid references public.campaigns(id) on delete set null;

create index if not exists customer_clients_user_idx on public.customer_clients(user_id, archived_at, created_at desc);
create index if not exists campaigns_user_idx on public.campaigns(user_id, created_at desc);
create index if not exists orders_client_idx on public.orders(client_id, created_at desc);
create index if not exists orders_campaign_idx on public.orders(campaign_id, created_at desc);

alter table public.customer_clients enable row level security;
alter table public.client_social_profiles enable row level security;
alter table public.campaigns enable row level security;

drop policy if exists customer_clients_owner_all on public.customer_clients;
drop policy if exists client_profiles_owner_all on public.client_social_profiles;
drop policy if exists campaigns_owner_all on public.campaigns;
create policy customer_clients_owner_all on public.customer_clients for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy client_profiles_owner_all on public.client_social_profiles for all to authenticated using (exists (select 1 from public.customer_clients c where c.id = client_id and c.user_id = auth.uid())) with check (exists (select 1 from public.customer_clients c join public.saved_social_profiles p on p.id = saved_profile_id where c.id = client_id and c.user_id = auth.uid() and p.user_id = auth.uid()));
create policy campaigns_owner_all on public.campaigns for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create or replace function public.assign_my_order_to_campaign(p_campaign_id uuid, p_order_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if not exists (select 1 from public.campaigns where id = p_campaign_id and user_id = auth.uid()) then raise exception 'Campaign not found'; end if;
  update public.orders set campaign_id = p_campaign_id where id = p_order_id and user_id = auth.uid();
  if not found then raise exception 'Order not found'; end if;
end; $$;
revoke all on function public.assign_my_order_to_campaign(uuid, uuid) from public;
grant execute on function public.assign_my_order_to_campaign(uuid, uuid) to authenticated;
