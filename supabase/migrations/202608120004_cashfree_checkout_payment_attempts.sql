-- Preserve every direct Cashfree attempt while permitting a retry after a
-- terminal unpaid attempt. A checkout intent may still have only one active
-- attempt and only one completed order.
alter table public.cashfree_checkout_intent_payments
  add column if not exists attempt_number integer not null default 1;

do $$
declare v_constraint text;
begin
  for v_constraint in
    select c.conname
    from pg_constraint c
    join pg_attribute a on a.attrelid=c.conrelid and a.attnum=any(c.conkey)
    where c.conrelid='public.cashfree_checkout_intent_payments'::regclass
      and c.contype='u' and array_length(c.conkey,1)=1 and a.attname='checkout_intent_id'
  loop
    execute format('alter table public.cashfree_checkout_intent_payments drop constraint %I',v_constraint);
  end loop;
end $$;

create unique index if not exists cashfree_checkout_intent_payments_intent_attempt_unique
  on public.cashfree_checkout_intent_payments(checkout_intent_id, attempt_number);

create unique index if not exists cashfree_checkout_intent_payments_one_active_attempt_unique
  on public.cashfree_checkout_intent_payments(checkout_intent_id)
  where status in ('created','pending');
