-- Persist the provider-issued checkout session so a repeated request can return
-- the same active Cashfree checkout instead of creating another provider order.
alter table public.cashfree_checkout_intent_payments
  add column if not exists payment_session_id text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'cashfree_checkout_intent_payments_pending_session_check'
      and conrelid = 'public.cashfree_checkout_intent_payments'::regclass
  ) then
    alter table public.cashfree_checkout_intent_payments
      add constraint cashfree_checkout_intent_payments_pending_session_check
      check ((status <> 'pending') or payment_session_id is not null) not valid;
  end if;
end $$;

alter table public.cashfree_checkout_intent_payments
  validate constraint cashfree_checkout_intent_payments_pending_session_check;
