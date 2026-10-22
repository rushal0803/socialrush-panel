-- Instructions only: run solely against an explicitly approved schema source.
-- No customer/service rows, rates, orders, secrets or Vault data are selected.
begin transaction read only;
select table_schema,table_name,column_name,data_type,is_nullable,column_default
from information_schema.columns
where table_schema='public' and table_name in ('services','crm_leads','crm_lead_contacts')
order by table_name,ordinal_position;
select schemaname,tablename,policyname,roles,cmd,qual,with_check
from pg_policies where schemaname='public' and tablename in ('services','crm_leads','crm_lead_contacts')
order by tablename,policyname;
select tc.table_name,tc.constraint_name,tc.constraint_type,kcu.column_name
from information_schema.table_constraints tc
left join information_schema.key_column_usage kcu
using(constraint_catalog,constraint_schema,constraint_name)
where tc.table_schema='public' and tc.table_name in ('services','crm_leads','crm_lead_contacts')
order by tc.table_name,tc.constraint_name,kcu.ordinal_position;
select grantee,table_name,privilege_type from information_schema.role_table_grants
where table_schema='public' and table_name in ('services','crm_leads','crm_lead_contacts')
order by table_name,grantee,privilege_type;
-- Get the authoritative CRM creation SQL and its dependent functions/triggers
-- from source control or an approved schema-only artifact; do not infer it
-- from these column listings. Review artifacts privately before sharing.
rollback;
