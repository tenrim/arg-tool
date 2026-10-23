import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {languageReading} from '../public/online-query/reading-language.js';

const fixture=async name=>JSON.parse(await readFile(new URL(`fixtures/online-reading/${name}.json`,import.meta.url),'utf8'));
const flatten=value=>value.sections.flatMap(section=>section.fields||[]);
const projection=value=>languageReading(value.result.provider,value.record,value.result);
const frozen=value=>{if(value&&typeof value==='object'){Object.values(value).forEach(frozen);Object.freeze(value);}return value;};
test('52poke actual full revision yields useful Pokémon data and retains exact raw input',async()=>{
 const value=await fixture('pokewiki-pikachu'),original=JSON.stringify(value),view=projection(frozen(value)),data=new Map(flatten(view));
 assert.equal(view.title,'皮卡丘');assert.equal(data.get('全国图鉴编号'),'025');
 const base=new Map(view.sections.find(section=>section.title==='基本资料').fields);
 assert.equal(base.get('日文名'),'ピカチュウ');assert.equal(base.get('英文名'),'Pikachu');assert.equal(base.get('分类（原词条）'),'鼠');assert.equal(base.get('属性'),'电');assert.equal(base.get('特性'),'静电');assert.equal(base.get('隐藏特性'),'避雷针');assert.equal(base.get('身高（m）'),'0.4');assert.equal(base.get('体重（kg）'),'6.0');
 assert.match(view.summary,/皮卡丘是电寶可夢/);assert.match(view.sections.find(section=>section.title==='内容摘读').paragraphs[0],/皮毛都是黄色/);
 assert.ok(view.sections.some(section=>section.title==='换装皮卡丘'));assert.ok(view.sections.some(section=>section.title==='超极巨化皮卡丘'));
 assert.deepEqual(view.sections.slice(0,3).map(section=>section.title),['基本资料','词条导语','内容摘读']);assert.ok(view.sections.slice(0,3).every(section=>section.collapsed!==true));assert.ok(view.sections.slice(3).every(section=>section.collapsed===true));
 const rendered=[view.summary,...flatten(view).map(([,value])=>value),...view.sections.flatMap(section=>section.paragraphs||[])].join('\n');assert.doesNotMatch(rendered,/\{\{|\[\[|<img|File:025Pikachu|PokémonPrevNext|未完成/);assert.equal(JSON.stringify(value),original);
});

test('Wiki article basics survive nested templates and links without remote rendering',()=>{
 const make=content=>({title:'测试道具',fields:{revisions:[{revid:1,slots:{main:{content}}}]}});
 const row=make('{{道具信息框|name=[[精灵球|精靈球]]|jname={{lang|ja|モンスターボール}}|enname=Poké Ball|effect={{i|捕捉}}[[宝可梦]]|region={{未知模板|不得猜测}}}}\n\'\'\'精灵球\'\'\'是[[宝可梦]]世界的道具。<ref>脚注不混入导语</ref>\n\n==效果==\n用来捕捉宝可梦。\n\n[[File:Example.png|caption]]');
 const output=languageReading('pokewiki',row,{}),data=new Map(flatten(output));assert.equal(data.get('中文名'),'精靈球');assert.equal(data.get('日文名'),'モンスターボール');assert.equal(data.get('英文名'),'Poké Ball');assert.equal(data.get('效果'),'捕捉宝可梦');assert.equal(data.has('地区'),false);assert.match(output.summary,/精灵球是宝可梦世界的道具/);assert.doesNotMatch(JSON.stringify(output),/Example.png|脚注|未知模板|不得猜测/);
 const unknown=languageReading('pokewiki',make('{{不认识的模板|名字=不要猜}}'),{});assert.equal(unknown.sections[0].title,'正文说明');assert.match(unknown.sections[0].paragraphs[0],/原文链接/);
 const noRevision=languageReading('pokewiki',{title:'缺失',fields:{}},{});assert.match(noRevision.summary,/未提供/);
});

test('Wiki plain projection does not expose active markup, transclusions or media',()=>{
 const original='{{训练家信息框|name=小智|region=[[关都地区]]}}\n小智是训练家。<script>evil()</script><iframe src="https://evil.test"></iframe>[[File:track.svg|像素]]{{未知|<img src="https://evil.test/a">}}\n\n==概述==\n原站简介。';
 const row={title:'小智',fields:{revisions:[{slots:{main:{content:original}}}]}};
 const output=languageReading('pokewiki',row,{});assert.equal(new Map(flatten(output)).get('地区'),'关都地区');assert.doesNotMatch(JSON.stringify(output),/<script|<iframe|<img|evil\(\)|evil.test|track.svg/);assert.equal(row.fields.revisions[0].slots.main.content,original);
 const malformed={title:'复杂',fields:{revisions:[{slots:{main:{content:'{{'.repeat(80)+'x'+'}}'.repeat(80)}}}]}};assert.doesNotThrow(()=>languageReading('pokewiki',malformed,{}));
});

test('汉典 actual character and idiom records expose readings, strokes and original dictionary sections',async()=>{
 const character=projection(await fixture('zdic-character')),data=new Map(flatten(character));assert.equal(character.title,'明');assert.equal(data.get('拼音'),'míng');assert.equal(data.get('部首'),'日');assert.equal(data.get('部外'),'4');assert.equal(data.get('总笔画'),'8');assert.equal(data.get('统一码'),'CJK 660E');assert.equal(data.get('笔顺'),'25113511');assert.equal(data.get('字形结构'),'左右结构');assert.match(data.get('异体'),/朙/);
 assert.ok(character.sections.some(section=>section.title==='康熙字典'));assert.ok(character.sections.some(section=>section.title==='说文解字'));
 assert.deepEqual(character.sections.filter(section=>section.collapsed!==true).map(section=>section.title),['读音与字形','基本解释']);assert.ok(character.sections.filter(section=>['详细解释','國語辭典','康熙字典','说文解字','音韵方言','字源字形'].includes(section.title)).every(section=>section.collapsed===true));
 const idiom=projection(await fixture('zdic-idiom'));assert.match(new Map(flatten(idiom)).get('拼音'),/bù yán ér yù/);assert.match(idiom.sections.find(section=>section.title==='成语').paragraphs[0],/孟子/);assert.equal(idiom.sections.some(section=>section.title==='百科'),false);assert.doesNotMatch(JSON.stringify(idiom),/反馈|内容登录会员可见/);
 assert.deepEqual(idiom.sections.filter(section=>section.collapsed!==true).map(section=>section.title),['读音与字形','词语解释']);assert.ok(idiom.sections.filter(section=>section.title!=='读音与字形'&&section.title!=='词语解释').every(section=>section.collapsed===true));
});

test('CNK search and detail show actual complete poem lines, date, author, dynasty and criticism',async()=>{
 const search=projection(await fixture('cnk-search')),detail=projection(await fixture('cnk-writing'));
 assert.equal(search.title,'靜夜思');assert.equal(new Map(flatten(search)).get('作者'),'李白');assert.equal(new Map(flatten(search)).get('朝代'),'盛唐');assert.equal(new Map(flatten(search)).get('写作时间'),'727年');
 assert.equal(search.sections.find(section=>section.title==='正文').paragraphs[0],'牀前明月光，疑是地上霜。\n舉頭望山月，低頭思故鄉。');assert.match(search.sections.find(section=>section.title==='评注与出处').paragraphs[0],/《唐诗品汇》/);
 assert.equal(detail.title,'野廟');assert.equal(new Map(flatten(detail)).get('作者'),'司馬光');assert.equal(detail.sections.find(section=>section.title==='正文').paragraphs[0].split('\n').length,4);
});

test('CNK all three tune modes retain complete formats and readable original line arrangement',async()=>{
 const search=projection(await fixture('cnk-tune-search')),detail=projection(await fixture('cnk-tune')),pattern=projection(await fixture('cnk-pattern'));
 assert.equal(search.title,'水調歌頭');assert.equal(new Map(flatten(search)).get('别名'),'元会曲、凯歌');assert.match(search.sections[0].paragraphs[0],/唐人大曲/);
 assert.equal(detail.sections.filter(section=>/^谱式 \d+$/.test(section.title)).length,3);assert.equal(detail.sections.filter(section=>section.title==='例词与平仄对照').length,3);assert.equal(detail.sections.filter(section=>section.title==='谱式说明').length,3);assert.match(JSON.stringify(detail),/深相憶/);assert.doesNotMatch(JSON.stringify(detail),/<p|<span|class=/);
 assert.equal(pattern.title,'木蘭花慢');assert.equal(new Map(flatten(pattern)).has('匹配起点（原接口位置）'),false);assert.match(JSON.stringify(pattern),/柳永/);
});

test('poetry joins punctuation fragments, prose flows, and explicit stanza breaks survive',()=>{
 const fragments=['原知己之时义，','故相知之信然。','乃贪廉之异贯，','奈穷达之相悬。'];
 const read=(Type,Clauses)=>languageReading('cnkgraph',{title:'正文',fields:{Type,Clauses}},{}).sections.find(s=>s.title==='正文').paragraphs[0];
 const clauses=fragments.map(Content=>({Content,BreakAfter:null})),before=JSON.stringify(clauses);
 assert.equal(read('赋',clauses),fragments.join(''));
 assert.equal(read('律詩',clauses),'原知己之时义，故相知之信然。\n乃贪廉之异贯，奈穷达之相悬。');
 assert.equal(read('詞',[{Content:'一片秋香世界，'},{Content:'几层凉雨楼台。',BreakAfter:true},{Content:'末句。'}]),'一片秋香世界，几层凉雨楼台。\n\n末句。');
 assert.equal(read('散文',[{Content:'第一段。',BreakAfter:true},{Content:'第二段，'},{Content:'还在第二段。'}]),'第一段。\n\n第二段，还在第二段。');
 assert.equal(read('文',[{Content:'引号内的问句？”'},{Content:'其后。'}]),'引号内的问句？”其后。');
 assert.equal(JSON.stringify(clauses),before);
});

test('CNK rhyme category retains every returned character with notes and cross-rhyme pointers',async()=>{
 const value=await fixture('cnk-rhyme'),output=projection(value),table=output.sections.find(section=>section.table).table;
 assert.deepEqual(table.columns,['字','原注','另见韵目']);assert.equal(table.rows.length,244);assert.equal(table.rows.length,value.record.fields.Chars.length);assert.ok(table.rows.some(row=>row[0]==='醒'&&row[1]==='醉醒'&&row[2]==='迥'));
 assert.deepEqual(table.rows.at(-1),value.record.fields.Chars.slice(-1).map(c=>[c.Char,c.Comment??'',c.Sames??''])[0]);
});

test('all archived complete records stay immutable and outputs contain only plain display values',async()=>{
 for(const name of ['pokewiki-pikachu','zdic-character','zdic-idiom','cnk-search','cnk-writing','cnk-tune-search','cnk-tune','cnk-pattern','cnk-rhyme']){const value=await fixture(name),raw=JSON.stringify(value);assert.equal(value.fixture.status,200);assert.match(value.fixture.sourceURL,/^https:/);const output=projection(frozen(value));assert.ok(output.sections.length>0,name);assert.equal(JSON.stringify(value),raw,name);for(const section of output.sections){assert.equal(typeof section.title,'string');for(const field of section.fields||[])assert.ok(field.every(v=>typeof v==='string'));for(const line of section.paragraphs||[])assert.equal(typeof line,'string');for(const row of section.table?.rows||[])assert.ok(row.every(v=>typeof v==='string'));}}
 assert.equal(languageReading('not-a-provider',{fields:{}},{}),null);
});
