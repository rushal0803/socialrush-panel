-- Raise the Facebook Followers public and checkout base rate to ₹499 / 1,000.
-- This edits only the service catalog; existing orders and checkout intents
-- retain their original recorded prices and totals.

update public.services
set rate = 499.0000
where lower(trim(name)) = 'facebook followers'
  and lower(trim(platform)) = 'facebook'
  and rate is distinct from 499.0000;

-- Older wallet checkout still contains a literal fallback for fb-followers.
-- Align only that one constant; do not alter unrelated service prices or
-- the function's authentication, wallet, idempotency, or order behavior.
do $$
declare
  v_definition text;
  v_old constant text := '(''fb-followers'', ''Facebook Followers'', ''facebook'', 299.0000, 100, 1000000)';
  v_new constant text := '(''fb-followers'', ''Facebook Followers'', ''facebook'', 499.0000, 100, 1000000)';
begin
  select pg_get_functiondef(
    to_regprocedure('public.checkout_campaign_with_wallet(bigint,text,text,integer,uuid)')
  ) into v_definition;

  if v_definition is not null and position(v_old in v_definition) > 0 then
    execute replace(v_definition, v_old, v_new);
  end if;
end;
$$;
