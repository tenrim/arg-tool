import test from 'node:test';
import assert from 'node:assert/strict';
import {newDrawing,validateDrawing,putDrawing,drawingsIn,DRAWING_MIME,encodeDrawing} from '../public/graphics/model.js';
import {newNote,exportBackup,parseBackup} from '../public/notebook/model.js';

test('editable drawings, preview and full source bytes survive notebook backup',()=>{
 const doc=newDrawing('whiteboard','灯塔线索');const full=Buffer.from([0,255,128,10,13,80,75]);doc.sources.push({id:'source',name:'原始.bin',mime:'application/octet-stream',base64:full.toString('base64'),text:null,tool:'文件检查',route:'file?task=native%3Afile'});
 const first=putDrawing(newNote('谜题'),doc,{expectedRevision:0});assert(!first.note.markdown.includes('!['));
 const png=new Uint8Array([137,80,78,71,13,10,26,10]);const saved=putDrawing(first.note,first.drawing,{preview:png,expectedRevision:1});
 assert.equal(saved.note.assets.length,2);assert.equal(saved.drawing.revision,2);assert(saved.note.markdown.includes('!['));
 const restored=parseBackup(exportBackup([saved.note]));const entry=drawingsIn(restored[0])[0];assert.equal(entry.drawing.id,doc.id);assert.deepEqual(Buffer.from(entry.drawing.sources[0].base64,'base64'),full);assert.deepEqual(restored[0].assets[1].bytes,png);
 assert.throws(()=>putDrawing(saved.note,first.drawing,{expectedRevision:1}),/其他窗口/);
});
test('mindmap keeps hierarchy and valid cross links, rejects executable resources',()=>{
 const doc=newDrawing('mindmap');doc.scene.nodeData.children=[{id:'a',topic:'图片',children:[{id:'b',topic:'通道'}]},{id:'c',topic:'音频'}];doc.scene.arrows=[{id:'link',label:'待核对',from:'b',to:'c'}];doc.scene.summaries=[{id:'s',label:'原始线索',parent:doc.scene.nodeData.id,start:0,end:1}];doc.scene.direction=3;
 const clean=validateDrawing(doc);assert.equal(clean.scene.direction,3);assert.equal(clean.scene.arrows[0].to,'c');assert.equal(clean.scene.summaries[0].end,1);
 doc.scene.nodeData.image={url:'https://remote.invalid/leak',width:100,height:100};assert.throws(()=>validateDrawing(doc),/本地图片/);delete doc.scene.nodeData.image;
 doc.scene.arrows[0].to='missing';assert.throws(()=>validateDrawing(doc),/不存在/);doc.scene.arrows=[];doc.scene.nodeData.children.push({id:'a',topic:'重复'});assert.throws(()=>validateDrawing(doc),/节点无效/);
});
test('whiteboard import validates objects, size and private file boundaries',()=>{
 const doc=newDrawing('whiteboard');doc.scene.elements=[{id:'shape',type:'rectangle',x:0,y:0,width:100,height:80,angle:0,link:'javascript:alert(1)'}];assert.equal(validateDrawing(doc).scene.elements[0].link,null);
 doc.scene.files.x={mimeType:'image/png',dataURL:'https://remote.invalid/leak'};assert.throws(()=>encodeDrawing(doc),/本地 PNG/);doc.scene.files={};doc.scene.elements[0].type='embeddable';assert.throws(()=>validateDrawing(doc),/嵌入/);
 const note=newNote();note.assets.push({id:'broken',name:'broken',mime:DRAWING_MIME,bytes:new TextEncoder().encode('{}')});assert.deepEqual(drawingsIn(note),[]);
});
test('large original attachments validate without a recursive regex stack',()=>{
 const doc=newDrawing('whiteboard'),bytes=Buffer.alloc(4*1024*1024,255);doc.sources.push({id:'source',name:'大文件.bin',mime:'application/octet-stream',base64:bytes.toString('base64'),text:null,tool:'文件',route:''});
 assert.equal(Buffer.from(JSON.parse(new TextDecoder().decode(encodeDrawing(doc))).sources[0].base64,'base64').length,bytes.length);
 for(const value of ['A===','AA=A','AA==AAAA','%AAA']){doc.sources[0].base64=value;assert.throws(()=>validateDrawing(doc),/来源记录/);}
});
test('native mindmap styles, tags, notes and compact layout survive notebook backup',()=>{
 const doc=newDrawing('mindmap');Object.assign(doc.scene.nodeData,{branchColor:'#42b6cf',note:'待核实：图像与音频',style:{fontSize:'24',fontFamily:'var(--mono)',fontWeight:'bold',width:'220px',textDecoration:'underline',border:'1px solid #e9ab00'},tags:[{text:'未确认',style:{background:'#e9ab00',color:'#111111'},className:'outside'}],icons:['🔎']});doc.scene.compact=true;
 const saved=putDrawing(newNote(),doc),restored=drawingsIn(parseBackup(exportBackup([saved.note]))[0])[0].drawing;
 assert.equal(restored.scene.nodeData.branchColor,'#42b6cf');assert.equal(restored.scene.nodeData.style.width,'220px');assert.equal(restored.scene.nodeData.style.fontFamily,'var(--mono)');assert.equal(restored.scene.nodeData.note,doc.scene.nodeData.note);assert.equal(restored.scene.compact,true);assert.equal(restored.scene.nodeData.tags[0].text,'未确认');assert(!('className'in restored.scene.nodeData.tags[0]));
 doc.scene.nodeData.style={background:'url(https://remote.invalid)',width:'expression(alert(1))',fontFamily:'url(https://remote.invalid/font)'};assert.deepEqual(validateDrawing(doc).scene.nodeData.style,{});
});
