import {spawn} from 'node:child_process';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve,delimiter} from 'node:path';
import {changedFiles,planChecks} from './affected-plan.mjs';

const args=process.argv.slice(2),options={},explicit=[];
for(let i=0;i<args.length;i++){
  const arg=args[i];
  if(['--base','--report'].includes(arg)){if(!args[i+1]||args[i+1].startsWith('--'))throw Error(arg+' needs a value');options[arg.slice(2)]=args[++i];}
  else if(arg==='--files'){let count=0;while(args[i+1]&&!args[i+1].startsWith('--')){explicit.push(args[++i]);count++;}if(!count)throw Error('--files needs repository paths');}
  else if(['--plan','--unit','--static'].includes(arg))options[arg.slice(2)]=true;
  else throw Error('Unknown argument '+arg);
}
if(options.unit&&options.static)throw Error('Choose --unit or --static');
// A JSON response file keeps a large, explicit scope usable on Windows without
// switching to all dirty files or exceeding the shell command-line limit.
const scoped=[];
for(const file of explicit){if(file.startsWith('@')){const paths=JSON.parse(await readFile(file.slice(1),'utf8'));if(!Array.isArray(paths)||paths.some(path=>typeof path!=='string'||!path||path.startsWith('@')))throw Error('Invalid file scope response file');scoped.push(...paths);}else scoped.push(file);}
const plan=await planChecks(explicit.length?scoped:changedFiles({base:options.base}),{unitOnly:options.unit,staticOnly:options.static});
console.log(`${plan.mode}: ${plan.files.length} changed files; ${plan.checks.length} selected checks.`);
for(const check of plan.checks)console.log(`  ${check.id}\n    because: ${check.reasons.slice(0,3).join(', ')}${check.reasons.length>3?` (+${check.reasons.length-3}; see JSON report)`:''}`);
if(plan.unknown.length){console.error('Unmapped changes: add an owner in scripts/test-map.mjs or affected-plan.mjs before verification.\n'+plan.unknown.join('\n'));process.exitCode=1;}
const results=[];
if(!options.plan&&!plan.unknown.length){
  const env={...process.env,NODE_PATH:[resolve('test-tools/node_modules'),process.env.NODE_PATH].filter(Boolean).join(delimiter)};
  for(const check of plan.checks){
    const start=Date.now();console.log('\nRUN '+check.id);
    const code=await new Promise(done=>{
      const [command,...args]=check.command,child=spawn(command==='node'?process.execPath:command,args,{env,stdio:'inherit'});
      let timedOut=false;const timer=setTimeout(()=>{timedOut=true;child.kill('SIGTERM');},300000);
      child.once('error',error=>{clearTimeout(timer);console.error(error.message);done(1);});
      child.once('exit',code=>{clearTimeout(timer);done(timedOut?124:code??1);});
    });
    results.push({id:check.id,exit_code:code,duration_ms:Date.now()-start});
    if(code){process.exitCode=1;console.error('FAIL '+check.id+'; stop here, repair and rerun the affected checks.');break;}
  }
  console.log(`${results.filter(row=>!row.exit_code).length}/${plan.checks.length} selected checks passed${results.length<plan.checks.length?' (remaining checks not run)':''}.`);
}
if(options.report)await writeFile(options.report,JSON.stringify({run_at:new Date().toISOString(),...plan,
  executed:!options.plan,passed:options.plan?null:!plan.unknown.length&&results.length===plan.checks.length&&results.every(row=>row.exit_code===0),results},null,2)+'\n');
