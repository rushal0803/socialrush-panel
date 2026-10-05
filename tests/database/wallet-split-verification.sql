-- Execute through an administrative SQL connection. Uses production table shapes
-- and installed RPC definitions, but all fixtures and functions are temporary.
-- Every write is rolled back; no production order, wallet or payment is touched.
begin;
create temporary table profiles (like public.profiles including defaults including constraints including indexes);
create temporary table checkout_intents (like public.checkout_intents including defaults including constraints including indexes);
create temporary table transactions (like public.transactions including defaults including constraints including indexes);
create temporary table orders (like public.orders including defaults including constraints including indexes);
create temporary table services (like public.services including defaults including constraints including indexes);
create temporary table customer_clients (like public.customer_clients including defaults including constraints including indexes);
create temporary table campaigns (like public.campaigns including defaults including constraints including indexes);
alter table pg_temp.orders alter column public_order_id set default ('SR-'||upper(replace(gen_random_uuid()::text,'-','')));
-- Atomically apply the wallet amount shown on a manual-payment checkout.
-- The expected amount prevents a customer from being asked to pay one amount
-- while a later wallet balance change causes a different debit.

do $clone$
declare f record;
begin
  for f in select p.proname,pg_get_functiondef(p.oid) as definition
    from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname in
      ('apply_wallet_to_manual_checkout','checkout_custom_intent_with_wallet')
  loop
    execute replace(f.definition,'public.','pg_temp.');
  end loop;
end;
$clone$;
do $tests$
declare
  u uuid:=gen_random_uuid(); i uuid:=gen_random_uuid(); req uuid:=gen_random_uuid();
  full_i uuid:=gen_random_uuid(); full_req uuid:=gen_random_uuid();
  zero_i uuid:=gen_random_uuid(); zero_req uuid:=gen_random_uuid();
  stale_i uuid:=gen_random_uuid(); stale_req uuid:=gen_random_uuid();
  sid bigint; r jsonb; r2 jsonb; b numeric; n integer; rejected boolean;
begin
  perform set_config('request.jwt.claim.sub',u::text,true);
  perform set_config('request.jwt.claims',jsonb_build_object('sub',u,'role','authenticated')::text,true);
  insert into pg_temp.profiles(id,email,full_name,balance) values(u,'wallet-verification@example.invalid','Temporary verification fixture',40.10);
  insert into pg_temp.services select * from public.services where status='active' and coalesce(accepts_new_orders,true) and health_status is distinct from 'paused' limit 1;
  select id into sid from pg_temp.services limit 1;
  if sid is null then raise exception 'No eligible service fixture'; end if;
  insert into pg_temp.checkout_intents(id,user_id,client_request_id,service_id,service_code,quantity,destination_link,total_paise)
  values(i,u,req::text,sid,'wallet-verification-fixture',100,'https://example.invalid/test',7990),
    (full_i,u,full_req::text,sid,'wallet-verification-fixture',100,'https://example.invalid/test',7990),
    (zero_i,u,zero_req::text,sid,'wallet-verification-fixture',100,'https://example.invalid/test',7990),
    (stale_i,u,stale_req::text,sid,'wallet-verification-fixture',100,'https://example.invalid/test',7990);

  r:=pg_temp.apply_wallet_to_manual_checkout(i,req,40.10);
  if (r->>'wallet_applied')::numeric<>40.10 or (r->>'remaining')::numeric<>39.80 then raise exception 'Partial split failed: %',r; end if;
  select balance into b from pg_temp.profiles where id=u;
  select count(*) into n from pg_temp.transactions where user_id=u;
  if b<>0 or n<>1 then raise exception 'Partial debit incorrect'; end if;
  r2:=pg_temp.apply_wallet_to_manual_checkout(i,req,40.10);
  if not (r2->>'duplicate')::boolean or (r2->>'remaining')::numeric<>39.80 then raise exception 'Retry split changed'; end if;
  select count(*) into n from pg_temp.transactions where user_id=u;
  if n<>1 then raise exception 'Retry duplicated debit'; end if;

  update pg_temp.profiles set balance=200 where id=u;
  r2:=pg_temp.apply_wallet_to_manual_checkout(i,req,40.10);
  select balance into b from pg_temp.profiles where id=u;
  if b<>200 or (r2->>'remaining')::numeric<>39.80 then raise exception 'Retry after top-up changed debit'; end if;
  rejected:=false;
  begin
    perform pg_temp.checkout_custom_intent_with_wallet(i,req::text,'wallet-verification-fixture',100,'https://example.invalid/test');
  exception when others then
    if sqlerrm not like 'Wallet already applied%' then raise; end if;
    rejected:=true;
  end;
  if not rejected then raise exception 'Wallet-only flow accepted reserved split'; end if;
  select balance into b from pg_temp.profiles where id=u;
  if b<>200 then raise exception 'Cross-flow deducted wallet'; end if;

  r:=pg_temp.apply_wallet_to_manual_checkout(full_i,full_req,79.90);
  select count(*) into n from pg_temp.transactions where user_id=u;
  select balance into b from pg_temp.profiles where id=u;
  if (r->>'remaining')::numeric<>0 or b<>200 or n<>1 then raise exception 'Full-wallet manual request deducted balance'; end if;
  r:=pg_temp.checkout_custom_intent_with_wallet(full_i,full_req::text,'wallet-verification-fixture',100,'https://example.invalid/test');
  if (r->>'balance')::numeric<>120.10 then raise exception 'Full-wallet order debit failed'; end if;
  r2:=pg_temp.checkout_custom_intent_with_wallet(full_i,full_req::text,'wallet-verification-fixture',100,'https://example.invalid/test');
  if not (r2->>'duplicate')::boolean or (r2->>'balance')::numeric<>120.10 then raise exception 'Full-wallet retry debit failed'; end if;

  update pg_temp.profiles set balance=0 where id=u;
  r:=pg_temp.apply_wallet_to_manual_checkout(zero_i,zero_req,0);
  r2:=pg_temp.apply_wallet_to_manual_checkout(zero_i,zero_req,0);
  select count(*) into n from pg_temp.transactions where user_id=u;
  if (r->>'remaining')::numeric<>79.90 or (r->>'wallet_applied')::numeric<>0 or n<>2 then raise exception 'Zero-wallet split failed'; end if;

  update pg_temp.profiles set balance=20 where id=u;
  rejected:=false;
  begin perform pg_temp.apply_wallet_to_manual_checkout(stale_i,stale_req,40.10);
  exception when others then
    if sqlerrm not like 'wallet balance changed%' then raise; end if;
    rejected:=true;
  end;
  select balance into b from pg_temp.profiles where id=u;
  if not rejected or b<>20 then raise exception 'Stale-wallet guard failed'; end if;

  -- Reuse the partial debit after simulating an API retry: no real order is inserted.
  insert into pg_temp.orders(user_id,service_id,link,quantity,charge,status,payment_status,client_request_id,customer_note)
  values(u,sid,'https://example.invalid/test',100,79.90,'pending','verification_pending',req,
    'Wallet applied: INR 40.10. External amount: INR 39.80.');
  rejected:=false;
  begin perform pg_temp.apply_wallet_to_manual_checkout(i,req,40.10);
  exception when others then
    if sqlerrm not like 'checkout request already has an order%' then raise; end if;
    rejected:=true;
  end;
  if not rejected then raise exception 'Existing-order guard failed'; end if;
  if exists(select 1 from pg_temp.transactions where amount<=0) then raise exception 'Transaction amount constraint invalid'; end if;
  if (select count(*) from pg_temp.orders where payment_status='verification_pending')<>1 then raise exception 'Manual order constraint failed'; end if;
  if (select count(*) from pg_temp.orders where client_request_id=full_req and payment_status='paid')<>1 then raise exception 'Full-wallet created a manual order'; end if;
end;
$tests$;
rollback;
select 'PASS' as verification, 'temporary fixtures only; rolled back; no customer payment/order submitted' as isolation;
