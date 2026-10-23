import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {scienceReading} from '../public/online-query/reading-science.js';

const fixture=name=>JSON.parse(fs.readFileSync(new URL(`./fixtures/online-reading/science/${name}.json`,import.meta.url),'utf8'));
const read=(provider,name)=>{const {record,result}=fixture(name);return scienceReading(provider,record,result);};
const fields=reading=>Object.fromEntries(reading.sections.flatMap(section=>section.fields||[]));
const table=(reading,title)=>reading.sections.find(section=>section.title===title)?.table;
const freeze=value=>{if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};

test('SIMBAD name/basic reading exposes identity, ICRS frame, epoch and actual source units without inventing missing measurements',()=>{
  const {record,result}=fixture('simbad-name'),before=JSON.stringify({record,result}),reading=scienceReading('simbad',freeze(record),freeze(result)),shown=fields(reading);
  assert.equal(reading.title,'M  31');assert.equal(shown['天体类型（原分类代码）'],'AGN');assert.match(shown['赤经'],/10\.684708333333333 deg/);assert.equal(shown['坐标参考系'],'ICRS');assert.equal(shown['坐标历元'],'J2000');assert.equal(shown['视向速度'],'-300 km.s-1');assert.equal(shown['文献数量'],undefined);assert.equal(shown['视差'],undefined);assert.equal(JSON.stringify({record,result}),before);
  const detail=scienceReading('simbad',record,{...result,parameters:{mode:'detail',oid:1575544,section:'basic'}});assert.equal(fields(detail)['主要标识符'],'M  31');
});

test('SIMBAD cone keeps its original frame, angular-distance unit and separate band measurements',()=>{
  const reading=read('simbad','simbad-cone'),shown=fields(reading),bands=table(reading,'天区返回的测光值');assert.match(shown['距查询中心角距离'],/^7\.879335328886527e-7（原服务未标注单位）$/);assert.equal(shown['原始坐标表示'],'00 42 44.330 +41 16 07.50');assert.deepEqual(bands.rows.find(row=>row[0]==='B'),['B','4.36','原服务未标注']);assert.equal(bands.rows.find(row=>row[0]==='R'),undefined);
});

test('SIMBAD photometry labels the band/system and retains uncertainty and literature; identifiers and bibliography are actual content',()=>{
  const photo=read('simbad','simbad-photometry'),shown=fields(photo);assert.equal(photo.title,'B 波段测光');assert.equal(shown['测光系统'],'Vega（V）');assert.equal(shown['测光值'],'4.36');assert.equal(shown['不确定度'],'0.02');assert.match(shown['论文入口'],/2007ApJS/);assert.equal(photo.sections[0].paragraphs,undefined);
  assert.equal(fields(read('simbad','simbad-identifiers'))['标识符'],'2C   56');const bibliography=fields(read('simbad','simbad-detail'));assert.equal(bibliography['出版年份'],'1850');assert.match(bibliography['论文题名（原文）'],/Catalogue/);assert.match(bibliography['论文入口'],/ui\.adsabs\.harvard\.edu/);
  const zero=scienceReading('simbad',{title:'Zero',fields:{filter:'X',flux:0,flux_err:0,system:'custom'}},{parameters:{section:'photometry'},columns:[]});assert.equal(fields(zero)['测光值'],'0');assert.equal(fields(zero)['测光系统'],'custom');
});

test('VizieR separates catalogue contents from explicit schema and real data',()=>{
 const catalogue=read('vizier','vizier-catalogs'),schema=read('vizier','vizier-columns');
 assert.match(catalogue.title,/Hipparcos/);assert.deepEqual(catalogue.sections.filter(section=>!section.collapsed).map(section=>section.title),['可查询的资料']);
 const credit=catalogue.sections.find(section=>section.title==='资料出处');assert.equal(credit.collapsed,true);assert.deepEqual(credit.fields,[['作者／机构','ESA 1997'],['文献','1997HIP...C......0E'],['许可','https://cds.unistra.fr/vizier-org/licences_vizier.html']]);
 assert.match(catalogue.sections[0].paragraphs[0],/赤经/);assert.doesNotMatch(JSON.stringify(catalogue),/目录表标识|本次返回字段数|格式／类型|不将不同星表/);
 const columns=table(schema,'字段与单位');assert.deepEqual(columns.columns,['项目','单位','说明']);const ra=columns.rows.find(row=>row[0].includes('RAICRS'));assert.equal(ra[0],'赤经 · RAICRS');assert.equal(ra[1],'deg');assert.match(ra[2],/J1991\.25/);assert.equal(columns.rows.length,50);
});
test('VizieR values retain precision, units, zero and exact descriptions without displaying missing fields',()=>{
 const {record,result}=fixture('vizier-records'),before=JSON.stringify({record,result}),reading=scienceReading('vizier',record,result),rows=table(reading,'天体数据').rows;
 assert.deepEqual(rows.find(row=>row[0].includes('RAICRS')),['赤经 · RAICRS','000.00091185','deg']);
 assert.equal(reading.sections.find(section=>section.title==='字段说明').collapsed,true);assert.match(table(reading,'字段说明').rows.find(row=>row[0].includes('RAICRS'))[1],/J1991\.25/);assert.equal(JSON.stringify({record,result}),before);
 const custom=scienceReading('vizier',{id:'T:1',title:'Record',fields:{RA:0,empty:' ',null:null,unknown:'<script>x</script>'}},{parameters:{mode:'records',table:'T'},columns:[{name:'RA',ucd:'pos.eq.ra',unit:'rad',description:'Original frame'}]});
 assert.deepEqual(table(custom,'天体数据').rows,[['赤经 · RA','0','rad'],['unknown','<script>x</script>','—']]);
});

test('COD search/detail summarizes documented schema units and original publication without claiming an available live service',()=>{
  // Protocol edge fixture, not a downloaded COD record. The field units are
  // documented by COD's public MySQL schema.
  const record={id:'1000000',title:'Protocol sample',fields:{file:'1000000',formula:'Si O2',sg:'P 31 2 1',a:'4.9(1)',alpha:90,vol:100,celltemp:298,title:'Original paper',authors:['Author A','Author B'],doi:'10.1234/test',year:2000,unknown:{original:true}}},before=JSON.stringify(record);
  for(const mode of ['search','detail']){const reading=scienceReading('cod',record,{parameters:{mode}}),shown=fields(reading);assert.equal(shown['分子式'],'Si O2');assert.equal(shown['空间群（Hermann–Mauguin）'],'P 31 2 1');assert.equal(shown['晶胞边长 a（Å）'],'4.9(1)');assert.equal(shown['晶胞角 α（°）'],'90');assert.equal(shown['晶胞测量温度（K）'],'298');assert.equal(shown['作者'],'Author A；Author B');assert.equal(shown['原始论文入口'],'https://doi.org/10.1234/test');assert.equal(shown['原始 CIF 链接'],'https://www.crystallography.net/cod/1000000.cif');}assert.equal(JSON.stringify(record),before);
});

test('COD CIF reading extracts only explicit scalar fields, skips multiline quotations and leaves uncertainty unchanged',()=>{
  const cif="data_1000000\n_chemical_formula_sum 'Si O2'\n_cell_length_a 4.123(4)\n_cell_length_b ?\n_cell_angle_alpha 90\n_publ_section_title\n;\n_cell_length_c 999\nthis is quoted text\n;\nloop_\n_atom_site_label\nSi1\n",record={id:'1000000',title:'COD',fields:{id:'1000000',format:'CIF',cif},sourceURL:'https://www.crystallography.net/cod/1000000.cif'},shown=fields(scienceReading('cod',record,{parameters:{mode:'cif'}}));assert.equal(shown['分子式'],'Si O2');assert.equal(shown['晶胞边长 a（Å）'],'4.123(4)');assert.equal(shown['晶胞边长 b（Å）'],undefined);assert.equal(shown['晶胞边长 c（Å）'],undefined);assert.equal(shown['数据块'],undefined);assert.equal(record.fields.cif,cif);
});

test('PubChem search exposes actual molecular identity, mass, identifiers and calculated properties for every supported identifier kind',()=>{
  const {record,result}=fixture('pubchem-search'),before=JSON.stringify(record);
  for(const kind of ['name','cid','formula','smiles','inchi']){const reading=scienceReading('pubchem',freeze(record),{...result,parameters:{mode:'search',kind}}),shown=fields(reading);assert.equal(shown['PubChem CID'],'2244');assert.equal(shown['分子式'],'C9H8O4');assert.equal(shown['分子量（g/mol）'],'180.16');assert.equal(shown['精确质量（Da）'],'180.04225873');assert.equal(shown['总形式电荷'],'0');assert.match(shown['标准 InChI'],/^InChI=/);assert.equal(shown['标准 InChIKey'],'BSYNRYMUTXBXSQ-UHFFFAOYSA-N');assert.match(shown['SMILES（含立体信息）'],/^CC/);}assert.equal(JSON.stringify(record),before);
});

test('PubChem annotation view selects useful fields, preserves per-value units/conditions and attaches only actual original sources',()=>{
  const reading=read('pubchem','pubchem-detail'),properties=table(reading,'基本性质与说明').rows,sources=table(reading,'资料出处').rows;assert.equal(fields(reading)['PubChem 名称'],'Aspirin');assert.equal(properties.find(row=>row[0]==='分子量')[1],'180.16 g/mol');assert.equal(properties.find(row=>row[0]==='精确质量')[1],'180.04225873 Da');assert.ok(properties.some(row=>row[0]==='颜色与形态（原文）'));assert.ok(sources.some(row=>row[1]==='PubChem'));assert.ok(sources.some(row=>row[3].startsWith('https://')));
  const unknown=scienceReading('pubchem',{title:'Unknown',fields:{Record:{RecordNumber:1,RecordTitle:'Original',Section:[{TOCHeading:'Molecular Weight',Information:[{ReferenceNumber:99,Value:{Number:[0],Unit:'u'}}]},{TOCHeading:'Unmapped source section',Information:[{Value:{Number:[9]}}]}]}}},{parameters:{mode:'detail'}});const rows=table(unknown,'基本性质与说明').rows;assert.deepEqual(rows[0],['分子量','0 u','来源编号 99','未提供']);assert.equal(rows.length,1);
});

test('PubChem synonyms use actual source Chinese names when present and explicitly bound large previews',()=>{
  assert.equal(fields(read('pubchem','pubchem-synonyms'))['同义词数量'],'8');const synonyms=['现有中文名',...Array.from({length:100},(_,i)=>`Synonym ${i}`)],record={id:'1',title:'CID1',fields:{InformationList:{Information:[{CID:1,Synonym:synonyms}]}}},reading=scienceReading('pubchem',record,{parameters:{mode:'synonyms'}});assert.deepEqual(table(reading,'原服务中文同义词').rows,[['现有中文名']]);assert.equal(table(reading,'其他同义词与编号').rows.length,40);assert.match(reading.sections.at(-1).paragraphs[0],/40 \/ 100/);assert.equal(record.fields.InformationList.Information[0].Synonym.length,101);
});

test('PubChem structure preserves real atom IDs/atomic numbers/coordinates/bonds and does not invent 3D positions or units',()=>{
  const {record,result}=fixture('pubchem-structure'),reading=scienceReading('pubchem',record,result),shown=fields(reading),atom=table(reading,'首个构象的原子坐标').rows[0];assert.equal(shown['请求维度'],'3d');assert.equal(shown['原子数量（本记录）'],'21');assert.deepEqual(atom,['1','8','1.2333','0.554','0.7792']);assert.deepEqual(table(reading,'化学键').rows[0],['1','5','1']);assert.equal(record.fields.PC_Compounds[0].coords.length>0,true);
  const twoD=scienceReading('pubchem',{id:'2',title:'2D',fields:{PC_Compounds:[{id:{id:{cid:2}},atoms:{aid:[7],element:[6]},coords:[{aid:[7],conformers:[{x:[0],y:[0]}]}],bonds:{aid1:[],aid2:[],order:[]}}]}},{parameters:{mode:'structure',dimension:'2d'}});assert.deepEqual(table(twoD,'首个构象的原子坐标').rows[0],['7','6','0','0','未提供']);
});

test('science reader does not generate data for unknown providers and accepts absent optional fields without false values',()=>{
  assert.equal(scienceReading('unknown',{fields:{}},{}),null);assert.equal(scienceReading('simbad',null,{}),null);
  for(const provider of ['simbad','vizier','cod','pubchem']){const reading=scienceReading(provider,{id:'1',title:'Original',fields:{}},{parameters:{}});assert.ok(Array.isArray(reading.sections));assert.ok(!JSON.stringify(reading).includes('undefined'));}
});
