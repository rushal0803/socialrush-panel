drop policy if exists "order_drafts_admin_read" on public.order_drafts;
create policy "order_drafts_admin_read"
on public.order_drafts
for select
to authenticated
using (public.is_admin());
