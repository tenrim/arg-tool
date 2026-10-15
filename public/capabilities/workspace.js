import {Box, Button, Toolbar, ToolPanel, ToolHeader, CapabilityButton, Status, updateStatus} from '../ui/index.js';
import {loadRegistry, capabilityCategories} from './registry.js';
import {mountCapabilityBrowser, requestCapability} from './browser.js';

export function mountCapabilityWorkspace(main, {navigate, openDirectory, onCategoryChange}) {
  const browse = ToolPanel({id: 'panel-browse', className: 'panel site-page capability-overview', hidden: true,
    header: ToolHeader({className: 'page-heading', title: '工具导航'})});
  const host = Box({className: 'capability-overview-body'});
  browse.append(host);main.prepend(browse);
  const browser = mountCapabilityBrowser(host, {searchId: 'overview-search', onCategory: category => {
    history.replaceState(null, '', '#browse' + (category ? '/' + category : ''));
    browse.dataset.category=category;browse.querySelector('h1').textContent=capabilityCategories.find(item=>item.id===category)?.title||'工具导航';
    onCategoryChange?.('browse'+(category?'/'+category:''));
  }});
  const bar = Box({className: 'capability-workspace-context', attrs: {'data-task-owner': 'capability-workspace'}});
  const toolbar = Toolbar({className: 'capability-workspace-navigation'});
  const back = Button({text: '返回功能总览', on: {click: () => navigate('browse/' + current.category + '/' + current.group)}});
  const location = Box({tag: 'span', className: 'capability-breadcrumb'});
  const all = Button({text: '全部功能', on: {click: () => openDirectory({category: current.category, group: current.group})}});
  toolbar.append(back, location, all);
  const peers = Toolbar({className: 'capability-workspace-peers', attrs: {role: 'group', 'aria-label': '相关任务'}});
  const nativeDirections=Toolbar({className:'capability-native-directions',hidden:true,attrs:{role:'group','aria-label':'转换方向'}});
  const learning=Toolbar({className:'capability-learning',hidden:true,attrs:{'aria-label':'相关知识'}});
  const status = Status({className: 'capability-workspace-status', hidden: true});
  bar.append(toolbar, peers, nativeDirections,learning,status);
  const originalHeadings = new WeakMap();
  let current = null, previousPanel = null, activationRevision = 0;
  function restore(invalidate = true) {
    if (invalidate) activationRevision++;
    if (previousPanel) {
      previousPanel.classList.remove('capability-task-panel');
      const original = originalHeadings.get(previousPanel);
      if (original) {original.h1.textContent = original.title;if(original.eyebrow)original.eyebrow.textContent = original.path;}
      previousPanel.querySelector(':scope>.workspace-outline')?.removeAttribute('hidden');
    }
    bar.remove();previousPanel = null;current = null;
  }
  async function activate(entry,{direction}={}) {
    const revision = ++activationRevision;
    const registry = await loadRegistry();
    if (revision !== activationRevision) return;
    const panel = document.getElementById('panel-' + entry.open.panel);
    if (!panel) throw Error('未找到对应工具工作区。');
    if(current?.id!==entry.id||previousPanel!==panel)restore(false);
    current = entry;
    previousPanel = panel;panel.classList.add('capability-task-panel');bar.dataset.currentCapability = entry.id;
    const heading = panel.querySelector('.page-heading'), h1 = heading?.querySelector('h1'), eyebrow = heading?.querySelector('.eyebrow');
    if (h1 && !originalHeadings.has(panel)) originalHeadings.set(panel, {h1, title: h1.textContent, eyebrow, path: eyebrow?.textContent});
    const group = registry.groups.find(item => item.id === entry.group), category = capabilityCategories.find(item => item.id === entry.category);
    if (h1) h1.textContent = entry.title;
    if (eyebrow) eyebrow.textContent = category.title + ' / ' + group.title;
    location.textContent = group.title;
    if(bar.parentElement!==panel)panel.prepend(bar);
    panel.querySelector(':scope>.workspace-outline')?.setAttribute('hidden', '');
    peers.replaceChildren();
    const sharedReference = entry.category==='knowledge'||['world', 'sky', 'matter'].includes(group.id);
    peers.hidden = sharedReference;
    if (!sharedReference) {
      const ids = [...new Set([...group.representatives, entry.id])];
      for (const id of ids) {
        const member = registry.byId?.get(id) || registry.entries.find(item => item.id === id);
        if (member?.listed !== false) peers.append(CapabilityButton({entry: member, compact: true, selected: member.id === entry.id, onOpen: requestCapability}));
      }
      if (group.count > ids.length) peers.append(Button({text: `全部 ${group.count} 项`, on: {click: () => openDirectory({category: entry.category, group: entry.group})}}));
      for (const id of entry.relatedIds || []) {
        const member = registry.byId?.get(id) || registry.entries.find(item => item.id === id);
        if (member && !ids.includes(id)) peers.append(CapabilityButton({entry: member, compact: true, onOpen: requestCapability}));
      }
    }
    const choices=entry.open.nativeDirections||[];
    nativeDirections.hidden=choices.length<2;
    const choiceKey=JSON.stringify([entry.id,choices.map(item=>[item.id,item.label])]);
    if(nativeDirections.dataset.choiceKey!==choiceKey){
      nativeDirections.dataset.choiceKey=choiceKey;
      nativeDirections.replaceChildren(...choices.map(item=>Button({text:item.label,attrs:{'data-native-direction':item.id},on:{click:()=>document.dispatchEvent(new CustomEvent('arg:capability-native-direction',{detail:{id:entry.id,direction:item.id}}))}})));
    }
    for(const button of nativeDirections.children)button.setAttribute('aria-pressed',String(button.dataset.nativeDirection===(direction||choices[0]?.id)));
    const lessons=(entry.learningIds||[]).map(id=>registry.byId.get(id)).filter(Boolean);
    learning.hidden=!lessons.length;learning.replaceChildren(...lessons.slice(0,2).map(lesson=>Button({text:'相关科普 · '+lesson.title,attrs:{'data-learning-link':lesson.id},on:{click:()=>requestCapability(lesson)}})));
    status.hidden = true;
  }
  return {activate, restore, showOverview(category = '', group = '') {
    restore();browser.select(category, group);browse.dataset.category=category;browse.querySelector('h1').textContent = capabilityCategories.find(item => item.id === category)?.title || '工具导航';
  }, retryRoute(route){browser.setRetryAction(()=>navigate(route));}, error(error) {status.hidden = false;updateStatus(status, error.message || String(error), 'error');}};
}
