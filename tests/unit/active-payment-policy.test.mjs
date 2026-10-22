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
