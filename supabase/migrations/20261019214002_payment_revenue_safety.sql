-- Phase 1.1. Additive; no historical order/transaction/balance updates or backfill.
-- Apply ONLY after isolated verification and explicit rollout approval.
begin;

alter table public.transactions add column if not exists ledger_entry_key text;
create unique index if not exists transactions_ledger_entry_key_unique
  on public.transactions(ledger_entry_key) where ledger_entry_key is not null;
create index if not exists orders_revenue_recognition_idx on public.orders(completed_at,id) where completed_at is not null;
create index if not exists transactions_completed_refund_idx on public.transactions(created_at,id) where type='refund' and status='completed';

-- Every writer (including legacy admin forms) gets the same atomic refund rule.
create or replace function public.refund_cancelled_order_atomic()
returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare v_amount numeric(14,2); v_refund public.transactions%rowtype; v_intent uuid;
begin
  if old.user_id is distinct from new.user_id or old.charge is distinct from new.charge then
    raise exception 'Historical order owner and charge are immutable';
  end if;
  if (old.status in ('cancelled','refunded') or old.payment_status='refunded') and new.status not in ('cancelled','refunded','failed') then
    raise exception 'Cancelled/refunded orders cannot be reopened; create a new order';
  end if;
  if new.status not in ('cancelled','refunded','failed') or old.status in ('cancelled','refunded') then return new; end if;
  if new.status='failed' and old.payment_status<>'verification_pending' then return new; end if;
  if old.payment_status in ('paid','completed') then
    v_amount:=old.charge;
  else
    -- For unverified split orders return only the wallet amount actually debited.
    select id into v_intent from public.checkout_intents where order_id=old.id and user_id=old.user_id;
    select amount into v_amount from public.transactions
      where user_id=old.user_id and provider_payment_id='wallet-split:'||v_intent::text
        and type='debit' and status='completed';
  end if;
  if v_amount::text='NaN' then raise exception 'Invalid refund amount requires manual review'; end if;
  if coalesce(v_amount,0)<=0 then return new; end if;
  if v_amount>old.charge then raise exception 'Refund amount requires manual review'; end if;
  -- Recognize historical refunds without modifying/deduplicating old records.
  select * into v_refund from public.transactions where user_id=old.user_id
    and type='refund' and status='completed' and
      (ledger_entry_key='order-refund:'||old.id::text or metadata->>'order_id'=old.id::text
       or position(old.id::text in coalesce(description,''))>0)
    order by created_at limit 1;
  if found then
    if v_refund.amount<>v_amount then raise exception 'Existing refund requires manual review'; end if;
    new.payment_status:='refunded'; return new;
  end if;
  insert into public.transactions(user_id,amount,type,status,payment_method,description,metadata,ledger_entry_key)
  values(old.user_id,v_amount,'refund','completed','wallet','Order cancellation refund '||old.id,
    jsonb_build_object('order_id',old.id,'refund_kind','order_cancelled','actor_id',auth.uid(),
      'recognition_reversal',old.completed_at is not null,'original_charge',old.charge),
    'order-refund:'||old.id::text);
  update public.profiles set balance=balance+v_amount where id=old.user_id and balance::text<>'NaN';
  if not found then raise exception 'Wallet profile missing'; end if;
  new.payment_status:='refunded';
  return new;
end $$;
revoke all on function public.refund_cancelled_order_atomic() from public,anon,authenticated;
create trigger zz_refund_cancelled_order_atomic before update on public.orders
  for each row execute function public.refund_cancelled_order_atomic();

-- Authenticated admin RPC: missing migration fails closed before any update.
create or replace function public.admin_update_order_financial(p_order_id uuid,p_patch jsonb,
  p_expected_status text default null,p_expected_payment text default null)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare o public.orders%rowtype; n public.orders%rowtype; k text;
begin
  if auth.uid() is null or not public.is_admin() then raise exception 'Admin access required'; end if;
  for k in select jsonb_object_keys(p_patch) loop
    if k not in ('status','payment_status','admin_note','admin_notes','provider_order_id','starting_count',
      'start_count','current_count','partial_quantity_delivered','remaining_count','remains',
      'count_detection_status','count_detection_source','count_detection_message','last_count_checked_at',
      'failed_reason','refund_credit_note','refill_eligible') then raise exception 'Unsupported order update field'; end if;
  end loop;
  select * into o from public.orders where id=p_order_id for update;
  if not found then raise exception 'Order not found'; end if;
  if (p_expected_status is not null and o.status<>p_expected_status)
     or (p_expected_payment is not null and o.payment_status<>p_expected_payment) then
    raise exception 'Order changed during review; refresh';
  end if;
  n:=jsonb_populate_record(o,p_patch);
  if o.payment_status='verification_pending' and n.status not in ('pending','cancelled','failed')
    and not(n.status='processing' and n.payment_status='paid') then raise exception 'Payment approval required'; end if;
  update public.orders set status=n.status,payment_status=n.payment_status,admin_note=n.admin_note,
    admin_notes=n.admin_notes,provider_order_id=n.provider_order_id,starting_count=n.starting_count,
    start_count=n.start_count,current_count=n.current_count,partial_quantity_delivered=n.partial_quantity_delivered,
    remaining_count=n.remaining_count,remains=n.remains,count_detection_status=n.count_detection_status,
    count_detection_source=n.count_detection_source,count_detection_message=n.count_detection_message,
    last_count_checked_at=n.last_count_checked_at,failed_reason=n.failed_reason,
    refund_credit_note=n.refund_credit_note,refill_eligible=n.refill_eligible
    where id=o.id returning * into n;
  return to_jsonb(n)||jsonb_build_object('__refund',(
    select jsonb_build_object('refunded',true,'amount',amount,'transactionId',id)
    from public.transactions where ledger_entry_key='order-refund:'||n.id::text));
end $$;
revoke all on function public.admin_update_order_financial(uuid,jsonb,text,text) from public,anon;
grant execute on function public.admin_update_order_financial(uuid,jsonb,text,text) to authenticated;

create table public.gateway_refund_requests (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null unique references public.transactions(id) on delete restrict,
  user_id uuid not null references public.profiles(id) on delete restrict,
  provider_payment_id text not null,
  amount numeric(14,2) not null check(amount>0),
  status text not null default 'reserved' check(status in ('reserved','submitting','pending','manual_review','completed','failed')),
  provider_refund_id text unique,
  requested_by uuid not null references public.profiles(id),
  review_reason text,
  created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create table public.gateway_refund_audit (
  id bigint generated always as identity primary key,
  request_id uuid not null references public.gateway_refund_requests(id),
  status text not null,actor_id uuid,provider_refund_id text,reason text,created_at timestamptz not null default now()
);
alter table public.gateway_refund_requests enable row level security;
alter table public.gateway_refund_audit enable row level security;
revoke all on public.gateway_refund_requests,public.gateway_refund_audit from public,anon,authenticated;
grant select on public.gateway_refund_requests,public.gateway_refund_audit to authenticated;
create policy gateway_refund_admin_read on public.gateway_refund_requests for select to authenticated using(public.is_admin());
create policy gateway_refund_audit_admin_read on public.gateway_refund_audit for select to authenticated using(public.is_admin());

create or replace function public.audit_gateway_refund_transition()
returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
begin
  insert into public.gateway_refund_audit(request_id,status,actor_id,provider_refund_id,reason)
    values(new.id,new.status,auth.uid(),new.provider_refund_id,new.review_reason);
  return new;
end $$;
revoke all on function public.audit_gateway_refund_transition() from public,anon,authenticated;
create trigger audit_gateway_refund_transition after insert or update on public.gateway_refund_requests
  for each row execute function public.audit_gateway_refund_transition();

create or replace function public.request_wallet_gateway_refund(p_transaction_id uuid)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare t public.transactions%rowtype; r public.gateway_refund_requests%rowtype;
begin
  if auth.uid() is null or not public.is_admin() then raise exception 'Admin access required'; end if;
  select * into t from public.transactions where id=p_transaction_id for update;
  if not found then raise exception 'Payment not found'; end if;
  select * into r from public.gateway_refund_requests where transaction_id=t.id;
  if found then return to_jsonb(r); end if;
  if t.amount::text='NaN' or t.type<>'credit' or t.status<>'completed' or t.provider_payment_id is null
    or t.provider_payment_id not like 'pay_%' or t.provider_order_id is null
    or t.provider_refund_id is not null or t.payment_method='cashfree'
    or coalesce(t.metadata,'{}'::jsonb) ? 'checkout_intent_id' then
    raise exception 'Only completed unrefunded Razorpay wallet deposits are eligible';
  end if;
  update public.profiles set balance=balance-t.amount where id=t.user_id and balance>=t.amount and balance::text<>'NaN';
  if not found then raise exception 'Insufficient available wallet balance'; end if;
  insert into public.gateway_refund_requests(transaction_id,user_id,provider_payment_id,amount,requested_by)
    values(t.id,t.user_id,t.provider_payment_id,t.amount,auth.uid()) returning * into r;
  insert into public.transactions(user_id,amount,type,status,payment_method,description,metadata,ledger_entry_key)
    values(t.user_id,t.amount,'debit','completed','wallet','Gateway refund reservation',
      jsonb_build_object('refund_request_id',r.id,'refund_kind','deposit_reservation'), 'gateway-reserve:'||r.id::text);
  return to_jsonb(r);
end $$;

create or replace function public.claim_wallet_gateway_refund(p_request_id uuid)
returns boolean language plpgsql security definer set search_path=public,pg_temp as $$
begin
  if auth.uid() is null or not public.is_admin() then raise exception 'Admin access required'; end if;
  update public.gateway_refund_requests set status='submitting',updated_at=now() where id=p_request_id and status='reserved';
  return found;
end $$;

create or replace function public.record_wallet_gateway_refund(p_request_id uuid,p_status text,
  p_provider_refund_id text default null,p_reason text default null)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare r public.gateway_refund_requests%rowtype;
begin
  if auth.uid() is null or not public.is_admin() then raise exception 'Admin access required'; end if;
  if p_status not in ('pending','manual_review','completed','failed') then raise exception 'Invalid refund result'; end if;
  select * into r from public.gateway_refund_requests where id=p_request_id for update;
  if not found then raise exception 'Refund request not found'; end if;
  if r.status in ('completed','failed') then return to_jsonb(r); end if;
  if r.status='reserved' then raise exception 'Refund has not been submitted'; end if;
  if p_status in ('pending','completed','failed') and nullif(p_provider_refund_id,'') is null then
    raise exception 'Verified provider refund ID required';
  end if;
  if r.provider_refund_id is not null and p_provider_refund_id is not null and p_provider_refund_id<>r.provider_refund_id then
    raise exception 'Provider refund identity conflict';
  end if;
  if p_status='completed' then
    insert into public.transactions(user_id,amount,type,status,payment_method,provider_refund_id,description,metadata,ledger_entry_key)
      values(r.user_id,r.amount,'refund','completed','razorpay',p_provider_refund_id,'Wallet deposit returned to payment method',
        jsonb_build_object('refund_request_id',r.id,'refund_kind','wallet_deposit','transaction_id',r.transaction_id),
        'gateway-refund:'||r.id::text);
    -- Reservation already removed spendable funds. Do not debit twice.
  elsif p_status='failed' then
    update public.profiles set balance=balance+r.amount where id=r.user_id and balance::text<>'NaN';
    if not found then raise exception 'Wallet balance requires manual review'; end if;
    insert into public.transactions(user_id,amount,type,status,payment_method,description,metadata,ledger_entry_key)
      values(r.user_id,r.amount,'credit','completed','wallet','Failed gateway refund reservation released',
        jsonb_build_object('refund_request_id',r.id,'refund_kind','deposit_reservation_release'), 'gateway-release:'||r.id::text);
  end if;
  update public.gateway_refund_requests set status=p_status,
    provider_refund_id=coalesce(p_provider_refund_id,provider_refund_id),review_reason=left(p_reason,500),updated_at=now()
    where id=r.id returning * into r;
  return to_jsonb(r);
end $$;
revoke all on function public.request_wallet_gateway_refund(uuid),public.claim_wallet_gateway_refund(uuid),
  public.record_wallet_gateway_refund(uuid,text,text,text) from public,anon;
grant execute on function public.request_wallet_gateway_refund(uuid),public.claim_wallet_gateway_refund(uuid),
  public.record_wallet_gateway_refund(uuid,text,text,text) to authenticated;

-- Close the obsolete post-provider debit API so it cannot bypass reservations.
revoke all on function public.admin_refund_wallet_payment(uuid,text) from public,anon,authenticated,service_role;

-- Preserve the existing quoted-intent transaction and split-flow protection, with null-safe identity checks.
CREATE OR REPLACE FUNCTION public.checkout_custom_intent_with_wallet(p_intent_id uuid, p_client_request_id text, p_service_code text, p_quantity integer, p_link text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_user_id uuid := auth.uid();
  v_intent public.checkout_intents%rowtype;
  v_existing public.orders%rowtype;
  v_service public.services%rowtype;
  v_charge numeric(14,2);
  v_unit_price numeric(14,4);
  v_balance numeric(14,2);
  v_order_id uuid;
  v_client_id uuid;
  v_campaign_client_id uuid;
begin
  if v_user_id is null then raise exception 'Authentication required'; end if;
  if p_intent_id is null or nullif(trim(p_client_request_id), '') is null then raise exception 'Checkout intent is required'; end if;

  select * into v_intent
  from public.checkout_intents
  where id = p_intent_id
  for update;

  if not found or v_intent.user_id <> v_user_id then raise exception 'Checkout intent not found'; end if;
  if v_intent.client_request_id is distinct from trim(p_client_request_id)
     or v_intent.service_code is distinct from trim(p_service_code)
     or v_intent.quantity is distinct from p_quantity
     or v_intent.destination_link is distinct from trim(p_link) then
    raise exception 'Checkout intent details mismatch';
  end if;

  if v_intent.status = 'completed' then
    select * into v_existing from public.orders where id = v_intent.order_id and user_id = v_user_id;
    if not found then raise exception 'Completed checkout order not found'; end if;
    select balance into v_balance from public.profiles where id = v_user_id;
    return jsonb_build_object('id',v_existing.id,'charge',v_existing.charge,'balance',v_balance,'duplicate',true);
  end if;

  if v_intent.status = 'cancelled' then raise exception 'Checkout intent is cancelled'; end if;
  if v_intent.status = 'expired' or v_intent.expires_at <= now() then
    update public.checkout_intents set status='expired',updated_at=now() where id=v_intent.id;
    raise exception 'Checkout intent is expired';
  end if;
  if v_intent.status <> 'created' then raise exception 'Checkout intent status is invalid'; end if;

  v_client_id := v_intent.client_id;
  if v_client_id is not null and not exists (
    select 1 from public.customer_clients
    where id = v_client_id and user_id = v_user_id
  ) then
    raise exception 'Checkout client is unavailable';
  end if;

  if v_intent.campaign_id is not null then
    select client_id into v_campaign_client_id
    from public.campaigns
    where id = v_intent.campaign_id and user_id = v_user_id;

    if not found then raise exception 'Checkout campaign is unavailable'; end if;

    if v_campaign_client_id is not null then
      if v_client_id is null then
        v_client_id := v_campaign_client_id;
      elsif v_client_id <> v_campaign_client_id then
        raise exception 'Checkout client and campaign do not match';
      end if;
    end if;
  end if;

  select * into v_service
  from public.services
  where id=v_intent.service_id and status='active' and coalesce(is_active,true) and coalesce(accepts_new_orders,true)
  for share;

  if not found or v_service.health_status='paused' then raise exception 'Checkout intent service is unavailable'; end if;
  if v_intent.quantity is null or v_intent.quantity <= 0 or v_intent.total_paise is null or v_intent.total_paise <= 0 or v_intent.currency <> 'INR' then
    raise exception 'Checkout intent amount is invalid';
  end if;

  select * into v_existing
  from public.orders
  where user_id=v_user_id and client_request_id::text=v_intent.client_request_id;

  if found then raise exception 'Checkout request ID already belongs to a different order'; end if;

  if exists (select 1 from public.transactions where user_id=v_user_id
    and provider_payment_id='wallet-split:'||v_intent.id::text) then
    raise exception 'Wallet already applied to manual checkout; finish the same payment';
  end if;
  v_charge := v_intent.total_paise::numeric/100;
  v_unit_price := round((v_charge*1000)/v_intent.quantity,4);

  update public.profiles
  set balance=balance-v_charge
  where id=v_user_id and balance>=v_charge and balance::text<>'NaN'
  returning balance into v_balance;

  if not found then raise exception 'Insufficient campaign budget'; end if;

  insert into public.orders(
    user_id,service_id,service_name,platform,link,quantity,unit_price,charge,status,
    package_name,client_request_id,notes,client_id,campaign_id
  )
  values(
    v_user_id,v_service.id,v_service.name,v_service.platform,v_intent.destination_link,
    v_intent.quantity,v_unit_price,v_charge,'pending','Custom',v_intent.client_request_id::uuid,
    v_intent.notes,v_client_id,v_intent.campaign_id
  )
  returning id into v_order_id;

  insert into public.transactions(user_id,amount,type,status,payment_method,description,metadata)
  values(
    v_user_id,v_charge,'debit','completed','wallet','Campaign checkout: '||v_service.name,
    jsonb_build_object(
      'order_id',v_order_id,
      'checkout_intent_id',v_intent.id,
      'service_code',v_intent.service_code,
      'quantity',v_intent.quantity,
      'total_paise',v_intent.total_paise,
      'currency',v_intent.currency,
      'client_id',v_client_id,
      'campaign_id',v_intent.campaign_id
    )
  );

  update public.checkout_intents
  set status='completed',order_id=v_order_id,completed_at=now(),updated_at=now()
  where id=v_intent.id;

  return jsonb_build_object('id',v_order_id,'charge',v_charge,'balance',v_balance,'duplicate',false);
end
$function$
;

-- Legacy callers also use active catalog pricing, never a client-selected cheap code.
create or replace function public.checkout_campaign_with_wallet(
  p_service_id bigint,
  p_service_code text,
  p_link text,
  p_quantity integer,
  p_request_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_name text;
  v_platform text;
  v_rate numeric(14,4);
  v_min integer;
  v_max integer;
  v_charge numeric(14,2);
  v_balance numeric(14,2);
  v_order_id uuid;
  v_existing public.orders%rowtype;
begin
  if v_user_id is null then raise exception 'Authentication required'; end if;
  if p_request_id is null then raise exception 'Checkout request ID is required'; end if;
  if nullif(trim(p_link), '') is null then raise exception 'A valid campaign link is required'; end if;
  if not exists (select 1 from public.services where id = p_service_id and status = 'active') then
    raise exception 'Selected service is unavailable';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_user_id::text||p_request_id::text,0));
  select * into v_existing
  from public.orders
  where user_id = v_user_id and client_request_id = p_request_id;

  if found then
    if v_existing.service_id is distinct from p_service_id or v_existing.quantity is distinct from p_quantity
      or v_existing.link is distinct from trim(p_link) then raise exception 'Checkout request details mismatch'; end if;
    select balance into v_balance from public.profiles where id = v_user_id;
    return jsonb_build_object(
      'id', v_existing.id,
      'charge', v_existing.charge,
      'balance', v_balance,
      'duplicate', true
    );
  end if;

  select name,platform,rate,min,max into v_name,v_platform,v_rate,v_min,v_max
  from public.services where id=p_service_id and status='active' and coalesce(is_active,true)
    and coalesce(accepts_new_orders,true) and health_status is distinct from 'paused'
    and code=case p_service_code
      when 'ig-followers' then 'instagram-followers' when 'ig-likes' then 'instagram-likes' when 'ig-views' then 'instagram-views'
      when 'yt-subscribers' then 'youtube-subscribers' when 'yt-likes' then 'youtube-likes' when 'yt-views' then 'youtube-views'
      when 'fb-followers' then 'facebook-followers' when 'fb-likes' then 'facebook-likes' when 'fb-views' then 'facebook-views'
      when 'fb-shares' then 'facebook-shares' when 'li-followers' then 'linkedin-followers' when 'li-likes' then 'linkedin-likes'
      when 'tg-members' then 'telegram-members' when 'tt-followers' then 'tiktok-followers'
      when 'tt-likes' then 'tiktok-likes' when 'tt-views' then 'tiktok-views' else p_service_code end
  for share;

  if not found then raise exception 'Unknown campaign service'; end if;
  if p_quantity is null or p_quantity < v_min or p_quantity > v_max then
    raise exception 'Quantity must be between % and %', v_min, v_max;
  end if;

  v_charge := round((p_quantity::numeric / 1000) * v_rate, 2);
  if v_charge::text='NaN' or v_charge <= 0 then raise exception 'Campaign total must be greater than zero'; end if;

  update public.profiles
  set balance = balance - v_charge
  where id = v_user_id and balance >= v_charge and balance::text<>'NaN'
  returning balance into v_balance;

  if not found then raise exception 'Insufficient campaign budget'; end if;

  insert into public.orders (
    user_id, service_id, service_name, platform, link, quantity,
    unit_price, charge, status, client_request_id
  )
  values (
    v_user_id, p_service_id, v_name, v_platform, trim(p_link), p_quantity,
    v_rate, v_charge, 'pending', p_request_id
  )
  returning id into v_order_id;

  insert into public.transactions (
    user_id, amount, type, status, payment_method, description, metadata
  )
  values (
    v_user_id,
    v_charge,
    'debit',
    'completed',
    'wallet',
    'Campaign checkout: ' || v_name,
    jsonb_build_object(
      'order_id', v_order_id,
      'service_code', p_service_code,
      'quantity', p_quantity
    )
  );

  return jsonb_build_object(
    'id', v_order_id,
    'charge', v_charge,
    'balance', v_balance,
    'duplicate', false
  );
end;
$$;

revoke all on function public.checkout_campaign_with_wallet(bigint, text, text, integer, uuid) from public;
grant execute on function public.checkout_campaign_with_wallet(bigint, text, text, integer, uuid) to authenticated;

-- Reliable supplier costs must be explicit historical evidence, never current sell rates.
create table public.order_supplier_costs (
  order_id uuid primary key references public.orders(id) on delete restrict,
  cost_inr numeric(14,2) not null check(cost_inr>=0 and cost_inr::text<>'NaN'),
  evidence_reference text not null check(length(trim(evidence_reference))>0),
  verified_by uuid not null references public.profiles(id), verified_at timestamptz not null default now()
);
alter table public.order_supplier_costs enable row level security;
revoke all on public.order_supplier_costs from public,anon,authenticated;
grant select on public.order_supplier_costs to authenticated;
create policy supplier_cost_admin_read on public.order_supplier_costs for select to authenticated using(public.is_admin());
-- No frontend cost writes. A future reviewed reconciliation import may populate this table.

create or replace function public.admin_revenue_report(p_since timestamptz,p_until timestamptz)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare result jsonb;
begin
  if auth.uid() is null or not public.is_admin() then raise exception 'Admin access required'; end if;
  if p_since is null or p_until is null or p_until<=p_since or p_until-p_since>interval '366 days' then
    raise exception 'Invalid report period'; end if;
  with earned as (
    select o.id,o.user_id,o.service_name,o.platform,o.charge,o.completed_at as created_at,c.cost_inr
    from public.orders o left join public.order_supplier_costs c on c.order_id=o.id
    where o.completed_at>=p_since and o.completed_at<p_until and o.status<>'failed'
      and o.payment_status in ('paid','completed','refunded')
  ), refund_candidates as (
    select t.*,o.completed_at as recognized_at
    from public.transactions t left join public.orders o on o.id::text=t.metadata->>'order_id'
    where t.type='refund' and t.status='completed' and t.created_at>=p_since and t.created_at<p_until
  ), service_refunds as (
    select id,amount,created_at from refund_candidates
    where recognized_at is not null and recognized_at<=created_at
      and coalesce(metadata->>'refund_kind','order_cancelled')<>'wallet_deposit'
  ), totals as (
    select coalesce(sum(charge),0) gross,count(*) orders,count(cost_inr) known_costs,coalesce(sum(cost_inr),0) costs from earned
  )
  select jsonb_build_object('orders',coalesce((select jsonb_agg(to_jsonb(e) order by created_at,id) from earned e),'[]'::jsonb),
    'refunds',coalesce((select jsonb_agg(to_jsonb(r) order by created_at,id) from service_refunds r),'[]'::jsonb),
    'gross',gross,'refundAmount',coalesce((select sum(amount) from service_refunds),0),
    'net',gross-coalesce((select sum(amount) from service_refunds),0),
    'supplierCost',case when known_costs=orders then costs else null end,
    'grossMargin',case when known_costs=orders then gross-coalesce((select sum(amount) from service_refunds),0)-costs else null end,
    'costCoverage',case when orders=0 then null else known_costs::numeric/orders end,
    'unclassifiedRefunds',(select count(*) from refund_candidates where recognized_at is null
      and coalesce(metadata->>'refund_kind','') not in ('wallet_deposit','deposit_reservation','deposit_reservation_release')
      and coalesce(description,'')<>'Payment refunded to original method'),
    'missingRecognitionOrders',(select count(*) from public.orders where status='completed' and completed_at is null
      and created_at>=p_since and created_at<p_until),
    'recognitionPolicy','completed_at; historical/partial delivery without verified completion is excluded') into result from totals;
  result:=result||jsonb_build_object('unreconciledRefundedOrders',(
    select count(*) from public.orders o where o.completed_at>=p_since and o.completed_at<p_until
      and o.status in ('cancelled','refunded') and not exists(select 1 from public.transactions t
        where t.type='refund' and t.status='completed' and t.metadata->>'order_id'=o.id::text)));
  if (result->>'unclassifiedRefunds')::integer>0 or (result->>'missingRecognitionOrders')::integer>0
    or (result->>'unreconciledRefundedOrders')::integer>0 then
    result:=jsonb_set(result,'{grossMargin}','null'::jsonb);
  end if;
  return result;
end $$;
revoke all on function public.admin_revenue_report(timestamptz,timestamptz) from public,anon;
grant execute on function public.admin_revenue_report(timestamptz,timestamptz) to authenticated;
-- Atomic manual order submission also owns the split wallet reservation.
create table public.manual_order_payment_references (
  reference text primary key,
  order_id uuid not null unique references public.orders(id) on delete restrict,
  user_id uuid not null references public.profiles(id),
  payment_method text not null,payment_reference text not null,
  wallet_applied numeric(14,2) not null,external_amount numeric(14,2) not null,
  created_at timestamptz not null default now()
);
alter table public.manual_order_payment_references enable row level security;
revoke all on public.manual_order_payment_references from public,anon,authenticated;
grant select on public.manual_order_payment_references to authenticated;
create policy manual_order_reference_read on public.manual_order_payment_references
  for select to authenticated using(user_id=auth.uid() or public.is_admin());
create index if not exists transactions_manual_reference_lookup on public.transactions(upper(provider_payment_id))
  where provider_payment_id is not null;

create or replace function public.guard_manual_wallet_reference()
returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare ref text:=upper(trim(new.provider_payment_id));
begin
  if new.payment_method is null or new.payment_method not in ('manual_upi','manual_bank_transfer','manual_usdt_trc20') or ref is null then return new; end if;
  perform pg_advisory_xact_lock(hashtextextended('manual-reference:'||ref,0));
  if exists(select 1 from public.manual_order_payment_references where reference=ref)
    or exists(select 1 from public.transactions where upper(provider_payment_id)=ref and id<>new.id) then
    raise exception 'Payment reference already submitted';
  end if;
  return new;
end $$;
revoke all on function public.guard_manual_wallet_reference() from public,anon,authenticated;
create trigger guard_manual_wallet_reference before insert on public.transactions
  for each row execute function public.guard_manual_wallet_reference();

create or replace function public.submit_manual_checkout_atomic(p_intent_id uuid,p_client_request_id uuid,
  p_expected_wallet numeric,p_utr text,p_payment_reference text,p_payment_method text)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare u uuid:=auth.uid(); i public.checkout_intents%rowtype; s public.services%rowtype;
  o public.orders%rowtype; r public.manual_order_payment_references%rowtype;
  split jsonb; applied numeric; remaining numeric; total numeric;
  ref text:=upper(trim(p_utr)); label text;
begin
  if u is null then raise exception 'Authentication required'; end if;
  if p_utr is null or p_utr!~'^[A-Za-z0-9-]{8,80}$' or p_payment_reference is null
    or p_payment_reference!~'^SR-[A-Z0-9-]{8,40}$' or p_payment_method is null
    or p_payment_method not in ('upi','bank_transfer','usdt_trc20') then raise exception 'Invalid payment details'; end if;
  if p_expected_wallet is null or p_expected_wallet::text='NaN' or p_expected_wallet<0 then raise exception 'Invalid wallet amount'; end if;
  select * into i from public.checkout_intents where id=p_intent_id and user_id=u
    and client_request_id=p_client_request_id::text for update;
  if not found then raise exception 'Checkout intent not found'; end if;
  if i.status='completed' then
    select * into o from public.orders where id=i.order_id and user_id=u;
    if not found then raise exception 'Completed checkout order not found'; end if;
    select * into r from public.manual_order_payment_references where order_id=o.id;
    if not found or r.reference<>ref or r.payment_method<>p_payment_method or r.payment_reference<>p_payment_reference then
      raise exception 'Completed checkout details require review';
    end if;
    return jsonb_build_object('order',to_jsonb(o),'duplicate',true,'walletApplied',r.wallet_applied,'remaining',r.external_amount,'orderTotal',i.total_paise::numeric/100);
  end if;
  if i.status<>'created' or i.expires_at<=now() or i.currency<>'INR' then raise exception 'Checkout intent expired or invalid'; end if;
  select * into s from public.services where id=i.service_id and status='active'
    and coalesce(is_active,true) and coalesce(accepts_new_orders,true) and health_status is distinct from 'paused' for share;
  if not found then raise exception 'Checkout service unavailable'; end if;
  if i.client_id is not null and not exists(select 1 from public.customer_clients where id=i.client_id and user_id=u and archived_at is null) then
    raise exception 'Checkout client unavailable'; end if;
  if i.campaign_id is not null and not exists(select 1 from public.campaigns where id=i.campaign_id and user_id=u
    and (client_id is null or client_id=i.client_id)) then raise exception 'Checkout campaign unavailable'; end if;
  perform pg_advisory_xact_lock(hashtextextended('manual-reference:'||ref,0));
  if exists(select 1 from public.manual_order_payment_references where reference=ref)
    or exists(select 1 from public.orders where customer_note ilike '%UTR: '||ref||'.%')
    or exists(select 1 from public.transactions where upper(provider_payment_id)=ref) then
    raise exception 'Payment reference already submitted';
  end if;
  split:=public.apply_wallet_to_manual_checkout(p_intent_id,p_client_request_id,p_expected_wallet);
  applied:=(split->>'wallet_applied')::numeric; remaining:=(split->>'remaining')::numeric;
  if applied::text='NaN' or remaining::text='NaN' then raise exception 'Wallet balance requires manual review'; end if;
  if remaining<=0 then raise exception 'Use wallet-only checkout'; end if;
  total:=i.total_paise::numeric/100;
  label:=case p_payment_method when 'bank_transfer' then 'Bank transfer (IMPS/NEFT)' when 'usdt_trc20' then 'USDT (TRC20)' else 'UPI' end;
  insert into public.orders(user_id,service_id,service_name,platform,link,quantity,unit_price,charge,status,payment_status,
    package_name,client_request_id,notes,customer_note,client_id,campaign_id)
  values(u,s.id,s.name,s.platform,i.destination_link,i.quantity,round(total*1000/i.quantity,4),total,'pending','verification_pending',
    coalesce(i.package_name,'Custom'),p_client_request_id,i.notes,
    label||' payment submitted for verification. Payment Ref: '||p_payment_reference||'. UTR: '||p_utr||'. Wallet applied: INR '||applied||'. External amount: INR '||remaining||'.',i.client_id,i.campaign_id)
  returning * into o;
  insert into public.manual_order_payment_references(reference,order_id,user_id,payment_method,payment_reference,wallet_applied,external_amount)
    values(ref,o.id,u,p_payment_method,p_payment_reference,applied,remaining);
  update public.transactions set metadata=metadata||jsonb_build_object('order_id',o.id,'checkout_intent_id',i.id)
    where user_id=u and provider_payment_id='wallet-split:'||i.id::text;
  update public.checkout_intents set status='completed',order_id=o.id,completed_at=now(),updated_at=now() where id=i.id;
  return jsonb_build_object('order',to_jsonb(o),'duplicate',false,'walletApplied',applied,'remaining',remaining,'orderTotal',total);
end $$;
revoke all on function public.submit_manual_checkout_atomic(uuid,uuid,numeric,text,text,text) from public,anon;
grant execute on function public.submit_manual_checkout_atomic(uuid,uuid,numeric,text,text,text) to authenticated;
-- This old split helper can no longer debit without the atomic order wrapper.
revoke all on function public.apply_wallet_to_manual_checkout(uuid,uuid,numeric) from public,anon,authenticated,service_role;

commit;
