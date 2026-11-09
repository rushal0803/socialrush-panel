#!/usr/bin/env bash
set -euo pipefail
# Disposable CI database only. Never run against a production database.
if [[ "${PGDATABASE:-}" != "legacy_checkout_fixture" ]]; then
  echo "Refusing to run outside legacy_checkout_fixture" >&2
  exit 2
fi
fixture=tests/postgres/legacy-place-order-disposable-fixture.sql
# Extract schema and seed rows only; fixture's BEGIN/ROLLBACK is for its own test.
sed -n '/^CREATE SCHEMA auth;/,/^INSERT INTO public_fixture.profiles /p' "$fixture" | psql -X -v ON_ERROR_STOP=1
# Make each checkout cost 750 of the 1000 available wallet balance.
# Pause the first debit while the second request competes for the same row lock.
psql -X -v ON_ERROR_STOP=1 <<'SQL'
CREATE FUNCTION public_fixture.pause_wallet_update() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 PERFORM pg_sleep(2);
 RETURN NEW;
END $$;
CREATE TRIGGER fixture_pause_wallet BEFORE UPDATE ON public_fixture.profiles
FOR EACH ROW EXECUTE FUNCTION public_fixture.pause_wallet_update();
SQL
set +e
psql -X -v ON_ERROR_STOP=1 -c "SELECT public_fixture.place_order(1,'https://example.test/first',1500)" > /tmp/legacy-first.log 2>&1 &
first=$!
sleep 0.3
psql -X -v ON_ERROR_STOP=1 -c "SELECT public_fixture.place_order(1,'https://example.test/second',1500)" > /tmp/legacy-second.log 2>&1 &
second=$!
wait "$first"; first_status=$?
wait "$second"; second_status=$?
set -e
if [[ "$first_status" != 0 || "$second_status" == 0 ]]; then
  echo "Expected first order success and second order rejection" >&2
  cat /tmp/legacy-first.log /tmp/legacy-second.log >&2
  exit 1
fi
grep -q 'Insufficient balance' /tmp/legacy-second.log
psql -X -v ON_ERROR_STOP=1 -At <<'SQL' | grep -qx '250|1|1'
SELECT balance::integer::text || '|' ||
  (SELECT count(*) FROM public_fixture.orders)::text || '|' ||
  (SELECT count(*) FROM public_fixture.transactions)::text
FROM public_fixture.profiles;
SQL
# Install only the keyed fixture model (not its DO test) in the disposable DB.
sed -n '/^CREATE TABLE public_fixture.keyed_orders (/,/^END $keyed$;/p' "$fixture" | psql -X -v ON_ERROR_STOP=1
set +e
psql -X -v ON_ERROR_STOP=1 -At -c "SELECT public_fixture.keyed_checkout('22222222-2222-4222-8222-222222222222',1,'https://example.test/retry',100)" > /tmp/keyed-first.log 2>&1 &
keyed_first=$!
sleep 0.3
psql -X -v ON_ERROR_STOP=1 -At -c "SELECT public_fixture.keyed_checkout('22222222-2222-4222-8222-222222222222',1,'https://example.test/retry',100)" > /tmp/keyed-second.log 2>&1 &
keyed_second=$!
wait "$keyed_first"; keyed_first_status=$?
wait "$keyed_second"; keyed_second_status=$?
set -e
if [[ "$keyed_first_status" != 0 || "$keyed_second_status" != 0 ]]; then
  echo "Expected both same-key retry calls to succeed" >&2
  cat /tmp/keyed-first.log /tmp/keyed-second.log >&2
  exit 1
fi
first_id=$(tail -n 1 /tmp/keyed-first.log)
second_id=$(tail -n 1 /tmp/keyed-second.log)
if [[ "$first_id" != "$second_id" || -z "$first_id" ]]; then
  echo "Same-key concurrent retry returned different order IDs" >&2
  exit 1
fi
psql -X -v ON_ERROR_STOP=1 -At <<'SQL' | grep -qx '200|1|2'
SELECT balance::integer::text || '|' ||
  (SELECT count(*) FROM public_fixture.keyed_orders)::text || '|' ||
  (SELECT count(*) FROM public_fixture.transactions)::text
FROM public_fixture.profiles;
SQL
psql -X -v ON_ERROR_STOP=1 -c 'DROP SCHEMA public_fixture CASCADE; DROP SCHEMA auth CASCADE;'
