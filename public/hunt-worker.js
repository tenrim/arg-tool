// All dictionary searching stays in a disposable worker; even a pathological regex can be stopped.
self.window=self; self.windows=self;
self.onmessage=async ({data})=>{try{
 const {task,query='',mode,grid,custom='',distance=1,min=3}=data;
 if(task==='chinese'){
  if(query.length>180)throw Error('查询条件请限制在 180 个字符内。');
  if(!query.trim())throw Error('请输入查询条件。');
  const {search}=await import('./vendor/hunt/chinese-puzzle/search.js');const rows=search(query);postMessage({rows:rows.slice(0,3000),total:rows.length});return;
 }
 const {OneWord}=await import('./vendor/hunt/cipher-machine/one-word/one-word.js');
 const {Trie}=await import('./vendor/hunt/cipher-machine/common/Trie.js');
 if(custom.trim()) {self.words={};for(const word of custom.toLowerCase().split(/[\s,，;；]+/u).filter(Boolean)){const key='a'.repeat(word.length);(self.words[key]??=[]).push(word);}}
 else {const s=await(await fetch('./vendor/hunt/cipher-machine/dict.js')).text();self.words=Function(s+';return words;')();}
 self.Trie=null;const engine=new OneWord();
 if(task==='wordsearch'){
  const matrix=grid.trim().toLowerCase().split(/\n/).map(x=>[...x.replace(/\s/g,'')]);
  if(!matrix.length||!matrix[0].length||matrix.some(x=>x.length!==matrix[0].length))throw Error('每行格子数量必须相同。');
  if(matrix.length*matrix[0].length>(mode==='boggle'?100:3600))throw Error('网格过大：直线搜索最多 3600 格，转弯搜索最多 100 格。');
  const {WordSearch}=await import('./vendor/hunt/cipher-machine/word-search/wordSearch.js');const ws=new WordSearch();
  const rows=(mode==='boggle'?ws.wordSearch2(matrix):ws.wordSearch(matrix)).filter(x=>x.word.length>=min);
  postMessage({rows:rows.slice(0,3000),total:rows.length});return;
 }
 if(!query.trim()||query.length>180)throw Error('请输入 1–180 个字符。');let rows;
 const q=query.toLowerCase();
 // onlyContains requires a per-match callback; this adapter does not stream
 // progress, so supply one explicitly instead of failing on the first match.
 switch(mode){case 'anagram':rows=engine.permutation(q.replace(/\s/g,''));break;case 'regex':rows=await engine.findByRegularExpression(q);break;case 'fuzzy':rows=await engine.findSimilarity(q,distance);break;case 'letters':rows=await engine.onlyContains(q,()=>{});break;default:rows=await engine.findByWildcard(query.replace(/\?/g,'#'));}
 postMessage({rows:[...new Set(rows)].slice(0,3000),total:rows.length});
 }catch(e){postMessage({error:e.message||String(e)});}};
