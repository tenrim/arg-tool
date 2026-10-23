import {languageReading} from './reading-language.js';
import {scienceReading} from './reading-science.js';
import {referenceReading} from './reading-reference.js';

// A disposable reading projection. Original records and saving leases remain
// owned by the query models; display bounds never modify their source bytes.
export const READING_LIMITS=Object.freeze({sections:24,fields:36,paragraphs:24,columns:8,rows:60,text:60000});
const present=value=>value!==undefined&&value!==null&&String(value).trim()!=='';
export function onlineReading(provider,record,result){
 const source=languageReading(provider,record,result)||scienceReading(provider,record,result)||referenceReading(provider,record,result)||{};
 let remaining=READING_LIMITS.text,truncated=false;
 const clip=(value,max=4000)=>{if(!present(value))return'';const text=String(value),limit=Math.max(0,Math.min(max,remaining));remaining-=Math.min(text.length,limit);if(text.length>limit){truncated=true;return limit?text.slice(0,limit-1)+'…':'';}return text;};
 const take=(values,max)=>{if(!Array.isArray(values))return[];if(values.length>max)truncated=true;return values.slice(0,max);};
 const title=clip(source.title||record?.title||record?.name||'资料记录',400),summary=clip(source.summary,900);
 const sections=take(source.sections,READING_LIMITS.sections).map(section=>{
  const heading=clip(section.title,120),fields=take(section.fields,READING_LIMITS.fields).filter(pair=>Array.isArray(pair)&&present(pair[1])).map(([key,value])=>[clip(key,120),clip(value,3000)]);
  const paragraphs=take(section.paragraphs,READING_LIMITS.paragraphs).filter(present).map(text=>clip(text,6000));
  let table=null;if(section.table){const columns=take(section.table.columns,READING_LIMITS.columns).map(text=>clip(text,160));const rows=take(section.table.rows,READING_LIMITS.rows).filter(Array.isArray).map(row=>columns.map((_,i)=>clip(row[i]??'—',1500)));if(columns.length&&rows.length)table={columns,rows};}
  return{title:heading,fields,paragraphs,table,collapsed:section.collapsed===true};
 }).filter(section=>section.fields.length||section.paragraphs.length||section.table);
 return{title,summary,sections,truncated};
}
