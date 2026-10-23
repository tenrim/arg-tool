import {element,Box,Button,onDisconnect} from '../ui/index.js';
import {createNoteRenderers,diagramLanguages} from './renderers.js';
import {mapAttachmentURLs} from './references.js';
import {toBase64} from './model.js';
const base=new URL('../vendor/notebook/',import.meta.url);
const pending=new Map();
function load(path,id,style=false){
 if(document.getElementById(id)?.dataset.loaded)return Promise.resolve();
 if(pending.has(id))return pending.get(id);
 const promise=new Promise((resolve,reject)=>{const node=element(style?'link':'script',{id,attrs:style?{rel:'stylesheet',href:new URL(path,base).href}:{src:new URL(path,base).href,'data-manual':true}});
  const timer=setTimeout(()=>{node.remove();reject(Error('编辑器资源载入超时，请重试。'));},15000);
  node.onload=()=>{clearTimeout(timer);node.dataset.loaded='true';resolve();};node.onerror=()=>{clearTimeout(timer);node.remove();reject(Error('编辑器资源载入失败，请重试。'));};
  // Local vendor CSS precedes the site's shared component theme.
  if(style)document.querySelector('link[href$="ui/components.css"]').before(node);else document.head.append(node);
 }).finally(()=>pending.delete(id));pending.set(id,promise);return promise;
}
export async function createNoteEditor(host,{change,dirty,attach,openAttachment,openAsset,record,exportNote}){
 await Promise.all([load('vditor/dist/index.css','notebook-vditor-css',true),load('vditor/dist/index.min.js','notebook-vditor-js'),load('purify.min.js','notebook-purify'),load('vditor/dist/js/lute/lute.min.js','vditorLuteScript'),load('vditor/dist/js/i18n/zh_CN.js','vditorI18nScriptzh_CN')]);
 await load('vditor/dist/js/icons/ant.js','vditorIconScript');
 let instance,disposed=false,muted=false;const urls=new Map(),documentURLs=new WeakMap();
 const purifier=window.DOMPurify(window);
 purifier.addHook('uponSanitizeAttribute',(_node,data)=>{
  if(['src','href','xlink:href','poster'].includes(data.attrName)){
   const value=data.attrValue.trim();
   data.keepAttr=data.attrName==='href'?/^(?:https?:\/\/|mailto:|#|notebook-asset:[a-z0-9-]+$)/i.test(value)||urls.has(value):urls.has(value);
  }
 });
 const config={USE_PROFILES:{html:true},ADD_TAGS:['wbr'],ALLOW_UNKNOWN_PROTOCOLS:true,
  FORBID_TAGS:['script','style','iframe','object','embed','form','video','audio','source','link','meta','base'],FORBID_ATTR:['srcset','style','autofocus','name']};
 const sanitize=html=>purifier.sanitize(html,config);
 const renders=createNoteRenderers({load,base,purifier:window.DOMPurify(window)});
 // Only preview copies receive adapter languages. Editable source nodes keep
 // their original fence labels, so switching modes/export never rewrites code.
 function prepare(html,whole=false){const fragment=purifier.sanitize(html,{...config,RETURN_DOM_FRAGMENT:true});
  for(const code of fragment.querySelectorAll('[class*="language-"]')){
   const language=diagramLanguages.find(n=>code.classList.contains('language-'+n));
   if(language&&(whole||code.closest('.vditor-ir__preview,.vditor-wysiwyg__preview'))){code.classList.replace('language-'+language,'language-notebook-'+language);code.dataset.notebookLanguage=language;}
  }
  const container=Box({children:[fragment]});return container.innerHTML;
 }
 const icon=name=>`<svg><use xlink:href="#vditor-icon-${name}"></use></svg>`;
 const insert=value=>{instance.insertValue(value);dirty();change();};
 const diagramNames={mermaid:'流程与时序图',echarts:'数据图表（JSON）',mindmap:'树形脑图（JSON）',markmap:'Markdown 脑图',flowchart:'流程图',graphviz:'Graphviz 关系图',wavedrom:'数字波形（JSON）',abc:'ABC 五线谱',smiles:'化学结构'};
 const finish=new Promise(resolve=>{
  instance=new window.Vditor(host,{cdn:new URL('vditor',base).href,lang:'zh_CN',theme:'dark',mode:'ir',height:'auto',minHeight:380,value:'',cache:{enable:false},undoDelay:100,
   placeholder:'写下线索、推测和下一步……',toolbarConfig:{pin:false},
   toolbar:['headings','bold','italic','strike','link','|','list','ordered-list','check','quote','code','table',
    {name:'notebook-upload',icon:icon('upload'),tip:'添加本地附件',click:()=>openAttachment()},
    {name:'diagram',icon:icon('table'),tip:'插入图表',click:()=>{},toolbar:Object.entries(diagramNames).map(([n,label])=>({name:'diagram-'+n,icon:label,tip:label,click:()=>insert('```'+n+'\n\n```\n')}))},
    '|','undo','redo','|','edit-mode','outline','fullscreen',
    {name:'more',toolbar:['emoji','inline-code','line','indent','outdent','insert-before','insert-after',
     {name:'formula',icon:'数学公式',tip:'数学公式',click:()=>insert('$$\n\n$$\n')},{name:'notebook-record',icon:'录音笔记',tip:'录音笔记',click:()=>record()},
     'both','preview','code-theme','content-theme',{name:'notebook-export',icon:'导出笔记',tip:'导出笔记',click:()=>exportNote?.()},'devtools','help']}],
   counter:{enable:true,type:'markdown'},outline:{enable:false,position:'right'},resize:{enable:true},fullscreen:{index:240},
   preview:{delay:150,maxWidth:1200,hljs:{enable:true,style:'github-dark',lineNumber:true,renderMenu:(_code,menu)=>{const text=menu.querySelector('textarea').value;menu.replaceChildren(Button({text:'复制代码',on:{click:async e=>{e.stopPropagation();const button=e.currentTarget;try{await navigator.clipboard.writeText(text);button.textContent='已复制';}catch{instance.tip('复制失败，请选中代码复制。');}}}}));}},math:{engine:'KaTeX'},theme:{current:'dark',path:new URL('vditor/dist/css/content-theme',base).href},actions:['desktop','tablet','mobile','mp-wechat'],
    markdown:{sanitize:true,autoSpace:false,fixTermTypo:false,codeBlockPreview:true,mathBlockPreview:true,footnotes:true,toc:true,mark:true,sup:true,sub:true},render:{media:{enable:false}},transform:html=>prepare(html,true)},
   customRenders:renders.custom,
   upload:{handler:files=>{attach(Array.from(files));return null;},accept:'*'},
   input:()=>{if(!muted&&!disposed)change();},blur:()=>{if(!muted&&!disposed)change();},after:()=>resolve()
  });
 });
 await finish;
 // Sanitizing is confined to this editor's parser boundary. Official runtime
 // bytes stay unchanged; no global parser monkeypatch or network interception.
 const lute=instance.vditor.lute;
 for(const name of ['Md2VditorIRDOM','SpinVditorIRDOM','Md2VditorDOM','SpinVditorDOM','Md2VditorSVDOM','SpinVditorSVDOM','Md2HTML','HTML2VditorDOM','HTML2VditorIRDOM']){
  if(typeof lute[name]!=='function')continue;const original=lute[name];lute[name]=(...args)=>prepare(original.apply(lute,args),name==='Md2HTML');
 }
 // Rich paste converts sanitized, detached HTML into Markdown before insertion.
 const paste=e=>{if(!e.clipboardData)return;const files=Array.from(e.clipboardData.files);e.preventDefault();e.stopImmediatePropagation();if(files.length)attach(files);else{const html=e.clipboardData.getData('text/html');instance.insertValue(html?lute.HTML2Md(sanitize(html)):e.clipboardData.getData('text/plain'));}dirty();change();};
 const input=()=>{if(!muted&&!disposed){dirty();queueMicrotask(()=>{if(!disposed)change();});}};
 let seededMode=instance.getCurrentMode();
 // Mode switching defers the upstream initial undo snapshot. Seed it before
 // the first keystroke so fast typing cannot cancel and replace that baseline.
 const beforeInput=()=>{const mode=instance.getCurrentMode();if(mode!==seededMode){instance.vditor.undo.addToUndoStack(instance.vditor);seededMode=mode;}};
 const theme=()=>queueMicrotask(()=>{if(!disposed)host.dataset.contentTheme=instance.vditor.options.preview.theme.current;});host.dataset.contentTheme='dark';
 const visitAsset=e=>{const node=e.target.closest?.('a[href],img[src],.vditor-ir__link');if(!node)return;const url=node.classList.contains('vditor-ir__link')?node.closest('[data-type="a"]')?.querySelector('.vditor-ir__marker--link')?.textContent:node.getAttribute(node.tagName==='IMG'?'src':'href');const id=urls.get(url);if(id&&openAsset?.(id)){e.preventDefault();e.stopImmediatePropagation();}};
 host.addEventListener('click',visitAsset,true);
 host.addEventListener('paste',paste,true);host.addEventListener('input',input);host.addEventListener('beforeinput',beforeInput,true);host.addEventListener('click',theme,true);
 host.querySelectorAll('[contenteditable="true"]').forEach(n=>{n.setAttribute('aria-label','笔记正文');n.setAttribute('role','textbox');n.setAttribute('aria-multiline','true');});
 function release(){renders.clear();for(const url of urls.keys())URL.revokeObjectURL(url);urls.clear();}
 const api={
  get(){return mapAttachmentURLs(instance.getValue(),new Map(Array.from(urls,([url,id])=>[url,'notebook-asset:'+id])));},
  set(note){muted=true;try{release();const mapping=new Map();for(const a of note.assets){const type=['image/png','image/jpeg','image/gif','image/webp'].includes(a.mime)?a.mime:'application/octet-stream';const url=URL.createObjectURL(new Blob([a.bytes],{type}));urls.set(url,a.id);mapping.set('notebook-asset:'+a.id,url);}instance.setValue(mapAttachmentURLs(note.markdown,mapping),true);seededMode=instance.getCurrentMode();}finally{muted=false;}},
  focus(){instance.focus();},enable(value){value?instance.enable():instance.disabled();},
  suspend(){if(host.classList.contains('vditor--fullscreen'))instance.vditor.toolbar.elements.fullscreen.firstElementChild.click();},
  async document(title){
   const stage=Box({className:'notebook-export-staging',attrs:{'aria-hidden':'true'},children:[Box({tag:'h1',text:title}),purifier.sanitize(prepare(instance.getHTML(),true),{...config,RETURN_DOM_FRAGMENT:true})]});document.body.append(stage);
   documentURLs.set(stage,new Map(urls));
   try{
    await load('vditor/dist/js/katex/katex.min.js','vditorKatexScript');await load('vditor/dist/js/katex/mhchem.min.js','vditorKatexChemScript');
    for(const node of stage.querySelectorAll('.language-math')){try{node.replaceChildren(window.DOMPurify.sanitize(window.katex.renderToString(node.textContent,{displayMode:node.tagName==='DIV',throwOnError:false,trust:false}),{RETURN_DOM_FRAGMENT:true}));}catch{/* Keep valid original formula source. */}}
    renders.render(stage);await renders.settled();return stage;
   }finally{stage.remove();}
  },
  portableHTML(node,note){const copy=node.cloneNode(true),mapping=documentURLs.get(node)||urls,assets=new Map(note.assets.map(asset=>[asset.id,asset]));for(const element of copy.querySelectorAll('[href],[src]'))for(const key of ['href','src']){const url=element.getAttribute(key),id=mapping.get(url)||(/^notebook-asset:([a-z0-9-]+)$/i.exec(url||'')||[])[1],asset=assets.get(id);if(asset)element.setAttribute(key,'data:'+asset.mime+';base64,'+toBase64(asset.bytes));}return copy.outerHTML;},
  destroy(){if(disposed)return;disposed=true;host.removeEventListener('paste',paste,true);host.removeEventListener('input',input);host.removeEventListener('beforeinput',beforeInput,true);host.removeEventListener('click',theme,true);host.removeEventListener('click',visitAsset,true);renders.destroy();release();instance.destroy();}
 };
 onDisconnect(host,api.destroy);return api;
}
