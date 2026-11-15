-- Disposable CI PostgreSQL fixture only; never a Supabase/customer database.
\set ON_ERROR_STOP on
begin;
do $$ begin
  if current_database()<>'wallet_fixture' then raise exception 'Only disposable wallet_fixture database is allowed'; end if;
end $$;
-- The wallet fixture supplies anon/authenticated/service_role already.
create table public.analytics_events(id integer);
grant insert,update,delete on public.analytics_events to public, anon, authenticated, service_role;
create function public.record_analytics_event(text,uuid) returns void language sql security definer as 'insert into public.analytics_events values(1)';
create function public.record_analytics_event(text) returns void language sql security definer as 'insert into public.analytics_events values(1)';
grant execute on function public.record_analytics_event(text,uuid) to public,anon,authenticated;
grant execute on function public.record_analytics_event(text) to public,anon,authenticated;
do $$ begin
  if not has_function_privilege('anon','public.record_analytics_event(text,uuid)','execute') then raise exception 'Fixture did not reproduce direct public RPC access';end if;
end $$;
\ir ../../docs/socialrush-3/phase4/analytics-ingestion-permissions.proposed.sql
do $$ begin
  if has_function_privilege('anon','public.record_analytics_event(text,uuid)','execute') or has_function_privilege('authenticated','public.record_analytics_event(text)','execute') then raise exception 'Legacy RPC overload remains executable';end if;
  if has_table_privilege('anon','public.analytics_events','insert') or has_table_privilege('authenticated','public.analytics_events','update') then raise exception 'Direct optional analytics writes remain allowed';end if;
  if not has_table_privilege('service_role','public.analytics_events','insert') then raise exception 'Server-only writer lost required table access';end if;
end $$;
rollback;
