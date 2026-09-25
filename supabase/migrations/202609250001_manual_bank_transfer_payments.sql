-- Extend manual wallet payment review to bank transfer and USDT without
-- changing the existing admin-only approval/credit path.

create or replace function public.admin_review_payment(p_transaction_id uuid, p_decision text)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_transaction public.transactions%rowtype;
begin
  if not public.is_admin() then raise exception 'Admin access required'; end if;
  if p_decision not in ('approve', 'reject') then raise exception 'Invalid payment decision'; end if;

  select * into v_transaction
  from public.transactions
  where id = p_transaction_id
  for update;

  if not found then raise exception 'Payment not found'; end if;
  if v_transaction.status <> 'pending' then raise exception 'Payment has already been reviewed'; end if;
  if v_transaction.type <> 'credit' then raise exception 'Only pending credit payments can be reviewed'; end if;
  if coalesce(v_transaction.payment_method, '') not in ('manual_upi', 'manual_bank_transfer', 'manual_usdt_trc20') then
    raise exception 'Only manual payments can be reviewed by an administrator';
  end if;

  if p_decision = 'approve' then
    update public.profiles
      set balance = balance + v_transaction.amount
      where id = v_transaction.user_id;
    if not found then raise exception 'Wallet profile not found'; end if;

    update public.transactions
      set status = 'completed'
      where id = p_transaction_id;
  else
    update public.transactions
      set status = 'failed'
      where id = p_transaction_id;
  end if;
end;
$$;

revoke all on function public.admin_review_payment(uuid, text) from public;
grant execute on function public.admin_review_payment(uuid, text) to authenticated;
