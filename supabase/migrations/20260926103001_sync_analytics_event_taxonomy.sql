alter table public.analytics_events
  drop constraint if exists analytics_events_event_name_check;

alter table public.analytics_events
  add constraint analytics_events_event_name_check
  check (event_name = any (array['sign_up_started','service_viewed','service_selected','package_viewed','package_selected','new_order_clicked','order_platform_selected','order_started','order_draft_saved','order_draft_discarded','order_details_completed','checkout_started','payment_started','payment_method_selected','utr_submitted','checkout_error','checkout_recovery_click','creator_tool_used','creator_tool_result_generated','blog_article_viewed','blog_service_cta_clicked','blog_tool_cta_clicked','creator_tool_service_cta_clicked','organic_landing_view','cross_sell_view','cross_sell_click','bundle_view','bundle_click','repeat_order_click','order_success_recommendation_view','order_success_recommendation_click','market_hub_viewed','recent_service_opened','continue_order_clicked','related_service_clicked','bulk_inquiry_clicked','lead_whatsapp_clicked','qualified_lead_submitted','referral_share_clicked','campaign_stack_growth_path_click','repeat_growth_path_click','dashboard_repeat_scale_click','package_growth_path_click','agency_bulk_form_view','agency_bulk_form_incomplete','agency_bulk_form_error','agency_revenue_path_click','web_vital','experiment_exposure','first_order_bonus_view','first_order_bonus_click','marketing_opt_in_selected','sign_up_completed','login_completed','payment_completed','payment_failed','wallet_topup_completed','wallet_order_completed','order_created','refill_requested','support_ticket_created','support_reply_sent','review_submitted','campaign_details_started','homepage_view','new_order_started','order_summary_viewed','packages_page_view','payment_successful','platform_selected','quantity_entered','service_landing_page_view','services_page_view','valid_link_entered']::text[]));

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
  v_client_events text[] := array['sign_up_started','service_viewed','service_selected','package_viewed','package_selected','new_order_clicked','order_platform_selected','order_started','order_draft_saved','order_draft_discarded','order_details_completed','checkout_started','payment_started','payment_method_selected','utr_submitted','checkout_error','checkout_recovery_click','creator_tool_used','creator_tool_result_generated','blog_article_viewed','blog_service_cta_clicked','blog_tool_cta_clicked','creator_tool_service_cta_clicked','organic_landing_view','cross_sell_view','cross_sell_click','bundle_view','bundle_click','repeat_order_click','order_success_recommendation_view','order_success_recommendation_click','market_hub_viewed','recent_service_opened','continue_order_clicked','related_service_clicked','bulk_inquiry_clicked','lead_whatsapp_clicked','qualified_lead_submitted','referral_share_clicked','campaign_stack_growth_path_click','repeat_growth_path_click','dashboard_repeat_scale_click','package_growth_path_click','agency_bulk_form_view','agency_bulk_form_incomplete','agency_bulk_form_error','agency_revenue_path_click','web_vital','experiment_exposure','first_order_bonus_view','first_order_bonus_click','marketing_opt_in_selected']::text[];
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
