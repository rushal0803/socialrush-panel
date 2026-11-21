-- Security release candidate. Apply to isolated QA first; never apply directly to production.
-- Customer RPCs below were superseded by intent-backed checkout. Keep definitions
-- for forensic reconciliation, but remove direct browser/API execution.
REVOKE EXECUTE ON FUNCTION public.checkout_campaign_with_wallet(bigint,text,text,integer,uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.place_order(bigint,text,integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.place_campaign(bigint,text,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.checkout_campaign_with_wallet(bigint,text,text,integer,uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.place_order(bigint,text,integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.place_campaign(bigint,text,text) TO service_role;

-- The former manual-payment flow debited wallet before attempting the order insert.
-- A single PostgreSQL RPC makes wallet debit + verification-pending order + intent
-- completion one transaction; any error rolls everything back.
-- Only a verified server-side service-role client can call this RPC.
CREATE OR REPLACE FUNCTION public.submit_manual_payment_order_atomic(
  p_user_id uuid,
  p_intent_id uuid,
  p_client_request_id uuid,
  p_payment_reference text,
  p_payment_method text,
  p_utr text,
  p_expected_wallet numeric
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_intent public.checkout_intents%ROWTYPE;
  v_service public.services%ROWTYPE;
  v_order public.orders%ROWTYPE;
  v_balance numeric;
  v_applied numeric;
  v_total numeric;
  v_remaining numeric;
  v_existing_split uuid;
  v_client_id uuid;
  v_campaign_client_id uuid;
  v_method_label text;
  v_customer_note text;
  v_utr text := upper(trim(coalesce(p_utr,'')));
  v_reference text := upper(trim(coalesce(p_payment_reference,'')));
BEGIN
  IF coalesce(auth.jwt()->>'role','') <> 'service_role' THEN
    RAISE EXCEPTION 'Service role required';
  END IF;
  IF p_user_id IS NULL OR p_intent_id IS NULL OR p_client_request_id IS NULL THEN
    RAISE EXCEPTION 'Checkout identity required';
  END IF;
  IF v_reference !~ '^SR-[A-Z0-9-]{8,40}$'
     OR v_utr !~ '^[A-Z0-9-]{8,80}$' THEN
    RAISE EXCEPTION 'Invalid payment reference';
  END IF;
  IF p_payment_method NOT IN ('upi','bank_transfer','usdt_trc20') THEN
    RAISE EXCEPTION 'Unsupported payment method';
  END IF;
  IF p_expected_wallet IS NULL OR p_expected_wallet < 0 OR
     p_expected_wallet <> round(p_expected_wallet,2) THEN
    RAISE EXCEPTION 'Invalid expected wallet amount';
  END IF;
  -- Prevent concurrent submissions sharing a UTR from both passing uniqueness checks.
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_utr, 0));

  SELECT * INTO v_intent FROM public.checkout_intents
  WHERE id=p_intent_id AND user_id=p_user_id
    AND client_request_id=p_client_request_id::text
  FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Checkout intent not found'; END IF;
  IF v_intent.status = 'completed' THEN
    SELECT * INTO v_order FROM public.orders
    WHERE id=v_intent.order_id AND user_id=p_user_id
      AND client_request_id=p_client_request_id;
    IF NOT FOUND OR v_order.payment_status <> 'verification_pending'
       OR position('UTR: '||v_utr||'.' IN coalesce(v_order.customer_note,'')) = 0
       OR position('Payment Ref: '||v_reference||'.' IN coalesce(v_order.customer_note,'')) = 0 THEN
      RAISE EXCEPTION 'Checkout already completed by different payment';
    END IF;
    RETURN jsonb_build_object('id',v_order.id,'public_order_id',v_order.public_order_id,
      'status',v_order.status,'payment_status',v_order.payment_status,'duplicate',true);
  END IF;
  IF v_intent.status <> 'created' OR v_intent.expires_at <= now() THEN
    RAISE EXCEPTION 'Checkout session expired or unavailable';
  END IF;
  IF v_intent.currency <> 'INR' OR v_intent.total_paise <= 0
     OR v_intent.quantity <= 0 OR v_intent.service_id IS NULL THEN
    RAISE EXCEPTION 'Invalid checkout amount or service';
  END IF;

  SELECT * INTO v_service FROM public.services
  WHERE id=v_intent.service_id AND status='active'
    AND coalesce(is_active,true) AND coalesce(accepts_new_orders,true)
    AND coalesce(health_status,'stable') <> 'paused'
  FOR SHARE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Service unavailable'; END IF;
  IF v_intent.quantity < v_service.min OR v_intent.quantity > v_service.max THEN
    RAISE EXCEPTION 'Service quantity unavailable';
  END IF;
  v_client_id:=v_intent.client_id;
  IF v_client_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.customer_clients WHERE id=v_client_id AND user_id=p_user_id
  ) THEN
    RAISE EXCEPTION 'Customer client unavailable';
  END IF;
  IF v_intent.campaign_id IS NOT NULL THEN
    SELECT client_id INTO v_campaign_client_id FROM public.campaigns
      WHERE id=v_intent.campaign_id AND user_id=p_user_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'Customer campaign unavailable'; END IF;
    IF v_campaign_client_id IS NOT NULL THEN
      IF v_client_id IS NOT NULL AND v_client_id <> v_campaign_client_id THEN
        RAISE EXCEPTION 'Campaign client mismatch';
      END IF;
      v_client_id:=v_campaign_client_id;
    END IF;
  END IF;

  IF EXISTS(SELECT 1 FROM public.orders
            WHERE user_id=p_user_id AND client_request_id=p_client_request_id) THEN
    RAISE EXCEPTION 'Checkout request already used';
  END IF;
  IF EXISTS(SELECT 1 FROM public.orders
    WHERE customer_note ILIKE '%UTR: '||v_utr||'.%') OR EXISTS(
      SELECT 1 FROM public.transactions WHERE upper(provider_payment_id)=v_utr
  ) THEN
    RAISE EXCEPTION 'Payment reference already submitted';
  END IF;
  -- Do not double debit an incomplete checkout created by the older RPC.
  SELECT id INTO v_existing_split FROM public.transactions
    WHERE user_id=p_user_id AND provider_payment_id='wallet-split:'||p_intent_id::text
    FOR UPDATE;
  IF FOUND THEN
    RAISE EXCEPTION 'Existing wallet split requires manual reconciliation';
  END IF;

  v_total:=v_intent.total_paise::numeric/100;
  SELECT balance INTO v_balance FROM public.profiles
    WHERE id=p_user_id FOR UPDATE;
  IF NOT FOUND OR v_balance IS NULL OR v_balance < 0 THEN
    RAISE EXCEPTION 'Customer wallet unavailable';
  END IF;
  v_applied:=least(v_balance,v_total);
  IF round(v_applied,2) <> p_expected_wallet THEN
    RAISE EXCEPTION 'Wallet balance changed; refresh checkout';
  END IF;
  v_remaining:=round(v_total-v_applied,2);
  IF v_remaining <= 0 THEN
    RAISE EXCEPTION 'Wallet covers full order; use wallet-only checkout';
  END IF;

  v_method_label:=CASE p_payment_method
    WHEN 'bank_transfer' THEN 'Bank transfer (IMPS/NEFT)'
    WHEN 'usdt_trc20' THEN 'USDT (TRC20)'
    ELSE 'UPI'
  END;
  v_customer_note:=v_method_label||' payment submitted for verification. Payment Ref: '||
    v_reference||'. UTR: '||v_utr||'. Wallet applied: INR '||
    to_char(v_applied,'FM999999999990.00')||'. External amount: INR '||
    to_char(v_remaining,'FM999999999990.00')||'.';

  IF v_applied > 0 THEN
    UPDATE public.profiles SET balance=balance-v_applied,updated_at=now()
      WHERE id=p_user_id;
    INSERT INTO public.transactions(user_id,type,amount,status,description,provider_payment_id)
      VALUES(p_user_id,'debit',v_applied,'completed',
        'Wallet applied to split order payment','wallet-split:'||p_intent_id::text);
  END IF;

  INSERT INTO public.orders (
    user_id,service_id,service_name,platform,link,quantity,unit_price,
    charge,status,payment_status,package_name,client_request_id,notes,customer_note,
    client_id,campaign_id
  ) VALUES (
    p_user_id,v_service.id,v_service.name,v_service.platform,v_intent.destination_link,
    v_intent.quantity,round((v_total*1000)/v_intent.quantity,4),
    v_total,'pending','verification_pending',coalesce(v_intent.package_name,'Custom'),
    p_client_request_id,v_intent.notes,v_customer_note,v_client_id,v_intent.campaign_id
  ) RETURNING * INTO v_order;

  UPDATE public.checkout_intents
    SET status='completed',order_id=v_order.id,completed_at=now(),updated_at=now()
    WHERE id=v_intent.id AND status='created';
  IF NOT FOUND THEN RAISE EXCEPTION 'Checkout intent state changed'; END IF;

  RETURN jsonb_build_object('id',v_order.id,'public_order_id',v_order.public_order_id,
    'status',v_order.status,'payment_status',v_order.payment_status,
    'wallet_applied',v_applied,'remaining',v_remaining,'duplicate',false);
END;
$function$;

REVOKE ALL ON FUNCTION public.submit_manual_payment_order_atomic(uuid,uuid,uuid,text,text,text,numeric)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_manual_payment_order_atomic(uuid,uuid,uuid,text,text,text,numeric)
  TO service_role;

-- The legacy split function must no longer be directly callable by customers.
REVOKE EXECUTE ON FUNCTION public.apply_wallet_to_manual_checkout(uuid,uuid,numeric)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_wallet_to_manual_checkout(uuid,uuid,numeric)
  TO service_role;
