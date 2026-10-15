// Local-only, read-only dashboard lab. Start through the existing fixture backend.
const { chromium } = require('@playwright/test');
const { loadEnvConfig } = require('@next/env');
const fs = require('node:fs');
loadEnvConfig(process.cwd());
const base = 'http://localhost:3001';
const routes = ['/dashboard', '/dashboard/new-order', '/dashboard/orders', '/dashboard/wallet', '/dashboard/billing', '/dashboard/packages'];
const stage = process.env.DASHBOARD_BENCH_STAGE || 'before';
const fixtures = require('../tests/fixtures/dashboard-workspace.json');
async function main() {
  process.env.DASHBOARD_UPGRADE_AUDIT = '1';
  const stop = await require('./playwright-server-setup.cjs')();
  const browser = await chromium.launch();
  const samples = [];
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce', serviceWorkers: 'block' });
    const origin = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin;
    const key = `sb-${new URL(origin).hostname.split('.')[0]}-auth-token`;
    const user = { id: '11111111-1111-4111-8111-111111111111', email: 'qa@example.invalid', role: 'authenticated', app_metadata: {}, user_metadata: {}, aud: 'authenticated', created_at: '2026-01-01T00:00:00Z' };
    const encode = x => Buffer.from(JSON.stringify(x)).toString('base64url');
    const exp = Math.floor(Date.now()/1000)+3600;
    const session = { access_token: `${encode({alg:'HS256',typ:'JWT'})}.${encode({sub:user.id,role:'authenticated',aud:'authenticated',exp})}.dGVzdA`, refresh_token:'fixture', expires_at:exp, expires_in:3600, token_type:'bearer', user };
    await context.addCookies([{name:key,value:`base64-${encode(session)}`,url:base}]);
    await context.addInitScript(({key,session}) => {
      localStorage.setItem(key,JSON.stringify(session));
      Object.defineProperty(navigator,'doNotTrack',{get:()=> '1'});
      window.__lab = { cls:0, lcp:null };
      new PerformanceObserver(list => {for(const e of list.getEntries()) if(!e.hadRecentInput) window.__lab.cls += e.value;}).observe({type:'layout-shift',buffered:true});
      new PerformanceObserver(list => {for(const e of list.getEntries()) window.__lab.lcp=e.startTime;}).observe({type:'largest-contentful-paint',buffered:true});
    },{key,session});
    await context.route(`${origin}/**`, route => {
      const req=route.request();
      const headers={'Access-Control-Allow-Origin':base,'Access-Control-Allow-Headers':'*','Access-Control-Allow-Methods':'GET,OPTIONS'};
      if(req.method()==='OPTIONS') return route.fulfill({status:204,headers});
      if(req.method()!=='GET') return route.fulfill({status:403,json:{message:'Writes disabled'},headers});
      const url=new URL(req.url()); const table=url.pathname.split('/').pop();
      const json=url.pathname.includes('/auth/')?user:table==='profiles'?{...user,full_name:'Performance QA',balance:100000,is_blocked:false}:table==='services'?require('../tests/fixtures/packages-catalog.json'):fixtures[table]||[];
      return route.fulfill({json,headers});
    });
    await context.routeWebSocket(/\/realtime\/v1\/websocket/, socket => socket.onMessage(message => {try {const [join,ref,topic]=JSON.parse(String(message));socket.send(JSON.stringify([join,ref,topic,'phx_reply',{status:'ok',response:{}}]));}catch{}}));
    const page=await context.newPage();
    const cdp=await context.newCDPSession(page);
    await cdp.send('Page.setBypassCSP',{enabled:true});
    await cdp.send('Network.enable');
    const errors=[]; page.on('pageerror',e=>errors.push(e.message));
    fs.mkdirSync(`artifacts/dashboard-navigation/${stage}`,{recursive:true});
    await context.tracing.start({screenshots:true,snapshots:true});
    for(const route of routes) {
      const response=await page.goto(base+route,{waitUntil:'load'});
      if(response.status()!==200 || new URL(page.url()).pathname!==route) throw Error(`Invalid authenticated sample: ${route} ${page.url()}`);
      await page.locator('#dashboard-main-content h1').first().waitFor();
      await page.waitForTimeout(1000);
      const data=await page.evaluate(()=>({ ...window.__lab, ttfb:performance.getEntriesByType('navigation')[0].responseStart, jsBytes:performance.getEntriesByType('resource').filter(r=>/\.js(?:\?|$)/.test(r.name)).reduce((n,r)=>n+r.transferSize,0), requests:performance.getEntriesByType('resource').map(r=>({url:new URL(r.name).pathname,ms:r.duration,bytes:r.transferSize})), domNodes:document.querySelectorAll('*').length, hiddenFundingNodes:document.querySelector('#add-funds')?.querySelectorAll('*').length||0 }));
      samples.push({kind:'document',route,...data});
      await page.screenshot({path:`artifacts/dashboard-navigation/${stage}/${route.split('/').pop()}-1440.png`});
    }
    for(let run=0;run<5;run++) for(const route of routes) {
      if(new URL(page.url()).pathname===route) continue;
      const link=page.locator(`aside a[href="${route}"]`).first();
      await link.scrollIntoViewIfNeeded();
      await page.evaluate(()=>window.__sameDocument=true);
      const start=performance.now(); await link.click();
      await page.waitForURL(base+route);
      await page.locator('#dashboard-main-content h1').first().waitFor();
      await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
      if(!await page.evaluate(()=>window.__sameDocument)) throw Error('Unexpected full document navigation');
      samples.push({kind:'transition',run,route,ms:performance.now()-start});
    }
    await context.tracing.stop({path:`artifacts/dashboard-navigation/${stage}/trace.zip`});
    const quantile=xs=>xs.sort((a,b)=>a-b)[Math.ceil(xs.length*.75)-1];
    const transitions=routes.map(route=>({route,p75:quantile(samples.filter(x=>x.kind==='transition'&&x.route===route).map(x=>x.ms))}));
    fs.writeFileSync(`artifacts/dashboard-navigation/${stage}/results.json`,JSON.stringify({profile:'Production localhost, Chromium 1440x900, reduced motion, no throttling, synthetic read-only Supabase transport; 5 repeat clicks/route. Not field CWV/INP or live database latency.',errors,transitions,samples},null,2));
    console.log(JSON.stringify({stage,errors,transitions}));
    await context.close();
  } finally {await browser.close();await stop();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
