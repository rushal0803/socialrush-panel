-- Canonical wallet funding methods, including international cards.

create or replace function public.create_wallet_payment(
  p_amount numeric,
  p_method text,
  p_provider_order_id text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if p_amount <= 0 or p_amount > 500000 then
    raise exception 'Amount must be greater than 0 and at most 500000';
  end if;

  if p_method not in ('upi', 'card', 'netbanking', 'wallet', 'international_card') then
    raise exception 'Unsupported payment method';
  end if;

  insert into public.transactions (
    user_id,
    amount,
    type,
    status,
    payment_method,
    provider_order_id,
    description
  )
  values (
    auth.uid(),
    p_amount,
    'credit',
    'pending',
    p_method,
    p_provider_order_id,
    'Wallet funding'
  )
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.create_wallet_payment(numeric, text, text) from public;
grant execute on function public.create_wallet_payment(numeric, text, text) to authenticated;
