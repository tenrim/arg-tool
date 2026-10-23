// User predicates run in the pinned QuickJS VM without host capabilities.
export async function queryByCode(code,words,{timeoutMs=10000}={}){
 if(typeof code!=='string'||!code.trim()||code.length>65536)throw Error('代码应为1–65536字符的函数表达式，如 word => word.length === 5 && word。');
 const q=await import('../vendor/coderunner/quickjs.js'),base=new URL('../vendor/coderunner/',import.meta.url).href,module=await q.load(base+'quickjs.wasm'),runtime=module.newRuntime();runtime.setMemoryLimit(128*1024*1024);runtime.setMaxStackSize(512*1024);const deadline=Date.now()+Math.min(10000,timeoutMs);runtime.setInterruptHandler(()=>Date.now()>deadline);const vm=runtime.newContext();
 try{
  const result=vm.evalCode(`(() => {const words=${JSON.stringify(words)},set=new Set(words),tools={isWord:s=>set.has(s),anagram:(s,letters)=>{const counts={};for(const c of s)counts[c]=(counts[c]||0)+1;for(const c of letters){if(!counts[c])return false;counts[c]--;}return true;}},predicate=(${code});if(typeof predicate!=='function')throw Error('请输入函数表达式');const rows=[];let bytes=0;for(const word of words){let value;try{value=predicate(word,tools);}catch{continue;}if(value){const text=String(value);bytes+=text.length*3;if(bytes>33554432)throw Error('结果超过32MB');rows.push(text);}}return JSON.stringify(rows);})()`);
  if(result.error){const e=vm.dump(result.error);result.error.dispose();throw Error(e.message||'本地代码执行失败或超过10秒。');}const json=vm.getString(result.value);result.value.dispose();return JSON.parse(json);
 }finally{vm.dispose();runtime.dispose();}
}
