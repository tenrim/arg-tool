import {test} from 'node:test';
import assert from 'node:assert/strict';
import {GUIDE_GROUPS,GUIDE_SITES,GUIDE_PAGES,findGuideSites} from '../public/external-guide/catalog.js';
import {sitePages} from '../public/navigation.js';

test('external introductions cover the approved remainder without broad encyclopedias or integrated queries',()=>{
 const excluded=['E01','E09','E11','E16','E17','E19','E20','E23','E34','E27','E35','E38'];
 const expected=Array.from({length:40},(_,i)=>'E'+String(i+1).padStart(2,'0')).filter(id=>!excluded.includes(id));
 assert.deepEqual(GUIDE_SITES.filter(s=>s.id.startsWith('E')).map(s=>s.id).sort(),expected);
 const approved=['P01','P02','P05','P06','P07','P08','P09','P12','P15','P16','P17','P23','P24','P26'];
 assert.deepEqual(GUIDE_SITES.filter(s=>s.id.startsWith('P')).map(s=>s.id).sort(),approved);
 assert.equal(new Set(GUIDE_SITES.map(s=>s.url)).size,42);
 assert.equal(new Set(GUIDE_SITES.map(s=>s.id)).size,42);
 for(const group of GUIDE_GROUPS)assert.ok(GUIDE_SITES.some(s=>s.group===group.id));
 for(const s of GUIDE_SITES){
  assert.ok(GUIDE_GROUPS.some(g=>g.id===s.group));assert.equal(new URL(s.url).protocol,'https:');
  assert.ok(s.description.length>100,s.id+' has a full introduction');
  for(const key of ['scope','clues','steps','limits','relation'])assert.equal(key in s,false);
 }
});
test('category introductions have one static owner and do not mix query scopes',()=>{
 const expected={reference:34,codec:2,media:3,other:3};
 for(const page of GUIDE_PAGES){
  assert.equal(sitePages.find(p=>p.route===page.route),page);
  const sites=findGuideSites('','',page.category);
  assert.equal(sites.length,expected[page.category]);
  for(const site of sites)assert.ok(page.aliases.includes(site.id)&&page.aliases.includes(site.name));
 }
 assert.equal(findGuideSites('','P26','reference').length,0);
 assert.equal(findGuideSites('music','P26','other').length,0);
 assert.deepEqual(findGuideSites('','Godbolt','other').map(s=>s.id),['P26']);
 assert.deepEqual(findGuideSites('','汇编','other').map(s=>s.id),['P26']);
 assert.equal(GUIDE_PAGES.find(p=>p.category==='other').route,'external-other');
});
test('guide search keeps directory filters separate and searches introductions',()=>{
 assert.deepEqual(findGuideSites('','NUTRIMATIC').map(s=>s.id),['E04']);
 assert.deepEqual(findGuideSites('music','Nutrimatic'),[]);
 assert.ok(findGuideSites('media-analysis','隐写','media').some(s=>s.id==='E29'));
 assert.deepEqual(findGuideSites('','E40').map(s=>s.id),['E40']);
 assert.equal(findGuideSites('','<script>').length,0);
});
