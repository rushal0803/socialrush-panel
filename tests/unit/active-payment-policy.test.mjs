import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
const require=createRequire(import.meta.url);
const ts=require('typescript');

for(const providerPath of ['razorpay/refund','cashfree/order']){
  test(`retired ${providerPath} returns 410 without loading financial dependencies`,async()=>{
    const source=readFileSync(`app/api/payments/${providerPath}/route.ts`,'utf8');
    const output=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
    const exports={};
    runInNewContext(output,{exports,require(name){assert.equal(name,'next/server','Retirement handler must have no database/provider dependency');return require(name);}});
    const result=await exports.POST();
    assert.equal(result.status,410);
    assert.equal(result.headers.get('cache-control'),'no-store');
    assert.match((await result.json()).error,/retired/);
  });
}

test('legacy-named checkout adapter still routes to manual UPI, never provider orders',()=>{
  const source=readFileSync('app/api/checkout/cashfree/order/route.ts','utf8');
  assert.match(source,/DIRECT_UPI_PREFIX/);
  assert.match(source,/\/dashboard\/direct-upi/);
  assert.doesNotMatch(source,/cashfreeRequest|razorpayRequest/);
});

test('manual adapter preserves server quote and rejects invalid owner/state/service/amount',async()=>{
  const {NextRequest}=require('next/server');
  const id='11111111-1111-4111-8111-111111111111';
  const source=readFileSync('app/api/checkout/cashfree/order/route.ts','utf8');
  const output=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
  async function request({intentPatch={},servicePatch={},balance=0,profileMissing=false,profileError=false}={}){
    const intent={id,user_id:id,service_id:1,service_code:'facebook-followers',quantity:100,total_paise:7990,currency:'INR',status:'created',expires_at:new Date(Date.now()+60000).toISOString(),...intentPatch};
    const rows={checkout_intents:intent,services:{id:1,rate:99999,min:100,max:1000,status:'active',is_active:true,accepts_new_orders:true,health_status:'stable',...servicePatch},profiles:profileMissing?null:{balance}};
    const exports={};
    runInNewContext(output,{exports,URL,require(name){
      if(name==='next/server')return require(name);
      if(name==='@/lib/supabase/server')return {createClient:async()=>({auth:{getUser:async()=>({data:{user:{id}}})}})};
      if(name==='@/lib/supabase/admin')return {createAdminClient:()=>({from(table){assert.ok(table in rows);return{select(){return this;},eq(){return this;},maybeSingle:async()=>({data:rows[table],error:table==='profiles'&&profileError?{message:'fixture failure'}:null})};}})};
      if(name==='@/lib/security/request')return {requireJson:()=>null,requireSameOrigin:()=>null,rateLimit:()=>null,isUuid:x=>x===id};
      if(name==='@/lib/service-pricing')return {validateQuantity:(q,limits)=>Number.isInteger(q)&&q>=limits.minQuantity&&q<=limits.maxQuantity?null:'Invalid quantity'};
      throw Error('Unexpected/provider dependency: '+name);
    }});
    return exports.POST(new NextRequest('http://localhost/api/checkout/cashfree/order',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({intentId:id,amount:1})}));
  }
  const accepted=await request();
  assert.equal(accepted.status,201);
  const data=(await accepted.json()).data;
  assert.equal(data.amountPaise,7990,'Ignore supplied total and unrelated current rate');
  assert.match(data.returnUrl,/\/dashboard\/direct-upi\?intent=/);
  for(const intentPatch of [{currency:'USD'},{status:'completed'},{expires_at:'2000-01-01T00:00:00Z'},{quantity:99},{total_paise:0},{total_paise:1.5},{total_paise:Number.MAX_SAFE_INTEGER+1}]){
    assert.equal((await request({intentPatch})).status,409);
  }
  assert.equal((await request({intentPatch:{user_id:'other-customer'}})).status,404);
  for(const servicePatch of [{status:'inactive'},{is_active:false},{accepts_new_orders:false},{health_status:'paused'}])assert.equal((await request({servicePatch})).status,409);
  assert.equal((await request({balance:100})).status,409,'Fully wallet-funded order stays on wallet flow');
  for(const invalid of [{balance:'NaN'},{balance:-1},{profileMissing:true},{profileError:true}])assert.equal((await request(invalid)).status,503,'Unknown wallet balance must not become zero');
});
