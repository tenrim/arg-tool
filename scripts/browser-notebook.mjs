import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import assert from 'node:assert/strict';
import {chooseOperation} from './browser-navigation.mjs';
const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});
try{
 for(const [width,motion,prefix]of [[1440,'no-preference',''],[390,'reduce','/tools']]){
  const ctx=await browser.newContext({viewport:{width,height:950},reducedMotion:motion}),errors=[],external=[];
  await ctx.route('**/*',async route=>{const u=new URL(route.request().url());if(u.hostname!=='arg.test'){external.push(u.href);return route.abort();}
   const path=u.pathname.slice(prefix.length).replace(/^\/$/,'/index.html');try{await route.fulfill({body:await readFile(resolve('public','.'+path)),contentType:({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.woff2':'font/woff2','.wasm':'application/wasm'})[extname(path)]||'application/octet-stream'});}catch{await route.fulfill({status:404,body:'Not found'});}
  });
  const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));
  const go=async route=>{await page.evaluate(hash=>{location.hash=hash;},route);};
  const saved=()=>page.waitForFunction(()=>document.querySelector('#notebook-status')?.textContent==='已保存到本机');
  const files=async()=>{await page.locator('#notebook-actions').click();await page.locator('#notebook-actions-dialog').waitFor({state:'visible'});};
  await page.goto(`https://arg.test${prefix}/#notebook`);const removeNote=page.getByRole('button',{name:'删除笔记',exact:true});await removeNote.waitFor({state:'visible'});assert(await removeNote.isDisabled());await page.locator('#notebook-new').click();
  await page.locator('#notebook-title').fill('灯塔线索');const edit=page.locator('#notebook-editor .vditor-ir [contenteditable="true"]');await edit.fill('秘密笔记 A-Z == !=');await saved();
  assert.equal(await page.locator('#notebook-title').inputValue(),'灯塔线索','typing while the editor opens must retain the new title');
  await go('home');await go('notebook');await saved();assert.match(await edit.textContent(),/秘密笔记/);await page.reload();await saved();assert.equal(await page.locator('#notebook-title').inputValue(),'灯塔线索');assert.match(await edit.textContent(),/A-Z == !=/);
  await page.evaluate(()=>{window.noteOriginalPut=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(){throw new DOMException('模拟存储空间不足','QuotaExceededError');};});
  await edit.fill('存储失败时保留的中文笔记 A-Z == !=');await page.waitForFunction(()=>document.querySelector('#notebook-status').textContent.includes('空间不足'));assert.match(await edit.textContent(),/保留的中文/);
  await page.evaluate(()=>IDBObjectStore.prototype.put=window.noteOriginalPut);await page.getByRole('button',{name:'重试',exact:true}).click();await saved();
  await edit.fill('立即切页也要保留 A-Z == !=');await go('home');await go('notebook');await saved();await page.reload();await saved();assert.match(await edit.textContent(),/立即切页也要保留/);
  // Optimistic concurrency rejects the second writer; no silently lost notes.
  const conflict=await page.evaluate(async()=>{const {createNotebookStore}=await import('./notebook/store.js');const s=createNotebookStore(),[note]=await s.list();await s.save({...note,title:'另一窗口'});try{await s.save({...note,title:'过期覆盖'});return false;}catch{return true;}});assert(conflict);
  await page.reload();await saved();assert.equal(await page.locator('#notebook-title').inputValue(),'另一窗口');
  await go('encoding');await page.waitForSelector('#ct-encoding .ct-run:enabled');await chooseOperation(page,'To Base64');const task=page.locator('#ct-encoding');await task.locator('.ct-input').fill('秘密');await task.locator('.ct-run').click();await page.waitForFunction(()=>document.querySelector('#ct-encoding .ct-status').textContent.includes('处理完成'));
  const noteButton=task.locator('[data-notebook-result]');await noteButton.click();const dialog=page.locator('#notebook-capture');await dialog.locator('#notebook-capture-save:enabled').waitFor();await dialog.locator('#notebook-comment').fill('待验证');await dialog.locator('#notebook-capture-save').click();await page.waitForFunction(()=>document.querySelector('#notebook-capture-status').textContent==='已加入笔记本');await page.keyboard.press('Escape');
  await go('notebook');await saved();assert((await edit.textContent()).includes('56eY5a+G'));assert.match(await edit.textContent(),/待验证/);assert.equal(await page.locator('#notebook-attachments .notebook-attachment').count(),1);
  await go('encoding');await task.locator('.ct-input').fill('new');assert.equal(await noteButton.isDisabled(),true);
  await task.locator('.ct-run').click();await page.waitForFunction(()=>document.querySelector('#ct-encoding .ct-status').textContent.includes('处理完成'));await noteButton.click();await dialog.locator('#notebook-capture-save:enabled').waitFor();await task.locator('.ct-input').evaluate(n=>{n.value='changed';n.dispatchEvent(new Event('input',{bubbles:true}));});await dialog.locator('#notebook-capture-save').click();assert.match(await dialog.locator('#notebook-capture-status').textContent(),/改变|失效/);await page.keyboard.press('Escape');
  await go('notebook');await saved();
  const binary=Buffer.from([0,255,128,13,10]);await page.locator('#notebook-file').setInputFiles({name:'原始.bin',mimeType:'application/octet-stream',buffer:binary});await saved();await page.waitForFunction(()=>document.querySelectorAll('#notebook-attachments .notebook-attachment').length===2);
  const image=Buffer.concat([Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jvRkAAAAASUVORK5CYII=','base64'),Buffer.from('504b0506000000000000000000000000000000000000','hex')]);
  await page.locator('#notebook-file').setInputFiles({name:'图片及尾部ZIP.png',mimeType:'image/png',buffer:image});await page.waitForFunction(()=>document.querySelectorAll('#notebook-attachments .notebook-attachment').length===3);await saved();assert.equal(await page.locator('#notebook-attachments img').count(),1);
  await files();const [download]=await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:'备份全部笔记',exact:true}).click()]);const backup=JSON.parse(await readFile(await download.path(),'utf8'));assert.equal(backup.notes.length,1);assert.deepEqual(Buffer.from(backup.notes[0].assets[1].base64,'base64'),binary);assert.deepEqual(Buffer.from(backup.notes[0].assets[2].base64,'base64'),image);
  await page.locator('#notebook-import').setInputFiles({name:'backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});await page.waitForFunction(()=>document.querySelector('#notebook-status').textContent.includes('已导入'));assert.equal(await page.locator('#notebook-list [data-note-id]').count(),2);
  // Invalid backup never partially imports. Markdown HTML and external images
  // never execute or request remote resources, including imported documents.
  await page.locator('#notebook-import').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from('{"format":"no"}')});await page.waitForFunction(()=>document.querySelector('#notebook-status').textContent.includes('不是受支持'));assert.equal(await page.locator('#notebook-list [data-note-id]').count(),2);
  await page.locator('#notebook-import').setInputFiles({name:'安全.md',mimeType:'text/markdown',buffer:Buffer.from('![x](https://example.invalid/private)\n\n<img src="https://example.invalid/raw" onerror="window.noteXss=true">\n\n<script>window.noteXss=true</script>\n\n```plantuml\nsecret\n```')});await page.waitForFunction(()=>document.querySelector('#notebook-status').textContent.includes('已导入'));assert.equal(await page.evaluate(()=>!!window.noteXss),false);assert.equal(await page.locator('#notebook-editor [src^="https:"]').count(),0);
  const rich='# 线索记录\n\n## 待验证\n\n- [ ] 核对图片\n\n| 字符 | 数字 |\n| --- | --- |\n| A | 1 |\n\n$$\nx^2+y^2=z^2\n$$\n\n```javascript\nconst clue = 42;\n```\n\n```mermaid\ngraph LR\n A[线索] --> B[验证]\n```\n\n```markmap\n# 线索\n## 图片\n## 音频\n```\n\n```echarts\n{"xAxis":{"data":["A","B"]},"yAxis":{},"series":[{"type":"bar","data":[2,4]}]}\n```\n\n```graphviz\ndigraph G { A -> B }\n```\n\n```flowchart\na=>start: Start\nb=>end: End\na->b\n```\n\n```wavedrom\n{"signal":[{"name":"clk","wave":"p....."}]}\n```\n\n```abc\nX:1\nT:Clue\nM:4/4\nK:C\nCDEF GABc|\n```\n\n```smiles\nCCO\n```';
  await page.locator('#notebook-import').setInputFiles({name:'功能检查.md',mimeType:'text/markdown',buffer:Buffer.from(rich)});await page.waitForFunction(()=>document.querySelector('#notebook-status').textContent.includes('已导入'));
  await page.waitForFunction(()=>document.querySelectorAll('.vditor-ir [data-notebook-language][data-rendered]').length===8);
  assert.equal(await page.locator('.vditor-ir [data-rendered="error"]').count(),0,await page.locator('.vditor-ir [data-rendered="error"]').allTextContents());
  assert.match(await page.locator('.vditor-ir [data-notebook-language="mermaid"] svg g.nodes').textContent(),/线索/);
  assert.match(await page.locator('.vditor-ir [data-notebook-language="flowchart"]').textContent(),/Start/);
  assert(await page.locator('.vditor-ir [data-notebook-language="smiles"] svg line').count());assert(await page.locator('.vditor-ir [data-notebook-language="wavedrom"] use').count());
  await page.locator('.vditor-ir .katex').first().waitFor();await page.locator('.vditor-ir .hljs-keyword').first().waitFor();
  const headingStyle=await page.locator('#panel-notebook h1').first().evaluate(n=>({font:getComputedStyle(n).fontFamily,size:parseFloat(getComputedStyle(n).fontSize)}));assert.match(headingStyle.font,/Inter|Noto Sans/);assert(headingStyle.size<=28);
  assert((await page.locator('#notebook-status').boundingBox()).height<48);assert.equal(await page.locator('#notebook-title').getAttribute('aria-label'),'笔记标题');
  await page.locator('#notebook-editor button[data-type="outline"]').click();assert.match(await page.locator('.vditor-outline').textContent(),/待验证/);
  // Real mode changes preserve source code, undo and attachments; a renderer's
  // private class names must never leak into saved Markdown.
  await page.locator('#notebook-editor button[data-type="edit-mode"]').click();await page.getByRole('button',{name:/所见即所得/}).click();await page.locator('.vditor-wysiwyg [contenteditable=true]').waitFor({state:'visible'});
  await page.locator('#notebook-editor button[data-type="edit-mode"]').click();await page.getByRole('button',{name:/分屏预览/}).click();const source=page.locator('.vditor-sv');await source.waitFor({state:'visible'});assert.match(await source.inputValue(),/```mermaid/);assert(!/notebook-mermaid/.test(await source.inputValue()));
  await source.focus();await page.keyboard.press('Control+End');await source.pressSequentially('\nNEW_CLUE');await saved();await page.keyboard.press('Control+z');await page.waitForFunction(()=>!document.querySelector('.vditor-sv').value.includes('NEW_CLUE'));
  await page.locator('#notebook-editor button[data-type="fullscreen"]').click();assert(await page.locator('#notebook-editor').evaluate(n=>n.classList.contains('vditor--fullscreen')));await page.locator('#notebook-editor button[data-type="fullscreen"]').click();
  await page.locator('#notebook-editor button[data-type="edit-mode"]').click();await page.getByRole('button',{name:/即时渲染/}).click();await edit.waitFor({state:'visible'});
  await files();const [htmlDownload]=await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:'导出 HTML',exact:true}).click()]);const html=await readFile(await htmlDownload.path(),'utf8');assert.match(html,/线索记录/);assert.match(html,/<svg/);assert.match(html,/katex/);assert(!/<script|blob:http/.test(html));
  await page.evaluate(()=>{window.print=()=>{window.notePrinted=!!document.querySelector('.notebook-print-document svg');};});await files();await page.getByRole('button',{name:'打印 / PDF'}).click();await page.waitForFunction(()=>window.notePrinted===true);
  await page.locator('#notebook-editor button[data-type="more"]').click();await page.locator('[data-type="notebook-record"]').click();await page.locator('#notebook-recorder').getByRole('button',{name:'开始录音'}).click();
  await page.waitForFunction(()=>document.querySelector('#notebook-recorder').textContent.includes('KB'));
  await page.locator('#notebook-recorder').getByRole('button',{name:'保存录音',exact:true}).click();await page.locator('#notebook-attachments audio').waitFor();await saved();assert.equal(await page.locator('#notebook-recorder').evaluate(n=>n.open),false);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);assert.deepEqual(external,[]);assert.deepEqual(errors,[]);
  // Deletion is visible in the notebook index, never hidden in file export.
  assert(await removeNote.isVisible());assert.equal(await removeNote.evaluate(n=>n.closest('dialog')),null);
  const records=()=>page.evaluate(async()=>{const {createNotebookStore}=await import('./notebook/store.js');const store=createNotebookStore();try{return await store.list();}finally{await store.close();}});
  const beforeDelete=await records(),selectedId=await page.locator('#notebook-list [aria-pressed=true]').getAttribute('data-note-id');
  await removeNote.click();await page.locator('#notebook-delete').getByRole('button',{name:'取消'}).focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#notebook-delete').evaluate(n=>n.open),false);assert.deepEqual(await records(),beforeDelete,'cancel preserves all content and attachments');
  const confirmDelete=async()=>{await removeNote.click();const confirmation=page.locator('#notebook-delete');await confirmation.waitFor({state:'visible'});assert.match(await confirmation.textContent(),/脑图和线索白板/);await confirmation.getByRole('button',{name:'确认删除',exact:true}).click();await page.waitForFunction(()=>!document.querySelector('#notebook-delete').open);};
  await confirmDelete();assert.deepEqual(await records(),beforeDelete.filter(note=>note.id!==selectedId),'delete removes only the confirmed note');
  assert.equal(await page.locator('#notebook-list [aria-pressed=true]').count(),1);
  await page.getByRole('button',{name:'回收站',exact:true}).click();
  const trash=page.locator('#notebook-trash'),deleted=beforeDelete.find(n=>n.id===selectedId);
  await trash.getByRole('button',{name:'恢复 '+deleted.title,exact:true}).click();
  await trash.getByText('笔记已恢复，可在笔记列表中打开。',{exact:true}).waitFor();
  await trash.getByRole('button',{name:'关闭',exact:true}).click();
  await page.locator('[data-note-id="'+selectedId+'"]').click();await saved();
  const restored=(await records()).find(n=>n.id===selectedId);
  assert.deepEqual(restored.assets,deleted.assets);assert.equal(restored.markdown,deleted.markdown);
  await files();await page.getByRole('button',{name:'正文加入思维导图',exact:true}).click();
  await page.locator('#graphic-start:enabled').waitFor();assert.equal(await page.locator('#graphic-kind').inputValue(),'mindmap');
  await page.locator('#graphic-picker').getByRole('button',{name:'取消',exact:true}).click();
  assert.deepEqual((await records()).find(n=>n.id===selectedId),restored,'opening the drawing picker does not overwrite the note');
  await files();const [single]=await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:'完整备份当前笔记',exact:true}).click()]);
  const singleBackup=JSON.parse(await readFile(await single.path(),'utf8'));assert.equal(singleBackup.notes.length,1);assert.equal(singleBackup.notes[0].id,selectedId);
  await confirmDelete();

  while((await records()).length)await confirmDelete();
  await page.waitForFunction(()=>document.querySelector('#notebook-title').disabled);assert.equal(await page.locator('#notebook-title').inputValue(),'');assert(await removeNote.isDisabled());assert.equal(await page.locator('#notebook-drawings').isVisible(),false);assert.equal(await page.locator('#notebook-attachments').textContent(),'');
  await page.reload();await page.waitForFunction(()=>document.querySelector('#notebook-status').textContent==='笔记保存在此浏览器中。');assert.equal(await page.locator('#notebook-list [data-note-id]').count(),0);assert.deepEqual(await records(),[],'autosave and reload must not resurrect deleted notes');
  assert.deepEqual(errors,[]);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
  // Regression: imported attachment IDs may share prefixes. Rendered links,
  // saved Markdown and portable HTML must agree without rewriting literal clues.
  const attachmentReview=await page.evaluate(async()=>{
   const {Box}=await import('./ui/index.js'),{createNoteEditor}=await import('./notebook/editor.js'),{newNote}=await import('./notebook/model.js');
   const host=Box();document.body.append(host);const editor=await createNoteEditor(host,{change(){},dirty(){},attach(){},openAttachment(){},record(){}});
   try{
    const note=newNote('附件检查');note.assets=[{id:'a',name:'A',mime:'text/plain',bytes:new Uint8Array([65])},{id:'ab',name:'B',mime:'text/plain',bytes:new Uint8Array([66])}];note.markdown='[B](notebook-asset:ab)\n\n```text\n[原文](notebook-asset:a)\n```';editor.set(note);
    const value=editor.get(),doc=await editor.document(note.title);editor.set(newNote('切换后的笔记'));
    const html=editor.portableHTML(doc,note);
    return{value,html};
   }finally{editor.destroy();host.remove();}
  });
  assert.match(attachmentReview.value,/\[B\]\(notebook-asset:ab\)/);assert.match(attachmentReview.value,/\[原文\]\(notebook-asset:a\)/);assert(!attachmentReview.value.includes('blob:'));
  assert.match(attachmentReview.html,/href="data:text\/plain;base64,Qg=="/);assert.match(attachmentReview.html,/\[原文\]\(notebook-asset:a\)/);assert(!attachmentReview.html.includes('QQ=='));
  const recorderReview=await page.evaluate(async()=>{
   const {createNoteRecorder}=await import('./notebook/recorder.js');
   const originalRecorder=window.MediaRecorder,originalGet=navigator.mediaDevices.getUserMedia,instances=[],saves=[];let stopped=0;
   class FakeRecorder{state='inactive';mimeType='audio/webm';constructor(){instances.push(this);}start(){this.state='recording';}stop(){this.state='inactive';this.ondataavailable?.({data:new Blob(['recorded'],{type:this.mimeType})});this.stopping=this.onstop?.();}}
   window.MediaRecorder=FakeRecorder;navigator.mediaDevices.getUserMedia=async()=>({getTracks:()=>[{stop(){stopped++;}}]});
   const recorder=createNoteRecorder((id,file)=>new Promise((resolve,reject)=>saves.push({id,file,resolve,reject}))),dialog=[...document.querySelectorAll('#notebook-recorder')].at(-1),buttons=[...dialog.querySelectorAll('button')],start=buttons.find(b=>b.textContent==='开始录音'),save=buttons.find(b=>b.textContent==='保存录音');
   try{
    recorder.open('first');start.click();await Promise.resolve();save.click();
    recorder.open('second');start.click();await Promise.resolve();const old=instances[0],current=instances[1];
    old.onerror();const survivesOldError=current.state==='recording'&&!save.disabled;
    saves[0].resolve();await old.stopping;const survivesOldSuccess=dialog.open&&current.state==='recording'&&!save.disabled;
    save.click();recorder.open('third');saves[1].reject(Error('old failed'));await current.stopping;
    return{survivesOldError,survivesOldSuccess,survivesOldFailure:dialog.open&&!dialog.textContent.includes('old failed'),targets:saves.map(s=>s.id),stopped};
   }finally{recorder.destroy();window.MediaRecorder=originalRecorder;navigator.mediaDevices.getUserMedia=originalGet;}
  });
  assert(recorderReview.survivesOldError);assert(recorderReview.survivesOldSuccess);assert(recorderReview.survivesOldFailure);assert.deepEqual(recorderReview.targets,['first','second']);assert(recorderReview.stopped>=2);assert.deepEqual(errors,[]);

  const storageReview=await page.evaluate(async()=>{
   const {createNotebookStore}=await import('./notebook/store.js'),{newNote}=await import('./notebook/model.js');
   const name='notebook-migration-review',legacy=newNote('旧版笔记');legacy.markdown='保留全文搜索';legacy.assets=[{id:'raw',name:'raw',mime:'application/octet-stream',bytes:new Uint8Array([0,255,4])}];legacy.revision=1;
   await new Promise((resolve,reject)=>{const req=indexedDB.open(name,1);req.onupgradeneeded=()=>req.result.createObjectStore('notes',{keyPath:'id'}).put(legacy);req.onsuccess=()=>{req.result.close();resolve();};req.onerror=()=>reject(req.error);});
   const factory={open:(_name,version)=>indexedDB.open(name,version)},a=createNotebookStore(factory),b=createNotebookStore(factory);
   try{
    const index=await a.summaries(),original=await a.get(legacy.id);
    if(index[0].assets||index[0].markdown)throw Error('列表泄漏正文或附件');
    const getAll=IDBObjectStore.prototype.getAll;IDBObjectStore.prototype.getAll=function(...args){if(this.name==='notes')throw Error('目录读取了全库');return getAll.apply(this,args);};
    try{await a.summaries();}finally{IDBObjectStore.prototype.getAll=getAll;}
    const found=await a.search('全文搜索');await a.remove(original);
    if(await b.get(legacy.id))throw Error('回收站笔记仍可写入');
    let rejected=false;try{await b.save(original);}catch{rejected=true;}if(!rejected)throw Error('过期写入覆盖回收站');
    const [trashed]=await a.summaries({trash:true});await b.restore(trashed);
    rejected=false;try{await a.purge(trashed);}catch{rejected=true;}if(!rejected)throw Error('过期删除移除了已恢复笔记');
    const restored=await a.get(legacy.id);await a.remove(restored);await a.purge((await a.summaries({trash:true}))[0]);
    return{found:found.length,bytes:Array.from(original.assets[0].bytes),restored:Array.from(restored.assets[0].bytes),remaining:(await a.summaries({includeDeleted:true})).length};
   }finally{await a.close();await b.close();}
  });
  assert.deepEqual(storageReview,{found:1,bytes:[0,255,4],restored:[0,255,4],remaining:0});
  if(process.env.NOTEBOOK_SCREENSHOT)await page.screenshot({path:process.env.NOTEBOOK_SCREENSHOT.replace('.png',width===1440?'.png':'-mobile.png'),fullPage:true});
  await ctx.close();
 }
 console.log('PASS: notebook persistence, conflict guard, result capture, binary backup/import, Markdown safety, visible delete/cancel/confirm/last-note cleanup, PC/mobile/subdirectory/keyboard/motion.');
}finally{await browser.close();}
