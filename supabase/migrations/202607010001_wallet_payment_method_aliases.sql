-- Canonicalize all supported wallet payment aliases before validation.
-- This migration is idempotent and safely replaces only the RPC definition.

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
  v_raw_method text;
  v_method text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if p_amount <= 0 or p_amount > 500000 then
    raise exception 'Amount must be greater than 0 and at most 500000';
  end if;

  v_raw_method := lower(trim(coalesce(p_method, '')));

  v_method := case
    when v_raw_method = 'upi' then 'upi'
    when v_raw_method = 'card'
      or v_raw_method = 'debit_card'
      or v_raw_method = 'credit_card'
      or position('debit' in v_raw_method) > 0
      or position('credit' in v_raw_method) > 0
      then 'card'
    when v_raw_method = 'netbanking'
      or v_raw_method = 'net_banking'
      or v_raw_method = 'net banking'
      or position('net' in v_raw_method) > 0
      then 'netbanking'
    when v_raw_method = 'wallet'
      or position('wallet' in v_raw_method) > 0
      then 'wallet'
    when v_raw_method = 'international_card'
      or position('international' in v_raw_method) > 0
      then 'international_card'
    else null
  end;

  if v_method is null then
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
    v_method,
    p_provider_order_id,
    'Wallet funding'
  )
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.create_wallet_payment(numeric, text, text) from public;
grant execute on function public.create_wallet_payment(numeric, text, text) to authenticated;
