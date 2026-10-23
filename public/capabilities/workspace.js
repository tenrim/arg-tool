import {Box, Button, Toolbar, ToolPanel, ToolHeader, Status, updateStatus, Card, FormGrid, Field, Select, Option} from '../ui/index.js';
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
  const bar = Box({className: 'capability-workspace-context', hidden: true, attrs: {'data-task-owner': 'capability-workspace'}});
  const back = Button({text: '返回分组', variant: 'quiet', attrs: {'data-task-navigation':'group'}, on: {click: () => {if(current)navigate('browse/' + current.category + '/' + current.group);}}});
  const all = Button({text: '全部功能', variant: 'quiet', attrs: {'data-task-navigation':'directory'}, on: {click: () => {if(current)openDirectory({category: current.category, group: current.group});}}});
  let currentLesson=null;
  const learning=Button({text:'相关科普',variant:'quiet',hidden:true,on:{click:()=>{if(currentLesson&&current)requestCapability(currentLesson);}}});
  const status = Status({className: 'capability-workspace-status', hidden: true});
  const topicSelect=Select({attrs:{'aria-label':'功能'}});
  const topicCard=Card({className:'surface capability-topic-settings',children:[FormGrid({children:[Field({label:'功能',control:topicSelect})]})]});
  topicSelect.addEventListener('change',()=>{
    const variant=current?.variants?.find(item=>item.id===topicSelect.value);
    if(!variant)return;
    // A mixed topic chooses an actual controller/operation, not a new engine.
    // Clear a previous search preference so it cannot override the explicit
    // variant selection (e.g. switching from Chef generation to native repair).
    requestCapability({...current,preferredOperation:undefined},variant.open.kind==='operation'?variant.open.operation:undefined,variant.id);
  });
  bar.append(status);
  const originalHeadings = new WeakMap();
  let current = null, previousPanel = null, activationRevision = 0;
  function restore(invalidate = true) {
    if (invalidate) activationRevision++;
    if (previousPanel) {
      previousPanel.classList.remove('capability-task-panel');
      const original = originalHeadings.get(previousPanel);
      if (original) original.h1.textContent = original.title;
      previousPanel.querySelector(':scope>.workspace-outline')?.removeAttribute('hidden');
    }
    back.remove();all.remove();learning.remove();learning.hidden=true;learning.removeAttribute('data-learning-link');learning.removeAttribute('aria-label');currentLesson=null;
    topicCard.remove();bar.remove();previousPanel = null;current = null;
  }
  async function activate(entry) {
    const revision = ++activationRevision;
    const registry = await loadRegistry();
    if (revision !== activationRevision) return;
    const panel = document.getElementById('panel-' + entry.open.panel);
    if (!panel) throw Error('未找到对应工具工作区。');
    if(current?.id!==entry.id||previousPanel!==panel)restore(false);
    current = entry;
    previousPanel = panel;panel.classList.add('capability-task-panel');bar.dataset.currentCapability = entry.id;
    const heading = panel.querySelector('.page-heading'), h1 = heading?.querySelector('h1');
    if (h1 && !originalHeadings.has(panel)) originalHeadings.set(panel, {h1, title: h1.textContent});
    if (h1) h1.textContent = entry.title;
    if(entry.topic&&entry.variants?.length>1){
      topicSelect.replaceChildren(...entry.variants.map(variant=>Option(variant.title,variant.id)));
      topicSelect.value=entry.variantId||entry.variants[0].id;
      heading?.after(topicCard);
    }else topicCard.remove();
    heading?.querySelector('.eyebrow')?.remove();
    if(bar.parentElement!==panel)panel.prepend(bar);
    panel.querySelector(':scope>.workspace-outline')?.setAttribute('hidden', '');
    const lessons=(entry.learningIds||[]).map(id=>registry.byId.get(id)).filter(Boolean);
    currentLesson=lessons[0]||null;learning.hidden=!currentLesson;
    if(currentLesson){learning.dataset.learningLink=currentLesson.id;learning.setAttribute('aria-label','相关科普：'+currentLesson.title);}
    else{learning.removeAttribute('data-learning-link');learning.removeAttribute('aria-label');}
    if(heading){
      let actions=heading.querySelector('.heading-actions');
      if(!actions){actions=Toolbar({className:'heading-actions'});heading.append(actions);}
      const help=actions.querySelector('.tool-help-button');
      if(help)help.before(learning);else actions.append(learning);
      actions.append(back,all);
    }
    bar.hidden = true;
    status.hidden = true;
  }
  return {activate, restore, showOverview(category = '', group = '') {
    restore();browser.select(category, group);browse.dataset.category=category;browse.querySelector('h1').textContent = capabilityCategories.find(item => item.id === category)?.title || '工具导航';
  }, retryRoute(route){browser.setRetryAction(()=>navigate(route));}, error(error) {bar.hidden = false;status.hidden = false;updateStatus(status, error.message || String(error), 'error');}};
}
