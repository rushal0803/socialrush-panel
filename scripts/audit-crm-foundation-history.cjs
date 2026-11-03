// Read-only source audit. No database/network access; no blob bodies are printed.
const {spawn,spawnSync}=require('node:child_process');
const fs=require('node:fs');
const path=require('node:path');
function git(args){const p=spawnSync('git',args,{encoding:'utf8',maxBuffer:64*1024*1024});if(p.status)throw Error(p.stderr);return p.stdout;}
const objects=git(['rev-list','--objects','--all']).trim().split('\n');
const candidates=new Map();
for(const line of objects){const space=line.indexOf(' ');if(space<0)continue;candidates.set(line.slice(0,space),line.slice(space+1));}
const report={head:git(['rev-parse','HEAD']).trim(),reachableCommits:Number(git(['rev-list','--all','--count']).trim()),
  refs:git(['for-each-ref','--format=%(refname) %(objectname)','refs/heads','refs/remotes','refs/tags']).trim().split('\n'),
  candidateBlobs:candidates.size,scannedBlobs:0,definitionCandidates:[],referenceBlobs:0,
  scope:'All path-bearing blobs across locally reachable refs, including docs/deleted historical files; excludes compressed archive internals, unreachable/unadvertised GitHub objects and inaccessible repositories'};
const definition=/\bcreate\s+(?:unlogged\s+)?table\s+(?:if\s+not\s+exists\s+)?(?:(?:"?public"?)\s*\.\s*)?"?crm_lead(?:s|_contacts)"?(?:\s|\()/i;
const child=spawn('git',['cat-file','--batch'],{stdio:['pipe','pipe','inherit']});
let buffer=Buffer.alloc(0),pending=null;
child.stdout.on('data',chunk=>{buffer=Buffer.concat([buffer,chunk]);while(true){
  if(!pending){const e=buffer.indexOf(10);if(e<0)break;const header=buffer.subarray(0,e).toString().trim().split(' ');buffer=buffer.subarray(e+1);if(header.length!==3)throw Error('Unexpected git batch header');pending={sha:header[0],type:header[1],size:Number(header[2])};}
  if(buffer.length<pending.size+1)break;
  if(pending.type==='blob'){const text=buffer.subarray(0,pending.size).toString('utf8');report.scannedBlobs++;
    if(/crm_leads|crm_lead_contacts/i.test(text))report.referenceBlobs++;
    if(definition.test(text)||definition.test(text.replace(/\\n/g,'\n')))
      report.definitionCandidates.push({blob:pending.sha,path:candidates.get(pending.sha)});
  }
  buffer=buffer.subarray(pending.size+1);pending=null;
}});
child.on('close',code=>{if(code||pending||buffer.length)throw Error('Incomplete git scan');
  const out=path.resolve('artifacts/crm-foundation-source-audit.json');fs.mkdirSync(path.dirname(out),{recursive:true});
  fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({...report,refs:report.refs.length},null,2));
});
child.stdin.end([...candidates.keys()].join('\n')+'\n');
