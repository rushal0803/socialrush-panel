-- Phase 21 production-stability hardening.
-- Wallet credit settlement must only be executed by trusted server-side code
-- after the payment provider response has been independently verified.

revoke all on function public.credit_verified_payment(text, text) from public;
revoke execute on function public.credit_verified_payment(text, text) from anon;
revoke execute on function public.credit_verified_payment(text, text) from authenticated;

revoke all on function public.credit_wallet_payment_system(text, text) from public;
grant execute on function public.credit_wallet_payment_system(text, text) to service_role;
