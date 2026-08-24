-- Supabase Cron replaces the unsupported hourly Vercel Hobby cron. The shared
-- authorization secret is read from Vault at execution time, never stored in
-- this migration or exposed through the Data API.
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

do $$
begin
  if not exists (
    select 1 from vault.decrypted_secrets where name = 'socialrush_email_cron_secret'
  ) then
    raise exception 'Create the socialrush_email_cron_secret Supabase Vault secret before applying this migration.';
  end if;

  if exists (select 1 from cron.job where jobname = 'socialrush-email-dispatch-hourly') then
    perform cron.unschedule('socialrush-email-dispatch-hourly');
  end if;
end $$;

select cron.schedule(
  'socialrush-email-dispatch-hourly',
  '0 * * * *',
  $schedule$
    select net.http_get(
      url := 'https://www.getsocialrush.com/api/cron/email',
      headers := jsonb_build_object(
        'Authorization',
        'Bearer ' || (
          select decrypted_secret
          from vault.decrypted_secrets
          where name = 'socialrush_email_cron_secret'
        )
      ),
      timeout_milliseconds := 10000
    );
  $schedule$
);
