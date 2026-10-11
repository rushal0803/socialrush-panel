alter table public.customer_email_events
  add column if not exists delivery_status text,
  add column if not exists delivered_at timestamptz,
  add column if not exists opened_at timestamptz,
  add column if not exists clicked_at timestamptz,
  add column if not exists provider_event_at timestamptz;

alter table public.customer_email_events
  drop constraint if exists customer_email_events_delivery_status_check;

alter table public.customer_email_events
  add constraint customer_email_events_delivery_status_check
  check (
    delivery_status is null
    or delivery_status = any (
      array[
        'accepted'::text,
        'delivered'::text,
        'bounced'::text,
        'complained'::text,
        'suppressed'::text,
        'failed'::text
      ]
    )
  );

create index if not exists customer_email_events_provider_message_idx
  on public.customer_email_events(provider_message_id)
  where provider_message_id is not null;

create or replace function public.mark_customer_email_delivery_accepted()
returns trigger
language plpgsql
set search_path to 'public'
as $function$
begin
  if new.status='sent'
     and new.provider_message_id is not null
     and (
       old.provider_message_id is null
       or new.delivery_status is null
     ) then
    new.delivery_status=coalesce(new.delivery_status,'accepted');
    new.provider_event_at=coalesce(new.provider_event_at,new.sent_at,new.updated_at,now());
  end if;
  return new;
end
$function$;

drop trigger if exists customer_email_events_mark_accepted on public.customer_email_events;
create trigger customer_email_events_mark_accepted
before update on public.customer_email_events
for each row
execute function public.mark_customer_email_delivery_accepted();

update public.customer_email_events
set delivery_status='accepted',
    provider_event_at=coalesce(provider_event_at,sent_at,updated_at)
where provider_message_id is not null
  and status='sent'
  and delivery_status is null;

comment on column public.customer_email_events.delivery_status is
  'Provider delivery state for accepted customer email messages. Separate from queue processing status.';
comment on column public.customer_email_events.delivered_at is
  'Latest Resend delivered timestamp received by webhook.';
comment on column public.customer_email_events.opened_at is
  'Latest Resend opened timestamp received by webhook when tracking is available.';
comment on column public.customer_email_events.clicked_at is
  'Latest Resend clicked timestamp received by webhook when tracking is available.';
