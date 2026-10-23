-- INSTRUCTIONS ONLY. Explicit approval of exact remote target, scope, script
-- version, existing read-only identity and private output location is required.
-- Catalog metadata only: no application rows, auth.users, Vault or role passwords.
-- Run with psql -X -v ON_ERROR_STOP=1 -f <this-file> AFTER approval only.
begin transaction read only;
set local statement_timeout = '15s';
set local lock_timeout = '2s';
set local search_path = pg_catalog;

select 'objects' as section, jsonb_agg(jsonb_build_object(
  'requested', t.name, 'exists', c.oid is not null, 'kind', c.relkind,
  'owner', pg_get_userbyid(c.relowner), 'rls', c.relrowsecurity,
  'force_rls', c.relforcerowsecurity) order by t.name) as evidence
from (values ('crm_leads'),('crm_lead_contacts')) t(name)
left join pg_namespace n on n.nspname='public'
left join pg_class c on c.relnamespace=n.oid and c.relname=t.name;

select 'columns' as section, jsonb_agg(jsonb_build_object(
  'table',c.relname,'column',a.attname,'position',a.attnum,
  'type',format_type(a.atttypid,a.atttypmod),'nullable',not a.attnotnull,
  'identity',a.attidentity,'generated',a.attgenerated,
  'default',pg_get_expr(d.adbin,d.adrelid),
  'collation',case when a.attcollation<>0 then a.attcollation::regcollation::text end)
  order by c.relname,a.attnum) as evidence
from pg_class c join pg_namespace n on n.oid=c.relnamespace
join pg_attribute a on a.attrelid=c.oid and a.attnum>0 and not a.attisdropped
left join pg_attrdef d on d.adrelid=c.oid and d.adnum=a.attnum
where n.nspname='public' and c.relname in ('crm_leads','crm_lead_contacts');

select 'constraints' as section, jsonb_agg(jsonb_build_object(
  'table',c.relname,'name',k.conname,'type',k.contype,
  'validated',k.convalidated,'definition',pg_get_constraintdef(k.oid,true),
  'referenced_table',case when k.confrelid<>0 then k.confrelid::regclass::text end)
  order by c.relname,k.conname) as evidence
from pg_constraint k join pg_class c on c.oid=k.conrelid
join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public' and c.relname in ('crm_leads','crm_lead_contacts');

select 'indexes' as section, jsonb_agg(jsonb_build_object(
  'table',c.relname,'definition',pg_get_indexdef(i.indexrelid),
  'valid',i.indisvalid,'ready',i.indisready) order by c.relname,i.indexrelid) as evidence
from pg_index i join pg_class c on c.oid=i.indrelid
join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public' and c.relname in ('crm_leads','crm_lead_contacts');

select 'policies' as section, jsonb_agg(to_jsonb(p) order by p.tablename,p.policyname) as evidence
from pg_policies p where p.schemaname='public'
and p.tablename in ('crm_leads','crm_lead_contacts');

select 'table_grants' as section, jsonb_agg(jsonb_build_object(
  'table',c.relname,'grantor',pg_get_userbyid(g.grantor),
  'grantee',case when g.grantee=0 then 'PUBLIC' else pg_get_userbyid(g.grantee) end,
  'privilege',g.privilege_type,'grant_option',g.is_grantable)
  order by c.relname,g.grantee,g.privilege_type) as evidence
from pg_class c join pg_namespace n on n.oid=c.relnamespace
cross join lateral aclexplode(coalesce(c.relacl,acldefault('r',c.relowner))) g
where n.nspname='public' and c.relname in ('crm_leads','crm_lead_contacts');

select 'column_grants' as section, jsonb_agg(jsonb_build_object(
  'table',c.relname,'column',a.attname,'grantee',
  case when g.grantee=0 then 'PUBLIC' else pg_get_userbyid(g.grantee) end,
  'privilege',g.privilege_type,'grant_option',g.is_grantable)
  order by c.relname,a.attnum,g.grantee,g.privilege_type) as evidence
from pg_class c join pg_namespace n on n.oid=c.relnamespace
join pg_attribute a on a.attrelid=c.oid and a.attnum>0 and not a.attisdropped
cross join lateral aclexplode(a.attacl) g
where n.nspname='public' and c.relname in ('crm_leads','crm_lead_contacts');

-- Trigger identities only: do not export/execute function bodies in this phase.
select 'triggers' as section, jsonb_agg(jsonb_build_object(
  'table',c.relname,'name',t.tgname,'enabled',t.tgenabled,
  'definition',pg_get_triggerdef(t.oid,true),'function',t.tgfoid::regprocedure::text)
  order by c.relname,t.tgname) as evidence
from pg_trigger t join pg_class c on c.oid=t.tgrelid
join pg_namespace n on n.oid=c.relnamespace
where not t.tgisinternal and n.nspname='public'
and c.relname in ('crm_leads','crm_lead_contacts');

-- Dependency identities only. This inventory is NOT a complete schema dump.
with targets as (select c.oid from pg_class c join pg_namespace n on n.oid=c.relnamespace
  where n.nspname='public' and c.relname in ('crm_leads','crm_lead_contacts'))
select 'dependencies' as section, jsonb_agg(jsonb_build_object(
  'object',pg_describe_object(d.classid,d.objid,d.objsubid),
  'references',pg_describe_object(d.refclassid,d.refobjid,d.refobjsubid),
  'kind',d.deptype) order by d.classid,d.objid,d.objsubid) as evidence
from pg_depend d where (d.classid='pg_class'::regclass and d.objid in(select oid from targets))
or (d.refclassid='pg_class'::regclass and d.refobjid in(select oid from targets));
rollback;
