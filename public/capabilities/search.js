import Fuse from '../vendor/fuse/fuse.js';
import {matchesSearch,searchText} from '../tool-search.js';

// One cached metadata index serves header, sidebar, home and directory.
// No clue contents, files, preferences or network requests enter this index.
const indexes=new WeakMap();
const graphemes=new Intl.Segmenter(undefined,{granularity:'grapheme'});
// Map normalized search offsets back to the unchanged display string. NFKC,
// whitespace, combining characters and surrogate pairs must not shift marks.
function searchable(value){
  const text=String(value),offsets=[];
  for(const {segment,index} of graphemes.segment(text)){
    const part=searchText(segment);
    for(let i=0;i<part.length;i++)offsets.push([index,index+segment.length]);
  }
  return {text,normalized:searchText(text),offsets};
}
function mergeRanges(ranges){
  const result=[];
  for(const [start,end] of ranges.sort((a,b)=>a[0]-b[0])){
    const last=result.at(-1);
    if(last&&start<=last[1])last[1]=Math.max(last[1],end);else result.push([start,end]);
  }
  return result;
}
function displayRanges(field,indices){
  return mergeRanges(indices.flatMap(([start,end])=>field.offsets[start]&&field.offsets[end]
    ?[[field.offsets[start][0],field.offsets[end][1]]]:[]));
}
function literalRanges(field,query){
  const indices=[];
  for(const token of String(query).normalize('NFKC').trim().split(/\s+/).map(searchText).filter(Boolean)){
    for(let index=field.normalized.indexOf(token);index>=0;index=field.normalized.indexOf(token,index+token.length))indices.push([index,index+token.length-1]);
  }
  return displayRanges(field,indices);
}
function excerpt(field,ranges){
  // Keep context around the first hit rather than dumping a long alias list.
  let start=Math.max(0,ranges[0][0]-24),end=Math.min(field.text.length,Math.max(start+120,ranges[0][1]));
  start=field.offsets.find(pair=>pair[0]>=start)?.[0]??start;
  end=field.offsets.find(pair=>pair[1]>=end)?.[1]??end;
  const prefix=start?'…':'';
  return {text:prefix+field.text.slice(start,end)+(end<field.text.length?'…':''),
    ranges:ranges.filter(([a,b])=>a<end&&b>start).map(([a,b])=>[Math.max(a,start)-start+prefix.length,Math.min(b,end)-start+prefix.length])};
}
function evidence(fields,query,matches){
  const hits=[];
  for(const [key,values] of Object.entries(fields))for(const [index,field] of values.entries()){
    const ranges=matches?displayRanges(field,matches.filter(match=>match.key===key&&(match.refIndex??0)===index).flatMap(match=>match.indices))
      :literalRanges(field,query);
    if(ranges.length)hits.push({key,field,ranges});
  }
  const title=hits.find(hit=>hit.key==='title')?.ranges||[];
  const seen=new Set([fields.title[0].text]);
  const titleExplains=title.length&&(matches||matchesSearch(fields.title[0].text,query));
  const tokens=String(query).normalize('NFKC').trim().split(/\s+/).map(searchText).filter(Boolean);
  const candidates=hits.filter(hit=>hit.key!=='title').map(hit=>({...hit,
    tokens:tokens.filter(token=>hit.field.normalized.includes(token))})).sort((a,b)=>
      b.tokens.length-a.tokens.length||a.field.text.length-b.field.text.length);
  const covered=new Set(tokens.filter(token=>fields.title[0].normalized.includes(token))),selected=[];
  if(!titleExplains)for(const hit of candidates){
    if(seen.has(hit.field.text)||(!matches&&selected.length&&hit.tokens.every(token=>covered.has(token))))continue;
    seen.add(hit.field.text);selected.push(hit);hit.tokens.forEach(token=>covered.add(token));
    if(matches||covered.size===tokens.length||selected.length===2)break;
  }
  const snippets=selected.map(hit=>({label:hit.key==='aliases'?'相关名称':'功能',...excerpt(hit.field,hit.ranges)}));
  return {title,snippets,approximate:!!matches};
}
export function literalSearchEvidence(entry,query){
  return evidence({title:[searchable(entry.title)],aliases:(entry.aliases||[]).map(searchable)},query);
}
const algorithmName=value=>searchText(String(value).replace(/^(?:To|From)\s+/i,'').replace(/\s+(?:Encode|Decode|Encrypt|Decrypt)$/i,''));
const operationNames=entry=>[...(entry.sourceOperationIds||[]),
  ...(entry.actions||entry.directions||[]).flatMap(item=>[item.op,item.label]),
  ...(entry.variants||[]).flatMap(item=>[item.title,...item.aliases||[],
    ...(item.directions||[]).flatMap(direction=>[direction.op,direction.label])]),
  ...(entry.open?.nativeDirections||[]).flatMap(item=>[item.label,...item.aliases||[]])].filter(Boolean);
function indexFor(entries){
  if(!indexes.has(entries)){
    const rows=entries.filter(entry=>entry.listed!==false).map((entry,index)=>{
      const fields={title:[searchable(entry.title)],names:operationNames(entry).map(searchable),aliases:(entry.aliases||[]).map(searchable)};
      return {entry,index,fields,title:fields.title[0].normalized,memberTitles:(entry.variants||[]).map(item=>searchText(item.title)),
        names:fields.names.map(field=>field.normalized),aliases:fields.aliases.map(field=>field.normalized)};
    });
    indexes.set(entries,{rows,fuse:new Fuse(rows,{includeScore:true,includeMatches:true,ignoreLocation:true,threshold:.38,
      keys:[{name:'title',weight:3},{name:'names',weight:2},{name:'aliases',weight:1}]})});
  }
  return indexes.get(entries);
}
export function rankCapabilities(entries,query,category=''){
  const {rows,fuse}=indexFor(entries),term=String(query).trim(),normalized=searchText(term);
  const candidates=rows.filter(({entry})=>!category||entry.category===category);
  if(!term)return candidates.map(({entry})=>entry);
  const found=new Map();
  for(const {entry,index,title,memberTitles,names,aliases,fields} of candidates){
    if(!matchesSearch([entry.title,...entry.aliases||[],...operationNames(entry)].join(' '),term))continue;
    const priority=title===normalized?4:[...names,...aliases].includes(normalized)||operationNames(entry).some(name=>algorithmName(name)===normalized)?3
      :title.startsWith(normalized)||memberTitles.some(name=>name.startsWith(normalized))?2.75:matchesSearch(entry.title,term)?2:operationNames(entry).some(name=>matchesSearch(name,term))?1:0;
    // A short article title such as ASCII must not displace an exact tool
    // alias. Lessons remain ahead of loose substring matches and discoverable.
    const rank=entry.category==='knowledge'&&category!=='knowledge'&&priority>=3?2.5:priority;
    found.set(entry.id,{entry,index,priority:rank,score:0,searchMatch:evidence(fields,term)});
  }
  // A recognized short algorithm name (SM4, SHA1) must not acquire similar but
  // unrelated algorithms. Fuzzy matching is a fallback when literals miss.
  if(normalized.length>=3&&found.size===0){
    for(const result of fuse.search(normalized)){
      const {entry,index}=result.item;
      if((category&&entry.category!==category)||found.has(entry.id))continue;
      found.set(entry.id,{entry,index,priority:-1,score:result.score,searchMatch:evidence(result.item.fields,term,result.matches)});
    }
  }
  return [...found.values()].sort((a,b)=>b.priority-a.priority||a.score-b.score||a.index-b.index).map(row=>({...row.entry,searchMatch:row.searchMatch}));
}
