-- Disposable PostgreSQL fixture: DO NOT run on production.
-- Run in an isolated, empty test database via psql -v ON_ERROR_STOP=1 -f this_file.
BEGIN;
CREATE SCHEMA auth;
CREATE SCHEMA public_fixture;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $auth_uid$ SELECT CASE WHEN current_setting('fixture.unauthenticated', true) = 'on' THEN NULL::uuid ELSE '00000000-0000-4000-8000-000000000001'::uuid END $auth_uid$;
CREATE TABLE public_fixture.services (id bigint PRIMARY KEY, status text NOT NULL, min integer NOT NULL, max integer NOT NULL, rate numeric NOT NULL);
CREATE TABLE public_fixture.profiles (id uuid PRIMARY KEY, balance numeric(14,2) NOT NULL);
CREATE TABLE public_fixture.orders (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, user_id uuid NOT NULL, service_id bigint NOT NULL, link text NOT NULL, quantity integer NOT NULL, charge numeric(14,2) NOT NULL);
CREATE TABLE public_fixture.transactions (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, user_id uuid NOT NULL, amount numeric NOT NULL, type text NOT NULL, status text NOT NULL);
CREATE FUNCTION public_fixture.place_order(p_service_id bigint, p_link text, p_quantity integer)
RETURNS bigint LANGUAGE plpgsql AS $body$
DECLARE v_user_id uuid := auth.uid(); v_service public_fixture.services%rowtype;
v_balance numeric(14,2); v_charge numeric(14,2); v_order_id bigint;
BEGIN
 IF v_user_id IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
 IF nullif(trim(p_link),'') IS NULL THEN RAISE EXCEPTION 'A valid target link is required'; END IF;
 SELECT * INTO v_service FROM public_fixture.services WHERE id=p_service_id AND status='active';
 IF NOT FOUND THEN RAISE EXCEPTION 'Service is unavailable'; END IF;
 IF p_quantity IS NULL OR p_quantity < v_service.min OR p_quantity > v_service.max THEN
  RAISE EXCEPTION 'Invalid quantity'; END IF;
 v_charge := round((p_quantity::numeric/1000)*v_service.rate,2);
 SELECT balance INTO v_balance FROM public_fixture.profiles WHERE id=v_user_id FOR UPDATE;
 IF v_balance IS NULL THEN RAISE EXCEPTION 'Profile not found'; END IF;
 IF v_balance < v_charge THEN RAISE EXCEPTION 'Insufficient balance'; END IF;
 UPDATE public_fixture.profiles SET balance=balance-v_charge WHERE id=v_user_id;
 INSERT INTO public_fixture.orders(user_id,service_id,link,quantity,charge)
 VALUES(v_user_id,p_service_id,trim(p_link),p_quantity,v_charge) RETURNING id INTO v_order_id;
 INSERT INTO public_fixture.transactions(user_id,amount,type,status) VALUES(v_user_id,v_charge,'debit','completed');
 RETURN v_order_id;
END $body$;
INSERT INTO public_fixture.services VALUES(1,'active',100,10000,500);
INSERT INTO public_fixture.profiles VALUES('00000000-0000-4000-8000-000000000001',1000);
DO $test$
DECLARE v_id bigint;
BEGIN
 v_id := public_fixture.place_order(1,' https://example.test/post ',1000);
 IF (SELECT charge FROM public_fixture.orders WHERE id=v_id) <> 500 THEN RAISE EXCEPTION 'incorrect order charge'; END IF;
 IF (SELECT balance FROM public_fixture.profiles) <> 500 THEN RAISE EXCEPTION 'incorrect wallet debit'; END IF;
 IF (SELECT count(*) FROM public_fixture.transactions) <> 1 THEN RAISE EXCEPTION 'missing transaction'; END IF;
 BEGIN PERFORM public_fixture.place_order(1,'https://example.test/post',2000);
  RAISE EXCEPTION 'expected insufficient balance';
 EXCEPTION WHEN raise_exception THEN
  IF SQLERRM <> 'Insufficient balance' THEN RAISE; END IF;
 END;
 BEGIN PERFORM public_fixture.place_order(1,'https://example.test/post',NULL);
  RAISE EXCEPTION 'expected invalid quantity';
 EXCEPTION WHEN raise_exception THEN
  IF SQLERRM <> 'Invalid quantity' THEN RAISE; END IF;
 END;
 BEGIN PERFORM public_fixture.place_order(1,'https://example.test/post',99);
  RAISE EXCEPTION 'expected minimum quantity rejection';
 EXCEPTION WHEN raise_exception THEN
  IF SQLERRM <> 'Invalid quantity' THEN RAISE; END IF;
 END;
 BEGIN PERFORM public_fixture.place_order(1,'https://example.test/post',10001);
  RAISE EXCEPTION 'expected maximum quantity rejection';
 EXCEPTION WHEN raise_exception THEN
  IF SQLERRM <> 'Invalid quantity' THEN RAISE; END IF;
 END;
 UPDATE public_fixture.services SET status='paused' WHERE id=1;
 BEGIN PERFORM public_fixture.place_order(1,'https://example.test/post',1000);
  RAISE EXCEPTION 'expected paused service rejection';
 EXCEPTION WHEN raise_exception THEN
  IF SQLERRM <> 'Service is unavailable' THEN RAISE; END IF;
 END;
 UPDATE public_fixture.services SET status='active' WHERE id=1;
 BEGIN PERFORM public_fixture.place_order(1,'  ',1000);
  RAISE EXCEPTION 'expected invalid target rejection';
 EXCEPTION WHEN raise_exception THEN
  IF SQLERRM <> 'A valid target link is required' THEN RAISE; END IF;
 END;
 PERFORM set_config('fixture.unauthenticated', 'on', true);
 BEGIN
  PERFORM public_fixture.place_order(1,'https://example.test/unauthenticated',1000);
  RAISE EXCEPTION 'expected authentication rejection';
 EXCEPTION WHEN raise_exception THEN
  IF SQLERRM <> 'Authentication required' THEN RAISE; END IF;
 END;
 PERFORM set_config('fixture.unauthenticated', 'off', true);
 IF (SELECT count(*) FROM public_fixture.orders) <> 1 OR (SELECT balance FROM public_fixture.profiles) <> 500
 THEN RAISE EXCEPTION 'failed request mutated wallet or orders'; END IF;
END $test$;
-- Document existing legacy RPC replay risk: without an idempotency key,
-- two identical requests can both debit the wallet. This is a risk-demonstration
-- test, NOT a desired security behavior or a production authorization.
DO $replay_test$
DECLARE v_before_orders integer; v_before_transactions integer; v_before_balance numeric;
BEGIN
 SELECT count(*) INTO v_before_orders FROM public_fixture.orders;
 SELECT count(*) INTO v_before_transactions FROM public_fixture.transactions;
 SELECT balance INTO v_before_balance FROM public_fixture.profiles;
 PERFORM public_fixture.place_order(1,'https://example.test/same-target',100);
 PERFORM public_fixture.place_order(1,'https://example.test/same-target',100);
 IF (SELECT count(*) FROM public_fixture.orders) <> v_before_orders + 2 THEN
  RAISE EXCEPTION 'replay-risk fixture did not create two orders';
 END IF;
 IF (SELECT count(*) FROM public_fixture.transactions) <> v_before_transactions + 2 THEN
  RAISE EXCEPTION 'replay-risk fixture did not create two debits';
 END IF;
 IF (SELECT balance FROM public_fixture.profiles) <> v_before_balance - 100 THEN
  RAISE EXCEPTION 'replay-risk fixture did not debit twice';
 END IF;
END $replay_test$;
-- Separate disposable keyed-checkout model; does not alter legacy place_order.
CREATE TABLE public_fixture.keyed_orders (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 user_id uuid NOT NULL, request_id uuid NOT NULL, service_id bigint NOT NULL,
 link text NOT NULL, quantity integer NOT NULL, charge numeric(14,2) NOT NULL,
 UNIQUE(user_id,request_id)
);
CREATE FUNCTION public_fixture.keyed_checkout(p_request_id uuid,p_service_id bigint,p_link text,p_quantity integer)
RETURNS bigint LANGUAGE plpgsql AS $keyed$
DECLARE v_user uuid:=auth.uid(); v_existing public_fixture.keyed_orders%rowtype;
 v_service public_fixture.services%rowtype; v_charge numeric(14,2); v_balance numeric(14,2); v_id bigint;
BEGIN
 IF v_user IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
 IF p_request_id IS NULL THEN RAISE EXCEPTION 'Request key required'; END IF;
 IF p_quantity IS NULL OR nullif(trim(p_link),'') IS NULL THEN RAISE EXCEPTION 'Invalid request'; END IF;
 -- Serialize all wallet operations per user, including same-key retries.
 SELECT balance INTO v_balance FROM public_fixture.profiles WHERE id=v_user FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Profile not found'; END IF;
 SELECT * INTO v_existing FROM public_fixture.keyed_orders WHERE user_id=v_user AND request_id=p_request_id;
 IF FOUND THEN
  IF v_existing.service_id<>p_service_id OR v_existing.link<>trim(p_link) OR v_existing.quantity<>p_quantity
  THEN RAISE EXCEPTION 'Request key payload mismatch'; END IF;
  RETURN v_existing.id;
 END IF;
 SELECT * INTO v_service FROM public_fixture.services WHERE id=p_service_id AND status='active';
 IF NOT FOUND THEN RAISE EXCEPTION 'Service is unavailable'; END IF;
 IF p_quantity<v_service.min OR p_quantity>v_service.max THEN RAISE EXCEPTION 'Invalid quantity'; END IF;
 v_charge:=round((p_quantity::numeric/1000)*v_service.rate,2);
 IF v_balance<v_charge THEN RAISE EXCEPTION 'Insufficient balance'; END IF;
 UPDATE public_fixture.profiles SET balance=balance-v_charge WHERE id=v_user;
 INSERT INTO public_fixture.keyed_orders(user_id,request_id,service_id,link,quantity,charge)
 VALUES(v_user,p_request_id,p_service_id,trim(p_link),p_quantity,v_charge) RETURNING id INTO v_id;
 INSERT INTO public_fixture.transactions(user_id,amount,type,status)
 VALUES(v_user,v_charge,'debit','completed');
 RETURN v_id;
END $keyed$;
DO $keyed_test$
DECLARE v_id bigint; v_orders integer; v_tx integer; v_balance numeric;
BEGIN
 SELECT count(*) INTO v_tx FROM public_fixture.transactions;
 SELECT balance INTO v_balance FROM public_fixture.profiles;
 v_id:=public_fixture.keyed_checkout('11111111-1111-4111-8111-111111111111',1,'https://example.test/keyed',100);
 IF public_fixture.keyed_checkout('11111111-1111-4111-8111-111111111111',1,' https://example.test/keyed ',100)<>v_id
 THEN RAISE EXCEPTION 'retry returned different order'; END IF;
 IF (SELECT count(*) FROM public_fixture.keyed_orders)<>1
 OR (SELECT count(*) FROM public_fixture.transactions)<>v_tx+1
 OR (SELECT balance FROM public_fixture.profiles)<>v_balance-50
 THEN RAISE EXCEPTION 'keyed retry caused duplicate debit'; END IF;
 BEGIN
  PERFORM public_fixture.keyed_checkout('11111111-1111-4111-8111-111111111111',1,'https://example.test/changed',100);
  RAISE EXCEPTION 'expected payload mismatch';
 EXCEPTION WHEN raise_exception THEN
  IF SQLERRM<>'Request key payload mismatch' THEN RAISE; END IF;
 END;
 IF (SELECT count(*) FROM public_fixture.keyed_orders)<>1
 OR (SELECT count(*) FROM public_fixture.transactions)<>v_tx+1
 THEN RAISE EXCEPTION 'mismatched retry changed records'; END IF;
END $keyed_test$;
-- Model manual split-payment recovery, not the production RPC implementation.
CREATE TABLE public_fixture.manual_intents (
 id uuid PRIMARY KEY, user_id uuid NOT NULL, request_id uuid NOT NULL,
 status text NOT NULL DEFAULT 'created', order_id bigint
);
CREATE TABLE public_fixture.manual_wallet_applications (
 intent_id uuid PRIMARY KEY, user_id uuid NOT NULL, amount numeric(14,2) NOT NULL
);
CREATE TABLE public_fixture.manual_orders (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, intent_id uuid NOT NULL UNIQUE,
 user_id uuid NOT NULL, request_id uuid NOT NULL, payment_ref text NOT NULL,
 UNIQUE(user_id,request_id)
);
CREATE FUNCTION public_fixture.apply_manual_wallet(p_intent uuid,p_request uuid,p_expected numeric)
RETURNS numeric LANGUAGE plpgsql AS $manual_wallet$
DECLARE v_user uuid:=auth.uid(); v_intent public_fixture.manual_intents%rowtype;
 v_existing numeric; v_balance numeric; v_apply numeric;
BEGIN
 IF v_user IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
 SELECT * INTO v_intent FROM public_fixture.manual_intents
 WHERE id=p_intent AND user_id=v_user AND request_id=p_request FOR UPDATE;
 IF NOT FOUND OR v_intent.status<>'created' THEN RAISE EXCEPTION 'Invalid manual intent'; END IF;
 SELECT amount INTO v_existing FROM public_fixture.manual_wallet_applications WHERE intent_id=p_intent;
 IF FOUND THEN RETURN v_existing; END IF;
 SELECT balance INTO v_balance FROM public_fixture.profiles WHERE id=v_user FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Missing wallet'; END IF;
 v_apply:=least(v_balance,coalesce(p_expected,0));
 IF v_apply<0 THEN RAISE EXCEPTION 'Invalid wallet application'; END IF;
 UPDATE public_fixture.profiles SET balance=balance-v_apply WHERE id=v_user;
 INSERT INTO public_fixture.manual_wallet_applications VALUES(p_intent,v_user,v_apply);
 RETURN v_apply;
END $manual_wallet$;
CREATE FUNCTION public_fixture.submit_manual_order(p_intent uuid,p_request uuid,p_ref text,p_fail_insert boolean DEFAULT false,p_fail_completion boolean DEFAULT false)
RETURNS bigint LANGUAGE plpgsql AS $manual_order$
DECLARE v_user uuid:=auth.uid(); v_intent public_fixture.manual_intents%rowtype;
 v_order public_fixture.manual_orders%rowtype; v_id bigint;
BEGIN
 SELECT * INTO v_intent FROM public_fixture.manual_intents
 WHERE id=p_intent AND user_id=v_user AND request_id=p_request FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Invalid manual intent'; END IF;
 SELECT * INTO v_order FROM public_fixture.manual_orders WHERE intent_id=p_intent;
 IF FOUND THEN
  IF v_order.payment_ref<>p_ref THEN RAISE EXCEPTION 'Payment reference mismatch'; END IF;
  RETURN v_order.id;
 END IF;
 IF NOT EXISTS(SELECT 1 FROM public_fixture.manual_wallet_applications WHERE intent_id=p_intent)
 THEN RAISE EXCEPTION 'Wallet not applied'; END IF;
 IF p_fail_insert THEN RAISE EXCEPTION 'Simulated insert failure'; END IF;
 INSERT INTO public_fixture.manual_orders(intent_id,user_id,request_id,payment_ref)
 VALUES(p_intent,v_user,p_request,p_ref) RETURNING id INTO v_id;
 IF p_fail_completion THEN RETURN v_id; END IF;
 UPDATE public_fixture.manual_intents SET status='completed',order_id=v_id WHERE id=p_intent;
 RETURN v_id;
END $manual_order$;
INSERT INTO public_fixture.manual_intents(id,user_id,request_id)
VALUES('33333333-3333-4333-8333-333333333333',auth.uid(),'44444444-4444-4444-8444-444444444444');
DO $manual_recovery$
DECLARE v_before numeric; v_id bigint;
BEGIN
 SELECT balance INTO v_before FROM public_fixture.profiles WHERE id=auth.uid();
 IF public_fixture.apply_manual_wallet('33333333-3333-4333-8333-333333333333','44444444-4444-4444-8444-444444444444',25)<>25
 THEN RAISE EXCEPTION 'wallet amount wrong'; END IF;
 BEGIN
  PERFORM public_fixture.submit_manual_order('33333333-3333-4333-8333-333333333333','44444444-4444-4444-8444-444444444444','UTR-ABC12345',true);
  RAISE EXCEPTION 'expected insert failure';
 EXCEPTION WHEN raise_exception THEN
  IF SQLERRM<>'Simulated insert failure' THEN RAISE; END IF;
 END;
 IF public_fixture.apply_manual_wallet('33333333-3333-4333-8333-333333333333','44444444-4444-4444-8444-444444444444',25)<>25
 THEN RAISE EXCEPTION 'wallet retry mismatch'; END IF;
 v_id:=public_fixture.submit_manual_order('33333333-3333-4333-8333-333333333333','44444444-4444-4444-8444-444444444444','UTR-ABC12345',false,true);
 IF public_fixture.submit_manual_order('33333333-3333-4333-8333-333333333333','44444444-4444-4444-8444-444444444444','UTR-ABC12345')<>v_id
 THEN RAISE EXCEPTION 'existing order not returned'; END IF;
 BEGIN
  PERFORM public_fixture.submit_manual_order('33333333-3333-4333-8333-333333333333','44444444-4444-4444-8444-444444444444','UTR-DIFFERENT');
  RAISE EXCEPTION 'expected payment reference mismatch';
 EXCEPTION WHEN raise_exception THEN
  IF SQLERRM<>'Payment reference mismatch' THEN RAISE; END IF;
 END;
 IF (SELECT balance FROM public_fixture.profiles WHERE id=auth.uid())<>v_before-25
 OR (SELECT count(*) FROM public_fixture.manual_wallet_applications)<>1
 OR (SELECT count(*) FROM public_fixture.manual_orders)<>1
 THEN RAISE EXCEPTION 'manual retry changed wallet or order count'; END IF;
END $manual_recovery$;
-- Simulate a downstream AFTER INSERT trigger failure, without real notifications.
CREATE FUNCTION public_fixture.reject_order_after_insert() RETURNS trigger LANGUAGE plpgsql AS $trigger$
BEGIN
 RAISE EXCEPTION 'simulated downstream order event failure';
END $trigger$;
CREATE TRIGGER fixture_order_event_failure AFTER INSERT ON public_fixture.orders
FOR EACH ROW EXECUTE FUNCTION public_fixture.reject_order_after_insert();
DO $rollback_test$
DECLARE v_before_balance numeric; v_before_orders integer; v_before_transactions integer;
BEGIN
 SELECT balance INTO v_before_balance FROM public_fixture.profiles;
 SELECT count(*) INTO v_before_orders FROM public_fixture.orders;
 SELECT count(*) INTO v_before_transactions FROM public_fixture.transactions;
 BEGIN
  PERFORM public_fixture.place_order(1,'https://example.test/trigger-test',100);
  RAISE EXCEPTION 'expected downstream trigger failure';
 EXCEPTION WHEN raise_exception THEN
  IF SQLERRM <> 'simulated downstream order event failure' THEN RAISE; END IF;
 END;
 IF (SELECT balance FROM public_fixture.profiles) <> v_before_balance THEN
  RAISE EXCEPTION 'wallet changed after downstream trigger failure';
 END IF;
 IF (SELECT count(*) FROM public_fixture.orders) <> v_before_orders THEN
  RAISE EXCEPTION 'order persisted after downstream trigger failure';
 END IF;
 IF (SELECT count(*) FROM public_fixture.transactions) <> v_before_transactions THEN
  RAISE EXCEPTION 'transaction persisted after downstream trigger failure';
 END IF;
END $rollback_test$;
ROLLBACK;
-- This fixture simulates a trigger exception; it does not reproduce production
-- notification/bonus triggers, concurrency, grants, RLS or external side effects.
-- It proves only that the corrected INSERT and basic wallet rollback work in isolation.
