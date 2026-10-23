import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import test from 'node:test';
import { queryBirds, queryBirdMetadata, queryMusic } from '../public/atlas-life-culture/core.js';

const root = new URL('../', import.meta.url);
const read = path => readFileSync(new URL(path, root));
const json = path => JSON.parse(read(path));
const birds = json('public/vendor/atlas-life-culture/birds.json');
const birdMetadata = json('public/vendor/atlas-life-culture/birds-metadata.json');
const music = json('public/vendor/atlas-life-culture/music.json');
const originalMusic = json('upstream/atlas-life-culture/openopus-dump.json');
test('player record projections keep technical fields and attribution in complete original records',()=>{
 const bird=queryBirds(birds,{query:'Struthio molybdophanes'}).items[0];
 assert.equal(bird.presentation.primary.find(([label])=>label==='中文名')[1],'灰颈鸵鸟');
 assert.ok(bird.presentation.primary.every(([label])=>!label.includes('_')&&!/原表|许可|快照|来源|英文/.test(label)));
 assert.ok(bird.fields.some(([label])=>label==='中文名署名与许可'));assert.equal(Object.keys(bird.raw).length,26);
 assert.ok(bird.presentation.additional.some(([label,value])=>label==='英文名'&&value==='Somali Ostrich'));
 const work=queryMusic(music,{query:'K.550'}).items.find(item=>item.raw.composer.name==='Mozart');
 assert.ok(work.presentation.primary.every(([label])=>!label.includes('_')));assert.ok(work.raw.work.title.includes('Symphony'));assert.ok(work.fields.length>work.presentation.primary.length);
});

test('complete fixed data and notice bytes agree with source and runtime manifests', () => {
  const pins = json('upstream/atlas-life-culture/pins.json');
  const manifest = json('public/vendor/atlas-life-culture/UPSTREAM.json');
  for (const item of [...pins.files, ...manifest.files]) {
    const bytes = read(item.path);
    assert.equal(bytes.length, item.bytes, item.path);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), item.sha256, item.path);
  }
  for (const name of ['birds.json', 'birds-metadata.json', 'music.json']) assert.deepEqual(gunzipSync(read(`public/vendor/atlas-life-culture/${name}.gz`)), read(`public/vendor/atlas-life-culture/${name}`));
  assert.deepEqual(read('public/vendor/atlas-life-culture/AviList-v2025b-10Jun2026-extended.xlsx'), read('upstream/atlas-life-culture/AviList-v2025b-10Jun2026-extended.xlsx'));
});

test('AviList Extended retains every rank, every column, contiguous original sequence and six worksheets', () => {
  assert.equal(birds.records.length, 33684);
  assert.equal(birds.columns.length, 26);
  assert.equal(birds.labels.length, 26);
  assert.equal(birds.records.every(row => row.length === 26), true);
  assert.equal(birds.records.at(-1)[0], 33684);
  assert.equal(birds.records.every((row, index) => row[0] === index + 1), true);
  const counts = Object.fromEntries(['order', 'family', 'genus', 'species', 'subspecies'].map(rank => [rank, queryBirds(birds, { rank }).total]));
  assert.deepEqual(counts, { order: 46, family: 252, genus: 2376, species: 11131, subspecies: 19879 });
  assert.equal(queryBirds(birds).total, 33684);
  assert.equal(queryBirds(birds).items.length, 24);
  assert.equal(birdMetadata.sheets.length, 6);
  assert.deepEqual(birdMetadata.sheets.map(sheet => sheet.name), ['AviList v2025b extended', 'Decision summaries', 'Recommended citation', 'How to use', 'References', 'Changes from previous version']);
  assert.deepEqual(birdMetadata.sheets.map(sheet => sheet.rows.length), [2, 1134, 3, 27, 1343, 62]);
  assert.equal(birdMetadata.sheets[0].recordRows.length, birds.records.length);
  assert.equal(birdMetadata.sheets[0].recordRows.at(-1), 33686);
});

test('bird search combines exact rank/family filters, original aliases and untouched 26-field details', () => {
  const found = queryBirds(birds, { query: 'struthio CAMELUS', rank: 'species', order: 'Struthioniformes', family: 'Struthionidae' });
  assert.equal(found.total, 1);
  assert.equal(found.items[0].id, 'bird:5');
  assert.equal(found.items[0].title, '非洲鸵鸟 · Struthio camelus');
  assert.equal(found.items[0].raw.English_name_AviList,'Common Ostrich');
  assert.equal(birds.columns.every(column=>found.items[0].fields.some(([key])=>key.endsWith(`（${column}）`))),true);
  assert.deepEqual(Object.keys(found.items[0].raw), birds.columns);
  assert.equal(found.items[0].raw.Protonym, 'Struthio Camelus');
  assert.equal(found.items[0].raw.Proposal_number, null);
  assert.equal(queryBirds(birds, { query: 'avibase-2247CB05' }).items[0].id, 'bird:5');
  assert.equal(queryBirds(birds, { recordId: 'bird:5', rank: 'order', query: 'irrelevant' }).items[0].raw.Scientific_name, 'Struthio camelus');
  assert.equal(queryBirds(birds, { query: '<script>alert(1)</script>' }).total, 0);
  assert.deepEqual(queryBirds(birds, { recordId: 'bird:missing' }).items, []);
  assert.equal(queryBirds(birds, { page: 999999, pageSize: 100 }).page, 336);
  assert.equal(queryBirds(birds).page, 0);
  assert.equal(queryBirds(birds, { page: 1 }).items[0].raw.Sequence, 25);
  assert.equal(queryBirds(birds, { pageSize: 1000 }).items.length, 100);
  assert.equal(found.facets.orders.length, 46);
  assert.equal(found.facets.families.length, 252);
});

test('workbook auxiliary rows remain individually searchable and preserve notes and source row numbers', () => {
  const decisions = queryBirdMetadata(birdMetadata, { sheet: 'Decision summaries', query: 'Shepherd', pageSize: 100 });
  assert.ok(decisions.total >= 1);
  assert.ok(decisions.items.some(item => item.raw.values.some(value => String(value).includes('Apteryx maxima'))));
  const references = queryBirdMetadata(birdMetadata, { sheet: 'References' });
  assert.equal(references.total, 1343);
  assert.equal(references.items.length, 24);
  const citation = queryBirdMetadata(birdMetadata, { sheet: 'Recommended citation', pageSize: 100 });
  assert.equal(citation.total, 3);
  assert.ok(citation.items.some(item => item.raw.values.some(value => String(value).includes('10.2173/avilist.v2025b'))));
  // The release changed visible citation text but retained an older embedded hyperlink.
  // Preserve this upstream discrepancy instead of silently rewriting its source record.
  assert.ok(citation.items.some(item => Object.values(item.raw.cellMetadata).some(cell => cell.hyperlink?.target === 'https://doi.org/10.2173/avilist.v2025')));
  assert.equal(citation.facets.sheets.length, 6);
  const main = queryBirdMetadata(birdMetadata, { sheet: 'AviList v2025b extended' });
  assert.equal(main.items[0].raw.mainTableRecordsRef, 'birds.json#/records');
  assert.deepEqual(queryBirdMetadata(birdMetadata, { recordId: decisions.items[0].id }).items[0].raw, decisions.items[0].raw);
});

test('complete Open Opus source can be reconstructed without losing one composer, work or field', () => {
  assert.equal(music.composers.length, 220);
  assert.equal(music.records.length, 24975);
  assert.equal(originalMusic.status.rows, music.composers.length + music.records.length);
  assert.deepEqual(music.meta.originalStatus, originalMusic.status);
  assert.deepEqual(music.meta.originalRequest, originalMusic.request);
  const works = new Map(music.records.map(work => [work.id, work]));
  const reconstructed = music.composers.map(composer => ({ ...composer.raw, works: composer.workIds.map(id => {
    const work = works.get(id);
    assert.equal(work.composerId, composer.id);
    return work.raw;
  }) }));
  assert.deepEqual(reconstructed, originalMusic.composers);
  assert.equal(new Set(music.records.map(work => work.id)).size, 24975);
  assert.equal(new Set(music.composers.map(composer => composer.id)).size, 220);
});

test('music query links exact composer/epoch/genre to real work and returns full raw detail', () => {
  const composers = queryMusic(music, { category: 'composers', query: 'Mozart' });
  assert.equal(composers.total, 1);
  const mozart = composers.items[0];
  assert.equal(mozart.raw.complete_name, 'Wolfgang Amadeus Mozart');
  assert.match(mozart.title,/莫[扎札]特.*Wolfgang Amadeus Mozart/u);
  const match = queryMusic(music, { query: 'K.550', composerId: mozart.id, epoch: 'Classical', genre: 'Orchestral' });
  assert.equal(match.total, 1);
  assert.equal(match.items[0].raw.work.title, 'Symphony no. 40 in G minor, K.550');
  assert.equal(match.items[0].raw.composer.complete_name, mozart.raw.complete_name);
  assert.equal(match.items[0].composerId, mozart.id);
  assert.deepEqual(queryMusic(music, { recordId: match.items[0].id, category: 'composers' }).items[0], match.items[0]);
  assert.equal(queryMusic(music, { query: 'K.550', composerId: mozart.id, epoch: 'Baroque' }).total, 0);
  assert.ok(queryMusic(music, { query: 'K.550', epoch: 'Baroque' }).items.some(item => item.raw.composer.name === 'Scarlatti'));
  assert.equal(queryMusic(music, { composerId: mozart.id }).total, mozart.raw.works.length);
  assert.equal(queryMusic(music, { query: 'Ades', category: 'composers' }).items[0].raw.name, 'Adès');
  assert.equal(queryMusic(music).total, 24975);
  assert.equal(queryMusic(music, { category: 'composers' }).total, 220);
  assert.equal(queryMusic(music).facets.composers.length, 220);
  assert.deepEqual(queryMusic(music, { recordId: 'work:missing' }).items, []);
});

test('schema errors fail rather than dropping incomplete records or composer relations', () => {
  assert.throws(() => queryBirds({ ...birds, columns: birds.columns.slice(1) }), /列结构/);
  assert.throws(() => queryBirds({ ...birds, records: [birds.records[0].slice(1)] }), /列数不完整/);
  assert.throws(() => queryBirds({ ...birds, records: [birds.records[0], birds.records[0]] }), /重复/);
  assert.throws(() => queryMusic({ ...music, composers: [] }), /关系不完整/);
  assert.throws(() => queryBirdMetadata({}), /无效/);
});

test('Chinese bird names are additive exact-species overlays with source attribution and no invented subspecies names', () => {
  assert.equal(birds.meta.chineseSupplement.matchedSpecies, 11075);
  assert.equal(birds.meta.chineseSupplement.unmatchedSpecies, 56);
  assert.equal(Object.keys(birds.chineseNames).length, 11075);
  const species = new Set(birds.records.filter(row=>row[birds.columns.indexOf('Taxon_rank')]==='species').map(row=>row[birds.columns.indexOf('Scientific_name')]));
  for (const [scientific, row] of Object.entries(birds.chineseNames)) {
    assert.ok(species.has(scientific));
    assert.ok(row.names.length && row.names.every(name=>name===row.simplified||name===row.traditional));
    assert.ok(Number.isInteger(row.sourceRow) && row.sourceRow>=2 && row.sourceRow<=11228);
  }
  for (const query of ['麻雀', '喜鹊', '鴕鳥']) {
    const result=queryBirds(birds,{query});assert.ok(result.total>0);
    assert.ok(result.items.every(item=>item.raw.Taxon_rank==='species'));
    assert.ok(result.items.every(item=>item.fields.some(([key,value])=>key==='中文名署名与许可'&&value.includes('CC BY 3.0'))));
    for(const item of result.items)assert.deepEqual(Object.keys(item.raw),birds.columns);
  }
  assert.equal(queryBirds(birds,{query:'中国'}).total,queryBirds(birds,{query:'中國'}).total);
  assert.match(queryBirds(birds).note,/分布说明仍为原文/);
  assert.match(queryBirdMetadata(birdMetadata).note,/保留原文/);
});

test('CLDR range search uses complete English territory terms, never Niger substrings inside Nigeria', () => {
  const fixture={...birds,chineseNames:{},records:['Nigeria','Niger','China'].map((range,index)=>birds.columns.map(column=>({Sequence:100000+index,Taxon_rank:'species',Order:'TestOrder',Family:'TestFamily',Scientific_name:'Testus '+index,Range:range}[column]??null)))};
  assert.deepEqual(queryBirds(fixture,{query:'尼日尔'}).items.map(item=>item.raw.Range),['Niger']);
  assert.deepEqual(queryBirds(fixture,{query:'中国'}).items.map(item=>item.raw.Range),['China']);
  assert.deepEqual(queryBirds(fixture,{query:'中國'}).items.map(item=>item.raw.Range),['China']);
  assert.equal(queryBirds(fixture).total,3);
});

test('Chinese composer identity evidence and every imported name remain traceable to fixed Wikidata responses', () => {
  const names=json('upstream/atlas-chinese/wikidata-composers.json');
  const responses=Object.values(JSON.parse(gunzipSync(read('upstream/atlas-chinese/wikidata-responses.json.gz'))));
  const entities=Object.assign({},...responses.filter(response=>response.body.entities).map(response=>response.body.entities));
  const normalize=value=>String(value).normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
  const values=(entity,key)=>(entity.claims[key]||[]).filter(claim=>claim.rank!=='deprecated').map(claim=>claim.mainsnak?.datavalue?.value);
  assert.equal(names.records.length,208);assert.equal(names.unmatched.length,12);
  assert.equal(music.composers.filter(composer=>composer.chinese).length,208);
  for(const row of names.records){
    const entity=entities[row.wikidataId];assert.ok(entity);assert.equal(row.revision,entity.lastrevid);
    assert.ok(values(entity,'P31').some(value=>value?.id==='Q5'));
    for(const [property,date]of [['P569',row.birth],['P570',row.death]])if(date)assert.ok(values(entity,property).some(value=>Number(/^([+-]?\d+)/.exec(value?.time||'')?.[1])===Number(date.slice(0,4))));
    const search=responses.find(response=>new URL(response.url).searchParams.get('action')==='wbsearchentities'&&new URL(response.url).searchParams.get('search')===row.completeName);
    assert.ok(search.body.search.some(item=>item.id===row.wikidataId&&[item.label,item.match?.text,...(item.aliases||[])].some(name=>normalize(name||'')===normalize(row.completeName))));
    const sourced=[...Object.values(entity.labels||{}),...Object.values(entity.aliases||{}).flat()].filter(value=>value.language.startsWith('zh')).map(value=>value.value);
    assert.ok(row.names.every(name=>sourced.includes(name)));
  }
  for(const query of ['莫扎特','莫札特','贝多芬','貝多芬','巴赫','巴洛克','室内乐'])assert.ok(queryMusic(music,{query}).total>0);
  assert.equal(queryMusic(music,{query:'莫扎特'}).items[0].raw.composer.complete_name,'Wolfgang Amadeus Mozart');
  const beethoven=queryMusic(music,{query:'贝多芬'}).items[0];
  assert.ok(beethoven.fields.some(([key,value])=>key==='中文名署名与许可'&&value.includes('CC0')));
  assert.ok(beethoven.fields.some(([key,value])=>key==='Wikidata 条目修订号'&&value>0));
});

test('source-backed music-form keywords support Chinese title terms without translating titles or inferring periods', () => {
  assert.equal(music.terminology.length,14);
  const symphony=queryMusic(music,{query:'交响曲',pageSize:100});assert.equal(symphony.total,730);
  assert.equal(queryMusic(music,{query:'交響曲'}).total,symphony.total);
  assert.ok(symphony.items.every(item=>/\bsymphony\b/i.test(item.raw.work.title)));
  assert.ok(symphony.items.every(item=>item.fields.some(([key,value])=>key==='标题术语来源与许可'&&value.includes('https://www.wikidata.org/wiki/')&&value.includes('CC0'))));
  const baroque=queryMusic(music,{query:'巴洛克',pageSize:100});
  assert.equal(baroque.total,music.records.filter(work=>music.composers.find(composer=>composer.id===work.composerId).raw.epoch==='Baroque').length);
  assert.ok(baroque.items.every(item=>item.raw.composer.epoch==='Baroque'));
  assert.match(queryMusic(music).note,/不是|不等于作品分类或完整标题翻译/);
  assert.match(queryMusic(music).note,/作品名称与描述仍为原文/);
});
