-- Checkout intents: server-created snapshots of a pending checkout. Safe to rerun.
-- Rows are created only by the service-role client in app/api/checkout/intent/route.ts.
-- No insert/update policy exists for `authenticated`, so customers cannot create
-- intents or change total_paise, user_id, service_code, status, or order_id.
create table if not exists public.checkout_intents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  client_request_id text not null,
  -- nullable: resolved server-side against public.services(id) when a match exists
  service_id bigint references public.services(id) on delete set null,
  service_code text not null,
  quantity integer not null check (quantity > 0),
  destination_link text not null,
  package_name text,
  notes text,
  -- integer paise, deliberately separate from the rupee-based money columns elsewhere
  total_paise bigint not null check (total_paise > 0),
  currency text not null default 'INR',
  -- allowed status values: 'created', 'expired', 'completed', 'cancelled'
  status text not null default 'created' check (status in ('created','expired','completed','cancelled')),
  -- reserved for a later PR that links a completed intent to its order
  order_id uuid references public.orders(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- server-controlled expiry: intents are valid for 30 minutes from creation
  expires_at timestamptz not null default now() + interval '30 minutes',
  completed_at timestamptz
);

create unique index if not exists checkout_intents_user_request_unique on public.checkout_intents(user_id, client_request_id);
create index if not exists checkout_intents_user_status_created_idx on public.checkout_intents(user_id, status, created_at desc);

alter table public.checkout_intents enable row level security;

-- Read-only for the owner (and admins). No insert/update/delete policy on purpose.
drop policy if exists "checkout_intents_select_own_or_admin" on public.checkout_intents;
create policy "checkout_intents_select_own_or_admin" on public.checkout_intents
  for select to authenticated using (user_id = auth.uid() or public.is_admin());
