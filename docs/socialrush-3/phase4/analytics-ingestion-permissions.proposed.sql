-- REVIEW PROPOSAL ONLY. Not installed as a migration and never run on QA/prod.
-- Required before enabling any collection. Existing anonymous RPC bypasses app consent.
-- Create an approved migration via supported tooling and authorize its rollout separately.
do $permissions$
declare target regprocedure;
begin
  for target in
    select p.oid::regprocedure from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname='record_analytics_event'
  loop
    execute format('revoke all on function %s from public, anon, authenticated', target);
  end loop;
  if to_regclass('public.analytics_events') is not null then
    revoke insert, update, delete on table public.analytics_events from public, anon, authenticated;
  end if;
end;
$permissions$;
