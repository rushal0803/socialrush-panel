-- One non-sensitive, resumable order configuration per customer.
create table if not exists public.order_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  platform text not null check (char_length(platform) <= 40),
  service_code text not null check (char_length(service_code) <= 100),
  quantity integer not null check (quantity > 0),
  target text check (target is null or char_length(target) <= 2048),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

alter table public.order_drafts enable row level security;

drop policy if exists "Customers manage their own order draft" on public.order_drafts;
create policy "Customers manage their own order draft" on public.order_drafts
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create index if not exists order_drafts_user_updated_idx on public.order_drafts(user_id, updated_at desc);
