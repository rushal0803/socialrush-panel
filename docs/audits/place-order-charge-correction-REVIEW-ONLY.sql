-- REVIEW ONLY. NOT A MIGRATION. DO NOT EXECUTE ON PRODUCTION.
-- Source: read-only pg_get_functiondef(public.place_order(bigint,text,integer))
-- from project valclbfoassmfyixwnyv on 2026-11-08.
-- Minimal correction: add v_charge as fifth value in the orders INSERT.
-- Security-definer permissions/search_path and concurrency require isolated validation.
CREATE OR REPLACE FUNCTION public.place_order(p_service_id bigint, p_link text, p_quantity integer)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  v_user_id uuid := auth.uid();
  v_service public.services%rowtype;
  v_balance numeric(14, 2);
  v_charge numeric(14, 2);
  v_order_id uuid;
begin
  if v_user_id is null then raise exception 'Authentication required'; end if;
  if nullif(trim(p_link), '') is null then raise exception 'A valid target link is required'; end if;

  select * into v_service from public.services where id = p_service_id and status = 'active';
  if not found then raise exception 'Service is unavailable'; end if;
  if p_quantity < v_service.min or p_quantity > v_service.max then
    raise exception 'Quantity must be between % and %', v_service.min, v_service.max;
  end if;

  v_charge := round((p_quantity::numeric / 1000) * v_service.rate, 2);
  select balance into v_balance from public.profiles where id = v_user_id for update;
  if v_balance is null then raise exception 'Profile not found'; end if;
  if v_balance < v_charge then raise exception 'Insufficient balance'; end if;

  update public.profiles set balance = balance - v_charge where id = v_user_id;
  insert into public.orders (user_id, service_id, link, quantity, charge)
  values (v_user_id, p_service_id, trim(p_link), p_quantity, v_charge)
  returning id into v_order_id;
  insert into public.transactions (user_id, amount, type, status)
  values (v_user_id, v_charge, 'debit', 'completed');
  return v_order_id;
end;
$function$;
