-- Checkout-specific Razorpay shortfall payments and atomic order completion.
create table if not exists public.checkout_intent_payments (
  id uuid primary key default gen_random_uuid(),
  checkout_intent_id uuid not null references public.checkout_intents(id) on delete restrict,
  user_id uuid not null references public.profiles(id) on delete cascade,
  client_request_id text not null,
  provider_order_id text not null,
  provider_payment_id text,
  amount_paise bigint not null check (amount_paise > 0),
  currency text not null default 'INR' check (currency = 'INR'),
  return_url text not null check (return_url like '/%' and return_url not like '//%'),
  status text not null default 'created' check (status in ('created','completed','failed','cancelled')),
  order_id uuid references public.orders(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create unique index if not exists checkout_intent_payments_intent_unique
  on public.checkout_intent_payments(checkout_intent_id);
create unique index if not exists checkout_intent_payments_provider_order_unique
  on public.checkout_intent_payments(provider_order_id);
create unique index if not exists checkout_intent_payments_provider_payment_unique
  on public.checkout_intent_payments(provider_payment_id)
  where provider_payment_id is not null;
create unique index if not exists checkout_intent_payments_user_request_unique
  on public.checkout_intent_payments(user_id, client_request_id);

alter table public.checkout_intent_payments enable row level security;
drop policy if exists "checkout_intent_payments_select_own" on public.checkout_intent_payments;
create policy "checkout_intent_payments_select_own"
  on public.checkout_intent_payments for select to authenticated
  using (user_id = auth.uid());

create or replace function public.complete_checkout_intent_payment_system(
  p_checkout_payment_id uuid,
  p_provider_payment_id text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payment public.checkout_intent_payments%rowtype;
  v_intent public.checkout_intents%rowtype;
  v_existing public.orders%rowtype;
  v_service_id bigint;
  v_name text;
  v_platform text;
  v_charge numeric(14,2);
  v_unit_price numeric(14,4);
  v_credit numeric(14,2);
  v_balance numeric(14,2);
  v_order_id uuid;
begin
  select * into v_payment
  from public.checkout_intent_payments
  where id = p_checkout_payment_id
  for update;

  if not found then raise exception 'Checkout payment not found'; end if;
  if v_payment.status = 'completed' then
    if v_payment.provider_payment_id <> p_provider_payment_id then
      raise exception 'Checkout payment was completed with a different payment ID';
    end if;
    select balance into v_balance from public.profiles where id = v_payment.user_id;
    return jsonb_build_object(
      'id', v_payment.order_id,
      'orderId', v_payment.order_id,
      'balance', v_balance,
      'duplicate', true
    );
  end if;
  if v_payment.status <> 'created' then raise exception 'Checkout payment cannot be completed'; end if;
  if nullif(trim(p_provider_payment_id), '') is null then raise exception 'Provider payment ID is required'; end if;

  if exists (
    select 1 from public.checkout_intent_payments
    where provider_payment_id = p_provider_payment_id and id <> v_payment.id
  ) then
    raise exception 'Provider payment ID was already consumed';
  end if;

  select * into v_intent
  from public.checkout_intents
  where id = v_payment.checkout_intent_id
  for update;
  if not found or v_intent.user_id <> v_payment.user_id then raise exception 'Checkout intent not found'; end if;

  if v_intent.status = 'completed' then
    if v_intent.order_id is null then raise exception 'Completed checkout intent has no order'; end if;
    v_credit := v_payment.amount_paise::numeric / 100;
    update public.profiles
    set balance = balance + v_credit
    where id = v_payment.user_id
    returning balance into v_balance;
    insert into public.transactions (
      user_id, amount, type, status, payment_method, provider_order_id,
      provider_payment_id, description, metadata
    ) values (
      v_payment.user_id, v_credit, 'credit', 'completed', 'razorpay',
      v_payment.provider_order_id, p_provider_payment_id,
      'Checkout payment credited after order completion',
      jsonb_build_object(
        'checkout_intent_id', v_intent.id,
        'checkout_payment_id', v_payment.id,
        'order_id', v_intent.order_id
      )
    );
    update public.checkout_intent_payments
    set status = 'completed', provider_payment_id = p_provider_payment_id,
        order_id = v_intent.order_id, completed_at = now(), updated_at = now()
    where id = v_payment.id;
    return jsonb_build_object(
      'id', v_intent.order_id,
      'orderId', v_intent.order_id,
      'balance', v_balance,
      'duplicate', true
    );
  end if;
  if v_intent.status = 'cancelled' then raise exception 'Checkout intent is cancelled'; end if;
  if v_intent.status = 'expired' or v_intent.expires_at <= now() then
    raise exception 'Checkout intent is expired';
  end if;
  if v_intent.status <> 'created' then raise exception 'Checkout intent status is invalid'; end if;
  if v_intent.client_request_id <> v_payment.client_request_id then
    raise exception 'Checkout payment request ID mismatch';
  end if;

  v_charge := v_intent.total_paise::numeric / 100;
  v_credit := v_payment.amount_paise::numeric / 100;

  select balance into v_balance
  from public.profiles
  where id = v_payment.user_id
  for update;
  if not found then raise exception 'Wallet profile not found'; end if;
  if round(v_balance * 100)::bigint + v_payment.amount_paise < v_intent.total_paise then
    raise exception 'Wallet balance changed and no longer covers this checkout';
  end if;

  select x.name, x.platform
  into v_name, v_platform
  from (
    values
      ('instagram-followers', 'Instagram Followers', 'instagram'),
      ('instagram-likes', 'Instagram Likes', 'instagram'),
      ('instagram-views', 'Instagram Views', 'instagram'),
      ('youtube-subscribers', 'YouTube Subscribers', 'youtube'),
      ('youtube-likes', 'YouTube Likes', 'youtube'),
      ('youtube-views', 'YouTube Views', 'youtube'),
      ('facebook-followers', 'Facebook Followers', 'facebook'),
      ('facebook-likes', 'Facebook Likes', 'facebook'),
      ('facebook-views', 'Facebook Views', 'facebook'),
      ('facebook-shares', 'Facebook Shares', 'facebook'),
      ('linkedin-followers', 'LinkedIn Followers', 'linkedin'),
      ('linkedin-likes', 'LinkedIn Likes', 'linkedin'),
      ('telegram-members', 'Telegram Members', 'telegram'),
      ('tiktok-followers', 'TikTok Followers', 'tiktok'),
      ('tiktok-likes', 'TikTok Likes', 'tiktok'),
      ('tiktok-views', 'TikTok Views', 'tiktok'),
      ('x-followers', 'Twitter/X Followers', 'x')
  ) as x(code, name, platform)
  where x.code = v_intent.service_code;
  if not found then raise exception 'Unknown checkout intent service'; end if;

  v_service_id := v_intent.service_id;
  if v_service_id is null or not exists (
    select 1 from public.services where id = v_service_id and status = 'active'
  ) then raise exception 'Checkout intent service is unavailable'; end if;

  select * into v_existing from public.orders
  where user_id = v_payment.user_id
    and client_request_id::text = v_intent.client_request_id;
  if found then raise exception 'Checkout request ID already belongs to a different order'; end if;

  update public.profiles
  set balance = balance + v_credit
  where id = v_payment.user_id
  returning balance into v_balance;

  insert into public.transactions (
    user_id, amount, type, status, payment_method, provider_order_id,
    provider_payment_id, description, metadata
  ) values (
    v_payment.user_id, v_credit, 'credit', 'completed', 'razorpay',
    v_payment.provider_order_id, p_provider_payment_id,
    'Checkout shortfall payment',
    jsonb_build_object('checkout_intent_id', v_intent.id, 'checkout_payment_id', v_payment.id)
  );

  update public.profiles
  set balance = balance - v_charge
  where id = v_payment.user_id and balance >= v_charge
  returning balance into v_balance;
  if not found then raise exception 'Insufficient campaign budget'; end if;

  v_unit_price := round((v_charge * 1000) / v_intent.quantity, 4);
  insert into public.orders (
    user_id, service_id, service_name, platform, link, quantity,
    unit_price, charge, status, package_name, client_request_id, notes
  ) values (
    v_payment.user_id, v_service_id, v_name, v_platform, v_intent.destination_link,
    v_intent.quantity, v_unit_price, v_charge, 'pending', 'Custom',
    v_intent.client_request_id::uuid, v_intent.notes
  ) returning id into v_order_id;

  insert into public.transactions (
    user_id, amount, type, status, payment_method, description, metadata
  ) values (
    v_payment.user_id, v_charge, 'debit', 'completed', 'wallet',
    'Campaign checkout: ' || v_name,
    jsonb_build_object(
      'order_id', v_order_id, 'checkout_intent_id', v_intent.id,
      'checkout_payment_id', v_payment.id, 'service_code', v_intent.service_code,
      'quantity', v_intent.quantity
    )
  );

  update public.checkout_intents
  set status = 'completed', order_id = v_order_id,
      completed_at = now(), updated_at = now()
  where id = v_intent.id;

  update public.checkout_intent_payments
  set status = 'completed', provider_payment_id = p_provider_payment_id,
      order_id = v_order_id, completed_at = now(), updated_at = now()
  where id = v_payment.id;

  return jsonb_build_object(
    'id', v_order_id, 'orderId', v_order_id,
    'charge', v_charge, 'balance', v_balance, 'duplicate', false
  );
end;
$$;

revoke all on function public.complete_checkout_intent_payment_system(uuid, text) from public;
grant execute on function public.complete_checkout_intent_payment_system(uuid, text) to service_role;
