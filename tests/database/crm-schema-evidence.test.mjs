import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
const sql=await readFile(new URL('../../scripts/clean-install-schema-evidence-readonly.sql',import.meta.url),'utf8');
test('schema inventory is scoped, read-only and reports missing foundation without inventing it',async()=>{
  const db=new PGlite();try{
    // Deliberately do NOT invent CRM table definitions for this regression.
    await db.exec(`create table unrelated_private_fixture(private_value text);
      insert into unrelated_private_fixture values('SYNTHETIC-PRIVATE-ROW');`);
    const result=await db.exec(sql);
    const sections=Object.fromEntries(result.flatMap(r=>r.rows??[]).filter(r=>r.section).map(r=>[r.section,r.evidence]));
    assert.equal(sections.objects.length,2);
    assert.ok(sections.objects.every(x=>!x.exists));
    assert.deepEqual(Object.keys(sections),['objects','columns','constraints','indexes','policies','table_grants','column_grants','triggers','dependencies']);
    for(const name of Object.keys(sections).filter(x=>x!=='objects'))assert.equal(sections[name],null);
    assert.ok(!JSON.stringify(sections).includes('SYNTHETIC-PRIVATE-ROW'));
    assert.ok(!JSON.stringify(sections).includes('unrelated_private_fixture'));
    assert.equal((await db.query('select private_value from unrelated_private_fixture')).rows[0].private_value,'SYNTHETIC-PRIVATE-ROW');
  }finally{await db.close();}
});
test('inventory explicitly reports missing foundation objects',async()=>{
  const db=new PGlite();try{
    const result=await db.exec(sql);
    const row=result.flatMap(r=>r.rows??[]).find(r=>r.section==='objects');
    assert.equal(row.evidence.length,2);
    assert.ok(row.evidence.every(x=>!x.exists));
  }finally{await db.close();}
});

test('RLS does not restrict TRUNCATE; a separate privilege is required on disposable tables',async()=>{
  const db=new PGlite();try{
    // Generic synthetic fixture, not a reconstruction of either CRM relation.
    await db.exec(`create role synthetic_customer nologin;
      create table synthetic_privilege_probe(id integer primary key);
      insert into synthetic_privilege_probe values(1);
      alter table synthetic_privilege_probe enable row level security;
      grant usage on schema public to synthetic_customer;
      grant select, delete on synthetic_privilege_probe to synthetic_customer;
      set role synthetic_customer;`);
    assert.equal((await db.query('delete from synthetic_privilege_probe returning id')).rows.length,0);
    await assert.rejects(db.exec('truncate synthetic_privilege_probe'), /permission denied/);
    await db.exec(`reset role;
      grant truncate on synthetic_privilege_probe to synthetic_customer;
      set role synthetic_customer;
      truncate synthetic_privilege_probe;
      reset role;`);
    assert.equal((await db.query('select count(*)::int as count from synthetic_privilege_probe')).rows[0].count,0);
  }finally{await db.close();}
});
