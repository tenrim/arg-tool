import {aaencode,jjencode} from '../vendor/completion/obfuscation/encoders.js';
export async function obfuscation(input,{codec,direction}){
 if(!['aaencode','jjencode'].includes(codec))throw Error('未知混淆格式。');
 if(direction==='encode')return codec==='aaencode'?aaencode(input):jjencode('$',input);
 const base=new URL('../vendor/coderunner/',import.meta.url),q=await import(new URL('quickjs.js',base).href),module=await q.load(new URL('quickjs.wasm',base).href);
 const runtime=module.newRuntime();runtime.setMemoryLimit(64*1024*1024);runtime.setMaxStackSize(512*1024);const deadline=Date.now()+5000;runtime.setInterruptHandler(()=>Date.now()>deadline);const ctx=runtime.newContext();
 try{
  // Only the wrapper's literal-return function may run. Capture the next
  // Function body as data instead of executing the decoded program.
  ctx.unwrapResult(ctx.evalCode(String.raw`{
   const NativeFunction=Function;let stage=0;
   const literal=/^return\s*(?:"(?:[^"\\\r\n]|\\[\s\S])*"|'(?:[^'\\\r\n]|\\[\s\S])*')\s*;?\s*$/;
   function Capture(...args){const source=String(args.at(-1));if(stage++===0){if(!literal.test(source))throw Error('非标准的字符串解包函数');return NativeFunction(source);}globalThis.__decoded=source;return ()=>{};}
   Object.defineProperty(Function.prototype,'constructor',{value:Capture,writable:false,configurable:false});globalThis.Function=Capture;
  }`)).dispose();
  const result=ctx.evalCode(input,'encoded.js');if(result.error){const e=ctx.dump(result.error);result.error.dispose();throw Error(e.message||'无法解包此编码。');}result.value.dispose();
  const handle=ctx.getProp(ctx.global,'__decoded');try{if(ctx.typeof(handle)!=='string')throw Error('未找到完整的 AAencode／JJencode 载荷。');return ctx.getString(handle);}finally{handle.dispose();}
 }finally{ctx.dispose();runtime.dispose();}
}
