import {runClassical} from './classical-core.js';
import {elementDecompositions,elementWords} from './element-core.js';
import {loadEnglishRecords} from './hunt-data.js';
self.onmessage=async({data})=>{try{
 const root=new URL(data.resourceBase||'../',import.meta.url);if(root.origin!==new URL(import.meta.url).origin)throw Error('运行资源必须同源。');
 let result;const progress=p=>self.postMessage({kind:'progress',...p});
 if(data.task==='classical')result=runClassical(data.cipher,data.input,data.options);
 else if(data.task==='keyboard'){const {runKeyboard}=await import('./keyboard-core.js');result=runKeyboard(data.mode,data.input,data.options);}
 else if(data.task==='elements'||data.task==='element-words'){
  const response=await fetch(new URL('vendor/science/elements.json',root));if(!response.ok)throw Error('完整元素数据载入失败。');let elements=await response.json();elements=elements.elements||elements;
  if(data.task==='elements')result=elementDecompositions(data.input,elements,data.options);
  else result=elementWords(data.input?.trim()?data.input.trim().split(/\s+/u):await loadEnglishRecords(data.options.dataset||data.options.dictionary||'standard',root),elements,data.options);
 }else if(data.task==='constraints'||data.task==='dictionary-substitution'){
  const {solveConstraints,solveDictionarySubstitution}=await import('./hunt-constraints.js');
  const words=await loadEnglishRecords(data.options.dataset||'standard',root);
  result=await(data.task==='constraints'?solveConstraints(data.options,{words:words.map(x=>x.word),onProgress:progress}):solveDictionarySubstitution({...data.options,text:data.input},{words:words.map(x=>x.word),onProgress:progress}));
 }else if(data.task==='stroke'){
  const {matchStrokeEndpoints}=await import('./stroke-core.js');const r=await fetch(new URL('vendor/expansion/hunt/stroke-endpoints.json',root));if(!r.ok)throw Error('笔画首尾完整数据载入失败。');result=matchStrokeEndpoints(data.points,await r.json(),data.options);
 }else throw Error('未知本地任务。');
 if(new TextEncoder().encode(JSON.stringify(result)).length>32*1024*1024)throw Error('完整结果超过32MB，请缩小输入范围；没有返回截断结果。');
 self.postMessage({result});
}catch(error){self.postMessage({error:error.message||String(error)});}};
