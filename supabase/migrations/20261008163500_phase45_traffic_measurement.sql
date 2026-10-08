-- Phase 45 — 100K Traffic Engine.
-- Forward-only analytics measurement:
-- 1) keep the database event taxonomy aligned with the current client/server event allowlists,
-- 2) add a generic consent-aware page_viewed event for traffic measurement,
-- 3) expose only an aggregated, service-role-only traffic snapshot for the admin dashboard.
-- No historical traffic is backfilled.

alter table public.analytics_events
  drop constraint if exists analytics_events_event_name_check;

alter table public.analytics_events
  add constraint analytics_events_event_name_check
  check (
    event_name = any (
      array[
        'page_viewed',
        'sign_up_started','service_viewed','service_selected','package_viewed','package_selected',
        'new_order_clicked','order_platform_selected','order_started','order_draft_saved',
        'order_draft_discarded','order_details_completed','checkout_started','payment_started',
        'payment_method_selected','payment_funnel_step','payment_exit','payment_help_clicked',
        'payment_returned','utr_submitted','checkout_error','checkout_recovery_view',
        'checkout_recovery_click','creator_tool_used','creator_tool_result_generated',
        'blog_article_viewed','blog_service_cta_clicked','blog_tool_cta_clicked',
        'creator_tool_service_cta_clicked','organic_landing_view','cross_sell_view','cross_sell_click',
        'bundle_view','bundle_click','repeat_order_click','order_success_recommendation_view',
        'order_success_recommendation_click','market_hub_viewed','recent_service_opened',
        'continue_order_clicked','related_service_clicked','bulk_inquiry_clicked',
        'lead_whatsapp_clicked','qualified_lead_submitted','referral_share_clicked',
        'referral_landing_view','referral_signup_attributed','referral_center_view',
        'campaign_stack_growth_path_click','repeat_growth_path_click','dashboard_repeat_scale_click',
        'retention_next_action_view','retention_next_action_click','package_growth_path_click',
        'homepage_conversion_path_click','agency_bulk_form_view','agency_bulk_form_incomplete',
        'agency_bulk_form_error','agency_revenue_path_click','agency_growth_next_action_view',
        'agency_growth_next_action_click','web_vital','experiment_exposure',
        'first_order_bonus_view','first_order_bonus_click','marketing_opt_in_selected',

        'sign_up_completed','login_completed','payment_completed','payment_failed',
        'wallet_topup_completed','wallet_order_completed','order_created','refill_requested',
        'support_ticket_created','support_reply_sent','review_submitted',

        -- Historical events already present in production remain valid.
        'campaign_details_started','homepage_view','new_order_started','order_summary_viewed',
        'packages_page_view','payment_successful','platform_selected','quantity_entered',
        'service_landing_page_view','services_page_view','valid_link_entered'
      ]::text[]
    )
  );

create or replace function public.record_analytics_event(
  p_event_name text,
  p_session_id uuid,
  p_page_path text,
  p_platform text default null::text,
  p_service_code text default null::text,
  p_package_id text default null::text,
  p_device_category text default 'unknown'::text,
  p_browser_family text default null::text,
  p_screen_width_category text default null::text,
  p_source text default null::text,
  p_medium text default null::text,
  p_campaign text default null::text,
  p_content text default null::text,
  p_term text default null::text,
  p_referring_domain text default null::text,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_customer uuid := auth.uid();
  v_path text := split_part(left(coalesce(p_page_path,'/'),300),'?',1);
  v_client_events text[] := array[
    'page_viewed',
    'sign_up_started','service_viewed','service_selected','package_viewed','package_selected',
    'new_order_clicked','order_platform_selected','order_started','order_draft_saved',
    'order_draft_discarded','order_details_completed','checkout_started','payment_started',
    'payment_method_selected','payment_funnel_step','payment_exit','payment_help_clicked',
    'payment_returned','utr_submitted','checkout_error','checkout_recovery_view',
    'checkout_recovery_click','creator_tool_used','creator_tool_result_generated',
    'blog_article_viewed','blog_service_cta_clicked','blog_tool_cta_clicked',
    'creator_tool_service_cta_clicked','organic_landing_view','cross_sell_view','cross_sell_click',
    'bundle_view','bundle_click','repeat_order_click','order_success_recommendation_view',
    'order_success_recommendation_click','market_hub_viewed','recent_service_opened',
    'continue_order_clicked','related_service_clicked','bulk_inquiry_clicked',
    'lead_whatsapp_clicked','qualified_lead_submitted','referral_share_clicked',
    'referral_landing_view','referral_signup_attributed','referral_center_view',
    'campaign_stack_growth_path_click','repeat_growth_path_click','dashboard_repeat_scale_click',
    'retention_next_action_view','retention_next_action_click','package_growth_path_click',
    'homepage_conversion_path_click','agency_bulk_form_view','agency_bulk_form_incomplete',
    'agency_bulk_form_error','agency_revenue_path_click','agency_growth_next_action_view',
    'agency_growth_next_action_click','web_vital','experiment_exposure',
    'first_order_bonus_view','first_order_bonus_click','marketing_opt_in_selected'
  ]::text[];
begin
  if not p_event_name = any(v_client_events) then
    raise exception 'Client event is not allowed';
  end if;

  if p_session_id is null and v_customer is null then
    raise exception 'Session required';
  end if;

  if jsonb_typeof(coalesce(p_metadata,'{}'::jsonb)) <> 'object'
     or pg_column_size(coalesce(p_metadata,'{}'::jsonb)) > 2048 then
    raise exception 'Invalid metadata';
  end if;

  if (
    select count(*)
    from public.analytics_events
    where occurred_at > now()-interval '1 hour'
      and coalesce(customer_id::text,anonymous_session_id::text)=coalesce(v_customer::text,p_session_id::text)
  ) >= 120 then
    return;
  end if;

  insert into public.analytics_events(
    event_name,anonymous_session_id,customer_id,page_path,platform,service_code,package_id,
    device_category,browser_family,screen_width_category,source,medium,campaign,content,term,
    referring_domain,safe_metadata,occurred_at
  )
  values(
    p_event_name,p_session_id,v_customer,v_path,
    nullif(left(p_platform,40),''),
    nullif(left(p_service_code,100),''),
    nullif(left(p_package_id,100),''),
    case when p_device_category in('mobile','tablet','desktop') then p_device_category else 'unknown' end,
    nullif(left(p_browser_family,30),''),
    nullif(left(p_screen_width_category,30),''),
    nullif(left(p_source,100),''),
    nullif(left(p_medium,100),''),
    nullif(left(p_campaign,150),''),
    nullif(left(p_content,150),''),
    nullif(left(p_term,150),''),
    nullif(left(p_referring_domain,150),''),
    coalesce(p_metadata,'{}'::jsonb),
    now()
  );
end
$function$;

revoke all on function public.record_analytics_event(
  text,uuid,text,text,text,text,text,text,text,text,text,text,text,text,text,jsonb
) from public;
grant execute on function public.record_analytics_event(
  text,uuid,text,text,text,text,text,text,text,text,text,text,text,text,text,jsonb
) to anon, authenticated;

create or replace function public.admin_traffic_growth_snapshot(p_window_days integer default 30)
returns jsonb
language sql
security invoker
set search_path = public
as $function$
with params as (
  select
    greatest(7, least(coalesce(p_window_days, 30), 90))::integer as window_days,
    now() as snapshot_at
),
base as (
  select
    e.*,
    coalesce(e.anonymous_session_id::text, e.customer_id::text) as visitor_id,
    coalesce(nullif(e.safe_metadata->>'landing_path',''), e.page_path, '/') as landing_path
  from public.analytics_events e
  cross join params p
  where e.occurred_at >= p.snapshot_at - make_interval(days => p.window_days * 2)
),
current_events as (
  select b.*
  from base b
  cross join params p
  where b.occurred_at >= p.snapshot_at - make_interval(days => p.window_days)
),
previous_events as (
  select b.*
  from base b
  cross join params p
  where b.occurred_at < p.snapshot_at - make_interval(days => p.window_days)
),
first_touch as (
  select distinct on (visitor_id)
    visitor_id,
    coalesce(nullif(source,''),'unattributed') as source,
    coalesce(nullif(medium,''),'unknown') as medium,
    nullif(campaign,'') as campaign,
    landing_path
  from current_events
  where visitor_id is not null
  order by visitor_id, occurred_at asc
),
source_rows as (
  select source, medium, count(*)::integer as visitors
  from first_touch
  group by source, medium
),
landing_rows as (
  select landing_path as path, count(*)::integer as visitors
  from first_touch
  group by landing_path
),
campaign_rows as (
  select campaign, source, count(*)::integer as visitors
  from first_touch
  where campaign is not null
  group by campaign, source
),
daily_rows as (
  select
    to_char((occurred_at at time zone 'Asia/Kolkata')::date, 'YYYY-MM-DD') as date,
    count(distinct visitor_id)::integer as visitors
  from current_events
  where visitor_id is not null
  group by (occurred_at at time zone 'Asia/Kolkata')::date
),
stats as (
  select
    (select count(distinct visitor_id)::integer from current_events where visitor_id is not null) as current_visitors,
    (select count(distinct visitor_id)::integer from previous_events where visitor_id is not null) as previous_visitors,
    (select count(*)::integer from current_events where event_name='page_viewed') as page_views,
    (select count(distinct visitor_id)::integer from current_events where event_name='page_viewed' and visitor_id is not null) as page_view_visitors,
    (select count(*)::integer from first_touch where medium='organic') as organic_visitors,
    (select count(*)::integer from first_touch where source <> 'unattributed') as attributed_visitors,
    (select count(*)::integer from current_events where event_name='organic_landing_view') as organic_landing_events,
    (select count(*)::integer from current_events where event_name='blog_article_viewed') as blog_views,
    (select count(*)::integer from current_events where event_name='market_hub_viewed') as market_hub_views,
    (select count(*)::integer from current_events where event_name='referral_landing_view') as referral_landings
)
select jsonb_build_object(
  'window_days', p.window_days,
  'current_visitors', s.current_visitors,
  'previous_visitors', s.previous_visitors,
  'page_views', s.page_views,
  'page_view_visitors', s.page_view_visitors,
  'organic_visitors', s.organic_visitors,
  'attributed_visitors', s.attributed_visitors,
  'organic_landing_events', s.organic_landing_events,
  'blog_views', s.blog_views,
  'market_hub_views', s.market_hub_views,
  'referral_landings', s.referral_landings,
  'sources', coalesce((
    select jsonb_agg(jsonb_build_object('source',x.source,'medium',x.medium,'visitors',x.visitors) order by x.visitors desc, x.source, x.medium)
    from (select * from source_rows order by visitors desc, source, medium limit 12) x
  ), '[]'::jsonb),
  'landings', coalesce((
    select jsonb_agg(jsonb_build_object('path',x.path,'visitors',x.visitors) order by x.visitors desc, x.path)
    from (select * from landing_rows order by visitors desc, path limit 12) x
  ), '[]'::jsonb),
  'campaigns', coalesce((
    select jsonb_agg(jsonb_build_object('campaign',x.campaign,'source',x.source,'visitors',x.visitors) order by x.visitors desc, x.campaign, x.source)
    from (select * from campaign_rows order by visitors desc, campaign, source limit 12) x
  ), '[]'::jsonb),
  'daily', coalesce((
    select jsonb_agg(jsonb_build_object('date',x.date,'visitors',x.visitors) order by x.date)
    from daily_rows x
  ), '[]'::jsonb)
)
from stats s
cross join params p;
$function$;

revoke all on function public.admin_traffic_growth_snapshot(integer) from public;
revoke execute on function public.admin_traffic_growth_snapshot(integer) from anon, authenticated;
grant execute on function public.admin_traffic_growth_snapshot(integer) to service_role;
