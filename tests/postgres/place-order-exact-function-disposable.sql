-- Execute only against the isolated legacy_checkout_fixture database.
-- Runs the EXACT review-only function body against disposable public tables.
\set ON_ERROR_STOP on
BEGIN;
CREATE SCHEMA auth;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
 SELECT '00000000-0000-4000-8000-000000000001'::uuid
$$;
CREATE TABLE public.services (id bigint PRIMARY KEY, status text NOT NULL, min integer NOT NULL, max integer NOT NULL, rate numeric NOT NULL);
CREATE TABLE public.profiles (id uuid PRIMARY KEY, balance numeric(14,2) NOT NULL);
CREATE TABLE public.orders (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, service_id bigint NOT NULL, link text NOT NULL, quantity integer NOT NULL, charge numeric(14,2) NOT NULL CHECK (charge >= 0));
CREATE TABLE public.transactions (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, user_id uuid NOT NULL, amount numeric NOT NULL, type text NOT NULL, status text NOT NULL);
\i docs/audits/place-order-charge-correction-REVIEW-ONLY.sql
INSERT INTO public.services VALUES (1,'active',100,10000,500);
INSERT INTO public.profiles VALUES ('00000000-0000-4000-8000-000000000001',1000);
DO $test$
DECLARE v_order uuid;
BEGIN
 v_order := public.place_order(1,' https://example.test/one ',1000);
 IF (SELECT charge FROM public.orders WHERE id=v_order) <> 500
 OR (SELECT link FROM public.orders WHERE id=v_order) <> 'https://example.test/one'
 OR (SELECT balance FROM public.profiles) <> 500
 OR (SELECT count(*) FROM public.transactions) <> 1
 THEN RAISE EXCEPTION 'exact function successful checkout mismatch'; END IF;
 BEGIN
  PERFORM public.place_order(1,'https://example.test/two',2000);
  RAISE EXCEPTION 'expected insufficient balance';
 EXCEPTION WHEN raise_exception THEN
  IF SQLERRM <> 'Insufficient balance' THEN RAISE; END IF;
 END;
 BEGIN
  PERFORM public.place_order(1,'https://example.test/invalid',99);
  RAISE EXCEPTION 'expected quantity rejection';
 EXCEPTION WHEN raise_exception THEN
  IF SQLERRM NOT LIKE 'Quantity must be between%' THEN RAISE; END IF;
 END;
 IF (SELECT balance FROM public.profiles) <> 500
 OR (SELECT count(*) FROM public.orders) <> 1
 OR (SELECT count(*) FROM public.transactions) <> 1
 THEN RAISE EXCEPTION 'failed request mutated wallet or orders'; END IF;
END $test$;
ROLLBACK;
