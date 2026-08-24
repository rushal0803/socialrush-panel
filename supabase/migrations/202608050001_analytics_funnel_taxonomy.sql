-- Consolidates first-party analytics around an allowlisted conversion taxonomy.
-- Financial and order outcomes are written only by the server helper.
alter table public.analytics_events add column if not exists event_id text;
alter table public.analytics_events add column if not exists occurred_at timestamptz not null default now();
alter table public.analytics_events drop constraint if exists analytics_events_event_name_check;
alter table public.analytics_events add constraint analytics_events_event_name_check check (event_name in (
  'sign_up_started','sign_up_completed','login_completed','service_viewed','service_selected',
  'package_viewed','package_selected','order_started','checkout_started','payment_started',
  'payment_completed','payment_failed','wallet_topup_completed','wallet_order_completed','order_created',
  'refill_requested','support_ticket_created','support_reply_sent','review_submitted',
  'creator_tool_used','creator_tool_result_generated','blog_article_viewed','blog_service_cta_clicked',
  -- Historical records already present in production before this taxonomy.
  -- Keep them valid rather than rewriting analytics history; the RPC allowlist
  -- below still prevents clients from creating new legacy events.
  'homepage_view','services_page_view','packages_page_view','service_landing_page_view',
  'new_order_started','platform_selected','campaign_details_started','valid_link_entered',
  'quantity_entered','order_summary_viewed','payment_successful'
));
create unique index if not exists analytics_events_event_id_unique
  on public.analytics_events(event_id) where event_id is not null;
create index if not exists analytics_events_occurred_funnel_idx
  on public.analytics_events(event_name, occurred_at desc);
create index if not exists analytics_events_session_occurred_idx
  on public.analytics_events(anonymous_session_id, occurred_at desc) where anonymous_session_id is not null;

create or replace function public.record_analytics_event(p_event_name text,p_session_id uuid,p_page_path text,p_platform text default null,p_service_code text default null,p_package_id text default null,p_device_category text default 'unknown',p_browser_family text default null,p_screen_width_category text default null,p_source text default null,p_medium text default null,p_campaign text default null,p_content text default null,p_term text default null,p_referring_domain text default null,p_metadata jsonb default '{}'::jsonb)
returns void language plpgsql security definer set search_path=public as $$
declare v_customer uuid:=auth.uid(); v_path text:=split_part(left(coalesce(p_page_path,'/'),300),'?',1);
declare v_client_events text[]:=array['sign_up_started','service_viewed','service_selected','package_viewed','package_selected','order_started','checkout_started','payment_started','creator_tool_used','creator_tool_result_generated','blog_article_viewed','blog_service_cta_clicked'];
begin
  if not p_event_name = any(v_client_events) then raise exception 'Client event is not allowed'; end if;
  if p_session_id is null and v_customer is null then raise exception 'Session required'; end if;
  if jsonb_typeof(coalesce(p_metadata,'{}'::jsonb)) <> 'object' or pg_column_size(coalesce(p_metadata,'{}'::jsonb)) > 2048 then raise exception 'Invalid metadata'; end if;
  if (select count(*) from analytics_events where occurred_at > now()-interval '1 hour' and coalesce(customer_id::text,anonymous_session_id::text)=coalesce(v_customer::text,p_session_id::text)) >= 120 then return; end if;
  insert into analytics_events(event_name,anonymous_session_id,customer_id,page_path,platform,service_code,package_id,device_category,browser_family,screen_width_category,source,medium,campaign,content,term,referring_domain,safe_metadata,occurred_at)
  values(p_event_name,p_session_id,v_customer,v_path,nullif(left(p_platform,40),''),nullif(left(p_service_code,100),''),nullif(left(p_package_id,100),''),case when p_device_category in('mobile','tablet','desktop') then p_device_category else 'unknown' end,nullif(left(p_browser_family,30),''),nullif(left(p_screen_width_category,30),''),nullif(left(p_source,100),''),nullif(left(p_medium,100),''),nullif(left(p_campaign,150),''),nullif(left(p_content,150),''),nullif(left(p_term,150),''),nullif(left(p_referring_domain,150),''),coalesce(p_metadata,'{}'::jsonb),now());
end $$;
