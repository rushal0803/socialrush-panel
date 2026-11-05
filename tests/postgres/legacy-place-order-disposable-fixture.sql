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
