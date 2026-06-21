-- Atomic admin operations for SocialRUSH Panel.

create or replace function public.admin_adjust_balance(
  p_user_id uuid,
  p_amount numeric,
  p_operation text
)
returns numeric
language plpgsql
security definer set search_path = public
as $$
declare
  v_new_balance numeric(14, 2);
  v_type text;
begin
  if not public.is_admin() then raise exception 'Admin access required'; end if;
  if p_amount <= 0 then raise exception 'Amount must be greater than zero'; end if;
  if p_operation not in ('add', 'deduct') then raise exception 'Invalid balance operation'; end if;

  if p_operation = 'deduct' then
    update public.profiles
    set balance = balance - p_amount
    where id = p_user_id and balance >= p_amount
    returning balance into v_new_balance;
    v_type := 'debit';
  else
    update public.profiles
    set balance = balance + p_amount
    where id = p_user_id
    returning balance into v_new_balance;
    v_type := 'credit';
  end if;

  if v_new_balance is null then raise exception 'User not found or insufficient balance'; end if;

  insert into public.transactions (user_id, amount, type, status)
  values (p_user_id, p_amount, v_type, 'completed');

  return v_new_balance;
end;
$$;

revoke all on function public.admin_adjust_balance(uuid, numeric, text) from public;
grant execute on function public.admin_adjust_balance(uuid, numeric, text) to authenticated;
