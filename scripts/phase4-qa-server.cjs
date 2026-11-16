// Own a synthetic loopback-only server for local/CI audits. Never deploys.
const fs=require('node:fs'),path=require('node:path'),{spawn}=require('node:child_process');
const action=process.argv[2],port=Number(process.argv[3]||3001);
if(!['start','stop'].includes(action)||!Number.isInteger(port)||port<1024||port>65535)throw Error('Use start|stop with an unprivileged loopback port');
const root=path.resolve('artifacts/phase4');fs.mkdirSync(root,{recursive:true});const pidFile=path.join(root,`server-${port}.pid`);
(async()=>{
 if(action==='stop'){
  if(!fs.existsSync(pidFile))return;const pid=Number(fs.readFileSync(pidFile,'utf8'));if(!Number.isInteger(pid)||pid<2)throw Error('Invalid owned PID');
  try{process.kill(-pid,'SIGTERM');}catch(error){if(error.code!=='ESRCH')throw error;}fs.rmSync(pidFile);return;
 }
 const url=`http://127.0.0.1:${port}`;
 try{await fetch(url,{redirect:'manual',signal:AbortSignal.timeout(1000)});throw Error('Loopback port already occupied');}catch(error){if(error.message==='Loopback port already occupied')throw error;}
 const fd=fs.openSync(path.join(root,`server-${port}.log`),'w');
 const child=spawn(process.execPath,[path.resolve('scripts/phase2-isolated.cjs'),'serve',String(port)],{detached:true,stdio:['ignore',fd,fd],env:{PATH:process.env.PATH,...Object.fromEntries(['RESPONSIVE_PAYMENT_FIXTURE','DASHBOARD_UPGRADE_AUDIT'].filter(name=>process.env[name]==='1').map(name=>[name,'1']))}});
 fs.closeSync(fd);fs.writeFileSync(pidFile,String(child.pid));child.unref();
 const deadline=Date.now()+60000;
 while(Date.now()<deadline){try{const response=await fetch(url,{redirect:'manual',signal:AbortSignal.timeout(3000)});if(response.status>=200&&response.status<400){console.log('Synthetic loopback server ready on port '+port);return;}}catch{}await new Promise(r=>setTimeout(r,200));}
 try{process.kill(-child.pid,'SIGTERM');}catch{}throw Error('Synthetic server readiness timeout');
})().catch(error=>{console.error(error.message);process.exitCode=1;});
