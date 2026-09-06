revoke execute on function public.enqueue_customer_lifecycle_email_events() from anon, authenticated;
revoke execute on function public.claim_next_customer_email_event() from anon, authenticated;
revoke execute on function public.enqueue_signup_no_order_email_events() from anon, authenticated;
revoke execute on function public.claim_customer_email_event() from anon, authenticated;

grant execute on function public.enqueue_customer_lifecycle_email_events() to service_role;
grant execute on function public.claim_next_customer_email_event() to service_role;
grant execute on function public.enqueue_signup_no_order_email_events() to service_role;
grant execute on function public.claim_customer_email_event() to service_role;
