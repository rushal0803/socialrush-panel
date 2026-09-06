alter table public.customer_email_events enable row level security;
drop policy if exists "admins read customer email events" on public.customer_email_events;
create policy "admins read customer email events" on public.customer_email_events for select to authenticated using (public.is_admin());
