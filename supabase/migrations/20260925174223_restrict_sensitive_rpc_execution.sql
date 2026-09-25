-- Admin-only and signed-in customer RPCs: remove anonymous/public execution,
-- preserve authenticated access (with the function's own auth/admin checks) and service-role access.
revoke execute on function public.admin_adjust_balance(uuid, numeric, text) from public, anon;
grant execute on function public.admin_adjust_balance(uuid, numeric, text) to authenticated, service_role;

revoke execute on function public.admin_credit_reward(uuid) from public, anon;
grant execute on function public.admin_credit_reward(uuid) to authenticated, service_role;

revoke execute on function public.admin_refund_wallet_payment(uuid, text) from public, anon;
grant execute on function public.admin_refund_wallet_payment(uuid, text) to authenticated, service_role;

revoke execute on function public.admin_review_payment(uuid, text) from public, anon;
grant execute on function public.admin_review_payment(uuid, text) to authenticated, service_role;

revoke execute on function public.admin_set_user_blocked(uuid, boolean) from public, anon;
grant execute on function public.admin_set_user_blocked(uuid, boolean) to authenticated, service_role;

revoke execute on function public.assign_my_order_to_campaign(uuid, uuid) from public, anon;
grant execute on function public.assign_my_order_to_campaign(uuid, uuid) to authenticated, service_role;

revoke execute on function public.checkout_campaign_with_wallet(bigint, text, text, integer, uuid) from public, anon;
grant execute on function public.checkout_campaign_with_wallet(bigint, text, text, integer, uuid) to authenticated, service_role;

revoke execute on function public.checkout_custom_intent_with_wallet(uuid, text, text, integer, text) from public, anon;
grant execute on function public.checkout_custom_intent_with_wallet(uuid, text, text, integer, text) to authenticated, service_role;

revoke execute on function public.create_support_ticket(text, text, text, uuid) from public, anon;
grant execute on function public.create_support_ticket(text, text, text, uuid) to authenticated, service_role;

revoke execute on function public.create_support_ticket_with_reference(text, text, text, uuid, text) from public, anon;
grant execute on function public.create_support_ticket_with_reference(text, text, text, uuid, text) to authenticated, service_role;

revoke execute on function public.create_wallet_payment(numeric, text, text) from public, anon;
grant execute on function public.create_wallet_payment(numeric, text, text) to authenticated, service_role;

revoke execute on function public.credit_verified_payment(text, text) from public, anon;
grant execute on function public.credit_verified_payment(text, text) to authenticated, service_role;

revoke execute on function public.ensure_my_referral_code() from public, anon;
grant execute on function public.ensure_my_referral_code() to authenticated, service_role;

revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated, service_role;

revoke execute on function public.mark_support_ticket_read(uuid) from public, anon;
grant execute on function public.mark_support_ticket_read(uuid) to authenticated, service_role;

revoke execute on function public.place_campaign(bigint, text, text) from public, anon;
grant execute on function public.place_campaign(bigint, text, text) to authenticated, service_role;

revoke execute on function public.place_order(bigint, text, integer) from public, anon;
grant execute on function public.place_order(bigint, text, integer) to authenticated, service_role;

revoke execute on function public.reply_to_support_ticket(uuid, text) from public, anon;
grant execute on function public.reply_to_support_ticket(uuid, text) to authenticated, service_role;

revoke execute on function public.request_order_refill(uuid, text) from public, anon;
grant execute on function public.request_order_refill(uuid, text) to authenticated, service_role;

revoke execute on function public.request_review_removal(uuid) from public, anon;
grant execute on function public.request_review_removal(uuid) to authenticated, service_role;

revoke execute on function public.resolve_my_support_ticket(uuid) from public, anon;
grant execute on function public.resolve_my_support_ticket(uuid) to authenticated, service_role;

revoke execute on function public.set_initial_order_count(uuid, bigint, text, text, text, text) from public, anon;
grant execute on function public.set_initial_order_count(uuid, bigint, text, text, text, text) to authenticated, service_role;

revoke execute on function public.submit_verified_review(uuid, smallint, text, text, text, text, boolean, text) from public, anon;
grant execute on function public.submit_verified_review(uuid, smallint, text, text, text, text, boolean, text) to authenticated, service_role;

revoke execute on function public.update_my_account(text, text, text, text, text, text, text) from public, anon;
grant execute on function public.update_my_account(text, text, text, text, text, text, text) to authenticated, service_role;

revoke execute on function public.update_my_settings(text, jsonb, boolean) from public, anon;
grant execute on function public.update_my_settings(text, jsonb, boolean) to authenticated, service_role;

revoke execute on function public.update_pending_review(uuid, smallint, text, text, text, text, boolean, text) from public, anon;
grant execute on function public.update_pending_review(uuid, smallint, text, text, text, text, boolean, text) to authenticated, service_role;

-- Provider/system settlement functions have no end-user auth checks and must only run server-side.
revoke execute on function public.complete_checkout_intent_payment_system(uuid, text) from public, anon, authenticated;
grant execute on function public.complete_checkout_intent_payment_system(uuid, text) to service_role;

revoke execute on function public.credit_wallet_payment_system(text, text) from public, anon, authenticated;
grant execute on function public.credit_wallet_payment_system(text, text) to service_role;

revoke execute on function public.settle_cashfree_checkout_intent_payment_system(text, text) from public, anon, authenticated;
grant execute on function public.settle_cashfree_checkout_intent_payment_system(text, text) to service_role;
