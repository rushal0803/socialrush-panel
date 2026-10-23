import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
const baseline=await readFile(new URL('../../supabase/clean-install/v1/services-timestamp.sql',import.meta.url),'utf8');
const pricing=await readFile(new URL('../../supabase/migrations/202609020001_update_follower_service_pricing.sql',import.meta.url),'utf8');
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
