// Classic worker isolates upstream asm.js and its filesystem globals.
importScripts('../vendor/completion/liblouis/build-no-tables-utf32.js','../vendor/completion/liblouis/easy-api.js');
self.onmessage=async({data:{input,options}})=>{try{
 const tables=await(await fetch('../vendor/completion/liblouis/tables.json')).json();
 if(!tables.some(t=>t.file===options.table)||typeof input!=='string'||input.length>100000)throw Error('无效规则表或输入超过 10 万字符。');
 liblouis.enableOnDemandTableLoading(new URL('../vendor/completion/liblouis/tables/',self.location.href).href);
 const c=liblouis.capi,chars=[...input].map(v=>v.codePointAt(0)),allocations=[];
 const alloc=n=>{const p=c._malloc(n);if(!p)throw Error('内存不足。');allocations.push(p);return p;};
 try{
  const ip=alloc((chars.length+1)*4),il=alloc(4),ol=alloc(4);c.HEAPU32.set([...chars,0],ip>>>2);
  let output;for(let capacity=Math.max(256,chars.length*4+32);capacity<=8000000;capacity*=2){
   const op=alloc(capacity*4);c.setValue(il,chars.length,'i32');c.setValue(ol,capacity,'i32');
   const ok=c.ccall(options.direction==='decode'?'lou_backTranslateString':'lou_translateString','number',['string','number','number','number','number','number','number','number'],['unicode.dis,'+options.table,ip,il,op,ol,0,0,0]);
   if(!ok)throw Error('这份规则表不支持本次转换，或规则加载失败。');
   const consumed=c.getValue(il,'i32'),length=c.getValue(ol,'i32');
   if(consumed===chars.length){output='';for(let i=0;i<length;i++)output+=String.fromCodePoint(c.HEAPU32[(op>>>2)+i]);break;}
   c._free(allocations.pop());
  }
  if(output===undefined)throw Error('结果超出内存限额，未返回截断文本。');
  self.postMessage({result:{output,value:{text:output},status:`已完成 · Liblouis ${liblouis.version()} · ${options.table}`}});
 }finally{for(const p of allocations)c._free(p);}
 }catch(e){self.postMessage({error:e.message||String(e)});}};
