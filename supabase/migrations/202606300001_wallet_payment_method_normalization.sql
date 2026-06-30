-- Canonicalize wallet payment methods so current and legacy clients cannot
-- accidentally store UI labels or reject enabled Razorpay methods.

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
  v_method text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if p_amount <= 0 or p_amount > 500000 then
    raise exception 'Amount must be greater than 0 and at most 500000';
  end if;

  v_method := lower(trim(regexp_replace(coalesce(p_method, ''), '\s+', ' ', 'g')));
  v_method := case v_method
    when 'upi' then 'upi'
    when 'card' then 'card'
    when 'debit card / credit card' then 'card'
    when 'debit card' then 'card'
    when 'credit card' then 'card'
    when 'netbanking' then 'netbanking'
    when 'net banking' then 'netbanking'
    when 'international_card' then 'international_card'
    when 'international card' then 'international_card'
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
