const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),cp=require('node:child_process');
test('synthetic launcher never loads ambient Next dotenv payment/backend values',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'phase4-env-fixture-'));
 try{fs.writeFileSync(path.join(dir,'.env.production'),'NEXT_PUBLIC_UPI_ID=synthetic-sentinel\nDATABASE_URL=synthetic-sentinel\n');
  const result=cp.execFileSync(process.execPath,['--require',path.resolve('scripts/phase4-no-dotenv.cjs'),'-e',`const result=require('@next/env').loadEnvConfig(${JSON.stringify(dir)},false,console,true);if(process.env.NEXT_PUBLIC_UPI_ID||process.env.DATABASE_URL||result.loadedEnvFiles.length)process.exit(1);`],{cwd:process.cwd(),env:{PATH:process.env.PATH}});
  assert.equal(result.length,0);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
