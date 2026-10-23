import test from 'node:test';
import assert from 'node:assert/strict';
import {LANGUAGE_PROVIDERS,parseZdicEntry} from '../services/online-query/providers/language.mjs';

const provider=id=>LANGUAGE_PROVIDERS.find(item=>item.id===id);
const context=(body,{type='application/json;charset=utf-8',status=200}={})=>({signal:new AbortController().signal,now:()=>1000,requests:[],async request(url,options){this.requests.push({url:new URL(url),options});return {response:new Response(body,{status,headers:{'Content-Type':type}}),text:body};}});
const html=(word='明')=>`<!doctype html><html><head><title>${word} - 汉典</title><meta name="description" content="字书说明 &amp; 原文"><script>const fake='<main id="main-content">坏正文</main>';</script><style>.ad{color:red}</style></head><body><nav>导航不能混入</nav><main id="main-content"><article class="char-card"><img alt="${word}" src="https://img.zdic.net/example.svg"><span>${word}</span><div>拼音 míng</div></article><nav>内容导航也不能混入</nav><section id="explain" class="dict-section" data-section="基本解释"><h2>${word} 基本解释</h2><p>公开义项，完整第一行。</p><p>第二行 &lt;script&gt;仅文字&lt;/script&gt;</p><script>window.bad=true;</script></section><section id="old" class="dict-section" data-section="康熙字典"><h2>康熙字典</h2><blockquote>【辰集上】【日部】古书引文&#x660E;。<a href="/hans/古">古</a></blockquote></section><div class="ad-wrapper">广告不能混入</div></main><aside>侧栏</aside></body></html>`;

test('language providers only own fixed sources and keep the unusually slow 52poke policy',()=>{
 assert.deepEqual(LANGUAGE_PROVIDERS.map(item=>item.id),['zdic','cnkgraph','pokewiki']);
 assert.equal(provider('pokewiki').minimumIntervalMs,500000);
 assert.equal(provider('zdic').minimumIntervalMs,10000);
 for(const item of LANGUAGE_PROVIDERS){assert.equal(item.requiresAcknowledgement,undefined);assert.ok(item.allowedHosts.every(host=>!host.includes('/')&&!host.includes('*')));}
});

test('public Zdic character and word extraction preserves every book section as inert text',()=>{
 for(const query of ['明','不言而喻']){
  const data=parseZdicEntry(html(query),query);assert.equal(data.title,query);assert.equal(data.headword,query);assert.equal(data.description,'字书说明 & 原文');assert.equal(data.sections.length,2);assert.match(data.sections[1].text,/古书引文明/);assert.match(data.sections[0].text,/<script>仅文字<\/script>/);
  assert.doesNotMatch(JSON.stringify(data),/window.bad|坏正文|广告不能混入|导航不能混入|color:red|<img/);
 }
 const quoted=html().replace('<p>公开义项','<p title="a > b">公开义项');assert.match(parseZdicEntry(quoted,'明').sections[0].text,/公开义项/);
});

test('Zdic rejects query paths, dynamic search shells, verification responses and wrong terms',async()=>{
 const p=provider('zdic');for(const query of ['../x','https://evil.test','明/暗','明?x=1','明#x','明\n','明 暗','<script>'])assert.throws(()=>p.validate({query}),{code:'INVALID_QUERY'});
 assert.throws(()=>p.validate({query:'明',url:'https://evil.test'}));
 for(const source of ['<title>安全验证</title><form>captcha</form>','<main id="main-content"><section class="search-result"></section></main>',html('暗')])assert.throws(()=>parseZdicEntry(source,'明'),{code:'INVALID_UPSTREAM_RESPONSE'});
 const ctx=context('',{type:'text/html',status:404}),empty=await p.execute({query:'不存在词'},ctx);assert.deepEqual(empty.records,[]);assert.equal(empty.total,0);
});

test('Zdic exact entry lookup never touches its robots-disallowed API or downloads media',async()=>{
 const ctx=context(html('不言而喻'),{type:'text/html'}),p=provider('zdic');const result=await p.execute({mode:'search',query:'不言而喻'},ctx);
 assert.equal(ctx.requests.length,1);assert.equal(ctx.requests[0].url.href,'https://zdic.net/hans/%E4%B8%8D%E8%A8%80%E8%80%8C%E5%96%BB');assert.equal(result.records[0].fields.sections.length,2);assert.match(result.attribution.license,/CC0/);assert.equal(result.fetchedAt,'1970-01-01T00:00:01.000Z');
 await assert.rejects(()=>p.execute({query:'明'},context('<html>验证</html>',{type:'text/html'})),{code:'INVALID_UPSTREAM_RESPONSE'});
});

const writing={Id:26460,Dynasty:'盛唐',Author:'李白',Type:'古體',Title:{Content:'靜夜思'},Clauses:[{Content:'床前明月光',Comments:[{Type:'Text',Content:'完整注释'}]}],Froms:['古籍出处'],newField:{keep:['所有未知字段']}};
test('CNKGraph passes only documented search parameters and preserves raw record and response metadata',async()=>{
 const payload={Notification:'官方通知',WritingCount:21,PageNo:0,PageSize:20,MatchedKeys:['床前'],Writings:[writing],Links:[{Value:'出处'}]},ctx=context(JSON.stringify(payload)),p=provider('cnkgraph');
 const result=await p.execute({query:'床前明月光',author:'李白',dynasty:'唐朝',exact:true},ctx),request=ctx.requests[0];
 assert.equal(request.url.href,'https://open.cnkgraph.com/api/Writing/Find');assert.equal(request.options.method,'POST');assert.equal(request.options.headers['Accept-Language'],'zh-hant');assert.deepEqual(JSON.parse(request.options.body),{key:'床前明月光',author:'李白',dynasty:'唐朝',exactlyMatch:true,showMatchedClauseOnly:false,pageNo:0});
 assert.deepEqual(result.records[0].fields,writing);assert.deepEqual(result.raw,payload);assert.equal(result.records[0].title,'靜夜思');assert.deepEqual(result.next,{mode:'search',query:'床前明月光',author:'李白',dynasty:'唐朝',page:1,exact:true});assert.deepEqual(result.records[0].actions[0].parameters,{mode:'detail',id:26460});
 assert.match(result.attribution.license,/仅限非商业/);
});

test('CNKGraph details, author result envelopes, disambiguation and empty searches retain real schemas',async()=>{
 const p=provider('cnkgraph'),detail={Writing:writing,Links:[{Value:'明月'}]},ctx=context(JSON.stringify(detail));const result=await p.execute({mode:'detail',query:'26460'},ctx);assert.equal(ctx.requests[0].url.pathname,'/api/Writing/26460');assert.deepEqual(result.raw,detail);assert.equal(result.next,null);
 const author={AuthorWritings:{Name:'李白',WritingCount:1,PageSize:20,PageNo:0,Writings:[writing]},Notification:'作者'};const a=await p.execute({author:'李白'},context(JSON.stringify(author)));assert.deepEqual(a.raw,author);assert.deepEqual(a.records[0].fields,writing);
 const groups={Dynasties:[{Name:'唐朝',Authors:[{Id:15,Name:'李白',WritingCount:100}]}]};const g=await p.execute({author:'李'},context(JSON.stringify(groups)));assert.deepEqual(g.records[0].fields,groups.Dynasties[0]);assert.equal(g.total,null);
 const e=await p.execute({query:'无命中'},context(JSON.stringify({WritingCount:0,Writings:[],PageNo:0,PageSize:20})));assert.equal(e.records.length,0);assert.equal(e.total,0);
});

test('CNKGraph validation rejects unsupported keys, path injection, malformed and HTML responses',async()=>{
 const p=provider('cnkgraph');for(const input of [{query:'明\n'},{query:'明',url:'https://bad.test'},{query:'明',id:1},{mode:'detail',query:'../10'},{mode:'detail',id:1,query:'1'},{query:'明',page:-1},{query:'明',page:1.1},{query:'明',dynasty:'../../'},{query:'明',exact:'true'}])assert.throws(()=>p.validate(input));
 await assert.rejects(()=>p.execute({query:'明'},context('<html>登录</html>',{type:'text/html'})),{code:'INVALID_UPSTREAM_RESPONSE'});
 await assert.rejects(()=>p.execute({query:'明'},context(JSON.stringify({Writings:[null]}))),{code:'INVALID_UPSTREAM_RESPONSE'});
});

test('CNKGraph tune name search, complete tune formats and matching patterns use the official Postman contracts',async()=>{
 const p=provider('cnkgraph'),tune={Id:90,Name:'醉花間',Aliases:['变格'],Desc:'全部谱式',WritingCount:50,Formats:[{FormatIndex:0,Desc:'雙調四十一字',Comment:'全部校注',SampleAuthor:'毛文錫',SampleContent:'完整例词',Definition:'○○●韻●○●疊',FormatHtml:'<p onclick="bad()">只作原文</p>'}]};
 const search=context(JSON.stringify([{...tune,Formats:undefined}])),s=await p.execute({mode:'tune-search',query:'醉花间'},search);assert.equal(search.requests[0].url.pathname,'/api/ciTune/find');assert.deepEqual(JSON.parse(search.requests[0].options.body),{key:'醉花间'});assert.deepEqual(s.records[0].actions[0].parameters,{mode:'tune-detail',id:90});assert.equal(s.total,1);
 const detail=context(JSON.stringify(tune)),d=await p.execute({mode:'tune-detail',id:90},detail);assert.equal(detail.requests[0].url.pathname,'/api/ciTune/90');assert.deepEqual(d.records[0].fields,tune);assert.match(d.records[0].fields.Formats[0].FormatHtml,/<p/);
 const match={Pattern:'对潇潇暮雨洒江天',MatchedLength:8,MatchedTuneFormats:[{MatchedIndex:30,Tune:{Id:90,Name:'醉花間',Format:tune.Formats[0]}},{MatchedIndex:50,Tune:{Id:90,Name:'醉花間',Format:tune.Formats[0]}}]},pattern=context(JSON.stringify(match)),m=await p.execute({mode:'tune-pattern',query:match.Pattern},pattern);assert.equal(pattern.requests[0].url.pathname,'/api/ciTune/pattern');assert.deepEqual(JSON.parse(pattern.requests[0].options.body),{pattern:match.Pattern});assert.equal(new Set(m.records.map(record=>record.id)).size,2);assert.deepEqual(m.raw,match);assert.deepEqual(m.records[0].fields,match.MatchedTuneFormats[0]);
});

test('CNKGraph rhyme groups preserve the full character table, comment and homophone fields',async()=>{
 const body={Book:'平水韵',Categories:[{Name:'九靑',Id:'靑',Tone:'平',Chars:[{Char:'青',Comment:'原注',Sames:null},{Char:'聽',Comment:null,Sames:'径'}]}]},ctx=context(JSON.stringify(body)),p=provider('cnkgraph'),r=await p.execute({mode:'rhyme',book:'平水韵',query:'青'},ctx);
 assert.equal(ctx.requests[0].url.href,'https://open.cnkgraph.com/api/rhyme/%E5%B9%B3%E6%B0%B4%E9%9F%B5/%E9%9D%92');assert.equal(ctx.requests[0].options.method,undefined);assert.deepEqual(r.raw,body);assert.deepEqual(r.records[0].fields,body.Categories[0]);assert.equal(r.next,null);
 for(const input of [{mode:'rhyme',query:'../青'},{mode:'rhyme',query:'青',book:'https://bad'},{mode:'tune-search',query:'词',page:0},{mode:'tune-detail',id:90,book:'平水韵'},{mode:'tune-pattern',query:'平\n仄'}])assert.throws(()=>p.validate(input));
 for(const input of [{mode:'rhyme',query:'青'},{mode:'tune-detail',id:90},{mode:'tune-pattern',query:'平仄'},{mode:'tune-search',query:'词'}])await assert.rejects(()=>p.execute(input,context('{}')),{code:'INVALID_UPSTREAM_RESPONSE'});
});

const page={pageid:182,ns:0,title:'皮卡丘',lastrevid:2627141,fullurl:'https://wiki.52poke.com/wiki/皮卡丘',revisions:[{revid:2627141,parentid:2627140,timestamp:'2026-10-08T00:00:00Z',user:'条目贡献者',slots:{main:{contentmodel:'wikitext',contentformat:'text/x-wiki',content:'{{宝可梦|皮卡丘}}\n完整正文与[[File:Example.png]]引用\n<script>只保留原文而不执行</script>'}}}],extra:{preserved:true}};
test('52poke combines explicit search with full revision text in one request, keeping version and contributor attribution',async()=>{
 const payload={batchcomplete:true,continue:{gsroffset:3,continue:'gsroffset||'},query:{pages:[page]},warnings:{note:'完整警告'}},ctx=context(JSON.stringify(payload)),p=provider('pokewiki');const result=await p.execute({query:'皮卡丘'},ctx),url=ctx.requests[0].url;
 assert.equal(ctx.requests.length,1);assert.equal(url.origin,'https://wiki.52poke.com');assert.equal(url.pathname,'/api.php');assert.equal(url.searchParams.get('action'),'query');assert.equal(url.searchParams.get('generator'),'search');assert.equal(url.searchParams.get('prop'),'info|revisions');assert.equal(url.searchParams.get('gsrnamespace'),'0');assert.equal(url.searchParams.get('gsrlimit'),'3');assert.equal(url.searchParams.get('rvslots'),'main');assert.equal(url.searchParams.get('rvprop'),'ids|timestamp|content|user');
 assert.deepEqual(result.records[0].fields,page);assert.deepEqual(result.raw,payload);assert.equal(result.records[0].title,'皮卡丘');assert.match(result.records[0].attribution.revisionURL,/oldid=2627141/);assert.match(result.records[0].attribution.historyURL,/action=history/);assert.match(result.attribution.license,/文字 CC BY-NC-SA 3.0/);assert.deepEqual(result.next,{mode:'search',query:'皮卡丘',page:3});assert.equal(result.total,null);
});

test('52poke explicit details and empty records work without rendering templates or requesting images',async()=>{
 const ctx=context(JSON.stringify({batchcomplete:true,query:{pages:[page]}})),p=provider('pokewiki');const result=await p.execute({mode:'detail',query:'皮卡丘'},ctx);assert.equal(ctx.requests.length,1);assert.equal(ctx.requests[0].url.searchParams.get('titles'),'皮卡丘');assert.equal(ctx.requests[0].url.searchParams.get('generator'),null);assert.match(result.records[0].fields.revisions[0].slots.main.content,/File:Example/);assert.equal(result.next,null);
 const empty=await p.execute({query:'没有'},context(JSON.stringify({batchcomplete:true})));assert.deepEqual(empty.records,[]);
 const missing=await p.execute({mode:'detail',query:'没有'},context(JSON.stringify({batchcomplete:true,query:{pages:[{ns:0,title:'没有',missing:true}]}})));assert.deepEqual(missing.records,[]);assert.equal(missing.total,0);
});

test('52poke refuses private namespace, hidden/malformed revisions, and upstream refusal without fallback scraping',async()=>{
 const p=provider('pokewiki');for(const input of [{mode:'detail',query:'Special:Search'},{mode:'detail',query:'User:名字'},{mode:'detail',query:'File:图片'},{query:'皮卡丘\n'},{query:'皮卡丘',page:-1},{mode:'detail',query:'皮卡丘',page:0},{query:'皮卡丘',url:'https://evil.test'}])assert.throws(()=>p.validate(input));
 for(const bad of [{...page,ns:6},{...page,revisions:[]},{...page,revisions:[{revid:1,slots:{main:{texthidden:true}}}]}])await assert.rejects(()=>p.execute({query:'皮卡丘'},context(JSON.stringify({query:{pages:[bad]}}))),{code:'INVALID_UPSTREAM_RESPONSE'});
 const ctx=context(JSON.stringify({error:{code:'maxlag',info:'private details'}}));await assert.rejects(()=>p.execute({query:'皮卡丘'},ctx),{status:503,code:'UPSTREAM_REJECTED'});assert.equal(ctx.requests.length,1);
});
