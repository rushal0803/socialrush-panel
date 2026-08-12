-- Stage 1 foundation for direct Cashfree order checkout.
-- `checkout_intents` remains the authoritative server-created order snapshot;
-- this table records the payment-specific snapshot without changing existing
-- wallet payments, orders, or historical gateway records.
create table if not exists public.cashfree_checkout_intent_payments (
  id uuid primary key default gen_random_uuid(),
  checkout_intent_id uuid not null unique references public.checkout_intents(id) on delete restrict,
  user_id uuid not null references public.profiles(id) on delete cascade,
  -- Immutable server-side snapshots taken immediately before Cashfree creation.
  order_total_paise bigint not null check (order_total_paise > 0),
  wallet_balance_paise bigint not null check (wallet_balance_paise >= 0),
  required_top_up_paise bigint not null check (required_top_up_paise > 0),
  provider_order_id text not null unique,
  provider_payment_id text unique,
  status text not null default 'created'
    check (status in ('created', 'pending', 'completed', 'failed', 'cancelled', 'expired')),
  -- A unique final-order reference guarantees that a direct-payment intent can
  -- settle to at most one order, including across return and webhook retries.
  order_id uuid unique references public.orders(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  check (required_top_up_paise <= order_total_paise),
  check ((status <> 'completed') or (provider_payment_id is not null and order_id is not null and completed_at is not null))
);

create index if not exists cashfree_checkout_intent_payments_user_status_created_idx
  on public.cashfree_checkout_intent_payments(user_id, status, created_at desc);
create index if not exists cashfree_checkout_intent_payments_order_idx
  on public.cashfree_checkout_intent_payments(order_id)
  where order_id is not null;

alter table public.cashfree_checkout_intent_payments enable row level security;

-- Customers may inspect only their own direct-checkout state. Creation and
-- settlement are intentionally reserved for trusted server-side code in Stage 2.
drop policy if exists "cashfree_checkout_intent_payments_select_own_or_admin"
  on public.cashfree_checkout_intent_payments;
create policy "cashfree_checkout_intent_payments_select_own_or_admin"
  on public.cashfree_checkout_intent_payments
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
