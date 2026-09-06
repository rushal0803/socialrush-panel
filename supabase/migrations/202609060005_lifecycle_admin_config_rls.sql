alter table public.customer_email_automation_config enable row level security;
drop policy if exists "admins manage customer email automation config" on public.customer_email_automation_config;
create policy "admins manage customer email automation config" on public.customer_email_automation_config
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
