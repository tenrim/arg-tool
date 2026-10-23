import test from 'node:test';
import assert from 'node:assert/strict';
import {SCIENCE_PROVIDERS} from '../services/online-query/providers/science.mjs';

const provider=id=>SCIENCE_PROVIDERS.find(item=>item.id===id);
const response=(value,status=200)=>({response:new Response(typeof value==='string'?value:JSON.stringify(value),{status,headers:{'Content-Type':typeof value==='string'?'text/plain':'application/json'}}),text:typeof value==='string'?value:JSON.stringify(value)});
function context(handler){const calls=[],controller=new AbortController();return {calls,controller,signal:controller.signal,now:()=>Date.UTC(2026,9,17),async request(url,options){controller.signal.throwIfAborted();calls.push({url:String(url),options});return handler(url,options,calls.length);}};}
const tap=(names,rows,extra={})=>({metadata:names.map(name=>({name,datatype:'CHAR',unit:name==='ra'?'deg':'',extra:{retained:true}})),data:rows,...extra});
const compound=(id,extra={})=>({id:{id:{cid:id}},atoms:{aid:[1],element:[6]},bonds:{aid1:[],aid2:[],order:[]},coords:[{type:[1],conformers:[{x:[0],y:[0]}]}],props:[{urn:{label:'IUPAC Name',name:'Preferred'},value:{sval:'Full compound'}}],unknown:{all:['preserved',null,1]},...extra});
const tsv=(rows,extra='')=>`# VizieR Astronomical Server vizier.cds.unistra.fr\n#Coosys\tICRS\n#RESOURCE=test\n#Name: I/239\n#Title: Original catalogue\n#INFO\trights_uri=https://example.org/original-license\n#INFO\tcites=OriginalPaper\n#Table\tI_239_hip_main:\n#Name: I/239/hip_main\n#Title: Main catalogue\n#Column\tHIP\t(I6)\tIdentifier\t[ucd=meta.id]\n#Column\tRA\t(F12.8)\tRight ascension\t[ucd=pos.eq.ra]\nHIP\tRA\n \tdeg\n------\t------------\n${rows.map(row=>row.join('\t')).join('\n')}\n${extra}`;

test('science adapters expose fixed official hosts, explicit modes and bounded white-list inputs',()=>{
  assert.equal(SCIENCE_PROVIDERS.length,4);
  assert.deepEqual(provider('simbad').allowedHosts,['simbad.u-strasbg.fr']);
  assert.deepEqual(provider('vizier').allowedHosts,['vizier.cds.unistra.fr']);
  assert.deepEqual(provider('cod').allowedHosts,['www.crystallography.net']);
  assert.deepEqual(provider('pubchem').allowedHosts,['pubchem.ncbi.nlm.nih.gov']);
  for(const id of ['simbad','vizier','cod','pubchem'])assert.throws(()=>provider(id).validate({query:'test',url:'https://attacker.invalid'}),{status:400});
  for(const input of [{query:'\nM31'},{mode:'cone',ra:360,dec:0,radius:1},{mode:'cone',ra:10,dec:91,radius:1},{mode:'cone',ra:10,dec:0,radius:0},{mode:'cone',ra:10,dec:0,radius:2},{mode:'detail',oid:1,section:'arbitrary'},{mode:'detail',oid:1,section:'basic',after:'next'}])assert.throws(()=>provider('simbad').validate(input),{status:400});
  for(const input of [{mode:'records',table:'I/239/hip_main',conditions:[]},{mode:'columns',table:'I/239/hip_main;DROP TABLE'},{mode:'records',table:'I/239/hip_main',conditions:[{column:'HIP',operator:'LIKE',value:'*'}]},{mode:'records',table:'I/239/hip_main',conditions:[{column:'-source',operator:'=',value:'other'}]},{mode:'records',table:'I/239/hip_main',conditions:[{column:'HIP',operator:'=',value:'1'}],offset:250}])assert.throws(()=>provider('vizier').validate(input),{status:400});
  for(const input of [{query:''},{query:'x',elements:['Qq']},{query:'x',elements:['H'],excludeElements:['H']},{mode:'cif',id:'../../etc'},{query:'x',start:1}])assert.throws(()=>provider('cod').validate(input),{status:400});
  for(const input of [{kind:'unknown',query:'x'},{kind:'cid',query:'0'},{kind:'cid',query:'9007199254740993'},{query:'x',start:250},{mode:'structure',cid:1,dimension:'4d'},{mode:'detail',cid:1,url:'https://example.org'}])assert.throws(()=>provider('pubchem').validate(input),{status:400});
});

test('SIMBAD name search retains every source field and original TAP units without arbitrary ADQL',async()=>{
  const raw=tap(['main_id','oid','ra','quality'],[["Barnard's Star",123,10.1,{nested:['all']}]],{unfamiliar:{kept:true}}),ctx=context(()=>response(raw)),p=provider('simbad'),input=p.validate({query:"Barnard's Star"}),value=await p.execute(input,ctx);
  const url=new URL(ctx.calls[0].url);assert.equal(url.origin,'https://simbad.u-strasbg.fr');assert.match(url.searchParams.get('QUERY'),/ident.id='Barnard''s Star'/);
  assert.deepEqual(value.records[0].fields,{main_id:"Barnard's Star",oid:123,ra:10.1,quality:{nested:['all']}});assert.deepEqual(value.columns,raw.metadata);assert.deepEqual(value.rawResponse,raw);assert.equal(value.total,null);
  assert.deepEqual(value.records[0].actions.map(action=>action.parameters.section),['basic','identifiers','photometry','bibliography']);assert.ok(value.records[0].actions.every(action=>action.parameters.oid===123));
});

test('SIMBAD cone uses official spatial index and complete current-page basics; bibliography/identifier use real cursors',async()=>{
  const p=provider('simbad'),raw={columns:[{name:'main_id'},{name:'distance',unit:'deg'}],data:Array.from({length:26},(_,i)=>['Object '+i,i/100]),data_origin:{frame:'ICRS',retained:true}},ctx=context((_url,_options,n)=>response(n===1?raw:tap(['main_id','oid'],Array.from({length:25},(_,i)=>['Object '+i,i+1]))));
  const value=await p.execute(p.validate({mode:'cone',ra:0,dec:-90,radius:0.5}),ctx);assert.equal(value.records.length,25);assert.equal(value.next.after,25);assert.equal(new URL(ctx.calls[0].url).pathname,'/cone/');assert.equal(new URL(ctx.calls[0].url).searchParams.get('SR'),'0.5');assert.equal(new URL(ctx.calls[0].url).searchParams.get('VERB'),'3');assert.equal(value.records[1].fields.cone.distance,0.01);assert.deepEqual(value.rawResponse.cone,raw);assert.equal(value.coneColumns[1].unit,'deg');assert.match(new URL(ctx.calls[1].url).searchParams.get('QUERY'),/main_id IN \(/);
  for(const section of ['identifiers','bibliography']){
    const key=section==='identifiers'?'id':'bibcode',rows=Array.from({length:26},(_,i)=>[String(i).padStart(3,'0')]),meta=tap([key],rows),c=context(()=>response(meta));const result=await p.execute(p.validate({mode:'detail',oid:42,section,after:"a'b"}),c);assert.equal(result.next.after,'024');const sql=new URL(c.calls[0].url).searchParams.get('QUERY');assert.match(sql,/'a''b'/);if(section==='bibliography')assert.match(sql,/has_ref.oidbibref=ref.oidbib/);assert.equal(result.records[0].actions[0].parameters.oid,42);
  }
});

test('SIMBAD basic and full photometry retain quality, references and no invented inverse or total',async()=>{
  const p=provider('simbad'),ctx=context(()=>response(tap(['oidref','filter','flux','system','qual','bibcode'],[[42,'V',3.44,'V','D','2007ApJS..173..185G']])));
  const value=await p.execute(p.validate({mode:'detail',oid:42,section:'photometry'}),ctx);assert.equal(value.records[0].fields.qual,'D');assert.equal(value.records[0].fields.system,'V');assert.equal(value.next,null);assert.equal(value.total,null);
  const tooMany=context(()=>response(tap(['filter'],Array.from({length:101},(_,i)=>['F'+i]))));await assert.rejects(p.execute(p.validate({mode:'detail',oid:42,section:'photometry'}),tooMany),{status:422,code:'QUERY_TOO_BROAD'});
});

test('SIMBAD photometry keeps every band when measurements share bibliography or even filter codes',async()=>{
  const p=provider('simbad'),raw=tap(['oidref','filter','flux','system','bibcode'],[[42,'B',4.36,'V','2007ApJS..173..185G'],[42,'V',3.44,'V','2007ApJS..173..185G'],[42,'V',3.45,'A','2007ApJS..173..185G']]),value=await p.execute(p.validate({mode:'detail',oid:42,section:'photometry'}),context(()=>response(raw)));
  assert.equal(value.records.length,3);assert.equal(new Set(value.records.map(record=>record.id)).size,3);assert.deepEqual(value.records.map(record=>record.fields.flux),[4.36,3.44,3.45]);assert.deepEqual(value.rawResponse,raw);assert.equal(value.records[0].title,'B 波段测光');
});

test('SIMBAD final bounded cone page retains lookahead and never invents a total or silently claims all matches',async()=>{
  const p=provider('simbad'),cone={columns:[{name:'main_id'},{name:'distance'}],data:Array.from({length:251},(_,i)=>['Object '+i,i/100])},ctx=context((_url,_options,n)=>response(n===1?cone:tap(['main_id','oid'],Array.from({length:25},(_,i)=>['Object '+(225+i),226+i]))));
  const value=await p.execute(p.validate({mode:'cone',ra:10,dec:20,radius:1,after:225}),ctx);assert.equal(value.records.length,25);assert.equal(value.next,null);assert.equal(value.total,null);assert.equal(value.records[0].fields.oid,226);assert.equal(value.limits.moreBeyondWindow,true);assert.equal(new URL(ctx.calls[0].url).searchParams.get('MAXREC'),'251');assert.throws(()=>p.validate({mode:'cone',ra:10,dec:20,radius:1,after:1}),{status:400});
});

test('SIMBAD empty, malformed and upstream failures are distinct from successful records',async()=>{
  const p=provider('simbad'),input=p.validate({query:'not found'});assert.deepEqual((await p.execute(input,context(()=>response(tap(['oid'],[]))))).records,[]);
  for(const raw of [tap(['oid'],[[1,2]]),tap(['oid','oid'],[[1,1]]),{metadata:[],data:'bad'},'<html>captcha</html>'])await assert.rejects(p.execute(input,context(()=>response(raw))),{status:502});
  await assert.rejects(p.execute(input,context(()=>response('overloaded',503))),{status:502,code:'UPSTREAM_UNAVAILABLE'});
});

test('VizieR catalogue metadata preserves every returned table, licensing/reference text and real actions',async()=>{
  const raw=tsv([]),p=provider('vizier'),ctx=context(()=>response(raw)),value=await p.execute(p.validate({query:'Hipparcos'}),ctx),url=new URL(ctx.calls[0].url);
  assert.equal(url.pathname,'/viz-bin/asu-tsv');assert.equal(url.searchParams.get('-meta.max'),'25');assert.equal(url.searchParams.get('-out.max'),'0');assert.equal(value.records[0].id,'I/239/hip_main');assert.match(value.records[0].fields.resource.info.join('\n'),/rights_uri/);assert.deepEqual(value.records[0].actions[0].parameters,{mode:'columns',table:'I/239/hip_main'});assert.equal(value.total,null);assert.equal(value.rawResponse.text,raw);
});

test('VizieR all-column schema preserves units, datatype, UCD, extra attributes, nested description and original XML',async()=>{
  const xml='<?xml version="1.0"?><VOTABLE><RESOURCE><TABLE name="I/239/hip_main" ID="full"><DESCRIPTION>All fields &amp; units</DESCRIPTION><FIELD name="RA" datatype="double" unit="deg" ucd="pos.eq.ra" extra="unchanged"><DESCRIPTION>ICRS &lt;reference&gt;</DESCRIPTION><VALUES null="NaN"/></FIELD><FIELD name="Flags" datatype="char" arraysize="*"/></TABLE></RESOURCE></VOTABLE>',p=provider('vizier'),ctx=context(()=>response(xml)),value=await p.execute(p.validate({mode:'columns',table:'I/239/hip_main'}),ctx);
  assert.equal(new URL(ctx.calls[0].url).pathname,'/viz-bin/votable');assert.equal(new URL(ctx.calls[0].url).searchParams.get('-out.all'),'1');assert.equal(value.records[0].fields.columns.length,2);assert.equal(value.records[0].fields.columns[0].unit,'deg');assert.equal(value.records[0].fields.columns[0].extra,'unchanged');assert.equal(value.records[0].fields.columns[0].description,'ICRS <reference>');assert.match(value.records[0].fields.columns[0].raw,/<VALUES null="NaN"\/>/);assert.equal(value.rawResponse.text,xml);
  await assert.rejects(p.execute(p.validate({mode:'columns',table:'I/239/hip_main'}),context(()=>response('<!DOCTYPE foo><VOTABLE/>'))),{status:502});
});

test('VizieR bounded record pages preserve all original cells, null/blank values, coordinate metadata and units',async()=>{
  const p=provider('vizier'),raw=tsv(Array.from({length:26},(_,i)=>[String(i+1).padStart(6,' '),i===0?'            ':String(i/3)])),ctx=context(()=>response(raw)),input=p.validate({mode:'records',table:'I/239/hip_main',conditions:[{column:'HIP',operator:'>=',value:'1'}],cone:{ra:10,dec:20,radius:0.5}}),value=await p.execute(input,ctx),url=new URL(ctx.calls[0].url);
  assert.equal(url.searchParams.get('HIP'),'>=1');assert.equal(url.searchParams.get('-c'),'10 +20');assert.equal(url.searchParams.get('-out.max'),'26');assert.equal(value.records.length,25);assert.equal(value.records[0].fields.HIP,'     1');assert.equal(value.records[0].fields.RA,'            ');assert.equal(value.columns[1].unit,'deg');assert.equal(value.next.offset,25);assert.equal(value.rawResponse.text,raw);assert.equal(value.total,null);assert.match(value.tableMetadata.global.join('\n'),/Coosys/);
  const second=context(()=>response(tsv(Array.from({length:27},(_,i)=>[String(i),String(i)]))));const page=await p.execute({...input,offset:25},second);assert.equal(page.records.length,2);assert.equal(page.records[0].fields.HIP,'25');assert.equal(page.next,null);
});

test('VizieR refuses unknown tables, truncated rows, HTML, upstream Error and unsupported responses',async()=>{
  const p=provider('vizier'),input=p.validate({mode:'records',table:'I/239/hip_main',conditions:[{column:'HIP',operator:'=',value:'1'}]});
  for(const raw of ['<html>unavailable</html>','# VizieR Astronomical Server\n#INFO\tError=unknown table',tsv([['1']]),tsv([['1','0']]).replace('#Name: I/239/hip_main','#Name: I/other/main')])await assert.rejects(p.execute(input,context(()=>response(raw))),{status:502});
  assert.deepEqual((await p.execute(input,context(()=>response('# VizieR Astronomical Server\n#INFO\tWarning=no result')))).records,[]);
});

test('COD query count bounds the real JSON search, complete fields and exact CIF/detail actions',async()=>{
  const p=provider('cod'),rows=Array.from({length:26},(_,i)=>({file:String(1000000+i),formula:'Si O2',cell:{a:4.9,units:'angstrom'},authors:['A','B'],unknown:[null,'full']})),ctx=context((url,_options,n)=>response(n===1?'26':rows)),input=p.validate({query:'quartz',formula:'O2 Si',elements:['Si'],excludeElements:['Na'],spacegroup:'P 31 2 1',year:1990,doi:'10.1234/example'}),value=await p.execute(input,ctx),url=new URL(ctx.calls[1].url);
  assert.equal(url.searchParams.get('format'),'json');assert.equal(url.searchParams.get('el1'),'Si');assert.equal(url.searchParams.get('nel1'),'Na');assert.equal(url.searchParams.get('spacegroup'),'P 31 2 1');assert.equal(value.total,26);assert.equal(value.records.length,25);assert.equal(value.next.start,25);assert.deepEqual(value.records[0].fields,rows[0]);assert.deepEqual(value.records[0].actions[1].parameters,{mode:'cif',id:'1000000'});assert.equal(value.attribution.licenseURL,'https://creativecommons.org/publicdomain/zero/1.0/');assert.deepEqual(value.rawResponse,rows);
});

test('COD count over limit never silently drops matches or requests the broad JSON; no-results and failures remain explicit',async()=>{
  const p=provider('cod'),input=p.validate({query:'quartz'}),broad=context(()=>response('251'));await assert.rejects(p.execute(input,broad),{status:422,code:'QUERY_TOO_BROAD'});assert.equal(broad.calls.length,1);
  const empty=context(()=>response('0'));assert.deepEqual((await p.execute(input,empty)).records,[]);assert.equal(empty.calls.length,1);
  await assert.rejects(p.execute(input,context(()=>response('<html>Error</html>'))),{status:502});await assert.rejects(p.execute(input,context(()=>response('maintenance',503))),{status:502});
  await assert.rejects(p.execute(p.validate({mode:'detail',id:'1000000'}),context(()=>response([{file:'9000000'}]))),{status:502});
});

test('COD original CIF is fetched only after explicit mode and retained byte-for-text without HTML substitution',async()=>{
  const p=provider('cod'),raw='data_1000000\n# Full original references\n_cell_length_a 4.321(4)\nloop_\n_atom_site_label\nSi1\n',ctx=context(()=>response(raw)),value=await p.execute(p.validate({mode:'cif',id:'1000000'}),ctx);
  assert.equal(ctx.calls[0].url,'https://www.crystallography.net/cod/1000000.cif');assert.equal(value.records[0].fields.cif,raw);assert.equal(value.records[0].fields.format,'CIF');assert.equal(value.total,1);
  await assert.rejects(p.execute(p.validate({mode:'cif',id:'1000000'}),context(()=>response('<html>captcha</html>'))),{status:502});
});

test('PubChem name and formula search page genuine CIDs and retain complete compound atoms, bonds, coordinates, properties',async()=>{
  const p=provider('pubchem'),ids=Array.from({length:26},(_,i)=>i+1),ctx=context((_url,_options,n)=>response(n===1?{IdentifierList:{CID:ids,unknown:'kept'}}:{PC_Compounds:ids.slice(0,25).map(id=>compound(id))})),value=await p.execute(p.validate({kind:'formula',query:'C9H8O4'}),ctx),url=new URL(ctx.calls[0].url);
  assert.equal(url.pathname,'/rest/pug/compound/fastformula/C9H8O4/cids/JSON');assert.equal(url.searchParams.get('MaxRecords'),'251');assert.equal(value.records.length,25);assert.equal(value.total,26);assert.equal(value.next.start,25);assert.deepEqual(value.records[0].fields,compound(1));assert.equal(value.rawResponse.identifiers.IdentifierList.unknown,'kept');assert.deepEqual(value.records[0].actions.map(a=>a.parameters.mode),['detail','synonyms','structure','structure']);
  const capped=context((_url,_options,n)=>response(n===1?{IdentifierList:{CID:Array.from({length:251},(_,i)=>i+1)}}:{PC_Compounds:Array.from({length:25},(_,i)=>compound(i+1))}));const result=await p.execute(p.validate({kind:'formula',query:'C6H12O6'}),capped);assert.equal(result.total,null);assert.equal(result.limits.moreBeyondWindow,true);
});

test('PubChem SMILES/InChI remain encoded POST fields, never paths or arbitrary endpoint URLs',async()=>{
  const p=provider('pubchem');for(const kind of ['smiles','inchi']){const query=kind==='smiles'?'C/C=C\\C':'InChI=1S/H2O/h1H2',ctx=context((_url,_options,n)=>response(n===1?{IdentifierList:{CID:[962]}}:{PC_Compounds:[compound(962)]}));await p.execute(p.validate({kind,query}),ctx);assert.equal(new URL(ctx.calls[0].url).pathname,`/rest/pug/compound/${kind}/cids/JSON`);assert.equal(ctx.calls[0].options.method,'POST');assert.equal(new URLSearchParams(ctx.calls[0].options.body).get(kind),query);}
});

test('PubChem details preserve full annotation/reference sections, synonyms and original 2D/3D structures',async()=>{
  const p=provider('pubchem'),detail={Record:{RecordType:'CID',RecordNumber:2244,RecordTitle:'Aspirin',Section:[{TOCHeading:'All',Information:[{ReferenceNumber:33,Value:{StringWithMarkup:[{String:'Full',Markup:[{URL:'https://original.example/'}]}]}}]}],Reference:[{ReferenceNumber:33,SourceName:'Original',LicenseURL:'https://original.example/license'}],unknown:'preserved'}};
  const value=await p.execute(p.validate({mode:'detail',cid:2244}),context(()=>response(detail)));assert.deepEqual(value.records[0].fields,detail);assert.equal(value.records[0].title,'Aspirin');
  const synonyms={InformationList:{Information:[{CID:2244,Synonym:Array.from({length:2000},(_,i)=>'Synonym '+i)}]}};assert.deepEqual((await p.execute(p.validate({mode:'synonyms',cid:2244}),context(()=>response(synonyms)))).records[0].fields,synonyms);
  const structure={PC_Compounds:[compound(2244,{coords:[{type:[2],conformers:[{x:[1],y:[2],z:[3]}]}]})]};const c=context(()=>response(structure));assert.deepEqual((await p.execute(p.validate({mode:'structure',cid:2244,dimension:'3d'}),c)).records[0].fields,structure);assert.equal(new URL(c.calls[0].url).searchParams.get('record_type'),'3d');
});

test('PubChem documented no-result errors are empty; 3D absence and malformed/inconsistent IDs cannot invent results',async()=>{
  const p=provider('pubchem'),empty={Fault:{Code:'PUGREST.NotFound',Message:'No CID found',Details:['No record']}};assert.equal((await p.execute(p.validate({query:'nonexistent'}),context(()=>response(empty,404)))).total,0);
  for(const raw of [{IdentifierList:{CID:['1']}},{IdentifierList:{CID:[1,1]}},{Fault:{Code:'PUGREST.BadRequest'}},'<html>captcha</html>'])await assert.rejects(p.execute(p.validate({query:'x'}),context(()=>response(raw))),{status:502});
  await assert.rejects(p.execute(p.validate({mode:'structure',cid:2244}),context(()=>response({PC_Compounds:[compound(1)]}))),{status:502});await assert.rejects(p.execute(p.validate({mode:'detail',cid:2244}),context(()=>response({Record:{RecordNumber:1}}))),{status:502});
  await assert.rejects(p.execute(p.validate({query:'x'}),context(()=>response('too many',429))),{status:503,code:'UPSTREAM_RATE_LIMITED'});
});

test('every science adapter delegates request cancellation to the shared context and refuses late results',async()=>{
  const inputs={simbad:{query:'M31'},vizier:{mode:'columns',table:'I/239/hip_main'},cod:{mode:'cif',id:'1000000'},pubchem:{mode:'detail',cid:2244}};
  for(const p of SCIENCE_PROVIDERS){const controller=new AbortController(),reason=new Error('cancelled'),ctx={signal:controller.signal,now:Date.now,request:()=>new Promise((_resolve,reject)=>controller.signal.addEventListener('abort',()=>reject(controller.signal.reason),{once:true}))};const promise=p.execute(p.validate(inputs[p.id]),ctx);controller.abort(reason);await assert.rejects(promise,error=>error===reason);}
});
