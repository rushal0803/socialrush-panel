import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

const admin='11111111-1111-4111-8111-111111111111';
const user='22222222-2222-4222-8222-222222222222';
const other='33333333-3333-4333-8333-333333333333';
const sqlFile = file => readFile(new URL('../../'+file,import.meta.url),'utf8');
async function fixture() {
  const db=new PGlite();
  await db.exec(await sqlFile('tests/database/payment-safety-fixture.sql'));
  await db.exec(await sqlFile('supabase/migrations/202607250001_checkout_intents.sql'));
  await db.exec(await sqlFile('supabase/migrations/202606190006_fintech_wallet.sql'));
  await db.exec(await sqlFile('supabase/migrations/20260926173543_agency_checkout_attribution.sql'));
  await db.exec(await sqlFile('supabase/migrations/20261005190934_verify_wallet_split_checkout_safety.sql'));
  await db.exec(await sqlFile('supabase/migrations/20261019214002_payment_revenue_safety.sql'));
  await db.exec(`grant select on checkout_intents to authenticated;
    insert into profiles(id,email,role,balance) values('${admin}','admin@example.invalid','admin',0),('${user}','u@example.invalid','user',100),('${other}','o@example.invalid','user',0);
    insert into services(id,code,name,platform,rate,min,max) values(1,'facebook-followers','Facebook Followers','facebook',499,100,100000);
    select set_config('request.jwt.claim.sub','${admin}',false);`);
  return db;
}
const scalar=async(db,sql,params=[])=>Object.values((await db.query(sql,params)).rows[0])[0];
const order=async(db,charge=30,status='processing',payment='paid')=>scalar(db,
  'insert into orders(user_id,service_id,charge,status,payment_status,quantity,link) values($1,1,$2,$3,$4,100,\'https://example.invalid\') returning id',[user,charge,status,payment]);
const transition=(db,id,status='cancelled')=>scalar(db,'select admin_update_order_financial($1,$2)',[id,JSON.stringify({status})]);

test('read-only reconciliation flags candidate anomalies without changing records',async()=>{
  const db=await fixture();try{
    await db.query("insert into transactions(user_id,amount,type,status) values($1,10,'credit','completed'),($1,5,'refund','completed')",[user]);
    await db.query("insert into orders(user_id,service_id,charge,quantity,status,payment_status,completed_at) values($1,1,10,100,'completed','paid',null),($1,1,20,100,'completed','paid',now())",[user]);
    const before=await scalar(db,'select count(*) from transactions');
    const results=await db.exec(await sqlFile('scripts/finance-reconciliation-readonly.sql'));
    const report=results.flatMap(r=>r.rows??[]).find(r=>r.report)?.report;
    assert.ok(report);
    assert.equal(report.counts.orphan_credit_candidate,1);
    assert.equal(report.counts.unmatched_service_refund,1);
    assert.equal(report.counts.missing_recognition_date,1);
    assert.equal(report.counts.missing_verified_supplier_cost,1);
    assert.equal(await scalar(db,'select count(*) from transactions'),before);
    assert.equal(Number(await scalar(db,'select balance from profiles where id=$1',[user])),100);
  }finally{await db.close();}
});

test('SQL cancellation, duplicate requests, unpaid order and terminal reopening',async()=>{
  const db=await fixture();try{
    const id=await order(db);
    // Requests are concurrent at the client; PGlite serializes transactions on its single session.
    await Promise.all(Array.from({length:8},()=>transition(db,id)));
    assert.equal(Number(await scalar(db,'select balance from profiles where id=$1',[user])),130);
    assert.equal(Number(await scalar(db,"select count(*) from transactions where type='refund'")),1);
    assert.equal(await scalar(db,'select payment_status from orders where id=$1',[id]),'refunded');
    await assert.rejects(transition(db,id,'processing'),/cannot be reopened/);
    await transition(db,await order(db,70,'pending','verification_pending'));
    assert.equal(Number(await scalar(db,'select balance from profiles where id=$1',[user])),130);
  }finally{await db.close();}
});

test('SQL failure between ledger and balance rolls back order and ledger',async()=>{
  const db=await fixture();try{
    const id=await order(db);
    await db.exec(`create function fail_balance() returns trigger language plpgsql as $$begin raise exception 'injected balance failure'; end$$;
      create trigger injected_failure before update on profiles for each row execute function fail_balance();`);
    await assert.rejects(transition(db,id),/injected balance failure/);
    assert.equal(await scalar(db,'select status from orders where id=$1',[id]),'processing');
    assert.equal(Number(await scalar(db,'select count(*) from transactions')),0);
    assert.equal(Number(await scalar(db,'select balance from profiles where id=$1',[user])),100);
    await db.exec('drop trigger injected_failure on profiles');
    await transition(db,id);
    assert.equal(Number(await scalar(db,'select balance from profiles where id=$1',[user])),130);
  }finally{await db.close();}
});

test('SQL honors historical refund without issuing another credit',async()=>{
  const db=await fixture();try{
    const id=await order(db);
    await db.query("insert into transactions(user_id,amount,type,status,metadata) values($1,30,'refund','completed',$2)",[user,JSON.stringify({order_id:id})]);
    await transition(db,id);
    assert.equal(Number(await scalar(db,'select balance from profiles where id=$1',[user])),100);
    assert.equal(Number(await scalar(db,'select count(*) from transactions')),1);
  }finally{await db.close();}
});

test('SQL gateway reservation, claim, completion and failed release are idempotent',async()=>{
  const db=await fixture();try{
    const tx=await scalar(db,"insert into transactions(user_id,amount,type,status,payment_method,provider_order_id,provider_payment_id) values($1,40,'credit','completed','upi','order_test','pay_test') returning id",[user]);
    const r=await scalar(db,'select request_wallet_gateway_refund($1)',[tx]);
    const duplicate=await scalar(db,'select request_wallet_gateway_refund($1)',[tx]);
    assert.equal(duplicate.id,r.id);
    assert.equal(Number(await scalar(db,'select balance from profiles where id=$1',[user])),60);
    const claims=await Promise.all(Array.from({length:8},()=>scalar(db,'select claim_wallet_gateway_refund($1)',[r.id])));
    assert.equal(claims.filter(Boolean).length,1);
    await scalar(db,"select record_wallet_gateway_refund($1,'manual_review',null,'timeout')",[r.id]);
    await scalar(db,"select record_wallet_gateway_refund($1,'completed','rfnd_test',null)",[r.id]);
    await scalar(db,"select record_wallet_gateway_refund($1,'completed','rfnd_test',null)",[r.id]);
    assert.equal(Number(await scalar(db,'select balance from profiles where id=$1',[user])),60);
    assert.equal(Number(await scalar(db,"select count(*) from transactions where type='refund'")),1);
    assert.equal(await scalar(db,'select status from transactions where id=$1',[tx]),'completed');
    const t2=await scalar(db,"insert into transactions(user_id,amount,type,status,payment_method,provider_order_id,provider_payment_id) values($1,20,'credit','completed','upi','order_fail','pay_fail') returning id",[user]);
    const fail=await scalar(db,'select request_wallet_gateway_refund($1)',[t2]);
    await scalar(db,'select claim_wallet_gateway_refund($1)',[fail.id]);
    await scalar(db,"select record_wallet_gateway_refund($1,'failed','rfnd_failed',null)",[fail.id]);
    await scalar(db,"select record_wallet_gateway_refund($1,'failed','rfnd_failed',null)",[fail.id]);
    assert.equal(Number(await scalar(db,'select balance from profiles where id=$1',[user])),60);
    assert.ok(Number(await scalar(db,'select count(*) from gateway_refund_audit'))>=6);
  }finally{await db.close();}
});

test('RLS: customer ownership, read-only intents, admin-only refund RPCs and internal tables',async()=>{
  const db=await fixture();try{
    const id=await order(db);
    await db.exec(`select set_config('request.jwt.claim.sub','${other}',false); set role authenticated;`);
    assert.equal(Number(await scalar(db,'select count(*) from orders')),0);
    assert.equal(Number(await scalar(db,'select count(*) from profiles')),1);
    assert.equal(Number(await scalar(db,'select count(*) from gateway_refund_requests')),0);
    await assert.rejects(scalar(db,'select admin_update_order_financial(gen_random_uuid(),\'{}\')'),/Admin access required/);
    await assert.rejects(scalar(db,'select request_wallet_gateway_refund(gen_random_uuid())'),/Admin access required/);
    await assert.rejects(scalar(db,"select admin_revenue_report(now()-interval '1 day',now())"),/Admin access required/);
    await assert.rejects(db.query("insert into checkout_intents(user_id,client_request_id,quantity,destination_link,total_paise,service_code) values($1,'x',100,'https://example.invalid',1,'fake')",[other]),/permission denied|row-level security/);
    await assert.rejects(db.query("insert into gateway_refund_audit(request_id,status) values(gen_random_uuid(),'completed')"),/permission denied/);
    await db.exec('reset role; set role anon;');
    await assert.rejects(scalar(db,"select admin_revenue_report(now()-interval '1 day',now())"),/permission denied/);
    await assert.rejects(scalar(db,'select count(*) from gateway_refund_requests'),/permission denied/);
    await db.exec(`reset role; select set_config('request.jwt.claim.sub','${admin}',false); set role authenticated;`);
    assert.equal(Number(await scalar(db,'select count(*) from orders')),1);
    const updated=await transition(db,id);
    assert.equal(updated.payment_status,'refunded');
    assert.equal(Number(updated.__refund.amount),30);
  }finally{await db.close();}
});

test('SQL earned revenue excludes deposits/unearned refunds; negative net, margins and row cap',async()=>{
  const db=await fixture();try{
    const earned=await order(db,30,'completed');
    await db.query("update orders set completed_at='2026-09-01T00:00:00Z' where id=$1",[earned]);
    await transition(db,earned);
    await db.query("insert into transactions(user_id,amount,type,status,metadata) values($1,999,'credit','completed','{}'),($1,500,'refund','completed','{\"refund_kind\":\"wallet_deposit\"}')",[user]);
    const today=new Date().toISOString().slice(0,10);
    const r=await scalar(db,'select admin_revenue_report($1,$2)',[today+'T00:00:00Z',today+'T23:59:59Z']);
    assert.equal(r.gross,0); assert.equal(r.refundAmount,30); assert.equal(r.net,-30);
    await db.query("insert into orders(user_id,service_id,charge,quantity,status,payment_status,completed_at) select $1,1,1,100,'completed','paid',now() from generate_series(1,1101)",[user]);
    const all=await scalar(db,'select admin_revenue_report($1,$2)',[today+'T00:00:00Z',today+'T23:59:59Z']);
    assert.equal(all.orders.length,1101); assert.equal(all.gross,1101); assert.equal(all.grossMargin,null);
    await db.query("insert into order_supplier_costs(order_id,cost_inr,evidence_reference,verified_by) select id,0.25,'fixture provider statement',$1 from orders where status='completed'",[admin]);
    const costs=await scalar(db,'select admin_revenue_report($1,$2)',[today+'T00:00:00Z',today+'T23:59:59Z']);
    assert.equal(costs.supplierCost,275.25); assert.equal(costs.grossMargin,795.75);
  }finally{await db.close();}
});

test('SQL wallet contention, exact retry, mismatch and insert failure keep balances safe',async()=>{
  const db=await fixture();try{
    await db.exec(`select set_config('request.jwt.claim.sub','${user}',false);`);
    const intents=[];
    for(let i=0;i<2;i++)intents.push(await scalar(db,"insert into checkout_intents(user_id,client_request_id,service_id,service_code,quantity,destination_link,total_paise) values($1,gen_random_uuid()::text,1,'facebook-followers',100,'https://example.invalid',6000) returning row_to_json(checkout_intents)",[user]));
    const pay=i=>scalar(db,'select checkout_custom_intent_with_wallet($1,$2,$3,$4,$5)',[i.id,i.client_request_id,i.service_code,i.quantity,i.destination_link]);
    const results=await Promise.allSettled(intents.map(pay));
    assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
    const winner=intents[results.findIndex(r=>r.status==='fulfilled')];
    assert.equal((await pay(winner)).duplicate,true);
    assert.equal(Number(await scalar(db,'select balance from profiles where id=$1',[user])),40);
    assert.equal(Number(await scalar(db,'select count(*) from orders')),1);
    await assert.rejects(scalar(db,'select checkout_custom_intent_with_wallet($1,$2,null,100,$3)',[winner.id,winner.client_request_id,winner.destination_link]),/details mismatch/);
    await db.exec(`create function fail_order() returns trigger language plpgsql as $$begin raise exception 'injected order insert failure';end$$;
      create trigger fail_order before insert on orders for each row execute function fail_order(); update profiles set balance=100 where id='${user}';`);
    const loser=intents.find(i=>i.id!==winner.id);
    await assert.rejects(pay(loser),/injected order insert failure/);
    assert.equal(Number(await scalar(db,'select balance from profiles where id=$1',[user])),100);
    assert.equal(Number(await scalar(db,"select count(*) from transactions where type='debit'")),1);
  }finally{await db.close();}
});

test('split-wallet cancellation returns only the reserved wallet funds',async()=>{
  const db=await fixture();try{
    await db.exec(`update profiles set balance=40.10 where id='${user}'; select set_config('request.jwt.claim.sub','${user}',false);`);
    const i=await scalar(db,"insert into checkout_intents(user_id,client_request_id,service_id,service_code,quantity,destination_link,total_paise) values($1,gen_random_uuid()::text,1,'facebook-followers',100,'https://example.invalid',7990) returning row_to_json(checkout_intents)",[user]);
    await scalar(db,'select apply_wallet_to_manual_checkout($1,$2,40.10)',[i.id,i.client_request_id]);
    const id=await order(db,79.90,'pending','verification_pending');
    await db.query('update checkout_intents set order_id=$1 where id=$2',[id,i.id]);
    await db.exec(`select set_config('request.jwt.claim.sub','${admin}',false)`);
    await transition(db,id); await transition(db,id);
    assert.equal(Number(await scalar(db,'select balance from profiles where id=$1',[user])),40.10);
    assert.equal(Number(await scalar(db,"select sum(amount) from transactions where type='refund'")),40.10);
  }finally{await db.close();}
});

test('legacy wallet uses current catalog, rejects service mismatch and never overdraws',async()=>{
  const db=await fixture();try{
    await db.exec(`select set_config('request.jwt.claim.sub','${user}',false)`);
    const req=await scalar(db,'select gen_random_uuid()');
    const call=()=>scalar(db,"select checkout_campaign_with_wallet(1,'fb-followers','https://example.invalid',100,$1)",[req]);
    const results=await Promise.all(Array.from({length:5},call));
    assert.equal(results.filter(r=>!r.duplicate).length,1);
    assert.equal(Number(results[0].charge),49.90);
    assert.equal(Number(await scalar(db,'select balance from profiles where id=$1',[user])),50.10);
    await assert.rejects(scalar(db,"select checkout_campaign_with_wallet(1,'ig-views','https://example.invalid',100,gen_random_uuid())"),/Unknown campaign service/);
    await assert.rejects(scalar(db,"select checkout_campaign_with_wallet(1,'fb-followers','https://example.invalid',1000,gen_random_uuid())"),/Insufficient campaign budget/);
    assert.equal(Number(await scalar(db,'select count(*) from orders')),1);
  }finally{await db.close();}
});

test('failed gateway reservation and stale admin updates leave financial records untouched',async()=>{
  const db=await fixture();try{
    const id=await order(db);
    await assert.rejects(scalar(db,'select admin_update_order_financial($1,$2,$3,$4)',[id,JSON.stringify({status:'cancelled'}),'pending','paid']),/changed during review/);
    assert.equal(await scalar(db,'select status from orders where id=$1',[id]),'processing');
    const tx=await scalar(db,"insert into transactions(user_id,amount,type,status,payment_method,provider_order_id,provider_payment_id) values($1,200,'credit','completed','upi','order_large','pay_large') returning id",[user]);
    await assert.rejects(scalar(db,'select request_wallet_gateway_refund($1)',[tx]),/Insufficient available wallet balance/);
    assert.equal(Number(await scalar(db,'select balance from profiles where id=$1',[user])),100);
    assert.equal(Number(await scalar(db,'select count(*) from gateway_refund_requests')),0);
  }finally{await db.close();}
});

test('manual order, receipt claim and split wallet debit commit together and retries are harmless',async()=>{
  const db=await fixture();try{
    await db.exec(`update profiles set balance=40.10 where id='${user}'; select set_config('request.jwt.claim.sub','${user}',false);`);
    const i=await scalar(db,"insert into checkout_intents(user_id,client_request_id,service_id,service_code,quantity,destination_link,total_paise) values($1,gen_random_uuid()::text,1,'facebook-followers',100,'https://example.invalid',7990) returning row_to_json(checkout_intents)",[user]);
    const submit=()=>scalar(db,"select submit_manual_checkout_atomic($1,$2,40.10,'UTR12345678','SR-TEST12345','upi')",[i.id,i.client_request_id]);
    await db.exec('set role authenticated');
    await assert.rejects(scalar(db,'select apply_wallet_to_manual_checkout($1,$2,40.10)',[i.id,i.client_request_id]),/permission denied/);
    const results=await Promise.all(Array.from({length:6},submit));
    assert.equal(results.filter(r=>!r.duplicate).length,1);
    const {order:o}=results[0];
    assert.equal(Number(await scalar(db,'select balance from profiles where id=$1',[user])),0);
    assert.equal(await scalar(db,'select order_id from checkout_intents where id=$1',[i.id]),o.id);
    assert.equal(Number(await scalar(db,'select count(*) from manual_order_payment_references')),1);
    await db.exec(`select set_config('request.jwt.claim.sub','${other}',false)`);
    assert.equal(Number(await scalar(db,'select count(*) from manual_order_payment_references')),0);
    await db.exec(`select set_config('request.jwt.claim.sub','${user}',false)`);
    await db.exec('reset role');
    assert.equal(await scalar(db,"select metadata->>'order_id' from transactions where provider_payment_id=$1",['wallet-split:'+i.id]),o.id);
    await assert.rejects(db.query("insert into transactions(user_id,amount,type,status,payment_method,provider_payment_id) values($1,10,'credit','pending','manual_upi','utr12345678')",[user]),/already submitted/);
    const second=await scalar(db,"insert into checkout_intents(user_id,client_request_id,service_id,service_code,quantity,destination_link,total_paise) values($1,gen_random_uuid()::text,1,'facebook-followers',100,'https://example.invalid',7990) returning row_to_json(checkout_intents)",[user]);
    await assert.rejects(scalar(db,"select submit_manual_checkout_atomic($1,$2,0,'utr12345678','SR-TEST12345','upi')",[second.id,second.client_request_id]),/already submitted/);
    assert.equal(Number(await scalar(db,'select count(*) from orders')),1);
    await db.exec(`select set_config('request.jwt.claim.sub','${admin}',false)`);
    await transition(db,o.id,'failed');
    assert.equal(Number(await scalar(db,'select balance from profiles where id=$1',[user])),40.10);
    await assert.rejects(transition(db,o.id,'processing'),/cannot be reopened/);
  }finally{await db.close();}
});

test('manual order insertion failure rolls back split debit, intent and receipt claim',async()=>{
  const db=await fixture();try{
    await db.exec(`update profiles set balance=40.10 where id='${user}'; select set_config('request.jwt.claim.sub','${user}',false);
      create function fail_manual_order() returns trigger language plpgsql as $$begin raise exception 'injected manual insert failure';end$$;
      create trigger fail_manual_order before insert on orders for each row execute function fail_manual_order();`);
    const i=await scalar(db,"insert into checkout_intents(user_id,client_request_id,service_id,service_code,quantity,destination_link,total_paise) values($1,gen_random_uuid()::text,1,'facebook-followers',100,'https://example.invalid',7990) returning row_to_json(checkout_intents)",[user]);
    await assert.rejects(scalar(db,"select submit_manual_checkout_atomic($1,$2,40.10,'UTR12345678','SR-TEST12345','upi')",[i.id,i.client_request_id]),/injected manual insert failure/);
    assert.equal(Number(await scalar(db,'select balance from profiles where id=$1',[user])),40.10);
    assert.equal(Number(await scalar(db,'select count(*) from transactions')),0);
    assert.equal(Number(await scalar(db,'select count(*) from manual_order_payment_references')),0);
    assert.equal(await scalar(db,'select status from checkout_intents where id=$1',[i.id]),'created');
  }finally{await db.close();}
});
