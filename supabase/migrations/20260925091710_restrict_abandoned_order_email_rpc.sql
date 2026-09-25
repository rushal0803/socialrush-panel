revoke all on function public.enqueue_abandoned_order_email_events() from public, anon, authenticated;
grant execute on function public.enqueue_abandoned_order_email_events() to service_role;
