import test from "node:test";
import assert from "node:assert/strict";
import { prepareMeasurement, buildSequentialFunnel, type MeasurementContext } from "../../lib/intelligence/measurement-policy.ts";
import { buildProfitReport, costKinds, type ProfitInput, type LedgerEntry } from "../../lib/intelligence/profit-report.ts";

const uuid = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12,"0")}`;
const context: MeasurementContext = { dataset: "production", deployment: "production", origin: "https://www.getsocialrush.com", canonicalOrigin: "https://www.getsocialrush.com", consent: "granted", doNotTrack: false, globalPrivacyControl: false, internal: false, synthetic: false };
const event = (name = "page_viewed", n = 1) => ({ event: name, eventId: uuid(n), sessionId: uuid(99), occurredAt: `2026-11-01T00:00:${String(n).padStart(2,"0")}Z`, source: "client" as "client" | "committed_server" });
test("allow only approved categorical dimensions, never URLs/PII/free text", () => {
  const out = prepareMeasurement({ ...event(), dimensions: { page_template:"home", platform:"linkedin", channel:"person@example.com", url:"https://example.com/token", email:"a@b.com", quantity:1000, token:"secret", campaign:"free text" } },context);
  assert.equal(out.accepted,true);
  if(out.accepted) assert.deepEqual(out.event.dimensions,{page_template:"home",platform:"linkedin"});
  assert.ok(!JSON.stringify(out).includes("secret"));
});
for (const override of [
  { consent:"unknown" }, {consent:"denied"}, {doNotTrack:true}, {globalPrivacyControl:true}, {internal:true},
  {deployment:"preview"}, {deployment:"development"}, {synthetic:true}, {origin:"https://wrong.example"},
  {origin:"https://www.getsocialrush.com.evil.example"}, {origin:"https://www.getsocialrush.com/path"},
  {origin:"http://www.getsocialrush.com"}, {origin:"https://preview.vercel.app",canonicalOrigin:"https://preview.vercel.app"},
] as Partial<MeasurementContext>[]) test(`exclude ${JSON.stringify(override)}`,()=>assert.equal(prepareMeasurement(event(),{...context,...override}).accepted,false));
test("unknown privacy flags fail closed",()=>assert.equal(prepareMeasurement(event(),{...context,internal:undefined!}).accepted,false));
test("client cannot assert auth or paid outcomes; wallet deposits are not paid orders",()=>{
  for(const name of ["sign_up_completed","verified_order_paid","payment_completed","wallet_topup_completed","order_created"]) assert.equal(prepareMeasurement(event(name),context).accepted,false);
  assert.equal(prepareMeasurement({...event("verified_order_paid"),source:"committed_server"},context).accepted,true);
});
test("synthetic dataset cannot be silently relabeled production",()=>{
  const synthetic={...context,dataset:"synthetic" as const,synthetic:true,deployment:"development" as const};
  const out=prepareMeasurement(event(),synthetic);assert.equal(out.accepted,true);
  if(out.accepted)assert.equal(out.event.dataset,"synthetic");
  assert.equal(prepareMeasurement(event(),{...synthetic,dataset:"production"}).accepted,false);
});
test("sequential cohort deduplicates retries and excludes out-of-order outcomes",()=>{
  const names=["page_viewed","service_selected","service_viewed","order_details_completed","checkout_started","verified_order_paid"];
  const events=names.map((n,i)=>prepareMeasurement({...event(n,i+1),source:i===5?"committed_server":"client"},context)).map(r=>{assert.ok(r.accepted);return r.event;});
  assert.deepEqual(buildSequentialFunnel([...events,events[0]]).map(r=>r.sessions),[1,1,1,1,1,1]);
  assert.deepEqual(buildSequentialFunnel(events.slice(1)).map(r=>r.sessions),[0,0,0,0,0,0]);
  assert.throws(()=>buildSequentialFunnel([...events,{...events[0],occurredAt:"2026-11-01T01:00:00Z"}]),/Conflicting/);
  assert.throws(()=>buildSequentialFunnel([...events,{...events[0],eventId:uuid(50),dataset:"synthetic"}]),/mix/);
});
const entry=(id:string,kind:LedgerEntry["kind"],amountPaise:number,orderId?:string):LedgerEntry=>({id,kind,amountPaise,orderId,occurredAt:"2026-11-03T00:00:00Z",currency:"INR",dataset:"synthetic",verified:true,internal:false});
function fixture():ProfitInput{return {dataset:"synthetic",start:"2026-11-01T00:00:00+05:30",endExclusive:"2026-12-01T00:00:00+05:30",coverage:Object.fromEntries(["earned_revenue","refunds","customer_history",...costKinds].map(k=>[k,true])),orders:[{id:"s1",serviceCode:"synthetic-instagram",customerKey:"opaque-1",firstPaidAt:"2026-10-01T00:00:00Z"},{id:"s2",serviceCode:"synthetic-linkedin",customerKey:"opaque-2",firstPaidAt:"2026-11-03T00:00:00Z"}],entries:[entry("e1","earned_order",10000,"s1"),entry("e2","earned_order",20000,"s2"),entry("r1","refund",4000,"s1"),entry("c1","fulfillment",6000,"s1"),entry("f1","processing",500,"s1"),entry("m1","marketing",2000),entry("o1","operating",3000),entry("t1","income_tax",1000)]};}
test("earned ex-tax waterfall, exact paise, customer mix and service contribution",()=>{
  const r=buildProfitReport(fixture());assert.equal(r.netRevenuePaise,26000);assert.equal(r.netProfitPaise,13500);assert.equal(r.grossAovPaise,15000);
  assert.equal(r.customerMetrics.newCustomers,1);assert.equal(r.customerMetrics.returningCustomers,1);assert.equal(r.customerMetrics.blendedCacPaise,2000);assert.equal(r.customerMetrics.returningCustomerShare,0.5);
  assert.equal(r.services[0].directContributionPaise,-500);assert.equal(r.services[0].basis,"before_shared_costs_not_net_profit");
});
test("refund-only period and costs preserve losses, no AOV or fake customers",()=>{
  const f=fixture();f.entries=f.entries.filter(e=>e.kind!=="earned_order");const r=buildProfitReport(f);assert.equal(r.netRevenuePaise,-4000);assert.equal(r.netProfitPaise,-16500);assert.equal(r.grossAovPaise,null);assert.equal(r.customerMetrics.blendedCacPaise,null);
});
test("missing costs are not zero, but known remainder stays diagnostic",()=>{
  const f=fixture();f.coverage.fulfillment=false;const r=buildProfitReport(f);assert.equal(r.netProfitPaise,null);assert.equal(r.knownRemainderPaise,13500);assert.ok(r.missingInputs.includes("fulfillment"));assert.equal(r.services[0].directContributionPaise,null);
});
test("unverified costs override contradictory upstream completeness",()=>{
  const f=fixture();f.entries.push({...entry("pending-fee","processing",900),verified:false});
  const r=buildProfitReport(f);assert.equal(r.netProfitPaise,null);assert.ok(r.missingInputs.includes("processing"));assert.equal(r.services[0].directContributionPaise,null);
});
test("missing revenue and refund coverage blocks profit and comparable ratios",()=>{
  const f=fixture();f.coverage.earned_revenue=false;f.coverage.refunds=false;const r=buildProfitReport(f);assert.equal(r.netProfitPaise,null);assert.equal(r.grossAovPaise,null);assert.equal(r.customerMetrics.newCustomers,null);
});
test("late refund belongs to its occurrence period and historical service",()=>{
  const f=fixture();f.entries=[{...entry("late","refund",25000,"s1"),occurredAt:"2026-11-30T18:29:59Z"},{...entry("next","refund",10000,"s1"),occurredAt:"2026-11-30T18:30:00Z"}];const r=buildProfitReport(f);assert.equal(r.netRevenuePaise,-25000);assert.equal(r.services[0].refundsPaise,25000);
});
test("retry IDs deduplicate, conflicts and duplicate earned orders fail",()=>{
  const f=fixture();f.entries.push({...f.entries[0]});assert.equal(buildProfitReport(f).paidOrders,2);
  f.entries.push({...f.entries[0],amountPaise:1});assert.throws(()=>buildProfitReport(f),/Conflicting/);
  f.entries.pop();f.entries.push({...f.entries[0],id:"different-payment"});assert.throws(()=>buildProfitReport(f),/Multiple earned/);
});
test("unverified internal and wrong-dataset entries never become revenue",()=>{
  const f=fixture();f.entries.push({...entry("prod","earned_order",99999999,"s1"),dataset:"production"},{...entry("unverified","earned_order",99999999,"s1"),verified:false},{...entry("internal","earned_order",99999999,"s1"),internal:true});const r=buildProfitReport(f);assert.equal(r.netProfitPaise,13500);assert.equal(r.excludedEntries,3);
});
test("invalid amounts currencies wallet deposits and orphan refunds fail",()=>{
  for(const change of [{amountPaise:-1},{amountPaise:0.1},{amountPaise:NaN},{currency:"USD"},{kind:"wallet_topup"},{orderId:"unknown"}] ){
    const f=fixture();Object.assign(f.entries[0],change);assert.throws(()=>buildProfitReport(f));
  }
});
test("unallocated direct costs withhold service ranking but not period total",()=>{
  const f=fixture();f.entries.push(entry("cost","processing",100));const r=buildProfitReport(f);assert.equal(r.netProfitPaise,13400);assert.equal(r.services[0].directContributionPaise,null);assert.equal(r.unallocatedDirectCostPaise,100);
});
test("unknown customer history withholds retention and CAC",()=>{
  const f=fixture();f.coverage.customer_history=false;const r=buildProfitReport(f);assert.equal(r.customerMetrics.returningCustomerShare,null);assert.equal(r.customerMetrics.blendedCacPaise,null);
});
test("date offsets and overflow validated",()=>{
  const f=fixture();f.start="2026-11-01";assert.throws(()=>buildProfitReport(f),/offset/);
  const g=fixture();g.entries=[entry("max","marketing",Number.MAX_SAFE_INTEGER),entry("overflow","marketing",1)];assert.throws(()=>buildProfitReport(g),/overflow/);
  const h=fixture();h.entries=[entry("big-sale","earned_order",Number.MAX_SAFE_INTEGER,"s2"),entry("big-refund","refund",Number.MAX_SAFE_INTEGER,"s1"),entry("big-cost","fulfillment",Number.MAX_SAFE_INTEGER,"s1")];assert.throws(()=>buildProfitReport(h),/overflow/);
});
