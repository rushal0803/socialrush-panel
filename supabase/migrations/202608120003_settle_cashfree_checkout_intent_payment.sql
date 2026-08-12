-- Atomically settle a verified direct Cashfree order payment.  This is
-- service-role only so neither browser callbacks nor customers can credit a
-- wallet or create an order without prior server-side provider verification.
create or replace function public.settle_cashfree_checkout_intent_payment_system(
  p_provider_order_id text,
  p_provider_payment_id text
) returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_payment public.cashfree_checkout_intent_payments%rowtype;
  v_intent public.checkout_intents%rowtype;
  v_service public.services%rowtype;
  v_existing public.orders%rowtype;
  v_charge numeric(14,2);
  v_balance numeric(14,2);
  v_order_id uuid;
begin
  if nullif(trim(p_provider_order_id),'') is null or nullif(trim(p_provider_payment_id),'') is null then
    raise exception 'Provider payment reference is required';
  end if;
  select * into v_payment from public.cashfree_checkout_intent_payments
  where provider_order_id=trim(p_provider_order_id) for update;
  if not found then raise exception 'Direct checkout payment not found'; end if;
  if v_payment.status='completed' then
    if v_payment.provider_payment_id<>trim(p_provider_payment_id) then raise exception 'Direct checkout payment was completed with a different payment ID'; end if;
    select balance into v_balance from public.profiles where id=v_payment.user_id;
    return jsonb_build_object('orderId',v_payment.order_id,'balance',v_balance,'duplicate',true);
  end if;
  if v_payment.status <> 'pending' then raise exception 'Direct checkout payment cannot be settled'; end if;
  if exists(select 1 from public.cashfree_checkout_intent_payments where provider_payment_id=trim(p_provider_payment_id) and id<>v_payment.id) then
    raise exception 'Provider payment ID was already consumed';
  end if;

  select * into v_intent from public.checkout_intents where id=v_payment.checkout_intent_id for update;
  if not found or v_intent.user_id<>v_payment.user_id then raise exception 'Checkout intent not found'; end if;
  if v_intent.status='completed' then
    if v_intent.order_id is null then raise exception 'Completed checkout intent has no order'; end if;
    update public.cashfree_checkout_intent_payments set provider_payment_id=trim(p_provider_payment_id),order_id=v_intent.order_id,status='completed',completed_at=now(),updated_at=now() where id=v_payment.id;
    select balance into v_balance from public.profiles where id=v_payment.user_id;
    return jsonb_build_object('orderId',v_intent.order_id,'balance',v_balance,'duplicate',true);
  end if;
  if v_intent.status<>'created' or v_intent.expires_at<=now() then raise exception 'Checkout intent is not available'; end if;
  if v_intent.currency<>'INR' or v_intent.total_paise<>v_payment.order_total_paise then raise exception 'Checkout total does not match its payment snapshot'; end if;
  select * into v_service from public.services where id=v_intent.service_id and status='active' and coalesce(accepts_new_orders,true) for share;
  if not found or v_service.health_status='paused' then raise exception 'Checkout intent service is unavailable'; end if;
  if exists(select 1 from public.orders where user_id=v_payment.user_id and client_request_id::text=v_intent.client_request_id) then raise exception 'Checkout request ID already belongs to an order'; end if;

  -- Credit and debit live inside the same transaction: a failure to create the
  -- order rolls back the credit too, preventing an orphan direct-payment credit.
  insert into public.transactions(user_id,amount,type,status,payment_method,provider_order_id,provider_payment_id,description,metadata)
  values(v_payment.user_id,v_payment.required_top_up_paise::numeric/100,'credit','completed','cashfree',v_payment.provider_order_id,trim(p_provider_payment_id),'Checkout balance payment',jsonb_build_object('checkout_intent_id',v_intent.id,'cashfree_checkout_payment_id',v_payment.id));
  update public.profiles set balance=balance+(v_payment.required_top_up_paise::numeric/100) where id=v_payment.user_id;
  v_charge:=v_intent.total_paise::numeric/100;
  update public.profiles set balance=balance-v_charge where id=v_payment.user_id and balance>=v_charge returning balance into v_balance;
  if not found then raise exception 'Insufficient campaign budget'; end if;
  insert into public.orders(user_id,service_id,service_name,platform,link,quantity,unit_price,charge,status,package_name,client_request_id,notes)
  values(v_payment.user_id,v_service.id,v_service.name,v_service.platform,v_intent.destination_link,v_intent.quantity,round((v_charge*1000)/v_intent.quantity,4),v_charge,'pending','Custom',v_intent.client_request_id::uuid,v_intent.notes) returning id into v_order_id;
  insert into public.transactions(user_id,amount,type,status,payment_method,description,metadata)
  values(v_payment.user_id,v_charge,'debit','completed','wallet','Campaign checkout: '||v_service.name,jsonb_build_object('order_id',v_order_id,'checkout_intent_id',v_intent.id,'cashfree_checkout_payment_id',v_payment.id));
  update public.checkout_intents set status='completed',order_id=v_order_id,completed_at=now(),updated_at=now() where id=v_intent.id;
  update public.cashfree_checkout_intent_payments set provider_payment_id=trim(p_provider_payment_id),order_id=v_order_id,status='completed',completed_at=now(),updated_at=now() where id=v_payment.id;
  return jsonb_build_object('orderId',v_order_id,'balance',v_balance,'duplicate',false);
end $$;
revoke all on function public.settle_cashfree_checkout_intent_payment_system(text,text) from public;
grant execute on function public.settle_cashfree_checkout_intent_payment_system(text,text) to service_role;
