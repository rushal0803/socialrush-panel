-- Keep real customer notifications untouched during a controlled recipient-only test.
-- Replace the one-argument claim signature to prevent bypass via overload.
drop function if exists public.claim_order_notification_batch(integer);
create or replace function public.claim_order_notification_batch(p_limit integer default 20, p_test_recipient text default null)
returns setof public.order_notification_outbox
language plpgsql security definer set search_path = public
as $$
begin
  if auth.role() <> 'service_role' then raise exception 'Forbidden'; end if;
  -- A worker may crash after claiming a row. Expired leases are recoverable,
  -- but never recycle a row beyond the configured delivery-attempt ceiling.
  update public.order_notification_outbox
  set status = 'failed', last_error = 'Maximum delivery attempts reached after stale claim',
      updated_at = now()
  where status = 'sending'
    and claimed_at < now() - interval '15 minutes'
    and attempts >= 5;

  return query
  with claimed as (
    select id from public.order_notification_outbox
    where (p_test_recipient is null or lower(recipient_email) = lower(p_test_recipient))
      and attempts < 5
      and ((status in ('pending','retry') and next_attempt_at <= now())
       or (status = 'sending' and claimed_at < now() - interval '15 minutes'))
    order by created_at
    limit least(greatest(p_limit,1),50)
    for update skip locked
  )
  update public.order_notification_outbox q
  set status = 'sending', attempts = q.attempts + 1, claimed_at = now(), updated_at = now()
  from claimed where q.id = claimed.id returning q.*;
end;
$$;
revoke all on function public.claim_order_notification_batch(integer,text) from public, anon, authenticated;
grant execute on function public.claim_order_notification_batch(integer) to service_role;
