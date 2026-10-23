export const ENGLISH_DATASETS=Object.freeze([
 ['standard','上游完整默认词库（含词类）'],['large','dict_large 完整词表'],['raw','dict.txt 原始完整词表'],['alternate','备用字型词库'],['twl06','TWL06 原始完整词表'],['idioms','英语惯用语完整表'],
].map(([id,title])=>Object.freeze({id,title})));
export async function loadEnglishRecords(id='standard',resourceBase=new URL('../',import.meta.url)){
 if(!ENGLISH_DATASETS.some(x=>x.id===id))throw Error('未知词库。');
 const response=await fetch(new URL('vendor/expansion/hunt/english-'+id+'.json',resourceBase));if(!response.ok)throw Error('本地完整词库载入失败，请重试。');
 const rows=await response.json();if(!Array.isArray(rows)||rows.some(x=>typeof x.word!=='string'||!Number.isInteger(x.flags)))throw Error('词库格式无效。');return rows;
}
export function dictionaryByPattern(rows,{filter=31}={}){
 const words={};for(const {word,flags}of rows){if(filter!==31&&!((flags&15)&filter)&&!((flags&16)&&(filter&16)))continue;const ids=new Map();let next=0;const pattern=[...word].map(c=>{if(!ids.has(c))ids.set(c,String.fromCharCode(97+next++));return ids.get(c);}).join('');(words[pattern]??=[]).push(word);}return words;
}
