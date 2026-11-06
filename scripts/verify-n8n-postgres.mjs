import {readFile,writeFile,unlink} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {join} from 'node:path';
import {parseEnv} from 'node:util';
import ExcelJS from 'exceljs';
const docker=process.platform==='win32'?join(process.env.LOCALAPPDATA,'Programs/DockerDesktop/resources/bin/docker.exe'):'docker';
const run=(args,input)=>spawnSync(docker,args,{input,encoding:'utf8',windowsHide:true,maxBuffer:20*1024*1024});
const must=(args,input)=>{const r=run(args,input);if(r.status!==0)throw new Error('Local n8n/PostgreSQL verification operation failed');return r.stdout;};
const result=run(['exec','-e','N8N_RUNNERS_BROKER_PORT=5680','n8n-n8n-1','n8n','execute','--id=crook-demo-postgres-export','--rawOutput']);
await writeFile('artifacts/n8n-postgres-execute.log',result.stdout+result.stderr);
if(result.status!==0)throw new Error('Real PostgreSQL workflow failed; inspect private log');
let execution;for(let i=result.stdout.indexOf('{');i<result.stdout.length;i++){if(result.stdout[i]!=='{')continue;try{execution=JSON.parse(result.stdout.slice(i));break;}catch { /* Log prefixes may contain braces; try the next JSON candidate. */ }}
if(!execution?.finished||execution.status!=='success')throw new Error('No successful workflow result');
const runData=execution.data.resultData.runData;const rows=runData['Normalizar cuatro columnas'][0].data.main[0];
const binary=runData['Resultado manual binario'][0].data.main[0][0].binary.data;
if(!binary.id.startsWith('filesystem-v2:workflows/'))throw new Error('Unexpected artifact location');
must(['cp','n8n-n8n-1:/home/node/.n8n/storage/'+binary.id.slice('filesystem-v2:'.length),'artifacts/crook-postgres.xlsx']);
const book=new ExcelJS.Workbook();await book.xlsx.readFile('artifacts/crook-postgres.xlsx');const sheet=book.worksheets[0];
const columns=['usuario','cuota_pagada','fecha','monto_pagado'];
if(JSON.stringify(sheet.getRow(1).values.slice(1))!==JSON.stringify(columns)||sheet.rowCount!==rows.length+1)throw new Error('Column/row mismatch');
if(rows.length&&(typeof sheet.getCell('B2').value!=='number'||typeof sheet.getCell('D2').value!=='number'))throw new Error('Numeric types were lost');
const env=parseEnv(await readFile('.env.n8n.local','utf8'));
if(!env.N8N_PG_PASSWORD)throw new Error('Missing local read-only credential');
const count=must(['exec','-i','supabase_db_crook-demo','sh','-c','read -r PGPASSWORD; export PGPASSWORD; exec psql -h 127.0.0.1 -U crook_n8n_reader -d postgres -At -v ON_ERROR_STOP=1 -c "select count(*) from crook_export.paid_installments"'],env.N8N_PG_PASSWORD+'\n');
if(Number(count.trim())!==rows.length)throw new Error('Workbook differs from actual read-only PostgreSQL count');
const denied=run(['exec','-i','supabase_db_crook-demo','sh','-c','read -r PGPASSWORD; export PGPASSWORD; exec psql -h 127.0.0.1 -U crook_n8n_reader -d postgres -At -v ON_ERROR_STOP=1 -c "select count(*) from public.clients"'],env.N8N_PG_PASSWORD+'\n');
if(denied.status===0||!denied.stderr.includes('permission denied'))throw new Error('Export role can read unapproved source tables');
// Controlled connection failure uses a separate inactive workflow and separate credential.
const failureCredential=[{id:'crook-demo-postgres-unreachable',name:'Crook TEST unreachable PostgreSQL',type:'postgres',data:{host:'host.docker.internal',port:54999,database:'postgres',user:'crook_n8n_reader',password:env.N8N_PG_PASSWORD,ssl:'disable',connectionTimeoutMillis:2000}}];
const path='artifacts/n8n-failure-private.json';await writeFile(path,JSON.stringify(failureCredential),{mode:0o600});
try{must(['cp',path,'n8n-n8n-1:/tmp/crook-failure-private.json']);must(['exec','--user','root','n8n-n8n-1','chown','node:node','/tmp/crook-failure-private.json']);must(['exec','n8n-n8n-1','n8n','import:credentials','--input=/tmp/crook-failure-private.json']);}
finally{await unlink(path);must(['exec','--user','root','n8n-n8n-1','rm','-f','/tmp/crook-failure-private.json']);}
const failure=JSON.parse(await readFile('automation/n8n/workflow-postgres-demo.json','utf8'));failure.id='crook-demo-postgres-expected-failure';failure.name='Crook TEST — expected PostgreSQL connection failure';const query=failure.nodes.find(n=>n.type==='n8n-nodes-base.postgres');query.credentials.postgres={id:'crook-demo-postgres-unreachable',name:'Crook TEST unreachable PostgreSQL'};query.retryOnFail=false;await writeFile('artifacts/n8n-failure-workflow.json',JSON.stringify(failure));
must(['cp','artifacts/n8n-failure-workflow.json','n8n-n8n-1:/tmp/crook-failure-workflow.json']);must(['exec','n8n-n8n-1','n8n','import:workflow','--input=/tmp/crook-failure-workflow.json']);
const failed=run(['exec','-e','N8N_RUNNERS_BROKER_PORT=5680','n8n-n8n-1','n8n','execute','--id=crook-demo-postgres-expected-failure','--rawOutput']);await writeFile('artifacts/n8n-expected-failure.log',failed.stdout+failed.stderr);
if(failed.status===0)throw new Error('Expected connection failure unexpectedly succeeded');
const stored=must(['exec','n8n-n8n-1','node','-e',"const {DatabaseSync}=require('node:sqlite');const db=new DatabaseSync('/home/node/.n8n/database.sqlite',{readOnly:true});console.log(JSON.stringify(db.prepare('select status from execution_entity where workflowId=? order by id desc limit 1').get('crook-demo-postgres-expected-failure')));"]);
if(JSON.parse(stored).status!=='error')throw new Error('Expected failure was not durably recorded');
const report={status:'verified-real-postgresql-n8n-xlsx',rows:rows.length,columns,readOnlyPermissions:true,controlledFailureRecorded:true};await writeFile('artifacts/n8n-postgres-verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
