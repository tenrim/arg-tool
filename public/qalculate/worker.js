import create from '../vendor/qalculate/qalculate.mjs';
import {snapshotVirtualFiles,changedVirtualFiles} from './files.js';

let engine;
const ready=()=>engine||=(create({print:()=>{},printErr:()=>{}}).then(q=>{q.FS.chdir('/tmp');return q;}));
let queue=Promise.resolve();
self.onmessage=({data})=>{queue=queue.then(async()=>{
 try{
  const q=await ready();let result;
  if(data.op==='catalog')result={...q.catalog(),datasets:q.datasets(),settings:q.options()};
  else if(data.op==='calculate'){
   // The explicit calculator uses a fresh Worker for each calculation. Live
   // units keep a warm instance with fixed options and validated numbers only;
   // their controller never submits definitions, files or assignments.
   for(const xml of data.definitions||[]){
    if(typeof xml!=='string'||xml.length>4_000_000||/<!DOCTYPE|<!ENTITY/i.test(xml))throw Error('定义文件过大或含不支持的外部实体。');
    if(q.loadDefinitions(xml)<1)throw Error('定义文件未能载入，请检查 Qalculate XML 格式。');
   }
   for(const line of data.options||[])if(!q.setOption(line))throw Error('无法应用设置：'+line);
   for(const file of data.files||[]){
    if(!/^[\w.\-\u4e00-\u9fff ]{1,120}$/.test(file.name)||file.name==='.'||file.name==='..')throw Error('数据文件名不受支持。');
    q.FS.writeFile('/tmp/'+file.name,new Uint8Array(file.bytes));
   }
   const before=snapshotVirtualFiles(q.FS),values=[];
   for(const expression of data.expressions){
    if(typeof expression!=='string'||expression.length>100000)throw Error('单条表达式最多 100,000 字符。');
    values.push({...q.calculate(expression),expression});
   }
   const generatedFiles=changedVirtualFiles(before,snapshotVirtualFiles(q.FS));
   result={values,generatedFiles,definitions:q.exportDefinitions()};
  }else throw Error('未知计算请求。');
  self.postMessage({id:data.id,result});
 }catch(error){self.postMessage({id:data.id,error:error.message});}
 });};
