"""Independent psql sessions, disposable localhost PostgreSQL only; no remote DSN.

Run in a fresh PostgreSQL cluster (roles/schema must not already exist):
PGHOST=127.0.0.1 PGDATABASE=finance_concurrency_fixture PGPASSWORD=... python3 ...
"""
import concurrent.futures
import json
import os
from pathlib import Path
import subprocess
import time

ROOT = Path(__file__).resolve().parents[2]
assert os.environ.get('PGHOST') in ('127.0.0.1', 'localhost'), 'Local fixture only'
assert os.environ.get('PGDATABASE') == 'finance_concurrency_fixture', 'Dedicated empty database required'
CMD = ['psql', '-X', '-qAt', '-v', 'ON_ERROR_STOP=1']
SAFE_ENV = {k: v for k, v in os.environ.items() if k not in ('PGSERVICE', 'PGSERVICEFILE', 'PGOPTIONS')}
SAFE_ENV['PGHOSTADDR'] = '127.0.0.1'  # Do not let an inherited hostaddr override loopback.
ADMIN = '11111111-1111-4111-8111-111111111111'
USER = '22222222-2222-4222-8222-222222222222'
OTHER = '33333333-3333-4333-8333-333333333333'


def run(sql, check=True):
    result = subprocess.run(CMD, input=sql, text=True, capture_output=True, timeout=25, env=SAFE_ENV)
    if check and result.returncode:
        raise AssertionError(result.stderr)
    return result


def value(sql):
    return run(sql).stdout.strip().splitlines()[-1]


def auth(uid):
    return f"set request.jwt.claim.sub='{uid}'; set role authenticated;"


def race(sqls):
    # Each invocation starts a separate backend, rather than sharing a client queue.
    with concurrent.futures.ThreadPoolExecutor(max_workers=len(sqls)) as pool:
        return list(pool.map(lambda sql: run("set statement_timeout='15s';" + sql, False), sqls))


def success(results, count):
    assert sum(r.returncode == 0 for r in results) == count, [r.stderr for r in results]
    assert all('deadlock detected' not in r.stderr for r in results), 'Unexpected application deadlock'


def seed(balance=100):
    run(f"""truncate profiles,services,orders,transactions,checkout_intents,
      gateway_refund_requests,gateway_refund_audit,order_supplier_costs,
      manual_order_payment_references cascade;
      insert into profiles(id,email,role,balance) values
      ('{ADMIN}','admin@example.invalid','admin',0),('{USER}','u@example.invalid','user',{balance}),
      ('{OTHER}','o@example.invalid','user',0);
      insert into services(id,code,name,platform,rate,min,max) values
      (1,'facebook-followers','Facebook Followers','facebook',499,100,100000);""")


def intent():
    return json.loads(value(f"""insert into checkout_intents(user_id,client_request_id,service_id,
      service_code,quantity,destination_link,total_paise) values('{USER}',gen_random_uuid()::text,
      1,'facebook-followers',100,'https://example.invalid',6000) returning row_to_json(checkout_intents);"""))


def pay(i):
    return auth(USER) + f"select checkout_custom_intent_with_wallet('{i['id']}','{i['client_request_id']}','facebook-followers',100,'https://example.invalid');"


def new_order():
    return value(f"insert into orders(user_id,service_id,charge,status,payment_status,quantity,link) values('{USER}',1,30,'processing','paid',100,'https://example.invalid') returning id;")


def refund(oid):
    return auth(ADMIN) + f"select admin_update_order_financial('{oid}','{{\"status\":\"cancelled\"}}');"


def balance():
    return float(value(f"select balance from profiles where id='{USER}';"))


def count(table, where='true'):
    return int(value(f'select count(*) from {table} where {where};'))


def held_race(lock_sql, calls):
    """Hold a real transaction open, observe blocked backends, then release it."""
    holder = subprocess.Popen(CMD, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, env=SAFE_ENV)
    holder.stdin.write("begin; set application_name='finance_holder';" + lock_sql + "\n")
    holder.stdin.flush()
    deadline = time.monotonic() + 5
    while value("select count(*) from pg_stat_activity where application_name='finance_holder' and state='idle in transaction';") != '1':
        assert time.monotonic() < deadline, 'Holder did not acquire lock'
        time.sleep(.05)
    with concurrent.futures.ThreadPoolExecutor(max_workers=len(calls)) as pool:
        pending = [pool.submit(run, "set application_name='finance_waiter'; set statement_timeout='15s';" + c, False) for c in calls]
        try:
            deadline = time.monotonic() + 5
            while int(value("select count(*) from pg_stat_activity where application_name='finance_waiter' and wait_event_type='Lock';")) < len(calls):
                assert time.monotonic() < deadline, 'Did not observe all independent lock waiters'
                time.sleep(.05)
        finally:
            holder.stdin.write('commit;\n')
            holder.stdin.close()
            holder.wait(timeout=5)
        assert holder.returncode == 0, holder.stderr.read()
        return [f.result() for f in pending]


for file in ['tests/database/payment-safety-fixture.sql',
             'supabase/migrations/202607250001_checkout_intents.sql',
             'supabase/migrations/202606190006_fintech_wallet.sql',
             'supabase/migrations/20261003033000_harden_wallet_payment_settlement.sql',
             'supabase/migrations/20260926173543_agency_checkout_attribution.sql',
             'supabase/migrations/20261005190934_verify_wallet_split_checkout_safety.sql',
             'supabase/migrations/20261019214002_payment_revenue_safety.sql',
             'supabase/migrations/202610110001_admin_manual_wallet_atomic_review.sql',
             'supabase/migrations/20261022103153_retire_obsolete_gateway_operations.sql']:
    run((ROOT / file).read_text(encoding='utf-8'))
print('ENGINE', value('select version();'))
run('grant select on checkout_intents to authenticated;')

seed()
a, b = intent(), intent()
results = held_race(f"select 1 from profiles where id='{USER}' for update;", [pay(a), pay(b)])
success(results, 1)
assert any('Insufficient' in r.stderr for r in results)
assert balance() == 40 and count('orders') == 1 and count('transactions', "type='debit'") == 1
winner = a if results[0].returncode == 0 else b
success(race([pay(winner)] * 6), 6)
assert balance() == 40 and count('orders') == 1
print('PASS purchases: two observed independent lock waiters; insufficient funds; six idempotent retries')

seed()
oid = new_order()
success(held_race(f"select 1 from orders where id='{oid}' for update;", [refund(oid)] * 6), 6)
assert balance() == 130 and count('transactions', "type='refund'") == 1
success(race([refund(oid)] * 4), 4)
assert balance() == 130
print('PASS simultaneous and duplicate order refunds: one credit')

seed()
oid = new_order()
run("create function injected_failure() returns trigger language plpgsql as $$begin raise exception 'injected balance failure';end$$; create trigger injected_failure before update on profiles for each row execute function injected_failure();")
results = race([refund(oid)] * 2)
success(results, 0)
assert all('injected balance failure' in r.stderr for r in results)
assert balance() == 100 and count('transactions') == 0
assert value(f"select status from orders where id='{oid}';") == 'processing'
run('drop trigger injected_failure on profiles; drop function injected_failure();')
success(race([refund(oid)] * 2), 2)
assert balance() == 130
print('PASS failure rollback and successful retry')

seed()
for role in ('anon', 'authenticated', 'service_role'):
    denied = run(f"set role {role}; select request_wallet_gateway_refund(gen_random_uuid());", False)
    assert denied.returncode != 0 and 'permission denied' in denied.stderr
assert balance() == 100 and count('gateway_refund_requests') == 0
print('PASS retired gateway RPCs denied; no reservation or balance mutation')

for method in ('manual_upi', 'manual_bank_transfer', 'manual_usdt_trc20'):
    seed()
    tx = value(f"insert into transactions(user_id,amount,type,status,payment_method,provider_payment_id) values('{USER}',20,'credit','pending','{method}','MANUALREF123456') returning id;")
    approve = "set request.jwt.claims='{\"role\":\"service_role\"}'; set role service_role;" + f"select admin_review_manual_wallet_payment('{tx}','approve','MANUALREF123456','Verified synthetic receipt evidence');"
    results = held_race(f"select 1 from transactions where id='{tx}' for update;", [approve] * 4)
    success(results, 1)
    assert all(r.returncode == 0 or 'Pending manual deposit not found' in r.stderr for r in results)
    assert balance() == 120 and count('transactions', "status='completed'") == 1
print('PASS concurrent UPI/bank/USDT approval: one evidenced credit per deposit')

seed(0)
a, b = intent(), intent()
def manual(i):
    return auth(USER) + f"select submit_manual_checkout_atomic('{i['id']}','{i['client_request_id']}',0,'UTR12345678','SR-TEST12345','upi');"
deposit = f"insert into transactions(user_id,amount,type,status,payment_method,provider_payment_id) values('{USER}',60,'credit','pending','manual_upi','utr12345678');"
lock = "select pg_advisory_xact_lock(hashtextextended('manual-reference:UTR12345678',0));"
results = held_race(lock, [manual(a), manual(b), deposit])
success(results, 1)
assert count('manual_order_payment_references') + count('transactions') == 1
assert balance() == 0 and count('orders') == count('manual_order_payment_references')
print('PASS concurrent case-insensitive manual reference across deposit and order flows')

# Deliberately inject an opposite-order cycle around real refunds. Native PostgreSQL
# must abort one whole transaction; application retry must then credit each order once.
seed()
a, b = new_order(), new_order()
def cycle(first, second):
    return 'begin; set deadlock_timeout=\'100ms\';' + refund(first) + 'select pg_sleep(1);' + refund(second) + 'commit;'
results = race([cycle(a, b), cycle(b, a)])
assert sum('deadlock detected' in r.stderr for r in results) == 1, [r.stderr for r in results]
assert sum(r.returncode == 0 for r in results) == 1
assert balance() == 160 and count('transactions', "type='refund'") == 2
success(race([refund(a), refund(b)]), 2)
assert balance() == 160 and count('transactions', "type='refund'") == 2
print('PASS injected deadlock: victim transaction rolled back, survivor and retries preserve exactly-once funds')

# This is SQL-role security coverage, deliberately not labelled PostgREST/Auth QA.
assert run(auth(OTHER) + 'select admin_revenue_report(now(),now());', False).returncode != 0
for role in ('anon', 'authenticated'):
    for fn in ('credit_verified_payment', 'credit_wallet_payment_system'):
        denied = run(f"set role {role}; select {fn}('order_fixture','pay_fixture');", False)
        assert denied.returncode != 0 and 'permission denied' in denied.stderr, denied.stderr
assert value("select has_function_privilege('service_role','credit_wallet_payment_system(text,text)','execute');") == 't'
assert value(auth(OTHER) + 'select count(*) from orders;') == '0'
assert run('set role anon; select * from gateway_refund_requests;', False).returncode != 0
print('PASS native SQL role/ownership checks; full Supabase stack remains a separate gate')
report = json.loads(run((ROOT / 'scripts/finance-reconciliation-readonly.sql').read_text(encoding='utf-8')).stdout.strip())
assert report['counts'] == {}, report
assert balance() == 160 and count('transactions', "type='refund'") == 2
print('PASS read-only reconciliation on valid native records: no false anomalies or financial changes')
print('PASS all native financial concurrency scenarios')
