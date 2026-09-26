alter table public.checkout_intents
  add column if not exists client_id uuid references public.customer_clients(id) on delete set null,
  add column if not exists campaign_id uuid references public.campaigns(id) on delete set null;

create index if not exists checkout_intents_user_client_idx
  on public.checkout_intents(user_id, client_id)
  where client_id is not null;

create index if not exists checkout_intents_user_campaign_idx
  on public.checkout_intents(user_id, campaign_id)
  where campaign_id is not null;

create or replace function public.checkout_custom_intent_with_wallet(
  p_intent_id uuid,
  p_client_request_id text,
  p_service_code text,
  p_quantity integer,
  p_link text
)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
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
$function$;


revoke all on function public.checkout_custom_intent_with_wallet(uuid, text, text, integer, text) from public, anon;
grant execute on function public.checkout_custom_intent_with_wallet(uuid, text, text, integer, text) to authenticated, service_role;
