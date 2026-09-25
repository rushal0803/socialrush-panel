revoke execute on function public.apply_first_order_wallet_bonus() from public, anon, authenticated;
grant execute on function public.apply_first_order_wallet_bonus() to service_role;

revoke execute on function public.assign_public_order_id() from public, anon, authenticated;
grant execute on function public.assign_public_order_id() to service_role;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
grant execute on function public.handle_new_user() to service_role;

revoke execute on function public.notify_customer_order_event() from public, anon, authenticated;
grant execute on function public.notify_customer_order_event() to service_role;

revoke execute on function public.notify_customer_support_reply() from public, anon, authenticated;
grant execute on function public.notify_customer_support_reply() to service_role;

revoke execute on function public.queue_customer_order_email() from public, anon, authenticated;
grant execute on function public.queue_customer_order_email() to service_role;

revoke execute on function public.record_order_status_history() from public, anon, authenticated;
grant execute on function public.record_order_status_history() to service_role;

revoke execute on function public.reject_paused_service_order() from public, anon, authenticated;
grant execute on function public.reject_paused_service_order() to service_role;

revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
grant execute on function public.rls_auto_enable() to service_role;
