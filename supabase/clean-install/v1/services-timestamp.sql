-- Clean-install baseline v1 only. Not an automatic production migration.
-- Apply explicitly before 202609020001_update_follower_service_pricing.sql.
-- Unknown historical update times remain NULL: no default, trigger or backfill.
do $$ begin
  if current_setting('socialrush.clean_install', true) is distinct from 'v1' then
    raise exception 'Explicit clean-install v1 context required';
  end if;
end $$;
alter table public.services add column if not exists updated_at timestamptz;
do $$ begin
  if not exists(select 1 from pg_attribute
    where attrelid='public.services'::regclass and attname='updated_at'
      and atttypid='timestamptz'::regtype and not attisdropped) then
    raise exception 'Existing services.updated_at has incompatible type; review schema evidence';
  end if;
end $$;
