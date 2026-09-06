-- Keep queued marketing work dormant while disabled and serialize only lifecycle capacity.
create or replace function public.claim_next_customer_email_event() returns setof public.customer_email_events language plpgsql security definer set search_path=public as $$
declare picked uuid; cfg customer_email_automation_config%rowtype;
begin
 select id into picked from customer_email_events where (status in ('queued','failed') or (status='processing' and processing_started_at < now()-interval '15 minutes')) and event_type not in ('first_order_reminder','inactive_7d') order by created_at for update skip locked limit 1;
 if picked is not null then return query update customer_email_events set status='processing',attempt_count=attempt_count+1,processing_started_at=now(),updated_at=now(),error_message=null where id=picked returning *; return; end if;
 select * into cfg from customer_email_automation_config where id=true for update;
 if not found or not cfg.lifecycle_enabled then return; end if;
 if (select count(*) from customer_email_events x where x.event_type in ('first_order_reminder','inactive_7d') and ((x.status='sent' and x.provider_message_id is not null and x.sent_at>=date_trunc('day',now())) or (x.status='processing' and x.processing_started_at>=date_trunc('day',now())))) >= cfg.lifecycle_daily_limit then return; end if;
 select id into picked from customer_email_events where (status in ('queued','failed') or (status='processing' and processing_started_at < now()-interval '15 minutes')) and event_type in ('first_order_reminder','inactive_7d') order by created_at for update skip locked limit 1;
 if picked is not null then return query update customer_email_events set status='processing',attempt_count=attempt_count+1,processing_started_at=now(),updated_at=now(),error_message=null where id=picked returning *; end if;
end $$;
revoke all on function public.claim_next_customer_email_event() from public; grant execute on function public.claim_next_customer_email_event() to service_role;
