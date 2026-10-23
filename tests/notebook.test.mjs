import test from 'node:test';
import {notebookViews,notebookViewForRoute,toolPages} from '../public/navigation.js';
import assert from 'node:assert/strict';
import {newNote,appendResult,fenced,exportBackup,parseBackup,portableMarkdown,importMarkdown,validateNote,noteSummary,backupGroups,MAX_ASSET} from '../public/notebook/model.js';
import {createNotebookStore} from '../public/notebook/store.js';
import {snapshot} from '../public/handoff/model.js';
import {mapAttachmentURLs} from '../public/notebook/references.js';
test('large valid clue text cannot overflow the call stack when fenced or captured',()=>{
 const text='a`'.repeat(150000)+'\n````';
 assert.equal(fenced(text),'`````text\n'+text+'\n`````');
 const note=appendResult(newNote(),snapshot({text}));
 assert(note.markdown.includes(text));assert.equal(new TextDecoder().decode(note.assets[0].bytes),text);
});
test('attachment mapping uses exact destinations and preserves literal code, unknown IDs and prefix IDs',()=>{
 const note=newNote('附件');note.assets=[{id:'a',name:'A',mime:'text/plain',bytes:new Uint8Array([65])},{id:'ab',name:'B',mime:'text/plain',bytes:new Uint8Array([66])}];
 const literal='notebook-asset:a\n`[code](notebook-asset:a)`\n``[multiline]\n(notebook-asset:ab)``\n\n```text\n[x](notebook-asset:a)\n```\n\n    [indented](notebook-asset:a)\n\n> ~~~\n> [quote](notebook-asset:a)\n> ~~~\n';
 note.markdown=literal+'\n[B](notebook-asset:ab)\n[A](<notebook-asset:a> "title")\n[unknown](notebook-asset:abc)\n[ref]: notebook-asset:a\n';
 const expected=literal+'\n[B](data:text/plain;base64,Qg==)\n[A](<data:text/plain;base64,QQ==> "title")\n[unknown](notebook-asset:abc)\n[ref]: data:text/plain;base64,QQ==\n';
 assert.equal(portableMarkdown(note),'# 附件\n\n'+expected);
 const forward=new Map([['notebook-asset:a','blob:https://tool.test/a'],['notebook-asset:ab','blob:https://tool.test/ab']]);
 assert.equal(mapAttachmentURLs(mapAttachmentURLs(note.markdown,forward),new Map(Array.from(forward,([a,b])=>[b,a]))),note.markdown);
});
test('captures full raw binary and provenance without interpreting clue Markdown',()=>{
 const raw=Uint8Array.from([0,255,128,13,10]),note=appendResult(newNote('线索'),snapshot({bytes:raw,name:'线索.bin'}),{tool:'字节分析',route:'file?task=native%3Afile',title:'<img> [线索]',comment:'```\n<script>'});
 raw[0]=3;assert.deepEqual(note.assets[0].bytes,Uint8Array.from([0,255,128,13,10]));assert.match(note.markdown,/\[字节分析\]\(#file\?task=/);assert.match(note.markdown,/\\<img\\>/);assert.match(note.markdown,/````text\n```/);assert.equal(fenced('秘密\n```'),'````text\n秘密\n```\n````');
 const restored=parseBackup(exportBackup([note]));assert.deepEqual(restored,[note]);assert.match(portableMarkdown(note),/data:application\/octet-stream;base64,AP\+ADQo=/);
 assert.deepEqual(importMarkdown(portableMarkdown(note),'重新导入').assets[0].bytes,note.assets[0].bytes);
 const literal='```text\n![线索](data:image/png;base64,AP+A)\n```';const imported=importMarkdown(literal,'原文');assert.equal(imported.markdown,literal);assert.equal(imported.assets.length,0);
 const big=appendResult(newNote(),snapshot({bytes:new Uint8Array(256*1024).fill(255),name:'large.bin'}));assert.deepEqual(parseBackup(exportBackup([big]))[0].assets[0].bytes,big.assets[0].bytes);
});
test('unavailable storage rejects rather than claiming persistence',async()=>{
 const store=createNotebookStore(null);await assert.rejects(store.list(),/无法使用/);await assert.rejects(store.save(newNote()),/无法使用/);
});
test('backup validation is all-or-nothing and rejects invalid payloads',()=>{
 const n=newNote('测试');assert.throws(()=>parseBackup('{"format":"preferences"}'));assert.throws(()=>parseBackup(exportBackup([n,n])),/重复/);
 for(const id of [123,['abc'],null,true]){assert.throws(()=>validateNote({...n,id}),/格式无效/);assert.throws(()=>validateNote({...n,assets:[{id,name:'x',mime:'text/plain',bytes:new Uint8Array()}]}),/附件无效/);}
 assert.throws(()=>validateNote({...n,markdown:'x'.repeat(2*1024*1024+1)}),/2 MB/);assert.throws(()=>appendResult(n,{bytes:new Uint8Array(MAX_ASSET+1),mime:'application/octet-stream',name:'big'}),/32 MB/);
 const payload=JSON.parse(exportBackup([appendResult(n,snapshot({text:'中文线索 → A-Z == !='}))]));payload.notes[0].assets[0].base64='%%%';assert.throws(()=>parseBackup(JSON.stringify(payload)),/编码/);
});
test('notebook owns its text, mindmap and whiteboard views outside the tool catalogue',()=>{
 assert.deepEqual(notebookViews.map(view=>view.route),['notebook','notebook/mindmap','notebook/whiteboard']);
 for(const kind of ['mindmap','whiteboard']){assert.equal(notebookViewForRoute(kind).route,'notebook/'+kind);assert.equal(notebookViewForRoute('notebook/'+kind).id,kind);assert(!toolPages.some(page=>page.route===kind));}
 assert.equal(notebookViewForRoute('crypto'),undefined);
});

test('note summaries omit private body and bytes, backups split conservatively and preserve trash state',()=>{
 const a=newNote('完整图稿');a.markdown='正文';a.assets=[{id:'scene',name:'场景',mime:'application/vnd.mist-drawing+json',bytes:new TextEncoder().encode('完整可编辑场景')}];
 const summary=noteSummary(a);assert.equal(summary.assetCount,1);assert(!('markdown' in summary));assert(!('assets' in summary));
 const deleted={...a,deletedAt:'2026-10-18T00:00:00.000Z'};
 assert.deepEqual(parseBackup(exportBackup([deleted])),[deleted]);
 const b={...a,id:'second'},limit=summary.backupSize+1024;
 const groups=backupGroups([summary,noteSummary(b)],limit);
 assert.equal(groups.length,2);assert.deepEqual(groups.flat().map(n=>n.id),[a.id,b.id]);
 assert(backupGroups([summary,noteSummary(b)])[0].length===2);
 assert.throws(()=>backupGroups([summary],1024),/单篇/);
 assert.throws(()=>validateNote({...a,deletedAt:42}),/回收站/);
});

test('complete backup beyond 128 MiB splits into independently restorable files without truncating bytes',()=>{
 const originals=Array.from({length:3},(_,i)=>{const note=newNote('大附件 '+i),bytes=new Uint8Array(32*1024*1024).fill(i+1);bytes[bytes.length-1]=255;note.assets=[{id:'raw-'+i,name:'完整原始文件.bin',mime:'application/octet-stream',bytes}];return note;});
 const groups=backupGroups(originals.map(noteSummary));assert.equal(groups.length,2);
 const restoredIds=[];
 for(const group of groups){const records=group.map(s=>originals.find(n=>n.id===s.id)),text=exportBackup(records);assert(new TextEncoder().encode(text).length<=128*1024*1024);
  const restored=parseBackup(text);for(let i=0;i<records.length;i++){assert.deepEqual(restored[i].assets[0].bytes,records[i].assets[0].bytes);assert.equal(restored[i].markdown,records[i].markdown);restoredIds.push(restored[i].id);}
 }
 assert.deepEqual(restoredIds,originals.map(n=>n.id));
});
