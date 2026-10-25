-- Candidate anomalies, not authority to correct balances. No personal data or secrets.
-- Run only against an explicitly approved source, with a SELECT-only database role.
-- Snapshot is consistent; timeout bounds impact. No temporary tables or persistent writes.
begin transaction isolation level repeatable read read only;
set local statement_timeout = '60s';
set local lock_timeout = '3s';
with findings as (
  select 'orphan_credit_candidate' kind, t.id::text record_id,
    'Completed credit has no provider/payment/adjustment provenance' reason
  from public.transactions t
  where t.type='credit' and t.status='completed'
    and nullif(trim(t.provider_payment_id),'') is null
    and nullif(trim(t.provider_order_id),'') is null
    and coalesce(t.metadata,'{}'::jsonb)->>'refund_kind' is distinct from 'deposit_reservation_release'
    and not (coalesce(t.metadata,'{}'::jsonb) ?| array['admin_id','adjusted_by','source','reason'])
  union all
  select 'unmatched_service_refund',t.id::text,'Service refund has no matching order'
  from public.transactions t left join public.orders o on o.id::text=t.metadata->>'order_id'
  where t.type='refund' and t.status='completed' and o.id is null
    and coalesce(t.metadata->>'refund_kind','') not in ('wallet_deposit','deposit_reservation_release')
    and coalesce(t.description,'')<>'Payment refunded to original method'
  union all
  select 'unmatched_gateway_refund',t.id::text,'External refund has no consistent durable request or legacy source credit'
  from public.transactions t where t.type='refund' and t.status='completed' and (
    (t.metadata->>'refund_kind'='wallet_deposit' and not exists(
      select 1 from public.gateway_refund_requests r where r.id::text=t.metadata->>'refund_request_id'
        and r.user_id=t.user_id and r.amount=t.amount and r.provider_refund_id=t.provider_refund_id and r.status='completed'))
    or (t.description='Payment refunded to original method' and not exists(
      select 1 from public.transactions source where source.type='credit' and source.status='completed'
        and source.user_id=t.user_id and source.amount=t.amount and source.provider_refund_id=t.provider_refund_id)))
  union all
  select 'duplicate_ledger_key',min(t.id::text),'Repeated nonempty ledger business key'
  from public.transactions t where nullif(t.ledger_entry_key,'') is not null
  group by t.ledger_entry_key having count(*)>1
  union all
  select 'duplicate_payment_reference',min(t.id::text),'Repeated normalized provider payment reference'
  from public.transactions t where nullif(trim(t.provider_payment_id),'') is not null
  group by upper(trim(t.provider_payment_id)) having count(*)>1
  union all
  select 'multiple_order_refunds',min(t.id::text),'Multiple completed refunds for one order; verify total and intent'
  from public.transactions t where t.type='refund' and t.status='completed'
    and nullif(t.metadata->>'order_id','') is not null
  group by t.metadata->>'order_id' having count(*)>1
  union all
  select 'incomplete_gateway_reference',t.id::text,'Gateway credit lacks provider order or payment identity'
  from public.transactions t where t.type='credit' and t.status='completed'
    and t.payment_method in ('razorpay','upi','card','netbanking')
    and (nullif(trim(t.provider_order_id),'') is null or nullif(trim(t.provider_payment_id),'') is null)
  union all
  select 'missing_recognition_date',o.id::text,'Completed order lacks completed_at'
  from public.orders o where o.status='completed' and o.completed_at is null
  union all
  select 'missing_verified_supplier_cost',o.id::text,'Recognized service order has no verified cost evidence'
  from public.orders o left join public.order_supplier_costs c on c.order_id=o.id
  where o.completed_at is not null and o.payment_status in ('paid','refunded')
    and (c.order_id is null or c.verified_by is null or c.verified_at is null or nullif(trim(c.evidence_reference),'') is null)
  union all
  select 'terminal_order_without_refund',o.id::text,'Refunded order has no completed linked refund ledger entry'
  from public.orders o where o.payment_status='refunded' and not exists (
    select 1 from public.transactions t where t.type='refund' and t.status='completed' and t.metadata->>'order_id'=o.id::text)
  union all
  select 'unresolved_gateway_refund',r.id::text,'Reserved or uncertain gateway refund requires reconciliation'
  from public.gateway_refund_requests r where r.status not in ('completed','failed')
  union all
  select 'gateway_settlement_mismatch',r.id::text,'Terminal request lacks its unique settlement or release entry'
  from public.gateway_refund_requests r where
    (r.status='completed' and (r.provider_refund_id is null or not exists(select 1 from public.transactions t
      where t.ledger_entry_key='gateway-refund:'||r.id::text and t.amount=r.amount and t.status='completed')))
    or (r.status='failed' and not exists(select 1 from public.transactions t
      where t.ledger_entry_key='gateway-release:'||r.id::text and t.amount=r.amount and t.status='completed'))
), counts as (select kind,count(*) count from findings group by kind),
samples as (select *,row_number() over(partition by kind order by record_id) n from findings)
select jsonb_build_object('generatedAt',transaction_timestamp(),'mode','read-only candidate review',
  'counts',coalesce((select jsonb_object_agg(kind,count) from counts),'{}'::jsonb),
  'samples',coalesce((select jsonb_agg(jsonb_build_object('kind',kind,'recordId',record_id,'reason',reason)
    order by kind,record_id) from samples where n<=20),'[]'::jsonb),
  'limitations','Candidate flags require evidence review; no opening-balance attestation, provider statement reconciliation, tax/fee audit or automatic corrections.') report;
rollback;
