-- Isolated PostgreSQL fixture for manual wallet review. No production credentials.
create role anon nologin;
create role authenticated nologin;
create role service_role nologin;
create schema auth;
create function auth.jwt() returns jsonb language sql stable as
'select coalesce(nullif(current_setting(''request.jwt.claims'', true), '''')::jsonb, ''{}''::jsonb)';
create table public.profiles (id uuid primary key, balance numeric not null default 0);
create table public.transactions (
 id uuid primary key, user_id uuid not null references public.profiles(id),
 status text not null, type text not null, payment_method text not null,
 amount numeric not null, provider_payment_id text, metadata jsonb
);
\i supabase/migrations/202610110001_admin_manual_wallet_atomic_review.sql
insert into public.profiles(id,balance) values
 ('00000000-0000-4000-8000-000000000001',100);
insert into public.transactions(id,user_id,status,type,payment_method,amount,provider_payment_id) values
 ('00000000-0000-4000-8000-000000000011','00000000-0000-4000-8000-000000000001','pending','credit','manual_upi',50,'UTR12345678'),
 ('00000000-0000-4000-8000-000000000012','00000000-0000-4000-8000-000000000001','pending','credit','manual_bank_transfer',40,'BANK12345678'),
 ('00000000-0000-4000-8000-000000000013','00000000-0000-4000-8000-000000000001','pending','credit','manual_usdt_trc20',30,'HASH12345678'),
 ('00000000-0000-4000-8000-000000000014','00000000-0000-4000-8000-000000000001','pending','credit','manual_upi',-99,'BAD12345678');
create function public.assert_true(ok boolean, message text) returns void language plpgsql as
'begin if ok is distinct from true then raise exception ''Assertion failed: %'', message; end if; end';
-- A user token must not execute the privileged RPC.
set request.jwt.claims = '{"role":"authenticated"}';
do $$ begin
 begin
  perform public.admin_review_manual_wallet_payment('00000000-0000-4000-8000-000000000011','approve','UTR12345678','Confirmed external bank receipt 123');
  raise exception 'User token unexpectedly approved';
 exception when others then
  if sqlerrm = 'User token unexpectedly approved' then raise; end if;
 end;
end $$;
select public.assert_true(balance=100,'user role cannot credit') from public.profiles;
set request.jwt.claims = '{"role":"service_role"}';
-- Wrong reference cannot credit.
do $$ begin
 begin
  perform public.admin_review_manual_wallet_payment('00000000-0000-4000-8000-000000000011','approve','WRONG123456','Confirmed external bank receipt 123');
  raise exception 'Wrong reference unexpectedly approved';
 exception when others then
  if sqlerrm = 'Wrong reference unexpectedly approved' then raise; end if;
 end;
end $$;
select public.assert_true(balance=100,'wrong reference cannot credit') from public.profiles;
-- Approval credits once, then replay fails.
select public.admin_review_manual_wallet_payment('00000000-0000-4000-8000-000000000011','approve','UTR12345678','Confirmed external bank receipt 123');
select public.assert_true(balance=150,'approved UPI credited once') from public.profiles;
do $$ begin
 begin
  perform public.admin_review_manual_wallet_payment('00000000-0000-4000-8000-000000000011','approve','UTR12345678','Confirmed external bank receipt 123');
  raise exception 'Replay unexpectedly approved';
 exception when others then
  if sqlerrm = 'Replay unexpectedly approved' then raise; end if;
 end;
end $$;
select public.assert_true(balance=150,'replay cannot credit') from public.profiles;
-- Rejection never credits; approval after rejection fails.
select public.admin_review_manual_wallet_payment('00000000-0000-4000-8000-000000000012','reject','','Payment could not be verified');
select public.assert_true(balance=150,'rejection does not credit') from public.profiles;
select public.assert_true(status='failed','rejected deposit marked failed') from public.transactions where id='00000000-0000-4000-8000-000000000012';
-- USDT approves with a matching reference.
select public.admin_review_manual_wallet_payment('00000000-0000-4000-8000-000000000013','approve','HASH12345678','Verified external TRC20 transfer');
select public.assert_true(balance=180,'USDT credits once') from public.profiles;
-- Invalid amount rejected without balance change.
do $$ begin
 begin
  perform public.admin_review_manual_wallet_payment('00000000-0000-4000-8000-000000000014','approve','BAD12345678','Confirmed external bank receipt 123');
  raise exception 'Negative amount unexpectedly approved';
 exception when others then
  if sqlerrm = 'Negative amount unexpectedly approved' then raise; end if;
 end;
end $$;
select public.assert_true(balance=180,'negative amount cannot credit') from public.profiles;
