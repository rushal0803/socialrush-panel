import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
const baseline=await readFile(new URL('../../supabase/clean-install/v1/services-timestamp.sql',import.meta.url),'utf8');
const pricing=await readFile(new URL('../../supabase/migrations/202609020001_update_follower_service_pricing.sql',import.meta.url),'utf8');
const crm=await readFile(new URL('../../supabase/clean-install/v1/crm-foundation.sql',import.meta.url),'utf8');
const replies=await readFile(new URL('../../supabase/migrations/202609020002_crm_reply_automation.sql',import.meta.url),'utf8');

test('CRM reconstruction preserves later priority ownership, constraints and restricted RLS grants',async()=>{
  const db=new PGlite();try{
    await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
      grant usage on schema public to anon,authenticated,service_role;
      create table profiles(id uuid primary key);
      create function public.is_admin() returns boolean language sql stable as $$
        select current_setting('test.admin',true)='yes' $$;
      set socialrush.clean_install='v1';`);
    await db.exec(crm);
    assert.equal((await db.query("select count(*)::int n from information_schema.columns where table_name='crm_leads' and column_name='priority'")).rows[0].n,0);
    await db.exec(replies); // Original file, no schema patch or skipped statements.
    assert.equal((await db.query("select column_default from information_schema.columns where table_name='crm_leads' and column_name='priority'")).rows[0].column_default,"'normal'::text");
    await assert.rejects(db.exec("insert into crm_leads(business_name,priority) values('Synthetic','invalid')"),/crm_leads_priority_check/);
    await assert.rejects(db.exec("insert into crm_leads(business_name,score) values('Synthetic',101)"),/crm_leads_score_check/);
    await db.exec("insert into crm_leads(id,business_name,domain) values('00000000-0000-0000-0000-000000000001','Synthetic','EXAMPLE.INVALID');");
    await assert.rejects(db.exec("insert into crm_leads(business_name,domain) values('Duplicate','example.invalid')"),/crm_leads_domain_uidx/);
    await assert.rejects(db.exec("insert into crm_lead_contacts(lead_id,email) values('00000000-0000-0000-0000-000000000099','synthetic@example.invalid')"),/crm_lead_contacts_lead_id_fkey/);
    await db.exec("set role authenticated; set test.admin='no';");
    assert.equal((await db.query('select * from crm_leads')).rows.length,0);
    await assert.rejects(db.exec("insert into crm_leads(business_name) values('Denied')"),/row-level security/);
    await assert.rejects(db.exec('truncate crm_lead_contacts'),/permission denied/);
    await db.exec("set test.admin='yes';");
    assert.equal((await db.query('select * from crm_leads')).rows.length,1);
    await db.exec("insert into crm_leads(business_name) values('Synthetic admin'); set role anon;");
    await assert.rejects(db.exec('select * from crm_leads'),/permission denied/);
    await assert.rejects(db.exec('truncate crm_lead_contacts'),/permission denied/);
    await db.exec('reset role;');
    const before=(await db.query('select * from crm_leads order by id')).rows;
    await assert.rejects(db.exec(crm),/requires absent relations/);
    await db.exec('rollback;');
    assert.deepEqual((await db.query('select * from crm_leads order by id')).rows,before);
  }finally{await db.close();}
});

test('CRM reconstruction requires explicit clean-install context and is atomic on rejection',async()=>{
  const db=new PGlite();try{
    await assert.rejects(db.exec(crm),/Explicit clean-install/);
    await db.exec('rollback;');
    assert.equal((await db.query("select to_regclass('public.crm_leads') r")).rows[0].r,null);
    await db.exec(`create role anon; create role authenticated; create role service_role;
      create table profiles(id uuid primary key); set socialrush.clean_install='v1';`);
    // Fail after the first table/indexes have been created: the policy helper is absent.
    await assert.rejects(db.exec(crm),/is_admin/);
    await db.exec('rollback;');
    assert.equal((await db.query("select to_regclass('public.crm_leads') r")).rows[0].r,null);
    assert.equal((await db.query("select to_regclass('public.crm_lead_contacts') r")).rows[0].r,null);
  }finally{await db.close();}
});
test('versioned baseline preserves rates/order totals and supplies the historical dependency',async()=>{
  const db=new PGlite();try{
    await db.exec(`create table services(id int primary key,code text,name text,rate numeric);
      create table orders(id int primary key,charge numeric);
      insert into services values(1,'instagram-followers','Instagram Followers',123),(2,'other','Other',77);
      insert into orders values(1,42);`);
    await assert.rejects(db.exec(pricing),/updated_at/);
    await assert.rejects(db.exec(baseline),/Explicit clean-install/);
    const before=(await db.query('select * from services order by id')).rows;
    await db.exec("set socialrush.clean_install='v1';"+baseline);
    assert.deepEqual((await db.query('select id,code,name,rate from services order by id')).rows,before);
    assert.equal((await db.query('select updated_at from services limit 1')).rows[0].updated_at,null);
    await db.exec("update services set updated_at='2020-01-01T00:00:00Z' where id=2;");
    await db.exec(baseline); // Explicitly idempotent; existing timestamps preserved.
    assert.equal(new Date((await db.query('select updated_at from services where id=2')).rows[0].updated_at).toISOString(),'2020-01-01T00:00:00.000Z');
    await db.exec(pricing); // Original bytes, synthetic data only.
    assert.equal(Number((await db.query('select rate from services where id=1')).rows[0].rate),799);
    assert.equal(Number((await db.query('select charge from orders')).rows[0].charge),42);
  }finally{await db.close();}
});
test('baseline fails closed on an incompatible existing timestamp column',async()=>{
  const db=new PGlite();try{
    await db.exec("create table services(updated_at text); set socialrush.clean_install='v1';");
    await assert.rejects(db.exec(baseline),/incompatible type/);
  }finally{await db.close();}
});
