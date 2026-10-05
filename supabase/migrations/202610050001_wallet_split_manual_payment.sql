-- Atomically apply the wallet amount shown on a manual-payment checkout.
-- The expected amount prevents a customer from being asked to pay one amount
-- while a later wallet balance change causes a different debit.
create or replace function public.apply_wallet_to_manual_checkout(
  p_intent_id uuid,
  p_client_request_id uuid,
  p_expected_wallet numeric
)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  v_user uuid:=auth.uid();
  v_intent checkout_intents%rowtype;
  v_balance numeric;
  v_total numeric;
  v_applied numeric;
  v_remaining numeric;
  v_existing transactions%rowtype;
begin
  if v_user is null then raise exception 'authentication required'; end if;
  if p_expected_wallet is null or p_expected_wallet < 0 then raise exception 'invalid wallet amount'; end if;

  select * into v_intent from checkout_intents
  where id=p_intent_id and user_id=v_user and client_request_id=p_client_request_id
  for update;
  if not found then raise exception 'checkout intent not found'; end if;
  if v_intent.status<>'created' then raise exception 'checkout intent conflict'; end if;
  if v_intent.expires_at<=now() then raise exception 'checkout intent expired'; end if;

  v_total:=v_intent.total_paise::numeric/100;
  select * into v_existing from transactions
  where user_id=v_user and provider_payment_id='wallet-split:'||p_intent_id::text limit 1;
  if found then
    v_applied:=abs(coalesce(v_existing.amount,0));
    return jsonb_build_object('wallet_applied',v_applied,'remaining',greatest(v_total-v_applied,0),'duplicate',true);
  end if;

  select greatest(coalesce(balance,0),0) into v_balance
  from profiles where id=v_user for update;
  if not found then raise exception 'wallet profile not found'; end if;
  v_applied:=least(v_balance,v_total);

  if round(v_applied,2) <> round(p_expected_wallet,2) then
    raise exception 'wallet balance changed; refresh checkout';
  end if;

  v_remaining:=greatest(v_total-v_applied,0);
  -- Do not debit here when the caller must use the wallet-only order flow.
  if v_remaining<=0 then
    return jsonb_build_object('wallet_applied',v_applied,'remaining',0,'duplicate',false);
  end if;
  if v_applied>0 then
    update profiles set balance=balance-v_applied,updated_at=now() where id=v_user;
    insert into transactions(user_id,type,amount,status,description,provider_payment_id)
    values(v_user,'debit',v_applied,'completed','Wallet applied to split order payment','wallet-split:'||p_intent_id::text);
  end if;
  return jsonb_build_object('wallet_applied',v_applied,'remaining',v_remaining,'duplicate',false);
end;
$$;

revoke execute on function public.apply_wallet_to_manual_checkout(uuid,uuid,numeric) from public;
revoke execute on function public.apply_wallet_to_manual_checkout(uuid,uuid,numeric) from anon;
grant execute on function public.apply_wallet_to_manual_checkout(uuid,uuid,numeric) to authenticated;
