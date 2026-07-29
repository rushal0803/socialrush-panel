-- Atomically complete a custom-service checkout intent with wallet funds.
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
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_intent public.checkout_intents%rowtype;
  v_existing public.orders%rowtype;
  v_service_id bigint;
  v_name text;
  v_platform text;
  v_charge numeric(14,2);
  v_unit_price numeric(14,4);
  v_balance numeric(14,2);
  v_order_id uuid;
begin
  if v_user_id is null then raise exception 'Authentication required'; end if;
  if p_intent_id is null then raise exception 'Checkout intent is required'; end if;
  if nullif(trim(p_client_request_id), '') is null then raise exception 'Checkout request ID is required'; end if;

  select * into v_intent
  from public.checkout_intents
  where id = p_intent_id
  for update;

  if not found then raise exception 'Checkout intent not found'; end if;
  if v_intent.user_id <> v_user_id then raise exception 'Checkout intent not found'; end if;
  if v_intent.client_request_id <> trim(p_client_request_id) then
    raise exception 'Checkout intent request ID mismatch';
  end if;
  if v_intent.service_code <> trim(p_service_code)
    or v_intent.quantity <> p_quantity
    or v_intent.destination_link <> trim(p_link) then
    raise exception 'Checkout intent details mismatch';
  end if;

  if v_intent.status = 'completed' then
    if v_intent.order_id is null then raise exception 'Completed checkout intent has no order'; end if;
    select * into v_existing
    from public.orders
    where id = v_intent.order_id and user_id = v_user_id;
    if not found then raise exception 'Completed checkout order not found'; end if;
    if v_existing.client_request_id::text <> v_intent.client_request_id
      or v_existing.link <> v_intent.destination_link
      or v_existing.quantity <> v_intent.quantity then
      raise exception 'Completed checkout intent conflicts with its order';
    end if;
    select balance into v_balance from public.profiles where id = v_user_id;
    return jsonb_build_object(
      'id', v_existing.id,
      'charge', v_existing.charge,
      'balance', v_balance,
      'duplicate', true
    );
  elsif v_intent.status = 'cancelled' then
    raise exception 'Checkout intent is cancelled';
  elsif v_intent.status = 'expired' then
    raise exception 'Checkout intent is expired';
  elsif v_intent.status <> 'created' then
    raise exception 'Checkout intent status is invalid';
  end if;

  if v_intent.expires_at <= now() then
    update public.checkout_intents
    set status = 'expired', updated_at = now()
    where id = v_intent.id;
    raise exception 'Checkout intent is expired';
  end if;

  select * into v_existing
  from public.orders
  where user_id = v_user_id
    and client_request_id::text = v_intent.client_request_id;
  if found then
    raise exception 'Checkout request ID already belongs to a different order';
  end if;

  select x.name, x.platform
  into v_name, v_platform
  from (
    values
      ('instagram-followers', 'Instagram Followers', 'instagram'),
      ('instagram-likes', 'Instagram Likes', 'instagram'),
      ('instagram-views', 'Instagram Views', 'instagram'),
      ('youtube-subscribers', 'YouTube Subscribers', 'youtube'),
      ('youtube-likes', 'YouTube Likes', 'youtube'),
      ('youtube-views', 'YouTube Views', 'youtube'),
      ('facebook-followers', 'Facebook Followers', 'facebook'),
      ('facebook-likes', 'Facebook Likes', 'facebook'),
      ('facebook-views', 'Facebook Views', 'facebook'),
      ('facebook-shares', 'Facebook Shares', 'facebook'),
      ('linkedin-followers', 'LinkedIn Followers', 'linkedin'),
      ('linkedin-likes', 'LinkedIn Likes', 'linkedin'),
      ('telegram-members', 'Telegram Members', 'telegram'),
      ('tiktok-followers', 'TikTok Followers', 'tiktok'),
      ('tiktok-likes', 'TikTok Likes', 'tiktok'),
      ('tiktok-views', 'TikTok Views', 'tiktok'),
      ('x-followers', 'Twitter/X Followers', 'x')
  ) as x(code, name, platform)
  where x.code = v_intent.service_code;
  if not found then raise exception 'Unknown checkout intent service'; end if;

  v_service_id := v_intent.service_id;
  if v_service_id is null or not exists (
    select 1 from public.services where id = v_service_id and status = 'active'
  ) then
    raise exception 'Checkout intent service is unavailable';
  end if;

  v_charge := v_intent.total_paise::numeric / 100;
  v_unit_price := round((v_charge * 1000) / v_intent.quantity, 4);

  update public.profiles
  set balance = balance - v_charge
  where id = v_user_id and balance >= v_charge
  returning balance into v_balance;
  if not found then raise exception 'Insufficient campaign budget'; end if;

  insert into public.orders (
    user_id, service_id, service_name, platform, link, quantity,
    unit_price, charge, status, package_name, client_request_id, notes
  )
  values (
    v_user_id, v_service_id, v_name, v_platform, v_intent.destination_link,
    v_intent.quantity, v_unit_price, v_charge, 'pending', 'Custom',
    v_intent.client_request_id::uuid, v_intent.notes
  )
  returning id into v_order_id;

  insert into public.transactions (
    user_id, amount, type, status, payment_method, description, metadata
  )
  values (
    v_user_id, v_charge, 'debit', 'completed', 'wallet',
    'Campaign checkout: ' || v_name,
    jsonb_build_object(
      'order_id', v_order_id,
      'checkout_intent_id', v_intent.id,
      'service_code', v_intent.service_code,
      'quantity', v_intent.quantity
    )
  );

  update public.checkout_intents
  set status = 'completed',
      order_id = v_order_id,
      completed_at = now(),
      updated_at = now()
  where id = v_intent.id;

  return jsonb_build_object(
    'id', v_order_id,
    'charge', v_charge,
    'balance', v_balance,
    'duplicate', false
  );
end;
$$;

revoke all on function public.checkout_custom_intent_with_wallet(uuid, text, text, integer, text) from public;
grant execute on function public.checkout_custom_intent_with_wallet(uuid, text, text, integer, text) to authenticated;
