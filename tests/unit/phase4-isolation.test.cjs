const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),cp=require('node:child_process');
test('synthetic launcher never loads ambient Next dotenv payment/backend values',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'phase4-env-fixture-'));
 try{fs.writeFileSync(path.join(dir,'.env.production'),'NEXT_PUBLIC_UPI_ID=synthetic-sentinel\nDATABASE_URL=synthetic-sentinel\n');
  const result=cp.execFileSync(process.execPath,['--require',path.resolve('scripts/phase4-no-dotenv.cjs'),'-e',`const result=require('@next/env').loadEnvConfig(${JSON.stringify(dir)},false,console,true);if(process.env.NEXT_PUBLIC_UPI_ID||process.env.DATABASE_URL||result.loadedEnvFiles.length)process.exit(1);`],{cwd:process.cwd(),env:{PATH:process.env.PATH}});
  assert.equal(result.length,0);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('isolated server retains only explicit read-only fixture modes and drops inherited secrets',()=>{
 const probe=`const cp=require('node:child_process'),{EventEmitter}=require('node:events');cp.spawn=(exe,args,options)=>{console.log(JSON.stringify(options.env));const child=new EventEmitter();child.kill=()=>{};return child;};process.argv=['node','launcher','serve','3108'];require('./scripts/phase2-isolated.cjs');`;
 const result=JSON.parse(cp.execFileSync(process.execPath,['-e',probe],{cwd:process.cwd(),env:{PATH:process.env.PATH,RESPONSIVE_PAYMENT_FIXTURE:'1',DASHBOARD_UPGRADE_AUDIT:'1',SUPABASE_SERVICE_ROLE_KEY:'must-not-propagate',RESEND_API_KEY:'must-not-propagate',DATABASE_URL:'must-not-propagate',OPTIONAL_ANALYTICS_ENABLED:'true'}}).toString());
 assert.equal(result.DASHBOARD_UPGRADE_AUDIT,'1');assert.equal(result.RESPONSIVE_PAYMENT_FIXTURE,'1');
 assert.equal(result.SUPABASE_SERVICE_ROLE_KEY,'synthetic-service');assert.equal(result.RESEND_API_KEY,undefined);assert.equal(result.DATABASE_URL,undefined);assert.equal(result.OPTIONAL_ANALYTICS_ENABLED,undefined);
});
