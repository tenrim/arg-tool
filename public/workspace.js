import {element as uiElement, render as uiRender, dialogController, motionAllowed} from './ui/index.js';
import {sitePages} from './navigation.js';
import {loadRegistry, searchEntries, capabilityCategories} from './capabilities/registry.js';
import {requestCapability} from './capabilities/browser.js';

// All discovery surfaces read canonical public capability metadata.
export function mountToolSearch(header,navigate){
 const trigger=uiElement('button');trigger.className='workspace-search-trigger';trigger.type='button';uiRender(trigger, '<span>查找功能</span><kbd>Ctrl K</kbd>');trigger.setAttribute('aria-haspopup','dialog');header.append(trigger);
 const dialog=uiElement('dialog');dialog.className='workspace-search';dialog.setAttribute('aria-labelledby','workspace-search-title');
 uiRender(dialog, '<div class="workspace-search-heading"><h2 id="workspace-search-title">查找工具与操作</h2><button type="button" class="quiet-button" aria-label="关闭工具搜索">关闭</button></div><label class="workspace-search-field"><span class="sr-only">中文用途或英文名称</span><input type="search" placeholder="输入用途、中文或英文名称…" autocomplete="off"></label><p class="workspace-search-info" role="status" aria-live="polite"></p><div class="workspace-search-results"></div><p class="workspace-search-hint">↑ ↓ 选择 · Enter 打开 · Esc 关闭</p>');
 document.body.append(dialog);const input=dialog.querySelector('input'),list=dialog.querySelector('.workspace-search-results'),info=dialog.querySelector('[role=status]');let registry,index=0,revision=0;
 const modal=dialogController(dialog,{trigger,closeButton:dialog.querySelector('.workspace-search-heading button'),initialFocus:input});
 function render(){const term=input.value.trim(),matches=registry?searchEntries(registry,term):[];list.replaceChildren();index=0;
  for(const entry of matches.slice(0,60)){const b=uiElement('button');b.type='button';b.className='workspace-search-item';b.dataset.capability=entry.id;b.dataset.op=entry.engineName||'';b.dataset.route=entry.route;const name=uiElement('strong'),hint=uiElement('span');name.textContent=entry.title;hint.textContent=capabilityCategories.find(c=>c.id===entry.category).title+' / '+registry.groups.find(g=>g.id===entry.group).title;b.append(name,hint);b.onclick=()=>{modal.close();requestCapability(entry);};list.append(b);}
  if(term)for(const page of sitePages.filter(p=>p.title.includes(term))){const b=uiElement('button',page.title,'workspace-search-item');b.type='button';b.onclick=()=>{modal.close();navigate(page.route);};list.append(b);}
  info.textContent=registry?(matches.length?`${matches.length} 项匹配${matches.length>60?' · 显示前 60 项，请细化搜索':''}`:'没有匹配项，请换一个名称或用途。'):'正在载入本地功能目录…';highlight();
 }
 function highlight(){[...list.children].forEach((b,i)=>b.classList.toggle('is-current',i===index));}
 function open(){if(dialog.open)return;document.dispatchEvent(new CustomEvent('arg:searchopen'));modal.open();input.value='';render();input.focus();const gen=++revision;if(!registry)loadRegistry().then(r=>{if(gen!==revision)return;registry=r;render();}).catch(()=>{if(gen===revision)info.textContent='功能目录暂时无法载入，请关闭后重试。';});}
 trigger.onclick=open;
 input.oninput=render;input.onkeydown=e=>{if(!list.children.length)return;if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();index=(index+(e.key==='ArrowDown'?1:-1)+list.children.length)%list.children.length;highlight();list.children[index].scrollIntoView({block:'nearest'});}else if(e.key==='Enter'){e.preventDefault();list.children[index].click();}};
 document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();open();}});
 return {open,close(){if(dialog.open)modal.close();}};
}

// Preserve the original controls and listeners. Shortcuts simply focus/scroll
// existing work areas; shared tab state and uploaded files stay in place.
export function mountWorkspaceGuides(main){
 const singleTitles={analysis:['输入密文','特征与建议','候选与密钥'],substitution:['密文与搜索','候选明文'],hanzi:['查询条件','查询结果'],cube:['魔方与公式','当前状态'],words:['查找条件','匹配结果'],extract:['输入与提取'],video:['视频与操作','预览与结果'],coordinates:['坐标换算','时间与时区'],symbols:['符号识读'],paper:['题面设置','题面','求解结果'],code:['运行设置','源代码','程序输出']};
 for(const panel of main.querySelectorAll('.panel')){
  if(panel.classList.contains('site-page'))continue;
  panel.classList.add('compact-workspace');const id=panel.id.slice(6);if(['crypto','encoding','language','textlab','datalab','networklab','mathlab','image','audio'].includes(id))continue;
  const bar=uiElement('nav');bar.className='workspace-outline';bar.setAttribute('aria-label','本页工作区');let counter=0;
  const candidates=[...panel.querySelectorAll('.surface,.hunt-inputs,.hunt-results,.hunt-extraction,.r4-box,.frag-stage-panel,.frag-inspector,.chef-pane')].filter(n=>!n.closest('.ct-tool,.ct-extension')&&!n.parentElement.closest('.surface,.r4-box,.frag-stage-panel,.frag-inspector,.chef-pane'));
  for(const node of candidates){node.classList.add('workspace-region');const h=node.querySelector('h2');let title=h?.textContent?.trim()||singleTitles[id]?.[counter]||(['image','audio','file'].includes(id)&&counter===0?'文件与预览':'');if(!title||title.length>24)continue;counter++;if(!h&&singleTitles[id]&&node.matches('.surface,.hunt-inputs')){const titleNode=uiElement('h2');titleNode.className='workspace-region-heading';titleNode.textContent=title;node.prepend(titleNode);}if(!node.id)node.id=`workspace-${id}-${counter}`;const button=uiElement('button');button.type='button';button.textContent=title;button.onclick=()=>{node.scrollIntoView({block:'start',behavior:motionAllowed()?'smooth':'instant'});const field=node.querySelector('input:not([type=file]),textarea:not([readonly]),select,button');field?.focus({preventScroll:true});};button._region=node;bar.append(button);}
  const jump=panel.querySelector(':scope>.ct-jump');if(jump){jump._region=panel.querySelector('.ct-extension');bar.append(jump);}
  if(bar.children.length>2||['file','coordinates','symbols','code'].includes(id)&&bar.children.length>1)panel.querySelector('.page-heading').after(bar);
 }
 function sync(){for(const button of main.querySelectorAll('.workspace-outline button'))button.hidden=!button._region.getClientRects().length;}
 document.addEventListener('arg:panelchange',()=>requestAnimationFrame(sync));document.addEventListener('arg:subpanelchange',()=>requestAnimationFrame(sync));
}
