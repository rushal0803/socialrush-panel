-- Correct the previously applied split RPC and prevent cross-flow double deductions.
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
set search_path=public,pg_temp
as $$
declare
  v_user uuid:=auth.uid();
  v_intent public.checkout_intents%rowtype;
  v_balance numeric;
  v_total numeric;
  v_applied numeric;
  v_remaining numeric;
  v_existing public.transactions%rowtype;
begin
  if v_user is null then raise exception 'authentication required'; end if;
  if p_expected_wallet is null or p_expected_wallet < 0 then raise exception 'invalid wallet amount'; end if;

  select * into v_intent from public.checkout_intents
  where id=p_intent_id and user_id=v_user and client_request_id=p_client_request_id::text
  for update;
  if not found then raise exception 'checkout intent not found'; end if;
  if v_intent.status<>'created' then raise exception 'checkout intent conflict'; end if;
  if v_intent.expires_at<=now() then raise exception 'checkout intent expired'; end if;

  if v_intent.currency<>'INR' or v_intent.total_paise<=0 then raise exception 'checkout amount invalid'; end if;
  if exists(select 1 from public.orders where user_id=v_user and client_request_id=p_client_request_id) then
    raise exception 'checkout request already has an order';
  end if;
  v_total:=v_intent.total_paise::numeric/100;
  select * into v_existing from public.transactions
  where user_id=v_user and provider_payment_id='wallet-split:'||p_intent_id::text limit 1;
  if found then
    v_applied:=abs(coalesce(v_existing.amount,0));
    return jsonb_build_object('wallet_applied',v_applied,'remaining',greatest(v_total-v_applied,0),'duplicate',true);
  end if;

  select greatest(coalesce(balance,0),0) into v_balance
  from public.profiles where id=v_user for update;
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
    update public.profiles set balance=balance-v_applied,updated_at=now() where id=v_user;
    insert into public.transactions(user_id,type,amount,status,description,provider_payment_id)
    values(v_user,'debit',v_applied,'completed','Wallet applied to split order payment','wallet-split:'||p_intent_id::text);
  end if;
  return jsonb_build_object('wallet_applied',v_applied,'remaining',v_remaining,'duplicate',false);
end;
$$;

revoke execute on function public.apply_wallet_to_manual_checkout(uuid,uuid,numeric) from public;
revoke execute on function public.apply_wallet_to_manual_checkout(uuid,uuid,numeric) from anon;
grant execute on function public.apply_wallet_to_manual_checkout(uuid,uuid,numeric) to authenticated;

CREATE OR REPLACE FUNCTION public.checkout_custom_intent_with_wallet(p_intent_id uuid, p_client_request_id text, p_service_code text, p_quantity integer, p_link text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_user_id uuid := auth.uid();
  v_intent public.checkout_intents%rowtype;
  v_existing public.orders%rowtype;
  v_service public.services%rowtype;
  v_charge numeric(14,2);
  v_unit_price numeric(14,4);
  v_balance numeric(14,2);
  v_order_id uuid;
  v_client_id uuid;
  v_campaign_client_id uuid;
begin
  if v_user_id is null then raise exception 'Authentication required'; end if;
  if p_intent_id is null or nullif(trim(p_client_request_id), '') is null then raise exception 'Checkout intent is required'; end if;

  select * into v_intent
  from public.checkout_intents
  where id = p_intent_id
  for update;

  if not found or v_intent.user_id <> v_user_id then raise exception 'Checkout intent not found'; end if;
  if v_intent.client_request_id <> trim(p_client_request_id)
     or v_intent.service_code <> trim(p_service_code)
     or v_intent.quantity <> p_quantity
     or v_intent.destination_link <> trim(p_link) then
    raise exception 'Checkout intent details mismatch';
  end if;

  if v_intent.status = 'completed' then
    select * into v_existing from public.orders where id = v_intent.order_id and user_id = v_user_id;
    if not found then raise exception 'Completed checkout order not found'; end if;
    select balance into v_balance from public.profiles where id = v_user_id;
    return jsonb_build_object('id',v_existing.id,'charge',v_existing.charge,'balance',v_balance,'duplicate',true);
  end if;

  if v_intent.status = 'cancelled' then raise exception 'Checkout intent is cancelled'; end if;
  if v_intent.status = 'expired' or v_intent.expires_at <= now() then
    update public.checkout_intents set status='expired',updated_at=now() where id=v_intent.id;
    raise exception 'Checkout intent is expired';
  end if;
  if v_intent.status <> 'created' then raise exception 'Checkout intent status is invalid'; end if;

  v_client_id := v_intent.client_id;
  if v_client_id is not null and not exists (
    select 1 from public.customer_clients
    where id = v_client_id and user_id = v_user_id
  ) then
    raise exception 'Checkout client is unavailable';
  end if;

  if v_intent.campaign_id is not null then
    select client_id into v_campaign_client_id
    from public.campaigns
    where id = v_intent.campaign_id and user_id = v_user_id;

    if not found then raise exception 'Checkout campaign is unavailable'; end if;

    if v_campaign_client_id is not null then
      if v_client_id is null then
        v_client_id := v_campaign_client_id;
      elsif v_client_id <> v_campaign_client_id then
        raise exception 'Checkout client and campaign do not match';
      end if;
    end if;
  end if;

  select * into v_service
  from public.services
  where id=v_intent.service_id and status='active' and coalesce(accepts_new_orders,true)
  for share;

  if not found or v_service.health_status='paused' then raise exception 'Checkout intent service is unavailable'; end if;
  if v_intent.total_paise is null or v_intent.total_paise <= 0 or v_intent.currency <> 'INR' then
    raise exception 'Checkout intent amount is invalid';
  end if;

  select * into v_existing
  from public.orders
  where user_id=v_user_id and client_request_id::text=v_intent.client_request_id;

  if found then raise exception 'Checkout request ID already belongs to a different order'; end if;

  if exists (select 1 from public.transactions where user_id=v_user_id
    and provider_payment_id='wallet-split:'||v_intent.id::text) then
    raise exception 'Wallet already applied to manual checkout; finish the same payment';
  end if;
  v_charge := v_intent.total_paise::numeric/100;
  v_unit_price := round((v_charge*1000)/v_intent.quantity,4);

  update public.profiles
  set balance=balance-v_charge
  where id=v_user_id and balance>=v_charge
  returning balance into v_balance;

  if not found then raise exception 'Insufficient campaign budget'; end if;

  insert into public.orders(
    user_id,service_id,service_name,platform,link,quantity,unit_price,charge,status,
    package_name,client_request_id,notes,client_id,campaign_id
  )
  values(
    v_user_id,v_service.id,v_service.name,v_service.platform,v_intent.destination_link,
    v_intent.quantity,v_unit_price,v_charge,'pending','Custom',v_intent.client_request_id::uuid,
    v_intent.notes,v_client_id,v_intent.campaign_id
  )
  returning id into v_order_id;

  insert into public.transactions(user_id,amount,type,status,payment_method,description,metadata)
  values(
    v_user_id,v_charge,'debit','completed','wallet','Campaign checkout: '||v_service.name,
    jsonb_build_object(
      'order_id',v_order_id,
      'checkout_intent_id',v_intent.id,
      'service_code',v_intent.service_code,
      'quantity',v_intent.quantity,
      'total_paise',v_intent.total_paise,
      'currency',v_intent.currency,
      'client_id',v_client_id,
      'campaign_id',v_intent.campaign_id
    )
  );

  update public.checkout_intents
  set status='completed',order_id=v_order_id,completed_at=now(),updated_at=now()
  where id=v_intent.id;

  return jsonb_build_object('id',v_order_id,'charge',v_charge,'balance',v_balance,'duplicate',false);
end
$function$
;
