create or replace function public.assign_my_order_to_campaign(
  p_campaign_id uuid,
  p_order_id uuid
)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_user_id uuid := auth.uid();
  v_campaign_client_id uuid;
  v_order_client_id uuid;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  select client_id
  into v_campaign_client_id
  from public.campaigns
  where id = p_campaign_id and user_id = v_user_id;

  if not found then
    raise exception 'Campaign not found';
  end if;

  select client_id
  into v_order_client_id
  from public.orders
  where id = p_order_id and user_id = v_user_id
  for update;

  if not found then
    raise exception 'Order not found';
  end if;

  if v_campaign_client_id is not null
     and v_order_client_id is not null
     and v_campaign_client_id <> v_order_client_id then
    raise exception 'Order belongs to a different client';
  end if;

  update public.orders
  set
    campaign_id = p_campaign_id,
    client_id = coalesce(v_order_client_id, v_campaign_client_id)
  where id = p_order_id and user_id = v_user_id;
end;
$function$;

revoke all on function public.assign_my_order_to_campaign(uuid, uuid) from public, anon;
grant execute on function public.assign_my_order_to_campaign(uuid, uuid) to authenticated, service_role;
