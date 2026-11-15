const test=require('node:test');
const assert=require('node:assert/strict');
const {NextRequest,NextResponse}=require('next/server');
const load=require('../helpers/isolated-module.cjs');
const privacy=load('lib/analytics/privacy.ts');
const authority=load('lib/analytics/consent-authority.ts',{'./privacy.ts':privacy});
const env={enabled:'true',deployment:'production',dataset:'production'};
const id=n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const req=(headers={})=>new NextRequest('https://www.getsocialrush.com/api/analytics',{method:'POST',headers:{origin:'https://www.getsocialrush.com','content-type':'application/json',...headers},body:'{}'});
function fixture(){const rows=new Map(),seen=new Set();let publicActivity=true;return {rows,seen,setPublic:v=>publicActivity=v,repo:{
 isPublicActivity:async()=>publicActivity,
 replace:async(old,row)=>{if(old&&rows.has(old))rows.get(old).choice='denied';rows.set(row.id,{...row});},
 revoke:async key=>{if(rows.has(key))rows.get(key).choice='denied';},
 read:async key=>rows.get(key)||null,
 consume:async(key,event,now,version)=>{const r=rows.get(key);if(!r||r.choice!=='granted'||r.version!==version||r.expiresAt<=now||seen.has(event))return false;seen.add(event);return true;},
}};}
test('deny by default, absent durable store, preview, QA and unknown environment',async()=>{
 for(const override of [{enabled:undefined},{enabled:'false'},{deployment:'preview'},{deployment:'development'},{deployment:undefined},{dataset:'synthetic'},{dataset:undefined}]){
  const f=fixture();const result=await authority.consentDecision(req(),'granted',undefined,f.repo,{...env,...override},1000,()=>id(1));assert.equal(result.choice,'denied');assert.equal(f.rows.size,0);
 }
 assert.equal((await authority.consentDecision(req(),'granted',undefined,null,env)).choice,'denied');
 for(const url of ['https://preview.vercel.app','https://qa.example.com','http://localhost:3107','https://www.getsocialrush.com.evil.invalid'])assert.equal(privacy.productionCollectionAllowed(url,env),false);
});
for(const headers of [{'dnt':'1'},{'sec-gpc':'1'}])test(`privacy choice ${JSON.stringify(headers)} denies grant/capture`,async()=>{
 const f=fixture();assert.equal((await authority.consentDecision(req(headers),'granted',undefined,f.repo,env,1000,()=>id(1))).choice,'denied');
 await authority.consentDecision(req(),'granted',undefined,f.repo,env,1000,()=>id(1));assert.equal(await authority.authorizeOptionalEvent(req(headers),id(1),id(2),f.repo,env,1001),false);
});
test('grant, concurrent replay, withdrawal and new grant do not revive old receipt',async()=>{
 const f=fixture();await authority.consentDecision(req(),'granted',undefined,f.repo,env,1000,()=>id(1));
 assert.deepEqual(await Promise.all([authority.authorizeOptionalEvent(req(),id(1),id(2),f.repo,env,1001),authority.authorizeOptionalEvent(req(),id(1),id(2),f.repo,env,1001)]),[true,false]);
 await authority.consentDecision(req(),'denied',id(1),f.repo,env,1002);assert.equal(await authority.authorizeOptionalEvent(req(),id(1),id(3),f.repo,env,1003),false);
 await authority.consentDecision(req(),'granted',id(1),f.repo,env,1004,()=>id(4));assert.equal(await authority.authorizeOptionalEvent(req(),id(1),id(5),f.repo,env,1005),false);assert.equal(await authority.authorizeOptionalEvent(req(),id(4),id(5),f.repo,env,1005),true);
});
test('expired or wrong policy consent, internal/synthetic/unknown classification deny',async()=>{
 const f=fixture();await authority.consentDecision(req(),'granted',undefined,f.repo,env,1000,()=>id(1));
 assert.equal(await authority.authorizeOptionalEvent(req(),id(1),id(2),f.repo,env,86_401_001),false);
 f.rows.get(id(1)).version=0;assert.equal(await authority.authorizeOptionalEvent(req(),id(1),id(2),f.repo,env,1001),false);f.rows.get(id(1)).version=1;
 for(const classification of [false,undefined]){f.setPublic(classification);assert.equal(await authority.authorizeOptionalEvent(req(),id(1),id(2),f.repo,env,1001),false);}
});
test('withdrawal while feature disabled revokes durable receipt before future reactivation',async()=>{
 const f=fixture();await authority.consentDecision(req(),'granted',undefined,f.repo,env,1000,()=>id(1));await authority.consentDecision(req(),'denied',id(1),f.repo,{...env,enabled:'false'},1001);
 assert.equal(await authority.authorizeOptionalEvent(req(),id(1),id(2),f.repo,env,1002),false);
});
test('withdrawal racing with authorization is checked atomically during consume',async()=>{
 const f=fixture();await authority.consentDecision(req(),'granted',undefined,f.repo,env,1000,()=>id(1));
 const original=f.repo.read;f.repo.read=async key=>{const row={...await original(key)};await f.repo.revoke(key);return row;};
 assert.equal(await authority.authorizeOptionalEvent(req(),id(1),id(2),f.repo,env,1001),false);
});
test('privacy sanitizer rejects destinations tokens credentials under allowed and unknown keys',()=>{
 const out=privacy.privateSafeMetadata({step:'https://instagram.com/private-destination',metric:'email@example.com',technical_reference:'secret',token:'auth-token',payment_reference:'utr-secret',landing_path:'/auth?access_token=secret',release:'secret',quantity:1000,total:99.5,currency:'INR',value:NaN});
 assert.deepEqual(JSON.parse(JSON.stringify(out)),{quantity:1000,total:99.5,currency:'INR'});
 assert.equal(privacy.analyticsPathBucket('/dashboard/orders/customer-token?jwt=secret'),'/other');
 assert.deepEqual(JSON.parse(JSON.stringify(privacy.coarseAttribution({source:'person@example.com',medium:'token',term:'password'}))),{source:'unknown',medium:'unknown'});
});
const security=load('lib/security/request.ts',{'server-only':{},'next/server':{NextResponse}});
function captureFixture({enabled=true,repository=null}={}){let db=0,writes=[];
 const route=load('app/api/analytics/route.ts',{
  '@/lib/analytics/collection-environment':{shouldIgnoreAnalyticsCollection:()=>false},'next/server':{NextResponse},'node:crypto':require('node:crypto'),
  '@/lib/supabase/admin':{createAdminClient:()=>{db++;return{from:()=>({insert:async args=>writes.push(args)})};}},
  '@/lib/analytics/events':{clientAnalyticsEvents:['page_viewed']},'@/lib/analytics/consent-authority':authority,
  '@/lib/analytics/consent-runtime':{consentRepository:()=>repository,consentEnvironment:()=>enabled?env:{}},'@/lib/analytics/privacy':privacy,
  '@/lib/smm-service-catalog':{activeSmmServices:[{code:'instagram-followers'}]},'@/lib/security/request':security,
 },{process:{env:{VERCEL_ENV:'production'}}});return{route,calls:()=>({db,writes})};}
test('real capture route rejects without activation or consent before DB/cookie allocation',async()=>{
 for(const args of [{enabled:false},{repository:null},{repository:fixture().repo}]){const f=captureFixture(args);const response=await f.route.POST(req());assert.equal(response.status,204);assert.equal(f.calls().db,0);assert.equal(response.cookies.getAll().length,0);}
});
test('real route records only a validated grant, sanitizes and rejects event replay',async()=>{
 const f=fixture();await authority.consentDecision(req(),'granted',undefined,f.repo,env,Date.now(),()=>id(1));const capture=captureFixture({repository:f.repo});
 const body={event:'page_viewed',eventId:id(2),pagePath:'/services/private-customer?token=secret',serviceCode:'person@example.com',metadata:{step:'secret',quantity:1000},attribution:{source:'email@example.com',campaign:'secret'}};
 const request=()=>new NextRequest('https://www.getsocialrush.com/api/analytics',{method:'POST',headers:{origin:'https://www.getsocialrush.com','content-type':'application/json',cookie:`sr_optional_consent=${id(1)}`},body:JSON.stringify(body)});
 await capture.route.POST(request());await capture.route.POST(request());assert.equal(capture.calls().writes.length,1);const row=capture.calls().writes[0];assert.equal(row.page_path,'/services');assert.equal(row.service_code,null);assert.equal(row.campaign,null);assert.ok(!JSON.stringify(row).includes('secret'));assert.equal(row.safe_metadata.quantity,1000);assert.equal(row.customer_id,null);assert.equal(row.event_id,'client:'+require('node:crypto').createHash('sha256').update(id(2)).digest('hex'));
});
test('default trusted writer stops before privileged DB client construction',async()=>{
 let calls=0;const server=load('lib/analytics/server.ts',{'server-only':{},'./consent-runtime':{authorizeTrustedAnalytics:async()=>null},'./privacy':privacy,'./collection-environment':{shouldIgnoreAnalyticsCollection:()=>false},'@/lib/supabase/admin':{createAdminClient:()=>{calls++;throw Error('Unexpected DB');}},'./events':{trustedAnalyticsEvents:['payment_completed']}},{process:{env:{VERCEL_ENV:'production'}}});
 await server.recordTrustedEvent({eventName:'payment_completed',customerId:'fixture',eventId:'fixture',pagePath:'/private'});assert.equal(calls,0);
});
test('browser honors explicit consent and GPC, and withdrawal clears only optional state',async()=>{
 const values=new Map([['sr_first_touch_attribution_v1','fixture'],['sr_analytics_pending_session_v1','fixture'],['operational_order_draft','keep']]);
 const window={location:{origin:'https://www.getsocialrush.com'},sessionStorage:{removeItem:k=>values.delete(k)}};
 const navigator={doNotTrack:'0',globalPrivacyControl:false};const document={cookie:'sr_optional_choice=granted.v1'};
 const browser=load('lib/analytics/browser-consent.ts',{'./privacy.ts':privacy},{window,navigator,document,process:{env:{NEXT_PUBLIC_OPTIONAL_ANALYTICS_ENABLED:'true',NEXT_PUBLIC_VERCEL_ENV:'production',NEXT_PUBLIC_ANALYTICS_DATASET:'production'}},fetch:async()=>({ok:true,json:async()=>({choice:'denied',confirmed:true})})});
 assert.equal(browser.browserAnalyticsAllowed(),true);navigator.globalPrivacyControl=true;assert.equal(browser.browserAnalyticsAllowed(),false);assert.equal(values.has('operational_order_draft'),true);
 navigator.globalPrivacyControl=false;const result=await browser.setOptionalAnalyticsChoice('denied');assert.equal(result.confirmed,true);assert.equal(browser.browserAnalyticsAllowed(),false);
});
test('consent endpoint denies cross-origin and does not falsely acknowledge failed revocation',async()=>{
 const f=fixture();const runtime={consentRepository:()=>f.repo,consentEnvironment:()=>env};
 const api=load('app/api/analytics/consent/route.ts',{'next/server':{NextResponse},'@/lib/analytics/consent-authority':{consentDecision:(...args)=>authority.consentDecision(...args,Date.now(),()=>id(1))},'@/lib/analytics/consent-runtime':runtime,'@/lib/analytics/privacy':privacy,'@/lib/security/request':security});
 const request=(choice,origin='https://www.getsocialrush.com')=>new NextRequest('https://www.getsocialrush.com/api/analytics/consent',{method:'POST',headers:{origin,'content-type':'application/json',cookie:`sr_optional_consent=${id(1)}`},body:JSON.stringify({choice})});
 assert.equal((await api.POST(request('granted','https://evil.invalid'))).status,403);
 const grant=await api.POST(request('granted'));assert.equal(grant.cookies.get('sr_optional_consent').httpOnly,true);assert.equal(grant.cookies.get('sr_optional_consent').secure,true);
 f.repo.revoke=async()=>{throw Error('synthetic durable failure');};const denial=await api.POST(request('denied'));assert.equal(denial.status,503);
});
test('auth telemetry does not initialize authentication without consent repository',async()=>{
 let auth=0;const route=load('app/api/analytics/auth-completed/route.ts',{'next/server':{NextResponse},'@/lib/analytics/consent-runtime':{consentRepository:()=>null,consentEnvironment:()=>env},'@/lib/analytics/privacy':privacy,'@/lib/supabase/server':{createClient:async()=>{auth++;throw Error('Unexpected auth');}},'@/lib/analytics/server':{recordTrustedEvent:async()=>{throw Error('Unexpected event');}},'@/lib/security/request':security});
 assert.equal((await route.POST(req())).status,204);assert.equal(auth,0);
});
test('consented trusted writer emits no raw customer order destination or campaign tokens',async()=>{
 let written;
 const admin={from:()=>({select:()=>({eq:()=>({not:()=>({order:()=>({limit:()=>({maybeSingle:async()=>({data:{source:'person@example.com',medium:'token',campaign:'secret',safe_metadata:{landing_path:'/auth?token=secret'}}})})})})})}),insert:async row=>{written=row;return{error:null};}})};
 const server=load('lib/analytics/server.ts',{'server-only':{},'./consent-runtime':{authorizeTrustedAnalytics:async()=>({eventId:'server:'+'a'.repeat(64),sessionId:id(1)})},'./privacy':privacy,'./collection-environment':{shouldIgnoreAnalyticsCollection:()=>false},'@/lib/supabase/admin':{createAdminClient:()=>admin},'./events':{trustedAnalyticsEvents:['payment_completed']}},{process:{env:{VERCEL_ENV:'production'}}});
 await server.recordTrustedEvent({eventName:'payment_completed',customerId:'raw-user',eventId:'raw-order',pagePath:'/dashboard/orders/raw-order',metadata:{order_id:'raw-order',destination:'https://example.com/private',token:'secret'}});
 assert.equal(written.customer_id,null);assert.equal(written.page_path,'/other');assert.ok(!/raw-user|raw-order|secret|example.com/.test(JSON.stringify(written)));assert.equal(written.event_id,'server:'+'a'.repeat(64));
});
