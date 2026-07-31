-- Privacy-safe, append-only first-party analytics. No historical backfill.
create table public.analytics_events (
  id bigint generated always as identity primary key,
  event_name text not null check (event_name in ('homepage_view','services_page_view','packages_page_view','service_landing_page_view','service_selected','package_selected','start_order_clicked','signup_started','signup_completed','login_completed','new_order_started','platform_selected','campaign_details_started','valid_link_entered','quantity_entered','order_summary_viewed','order_confirmation_started','order_created','order_creation_failed','add_funds_started','payment_method_selected','payment_checkout_started','payment_successful','payment_processing','payment_failed','wallet_credited','reorder_started','saved_profile_used','referral_link_copied','support_ticket_created','review_submitted','page_load_failure','service_load_failure','invalid_link_validation','quantity_validation_error','checkout_intent_failure','payment_verification_delay','support_ticket_submission_failure')),
  anonymous_session_id uuid,
  customer_id uuid references auth.users(id) on delete set null,
  page_path text not null check (page_path like '/%' and page_path not like '%?%'),
  platform text, service_code text, package_id text,
  device_category text not null check(device_category in ('mobile','tablet','desktop','unknown')),
  browser_family text, screen_width_category text,
  source text, medium text, campaign text, content text, term text, referring_domain text,
  safe_metadata jsonb not null default '{}'::jsonb check(jsonb_typeof(safe_metadata)='object' and pg_column_size(safe_metadata)<=4096),
  created_at timestamptz not null default now()
);
alter table public.analytics_events enable row level security;
create policy analytics_admin_read on public.analytics_events for select to authenticated using(public.is_admin());
create index analytics_events_created_idx on public.analytics_events(created_at desc);
create index analytics_events_funnel_idx on public.analytics_events(event_name,created_at desc);
create index analytics_events_customer_idx on public.analytics_events(customer_id,created_at desc) where customer_id is not null;

create or replace function public.record_analytics_event(p_event_name text,p_session_id uuid,p_page_path text,p_platform text default null,p_service_code text default null,p_package_id text default null,p_device_category text default 'unknown',p_browser_family text default null,p_screen_width_category text default null,p_source text default null,p_medium text default null,p_campaign text default null,p_content text default null,p_term text default null,p_referring_domain text default null,p_metadata jsonb default '{}'::jsonb)
returns void language plpgsql security definer set search_path=public as $$
declare v_customer uuid:=auth.uid();v_path text:=split_part(left(coalesce(p_page_path,'/'),300),'?',1);v_financial text[]:=array['order_created','payment_successful','wallet_credited'];
begin
  if p_event_name=any(v_financial) then raise exception 'Trusted server event required';end if;
  if p_session_id is null and v_customer is null then raise exception 'Session required';end if;
  if (select count(*) from analytics_events where created_at>now()-interval '1 hour' and coalesce(customer_id::text,anonymous_session_id::text)=coalesce(v_customer::text,p_session_id::text))>=120 then return;end if;
  insert into analytics_events(event_name,anonymous_session_id,customer_id,page_path,platform,service_code,package_id,device_category,browser_family,screen_width_category,source,medium,campaign,content,term,referring_domain,safe_metadata)
  values(p_event_name,p_session_id,v_customer,v_path,nullif(left(p_platform,40),''),nullif(left(p_service_code,100),''),nullif(left(p_package_id,100),''),case when p_device_category in('mobile','tablet','desktop')then p_device_category else 'unknown'end,nullif(left(p_browser_family,30),''),nullif(left(p_screen_width_category,30),''),nullif(left(p_source,100),''),nullif(left(p_medium,100),''),nullif(left(p_campaign,150),''),nullif(left(p_content,150),''),nullif(left(p_term,150),''),nullif(left(p_referring_domain,150),''),coalesce(p_metadata,'{}'::jsonb));
end$$;
revoke all on function public.record_analytics_event(text,uuid,text,text,text,text,text,text,text,text,text,text,text,text,text,jsonb) from public;
grant execute on function public.record_analytics_event(text,uuid,text,text,text,text,text,text,text,text,text,text,text,text,text,jsonb) to anon,authenticated;
