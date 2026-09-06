-- Repair Phase 11 without altering historical event rows or prospect CRM.
alter table public.customer_email_events drop constraint if exists customer_email_events_event_target;
alter table public.customer_email_events add constraint customer_email_events_event_target check (
 (event_type in ('signup_no_order','first_order_reminder','inactive_7d') and order_id is null) or
 (event_type in ('order_created','order_completed') and order_id is not null)
);

-- Claim transactional work normally, but reserve lifecycle capacity atomically.
create or replace function public.claim_next_customer_email_event() returns setof public.customer_email_events language plpgsql security definer set search_path=public as $$
begin
 return query with config as (select lifecycle_daily_limit from customer_email_automation_config where id=true), candidate as (
  select e.id from customer_email_events e where (e.status in ('queued','failed') or (e.status='processing' and e.processing_started_at < now()-interval '15 minutes'))
  and (e.event_type not in ('first_order_reminder','inactive_7d') or (
   (select count(*) from customer_email_events x where x.event_type in ('first_order_reminder','inactive_7d') and ((x.status='sent' and x.provider_message_id is not null and x.sent_at >= date_trunc('day',now())) or (x.status='processing' and x.processing_started_at >= date_trunc('day',now())))) < (select lifecycle_daily_limit from config)
  )) order by e.created_at for update skip locked limit 1
 ) update customer_email_events e set status='processing',attempt_count=e.attempt_count+1,processing_started_at=now(),updated_at=now(),error_message=null from candidate where e.id=candidate.id returning e.*;
end $$;
revoke all on function public.claim_next_customer_email_event() from public; grant execute on function public.claim_next_customer_email_event() to service_role;

-- signup_no_order is retained for history only; first_order_reminder is canonical.
create or replace function public.enqueue_signup_no_order_email_events() returns integer language sql security definer set search_path=public as $$ select 0 $$;
revoke all on function public.enqueue_signup_no_order_email_events() from public; grant execute on function public.enqueue_signup_no_order_email_events() to service_role;
