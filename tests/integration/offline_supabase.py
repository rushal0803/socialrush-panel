"""GitHub-hosted runner only. No project/production credentials or local Docker.

Pull images before any SQL/data exists. All data-plane processes then share a
--network none namespace. No published ports, network interfaces, host sockets,
project links, .env files or external credentials enter that namespace.
"""
import hashlib
import json
import os
from pathlib import Path
import secrets
import subprocess
import sys
import time

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'artifacts/offline-supabase/report.json'
IMAGES = {'db': 'supabase/postgres:17.6.1.136',
          'auth': 'supabase/gotrue:v2.197.0',
          'rest': 'postgrest/postgrest:v14.18', 'probe': 'python:3.12.12-alpine3.22'}
PREFIX = 'sr-offline-' + secrets.token_hex(4)
DB = PREFIX + '-db'
PW, JWT = secrets.token_hex(24), secrets.token_hex(32)
report = {'head': subprocess.check_output(['git', 'rev-parse', 'HEAD'], text=True).strip(), 'synthetic_only': True,
          'images': IMAGES, 'isolation': 'NOT TESTED', 'full_replay': 'NOT TESTED',
          'integration': 'NOT TESTED', 'production_access': False, 'migrations': []}
containers = []


def run(args, data=None, check=True):
    p = subprocess.run(args, input=data, text=True, capture_output=True, timeout=300)
    if check and p.returncode:
        # Never print runtime credentials, Auth bodies/tokens or container env.
        message = p.stderr[-2500:]
        for secret in (PW, JWT):
            message = message.replace(secret, '[ephemeral-secret]')
        raise RuntimeError(message or ('command failed: ' + args[0]))
    return p


def sql(text, check=True):
    return run(['docker', 'exec', '-i', DB, 'psql', '-X', '-qAt', '-v',
                'ON_ERROR_STOP=1', '-U', 'supabase_admin', '-d', 'postgres'], text, check)


def start(name, image, env, command=(), anchor=False):
    args = ['docker', 'run', '-d', '--name', name, '--network',
            'none' if anchor else 'container:' + DB, '--cap-drop=NET_RAW',
            '--security-opt=no-new-privileges:true']
    for k, v in env.items():
        args += ['-e', k + '=' + v]
    args += [image, *command]
    run(args)
    containers.append(name)


def probe(mode):
    return run(['docker', 'run', '--rm', '--network', 'container:' + DB,
                '--cap-drop=ALL', '--security-opt=no-new-privileges:true',
                '-v', str(ROOT / 'tests/integration') + ':/suite:ro',
                '-e', 'FIXTURE_JWT_SECRET=' + JWT, '-e', 'FIXTURE_MODE=' + mode,
                IMAGES['probe'], 'python', '/suite/offline_client.py'])


def auth_start():
    name = PREFIX + '-auth'
    start(name, IMAGES['auth'], {
        'GOTRUE_API_HOST': '127.0.0.1', 'GOTRUE_API_PORT': '9999',
        'API_EXTERNAL_URL': 'http://127.0.0.1:9999',
        'GOTRUE_DB_DRIVER': 'postgres',
        'GOTRUE_DB_DATABASE_URL': f'postgres://supabase_auth_admin:{PW}@127.0.0.1:5432/postgres',
        'GOTRUE_SITE_URL': 'http://127.0.0.1:3000',
        'GOTRUE_JWT_SECRET': JWT, 'GOTRUE_JWT_ADMIN_ROLES': 'service_role',
        'GOTRUE_JWT_AUD': 'authenticated', 'GOTRUE_JWT_DEFAULT_GROUP_NAME': 'authenticated',
        'GOTRUE_EXTERNAL_EMAIL_ENABLED': 'true', 'GOTRUE_MAILER_AUTOCONFIRM': 'true',
        'GOTRUE_EXTERNAL_PHONE_ENABLED': 'false', 'GOTRUE_DISABLE_SIGNUP': 'false',
        'GOTRUE_SMTP_HOST': '127.0.0.1', 'GOTRUE_SMTP_PORT': '1'})
    probe('auth-ready')


def main():
    assert os.environ.get('GITHUB_ACTIONS') == 'true', 'Run only on temporary GitHub Actions runner'
    # Only committed SQL enters the test system. No local env or linked project.
    manifest = json.loads((ROOT / 'docs/growth-phase1/staging-migration-manifest.json').read_text())
    assert len(manifest['migrations']) == manifest['migrationCount'] == 121
    for item in manifest['migrations']:
        text = (ROOT / 'supabase/migrations' / item['file']).read_text().replace('\r\n', '\n')
        assert hashlib.sha256(text.encode()).hexdigest() == item['sha256'], item['file']
    for image in IMAGES.values():
        run(['docker', 'pull', image])
    report['image_ids'] = {k: json.loads(run(['docker', 'image', 'inspect', v]).stdout)[0]['Id']
                           for k, v in IMAGES.items()}
    start(DB, IMAGES['db'], {'POSTGRES_PASSWORD': PW, 'POSTGRES_DB': 'postgres',
                           'JWT_SECRET': JWT, 'JWT_EXP': '3600'},
          ['postgres', '-c', 'config_file=/etc/postgresql/postgresql.conf',
           '-c', 'cron.launch_active_jobs=off', '-c', 'listen_addresses=127.0.0.1'], True)
    for _ in range(90):
        if run(['docker', 'exec', DB, 'pg_isready', '-U', 'postgres'], check=False).returncode == 0:
            break
        time.sleep(1)
    else:
        raise RuntimeError('Isolated PostgreSQL failed readiness')
    # Prove the runtime isolation BEFORE application migration replay.
    detail = json.loads(run(['docker', 'inspect', DB]).stdout)[0]
    assert detail['HostConfig']['NetworkMode'] == 'none'
    assert not detail['HostConfig']['Privileged'] and not detail['HostConfig']['PortBindings']
    assert not detail['HostConfig'].get('CapAdd')
    assert not detail['Mounts'] or all(m['Type'] == 'volume' for m in detail['Mounts'])
    probe('isolation')
    assert sql('show cron.launch_active_jobs').stdout.strip() == 'off'
    report['isolation'] = 'PASS: loopback only, no external routes/ports, cron launch disabled'
    sql(f"alter user authenticator password '{PW}'; alter user supabase_auth_admin password '{PW}';")
    auth_start()  # Real GoTrue migrations/auth schema, never a mocked auth.uid().
    sql("create extension if not exists pg_cron; create extension if not exists supabase_vault with schema vault;")
    sql("select vault.create_secret('synthetic-never-used', 'socialrush_email_cron_secret');")
    # Do not consume cron job IDs before history: a legacy migration uses ID 1.
    sql("create table public.offline_cron_sentinel(n int);")
    failed = None
    for item in manifest['migrations']:
        if item['file'] == '202609020001_update_follower_service_pricing.sql':
            baseline = ROOT / 'supabase/clean-install/v1/services-timestamp.sql'
            before = sql("select md5(coalesce(jsonb_agg(to_jsonb(s)-'updated_at' order by id)::text,'')) from services s").stdout
            orders_before = sql("select md5(coalesce(jsonb_agg(to_jsonb(o) order by id)::text,'')) from orders o").stdout
            sql("set socialrush.clean_install='v1';" + baseline.read_text())
            assert sql("select md5(coalesce(jsonb_agg(to_jsonb(s)-'updated_at' order by id)::text,'')) from services s").stdout == before
            assert sql("select md5(coalesce(jsonb_agg(to_jsonb(o) order by id)::text,'')) from orders o").stdout == orders_before
            report['clean_install_baseline'] = {'version': 'v1', 'file': str(baseline.relative_to(ROOT)),
                'sha256': hashlib.sha256(baseline.read_bytes()).hexdigest(), 'data_preservation': 'PASS'}
        result = sql((ROOT / 'supabase/migrations' / item['file']).read_text(), check=False)
        report['migrations'].append({'file': item['file'], 'result': 'PASS' if result.returncode == 0 else 'FAIL'})
        if result.returncode:
            failed = item['file']
            report['full_replay'] = 'BLOCKED at ' + failed
            report['replay_error'] = result.stderr[-1800:].replace(PW, '[ephemeral-secret]').replace(JWT, '[ephemeral-secret]')
            break
    if not failed:
        report['full_replay'] = 'PASS: clean-install baseline v1 plus all 121 unchanged migrations; NOT unmodified history or production upgrade'
    assert sql('show cron.launch_active_jobs').stdout.strip() == 'off'
    sql("select cron.schedule('offline-sentinel', '* * * * *', 'insert into public.offline_cron_sentinel values(1)');")
    time.sleep(65)
    assert sql('select count(*) from public.offline_cron_sentinel').stdout.strip() == '0'
    report['cron_sentinel'] = 'PASS: no execution over at least 65 seconds'
    if failed:
        # Supplementary coverage, clearly NOT full-history compatibility. This
        # database is disposable, with no customer identities created yet.
        sql('drop schema public cascade; create schema public; grant usage on schema public to anon,authenticated,service_role;')
        fixture = (ROOT / 'tests/database/payment-safety-fixture.sql').read_text()
        sql(fixture[fixture.index('create table profiles'):])
        for file in ['202607250001_checkout_intents.sql', '202606190006_fintech_wallet.sql',
                     '20261003033000_harden_wallet_payment_settlement.sql',
                     '20260926173543_agency_checkout_attribution.sql',
                     '20261005190934_verify_wallet_split_checkout_safety.sql',
                     '20261019214002_payment_revenue_safety.sql',
                     '202610110001_admin_manual_wallet_atomic_review.sql',
                     '20261022103153_retire_obsolete_gateway_operations.sql']:
            sql((ROOT / 'supabase/migrations' / file).read_text())
        # Reinstall the exact profile trigger from the initial migration.
        initial = (ROOT / 'supabase/migrations/202606190001_initial_schema.sql').read_text()
        trigger = initial[initial.index('create or replace function public.handle_new_user()'):initial.index('-- Security-definer helper')]
        # Curated fixture lacks full_name, used by the real signup trigger.
        sql("alter table profiles add column full_name text not null default '';" + trigger)
        report['integration_schema'] = 'curated financial fixture + real Auth; full replay remains BLOCKED'
    else:
        report['integration_schema'] = 'full migration history + real Auth'
    sql('grant all on all tables in schema public to service_role; grant all on all sequences in schema public to service_role; grant select on checkout_intents to authenticated;')
    if not failed:
        sql("insert into categories(name) values('Offline synthetic integration'); insert into services(category_id,code,name,platform,rate,min,max,status,is_active,accepts_new_orders,health_status) select id,'offline-integration','Offline synthetic service','facebook',500,100,1000,'active',true,true,'stable' from categories where name='Offline synthetic integration';")
    else:
        sql("insert into services(code,name,platform,rate,min,max) values('offline-integration','Offline synthetic service','facebook',500,100,1000);")
    # Test-only fault injected after the RPC deducts funds, at order insertion.
    sql("""create function public.offline_reject_order() returns trigger language plpgsql as $$
      begin if new.link='https://example.invalid/rollback' then raise exception 'Synthetic order insert failure'; end if;
      return new; end $$;
      create trigger offline_reject_order before insert on public.orders
      for each row execute function public.offline_reject_order();""")
    start(PREFIX + '-rest', IMAGES['rest'], {
        'PGRST_DB_URI': f'postgres://authenticator:{PW}@127.0.0.1:5432/postgres',
        'PGRST_DB_SCHEMAS': 'public', 'PGRST_DB_ANON_ROLE': 'anon',
        'PGRST_JWT_SECRET': JWT, 'PGRST_SERVER_HOST': '127.0.0.1', 'PGRST_SERVER_PORT': '3000'})
    result = probe('integration')
    report['integration'] = json.loads(result.stdout)
    probe('isolation')
    report['final_isolation'] = 'PASS'


if __name__ == '__main__':
    code = 0
    try:
        main()
    except Exception as exc:
        code = 1
        report['error'] = str(exc)
    finally:
        for name in reversed(containers):
            run(['docker', 'rm', '-fv', name], check=False)
        OUT.parent.mkdir(parents=True, exist_ok=True)
        OUT.write_text(json.dumps(report, indent=2))
        print(json.dumps(report, indent=2))
    sys.exit(code)
