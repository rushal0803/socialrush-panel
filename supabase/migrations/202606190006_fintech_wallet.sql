-- Fintech wallet metadata and atomic Razorpay settlement functions.

alter table public.transactions add column if not exists payment_method text;
alter table public.transactions add column if not exists provider_order_id text;
alter table public.transactions add column if not exists provider_payment_id text;
alter table public.transactions add column if not exists provider_refund_id text;
alter table public.transactions add column if not exists description text;
alter table public.transactions add column if not exists metadata jsonb not null default '{}'::jsonb;

create unique index if not exists transactions_provider_order_unique on public.transactions(provider_order_id) where provider_order_id is not null;
create unique index if not exists transactions_provider_payment_unique on public.transactions(provider_payment_id) where provider_payment_id is not null;

create or replace function public.create_wallet_payment(p_amount numeric, p_method text, p_provider_order_id text)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if p_amount <= 0 or p_amount > 500000 then raise exception 'Amount must be greater than 0 and at most 500000'; end if;
  if p_method not in ('upi','card','netbanking','international_card') then raise exception 'Unsupported payment method'; end if;
  insert into public.transactions (user_id, amount, type, status, payment_method, provider_order_id, description)
  values (auth.uid(), p_amount, 'credit', 'pending', p_method, p_provider_order_id, 'Wallet funding') returning id into v_id;
  return v_id;
end; $$;

create or replace function public.credit_verified_payment(p_provider_order_id text, p_provider_payment_id text)
returns numeric language plpgsql security definer set search_path = public as $$
declare v_transaction public.transactions%rowtype; v_balance numeric(14,2);
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select * into v_transaction from public.transactions where provider_order_id = p_provider_order_id and user_id = auth.uid() for update;
  if not found then raise exception 'Payment transaction not found'; end if;
  if v_transaction.status = 'completed' then select balance into v_balance from public.profiles where id = auth.uid(); return v_balance; end if;
  if v_transaction.status <> 'pending' then raise exception 'Payment cannot be settled'; end if;
  update public.transactions set status = 'completed', provider_payment_id = p_provider_payment_id where id = v_transaction.id;
  update public.profiles set balance = balance + v_transaction.amount where id = auth.uid() returning balance into v_balance;
  return v_balance;
end; $$;

create or replace function public.credit_wallet_payment_system(p_provider_order_id text, p_provider_payment_id text)
returns void language plpgsql security definer set search_path = public as $$
declare v_transaction public.transactions%rowtype;
begin
  select * into v_transaction from public.transactions where provider_order_id = p_provider_order_id for update;
  if not found or v_transaction.status = 'completed' then return; end if;
  if v_transaction.status <> 'pending' then return; end if;
  update public.transactions set status = 'completed', provider_payment_id = p_provider_payment_id where id = v_transaction.id;
  update public.profiles set balance = balance + v_transaction.amount where id = v_transaction.user_id;
end; $$;

create or replace function public.admin_refund_wallet_payment(p_transaction_id uuid, p_provider_refund_id text)
returns void language plpgsql security definer set search_path = public as $$
declare v_transaction public.transactions%rowtype;
begin
  if not public.is_admin() then raise exception 'Admin access required'; end if;
  select * into v_transaction from public.transactions where id = p_transaction_id and type = 'credit' and status = 'completed' for update;
  if not found then raise exception 'Completed wallet payment not found'; end if;
  update public.profiles set balance = balance - v_transaction.amount where id = v_transaction.user_id and balance >= v_transaction.amount;
  if not found then raise exception 'Wallet balance is below refundable amount'; end if;
  update public.transactions set status = 'cancelled', provider_refund_id = p_provider_refund_id where id = v_transaction.id;
  insert into public.transactions (user_id, amount, type, status, payment_method, provider_refund_id, description)
  values (v_transaction.user_id, v_transaction.amount, 'refund', 'completed', v_transaction.payment_method, p_provider_refund_id, 'Payment refunded to original method');
end; $$;

revoke all on function public.create_wallet_payment(numeric,text,text) from public;
revoke all on function public.credit_verified_payment(text,text) from public;
revoke all on function public.credit_wallet_payment_system(text,text) from public;
revoke all on function public.admin_refund_wallet_payment(uuid,text) from public;
grant execute on function public.create_wallet_payment(numeric,text,text) to authenticated;
grant execute on function public.credit_verified_payment(text,text) to authenticated;
grant execute on function public.credit_wallet_payment_system(text,text) to service_role;
grant execute on function public.admin_refund_wallet_payment(uuid,text) to authenticated;
