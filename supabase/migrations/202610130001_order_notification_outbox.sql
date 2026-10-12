-- Phase 3 transactional notification outbox. Apply separately after review.
create table if not exists public.order_notification_outbox (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  event_kind text not null check (event_kind in ('order_placed','payment_verified','processing_started','order_completed','order_attention')),
  event_key text not null unique,
  recipient_email text,
  status text not null default 'pending' check (status in ('pending','sending','sent','retry','failed','suppressed')),
  attempts integer not null default 0 check (attempts >= 0),
  next_attempt_at timestamptz not null default now(),
  claimed_at timestamptz,
  provider_message_id text,
  last_error text,
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  updated_at timestamptz not null default now()
);
create index if not exists order_notification_outbox_pending_idx on public.order_notification_outbox (next_attempt_at, created_at) where status in ('pending','retry');
alter table public.order_notification_outbox enable row level security;
revoke all on public.order_notification_outbox from anon, authenticated;
-- Only privileged backend/service role may read or mutate queue rows.
create or replace function public.claim_order_notification_batch(p_limit integer default 20)
returns setof public.order_notification_outbox
language plpgsql security definer set search_path = public
as $$
begin
  if auth.role() <> 'service_role' then raise exception 'Forbidden'; end if;
  return query
  with claimed as (
    select id from public.order_notification_outbox
    where (status in ('pending','retry') and next_attempt_at <= now())
       or (status = 'sending' and claimed_at < now() - interval '15 minutes')
    order by created_at
    limit least(greatest(p_limit,1),50)
    for update skip locked
  )
  update public.order_notification_outbox q
  set status = 'sending', attempts = q.attempts + 1, claimed_at = now(), updated_at = now()
  from claimed where q.id = claimed.id returning q.*;
end;
$$;
revoke all on function public.claim_order_notification_batch(integer) from public, anon, authenticated;
grant execute on function public.claim_order_notification_batch(integer) to service_role;
