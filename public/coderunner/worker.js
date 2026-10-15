// Fresh dedicated Worker per run. User JavaScript runs ONLY inside QuickJS.
// Trusted runtime loading finishes before exposed worker capabilities are removed.
const send=postMessage.bind(self),listen=addEventListener.bind(self),delay=setTimeout.bind(self),sleep=ms=>new Promise(r=>delay(r,ms));
const base=new URL('../vendor/coderunner/',self.location.href).href;
let language,engine,stepper,paused=false,ended=false,steps=0,output='',stderr='',locationRange=null,workingCode='',state={},running=false,elapsed=0;
const OUTPUT_LIMIT=262144,STEP_LIMIT=2000000,encoder=new TextEncoder();let outputBytes=0,lastFlush=0;
function append(text,isError=false){text=String(text);outputBytes+=encoder.encode(text).length;if(outputBytes>OUTPUT_LIMIT)throw Error('输出超过 256 KB，已停止。');if(isError)stderr+=text;else output+=text;if(performance.now()-lastFlush>250){lastFlush=performance.now();send({kind:'progress',output,stderr,steps,elapsed:Math.round(elapsed)});}}
function harden(){
 // Remove inherited entry points too; an own-property shadow alone is insufficient.
 // Block host code generation, including constructor-chain and string-timer paths.
 // Python's FFI is deliberately unavailable; JS execution belongs in QuickJS.
 const blockedFunction=new Proxy(Function,{apply(){throw Error('此运行环境不开放 JavaScript 动态执行。');},construct(){throw Error('此运行环境不开放 JavaScript 动态执行。');}});
 for(const fn of [function(){},async function(){},function*(){},async function*(){}]){
  Object.defineProperty(Object.getPrototypeOf(fn),'constructor',{value:undefined,writable:false,configurable:false});
 }
 Object.defineProperty(self,'Function',{value:blockedFunction,writable:false,configurable:false});
 const denied=['fetch','XMLHttpRequest','WebSocket','WebTransport','EventSource','Worker','SharedWorker','importScripts','indexedDB','caches','navigator','BroadcastChannel','RTCPeerConnection','eval','setTimeout','setInterval','postMessage'];
 for(const key of denied){for(let obj=self;obj;obj=Object.getPrototypeOf(obj)){const d=Object.getOwnPropertyDescriptor(obj,key);if(d?.configurable)try{delete obj[key];}catch{}}
  try{Object.defineProperty(self,key,{value:undefined,writable:false,configurable:false});}catch{}
 }
}
function snapshot(kind='progress'){
 let view={};
 if(language==='brainfuck'||language==='ook'){const pointer=state.pointer||0;view={pointer,cells:Array.from({length:17},(_,i)=>{const n=Math.max(0,pointer-8)+i;return [n,state.tape?.[n]||0];})};}
 else if(language==='befunge')view={stack:state.stack?.slice(-40)||[],direction:state.direction,strMode:state.strMode,grid:workingCode};
 else if(language==='deadfish')view={value:state.value};
 else if(language==='whitespace')view={stack:engine.state.stack.slice(-40),heap:Object.entries(engine.state.heap).slice(0,40),pc:engine.state.progCount};
 else if(language==='malbolge')view={a:engine.a,c:engine.c,d:engine.d,memory:engine.mem.slice(Math.max(0,engine.d-4),Math.max(0,engine.d-4)+9)};
 send({kind,output,stderr,steps,range:locationRange,state:view,elapsed:Math.round(elapsed)});
}
function fail(e){ended=true;send({kind:'error',output,stderr,error:String(e?.message||e).slice(0,8000),range:e?.range||null,steps});}
function check(){if(steps>=STEP_LIMIT)throw Error('超过 2,000,000 步，已停止。');if(elapsed>10000)throw Error('执行超过 10 秒，已停止。');if(state.stack?.length>100000||engine?._stack?.length>100000)throw Error('栈超过 100,000 项，已停止。');if((state.pointer||0)>100000)throw Error('内存带超过 100,000 格，已停止。');}
async function tick(){const t=performance.now();await stepper();steps++;elapsed+=performance.now()-t;check();}
async function run(){if(running||ended)return;running=true;paused=false;send({kind:'running'});try{while(!paused&&!ended){for(let n=0;n<1000&&!paused&&!ended;n++)await tick();snapshot(ended?'done':'progress');if(!ended)await sleep(0);}if(paused&&!ended)snapshot('paused');}catch(e){fail(e);}finally{running=false;}}
async function prepareEsoteric(code,input){
 const mod=await import(base+'esoteric.js');
 if(['brainfuck','ook','befunge','deadfish'].includes(language)){
  const ctor=language==='befunge'?mod.Befunge:language==='deadfish'?mod.Deadfish:mod.Brainfuck;
  engine=new ctor();engine.prepare(code,input);workingCode=code;
  const accept=r=>{if(r.output!==undefined)append(r.output);state=r.rendererState;locationRange=r.nextStepLocation;if(language==='befunge')workingCode=engine._ast.join('\n');ended=!locationRange;};
  accept(engine.executeStep()); // Upstream first step prepares the instruction pointer only.
  stepper=()=>accept(engine.executeStep());
 }else if(language==='malbolge'){
  const mb=mod.malbolge;engine=mb.load(code);let index=0;
  stepper=()=>{let r;try{r=mb.step(engine);}catch(e){if(e!==mb.WANTS_INPUT)throw e;r=mb.step(engine,index<input.length?input.charCodeAt(index++):59048);}if(r===mb.EXIT)ended=true;else if(r!==null&&r!==undefined)append(String.fromCharCode(r));};
 }else{
  const ws=mod.whitespace;let index=0;
  const prog=ws.inst.compile(ws.parser.ws('代码',code));
  engine=new ws.vm.VM(prog,()=>index<input.length?Promise.resolve(input[index++]):Promise.reject(Error('程序输入已用尽。')),s=>append(s),()=>{ended=true;});
  stepper=async()=>{if(engine.state.progCount>=prog.length)throw Error('Whitespace 缺少结束指令 LF LF LF。');const instr=engine.proceed();locationRange={startLine:Math.max(0,(instr.pos?.line||1)-1),startCol:Math.max(0,(instr.pos?.column||1)-1)};await instr.do(engine);if(engine.state.stack.length>100000||Object.keys(engine.state.heap).length>100000)throw Error('栈或堆超过 100,000 项，已停止。');};
 }
 harden();
}
async function executeJS(code,input){
 const q=await import(base+'quickjs.js'),module=await q.load(base+'quickjs.wasm');harden();
 const runtime=module.newRuntime();runtime.setMemoryLimit(32*1024*1024);runtime.setMaxStackSize(512*1024);const deadline=Date.now()+10000;runtime.setInterruptHandler(()=>Date.now()>deadline);
 const vm=runtime.newContext();let pos=0;
 function bind(name,fn){const h=vm.newFunction(name,fn);vm.setProp(vm.global,name,h);h.dispose();}
 bind('__write',(s,isError)=>{append(vm.getString(s),!!vm.dump(isError));});
 bind('readline',()=>{if(pos>=input.length)return vm.null;const n=input.indexOf('\n',pos),s=input.slice(pos,n<0?input.length:n).replace(/\r$/,'');pos=n<0?input.length:n+1;return vm.newString(s);});
 const stdin=vm.newString(input);vm.setProp(vm.global,'stdin',stdin);stdin.dispose();
 vm.unwrapResult(vm.evalCode(`globalThis.console={log:(...xs)=>__write(xs.map(x=>typeof x==='string'?x:JSON.stringify(x)).join(' ')+'\\n',false),error:(...xs)=>__write(xs.map(String).join(' ')+'\\n',true)};globalThis.print=console.log;`)).dispose();
 send({kind:'running'});
 try{const res=vm.evalCode(code,'代码.js');if(res.error){const e=vm.dump(res.error);res.error.dispose();throw Error([e.name,e.message,e.stack].filter(Boolean).join('\n')||String(e));}res.value.dispose();while(runtime.hasPendingJob()){const j=runtime.executePendingJobs();if(j.error){const e=vm.dump(j.error);j.error.dispose();throw Error([e.name,e.message,e.stack].filter(Boolean).join('\n')||String(e));}}}finally{vm.dispose();runtime.dispose();}
}
async function executePython(code,input){
 importScripts(base+'python/pyodide.js');
 const py=await loadPyodide({indexURL:base+'python/',jsglobals:Object.create(null),stdout:s=>append(s+'\n'),stderr:s=>append(s+'\n',true)});
 // Preload trusted stdlib I/O before removing host APIs. No package installation or auto-loading.
 py.runPython('import sys, io, traceback');
 py.globals.set('__arg_stdin',input);py.runPython('sys.stdin = io.StringIO(__arg_stdin)\ndel __arg_stdin');
 const outDecoder=new TextDecoder(),errDecoder=new TextDecoder();
 py.setStdout({write:b=>{append(outDecoder.decode(b,{stream:true}));return b.length;}});
 py.setStderr({write:b=>{append(errDecoder.decode(b,{stream:true}),true);return b.length;}});
 harden();send({kind:'running'});try{py.runPython(code,{filename:'代码.py'});}finally{append(outDecoder.decode());append(errDecoder.decode(),true);}
}
async function executeLua(code,input){
 const {LuaFactory}=await import(base+'lua.js'),factory=new LuaFactory(base+'lua.wasm');
 await factory.mountFile('/input.txt',new TextEncoder().encode(input));
 const lua=await factory.createEngine({injectObjects:false,enableProxy:false,traceAllocations:true,functionTimeout:10000});
 lua.global.setMemoryMax(32*1024*1024);lua.global.set('__arg_write',s=>append(String(s)));
 lua.doStringSync(`io.input('/input.txt'); print=function(...) local t={} for i=1,select('#',...) do t[i]=tostring(select(i,...)) end __arg_write(table.concat(t,'\\t')..'\\n') end; io.write=function(...) for i=1,select('#',...) do __arg_write(tostring(select(i,...))) end end; os.execute=nil; io.popen=nil`);
 harden();send({kind:'running'});try{lua.doStringSync(code);}finally{lua.global.close();}
}
async function executeSQL(code,dbBytes){
 importScripts(base+'sql.js');const SQL=await initSqlJs({locateFile:()=>base+'sql-wasm.wasm'});harden();
 const db=dbBytes?new SQL.Database(new Uint8Array(dbBytes)):new SQL.Database();const tables=[];let rowsCount=0;send({kind:'running'});
 try{for(const stmt of db.iterateStatements(code)){const columns=stmt.getColumnNames(),rows=[];while(stmt.step()){if(++rowsCount>10000)throw Error('查询结果超过 10,000 行，请用 LIMIT 缩小范围。');const row=stmt.get().map(v=>v instanceof Uint8Array?'0x'+Array.from(v,x=>x.toString(16).padStart(2,'0')).join(''):v);append(JSON.stringify(row)+'\n');rows.push(row);}if(columns.length)tables.push({columns,rows});if(tables.length>100)throw Error('结果表超过 100 个，请减少语句。');}
 const bytes=db.export();if(bytes.length>16*1024*1024)throw Error('数据库超过 16 MB，无法导出。');send({kind:'database',bytes:bytes.buffer,tables},[bytes.buffer]);if(!output)append('语句执行完成。\n');}finally{db.close();}
}
listen('message',async({data})=>{
 try{
 if(data.kind==='init'){
  language=data.language;if(typeof data.code!=='string'||typeof data.input!=='string'||encoder.encode(data.code).length>262144||encoder.encode(data.input).length>262144)throw Error('代码和输入分别最多 256 KB。');
  send({kind:'loading'});
  if(['javascript','python','lua','sql'].includes(language)){const start=performance.now();await ({javascript:executeJS,python:executePython,lua:executeLua,sql:(c)=>executeSQL(c,data.database)})[language](data.code,data.input);elapsed=performance.now()-start;ended=true;snapshot('done');return;}
  if(!['brainfuck','ook','befunge','deadfish','whitespace','malbolge'].includes(language))throw Error('不支持的语言。');
  await prepareEsoteric(data.code,data.input);
  if(ended){snapshot('done');return;}
  if(data.mode==='step'){await tick();snapshot(ended?'done':'paused');}else await run();
 }else if(data.kind==='pause'){paused=true;}
 else if(data.kind==='run')await run();
 else if(data.kind==='step'&&!running&&!ended){await tick();snapshot(ended?'done':'paused');}
 }catch(e){fail(e);}
});
