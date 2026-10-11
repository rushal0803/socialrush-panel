-- Manual wallet deposits: service-role-only atomic review and evidence.
-- No direct authenticated execution; the server action verifies admin identity.
create or replace function public.admin_review_manual_wallet_payment(
  p_transaction_id uuid, p_decision text, p_verified_transaction_id text, p_evidence text
) returns void
language plpgsql security definer set search_path = public
as $$
declare v_payment public.transactions%rowtype;
begin
  if coalesce(auth.jwt()->>'role', '') <> 'service_role' then
    raise exception 'Service role required';
  end if;
  if p_decision not in ('approve','reject') then raise exception 'Invalid decision'; end if;
  if char_length(trim(coalesce(p_evidence,''))) < (case when p_decision='approve' then 20 else 12 end)
     or char_length(p_evidence) > 1000 then raise exception 'Review evidence required'; end if;
  select * into v_payment from public.transactions
    where id=p_transaction_id for update;
  if not found or v_payment.status <> 'pending' or v_payment.type <> 'credit'
     or v_payment.payment_method not in ('manual_upi','manual_bank_transfer','manual_usdt_trc20')
  then raise exception 'Pending manual deposit not found'; end if;
  if p_decision='approve' and (v_payment.amount is null or v_payment.amount <= 0) then
    raise exception 'Invalid deposit amount';
  end if;
  if p_decision='approve' and (
    trim(coalesce(p_verified_transaction_id,'')) = ''
    or upper(trim(p_verified_transaction_id)) <> upper(coalesce(v_payment.provider_payment_id,''))
  ) then raise exception 'Transaction ID does not match'; end if;
  if p_decision='approve' then
    update public.profiles set balance=balance+v_payment.amount where id=v_payment.user_id;
    if not found then raise exception 'Wallet profile missing'; end if;
  end if;
  update public.transactions
  set status=case when p_decision='approve' then 'completed' else 'failed' end,
      metadata=coalesce(v_payment.metadata,'{}'::jsonb) || jsonb_build_object(
        'admin_review_decision',p_decision,
        'admin_review_evidence',trim(p_evidence),
        'admin_reviewed_at',now(),
        'admin_verified_transaction_id',case when p_decision='approve' then trim(p_verified_transaction_id) else null end
      )
  where id=p_transaction_id;
end;
$$;
revoke all on function public.admin_review_manual_wallet_payment(uuid,text,text,text) from public;
revoke all on function public.admin_review_manual_wallet_payment(uuid,text,text,text) from anon, authenticated;
grant execute on function public.admin_review_manual_wallet_payment(uuid,text,text,text) to service_role;
