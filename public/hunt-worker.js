// Full pinned dictionaries are data, never evaluated as host code.
import {loadEnglishRecords,dictionaryByPattern} from './expansion/hunt-data.js';
const finalizeRows=rows=>{if(new TextEncoder().encode(JSON.stringify(rows)).length>32*1024*1024)throw Error('完整结果超过32MB，请缩小条件；没有返回截断结果。');postMessage({rows,total:rows.length});};
self.window=self;self.windows=self;
self.onmessage=async({data})=>{try{
 const {task,query='',mode,grid,custom='',distance=1,min=3,dataset='standard',filter=31,moreWord=false}=data;
 if(task==='chinese'){
  if(query.length>180||!query.trim())throw Error('请输入1–180个字符的汉字查询条件。');
  const {searchChinese}=await import('./vendor/expansion/hunt/chinese-search.js');let corpus;if(data.chineseDataset==='idioms'){const r=await fetch(new URL('./vendor/expansion/hunt/chinese-idioms.json',import.meta.url));if(!r.ok)throw Error('完整成语库载入失败，请重试。');corpus=await r.json();}const rows=searchChinese(query,corpus);finalizeRows(rows);return;
 }
 if(custom.length>8*1024*1024)throw Error('自定义词表最多8MB。');
 const records=custom.trim()?custom.toLowerCase().split(/[\s,，;；]+/u).filter(Boolean).map(word=>({word,flags:31})):await loadEnglishRecords(dataset);
 self.words=dictionaryByPattern(records,{filter:Number(filter)});self.Trie=null;
 if(task==='wordsearch'){
  const {Trie}=await import('./vendor/hunt/cipher-machine/common/Trie.js');self.Trie=new Trie();for(const list of Object.values(self.words))for(const word of list)self.Trie.insert(word);
  const matrix=grid.trim().toLowerCase().split(/\n/).map(x=>[...x.replace(/\s/g,'')]);
  if(!matrix.length||!matrix[0].length||matrix.some(x=>x.length!==matrix[0].length))throw Error('每行格子数量必须相同。');
  if(matrix.length*matrix[0].length>(mode==='boggle'?100:3600))throw Error('直线搜索最多3600格，转弯搜索最多100格。');
  const {WordSearch}=await import('./vendor/hunt/cipher-machine/word-search/wordSearch.js');const ws=new WordSearch();
  const rows=(mode==='boggle'?ws.wordSearch2(matrix):ws.wordSearch(matrix)).filter(x=>x.word.length>=min);finalizeRows(rows);return;
 }
 if(mode==='code'){
  const {queryByCode}=await import('./expansion/word-code.js');const rows=await queryByCode(query,records.filter(x=>Number(filter)===31||(x.flags&Number(filter))).map(x=>x.word));finalizeRows(rows);return;
 }
 if(!query.trim()||query.length>180)throw Error('请输入1–180个字符。');
 const {OneWord}=await import('./vendor/expansion/hunt/one-word.js');const engine=new OneWord(),q=query.toLowerCase();let rows;
 switch(mode){case'anagram':rows=engine.permutation(q.replace(/\s/g,''));break;case'regex':rows=await engine.findByRegularExpression(q);break;case'fuzzy':rows=await engine.findSimilarity(q,distance);break;case'letters':rows=await engine.onlyContains(q,()=>{});break;case'contains':rows=await engine.contains(q);break;default:rows=await engine.findByWildcard(query.replace(/\?/g,'#'),()=>{},undefined,moreWord);}
 finalizeRows([...new Set(rows)]);
}catch(e){postMessage({error:e.message||String(e)});}};
