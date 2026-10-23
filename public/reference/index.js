import {element as uiElement, DataList, Link, Box, setState, updateStatus, onDisconnect} from '../ui/index.js';
import {$,mount,field,button,status,download,copy} from '../round1/common.js';
import {REFERENCE_TOOLS,REFERENCE_LANGUAGE_NOTES,referenceToolSources} from './catalog.js';
import {mountReferenceBrowser} from './browser.js';
import {tarotDeck} from './tarot-art.js';
import {appendDiscoveryActions} from '../discovery/bridge.js';
import {SKY_TYPES} from '../discovery/reference-core.js';
import {adoptWorldSelection} from '../capabilities/reference-workspaces.js';
import {mountTaskLifecycle} from '../capabilities/task-lifecycle.js';
const select=(id,options)=>`<select id="${id}">${options.map(([v,t])=>`<option value="${v}">${t}</option>`).join('')}</select>`;
function controls(id){
 if(id==='currencies')return field('资料状态',select('currencies-filter',[['current','现行'],['historic','历史'],['','全部']]))+field('国家／地区代码（可留空）','<input id="currencies-region" maxlength="2" placeholder="如 CN" autocapitalize="characters">');
 if(id==='marine')return field('处理方式',select('marine-mode',[['lookup','查找信号旗'],['sequence','组合旗语'],['codebook','完整国际信号规则（原文）']]))+field('旗帜类别',select('marine-filter',[['','全部'],['letters','字母旗'],['numbers','数字旗']]));
 if(id==='sky')return field('天体类型',select('sky-filter',[['','全部类型'],...Object.entries(SKY_TYPES).map(([k,v])=>[k,v])]))+field('V 星等上限（可留空）','<input id="sky-max-magnitude" type="number" min="-30" max="30" step="any" placeholder="如 6.5">');
 if(id==='countries')return field('所属洲',select(id+'-region',[['','全部'],...['亚洲','欧洲','非洲','北美洲','南美洲','大洋洲','南极洲'].map(s=>[s,s])]));
 if(id==='airports'||id==='ports')return field('国家／地区代码（可留空）',`<input id="${id}-region" maxlength="2" placeholder="两字母代码，如 CN" autocapitalize="characters">`)+field(id==='airports'?'设施类型':'地点功能',select(id+'-filter',id==='airports'?[['','全部'],['large_airport','大型机场'],['medium_airport','中型机场'],['small_airport','小型机场'],['heliport','直升机场'],['closed','已关闭']]:[['','全部'],['1','港口'],['2','铁路'],['3','公路'],['4','机场'],['5','邮政交换'],['6','多式联运'],['7','固定运输设施'],['B','边境口岸']]));
 if(id==='unicode')return field('查询方式',select(id+'-mode',[['character','字符或码位'],['name','名称／关键词／类别反查']]));
 if(id==='iching')return field('查询范围',select(id+'-mode',[['hexagram','六十四卦'],['trigram','八卦']]))+`<details class="ref-lines-input"><summary>按阴阳爻查询</summary><div id="iching-lines" class="ref-lines-controls">${[5,4,3,2,1,0].map(i=>`<button type="button" data-line="${i}" aria-pressed="false">${['初','二','三','四','五','上'][i]}爻：阴 0</button>`).join('')}</div><label class="ref-check"><input id="iching-by-lines" type="checkbox">使用上方爻象查询（忽略文字）</label></details>`;
 if(id==='tarot')return field('牌组／花色',select(id+'-filter',[['','全部'],...['大阿尔卡那','权杖','圣杯','宝剑','星币'].map(s=>[s,s])]));
 if(id==='geology')return field('查询方式',select(id+'-mode',[['name','名称查询'],['age','指定百万年前（Ma）']]))+field('年代层级',select(id+'-filter',[['','全部层级'],...['宙','代','纪','世','期'].map(s=>[s,s])]));
 return '';
}
const el=uiElement;
import {resultRecording} from '../result-recording.js';
export function initReference(){
 for(const tool of REFERENCE_TOOLS){const {id,title}=tool;
  const integratedSources=referenceToolSources(tool);
  const panel=mount(id,title,`<div class="ref-layout"><form id="${id}-form" class="ref-card"><h2>查询条件</h2>${field('查询内容',`<textarea id="${id}-query" rows="3" maxlength="10000" spellcheck="false" placeholder="${tool.placeholder}"></textarea>`)}${controls(id)}<div class="ref-actions"><button type="submit" id="${id}-run" class="primary-button">查询</button><button type="button" id="${id}-stop" class="secondary-button" disabled>停止</button><button type="button" id="${id}-clear" class="secondary-button">清空结果</button></div>${status(id+'-status')}</form><section class="ref-card ref-results" aria-labelledby="${id}-result-heading"><div class="ref-result-head"><h2 id="${id}-result-heading">查询结果</h2><div class="ref-actions">${button(id+'-copy','复制当前页')}${button(id+'-download','下载当前页')}</div></div><p id="${id}-summary" role="status">填写条件后点击查询。</p><div id="${id}-results" class="ref-result-list"></div><div class="ref-pagination"><button id="${id}-prev" class="secondary-button" disabled>上一页</button><span id="${id}-page">—</span><button id="${id}-next" class="secondary-button" disabled>下一页</button></div></section></div>`,integratedSources);panel.classList.add('ref-panel');
  if(REFERENCE_LANGUAGE_NOTES[id])panel.querySelector('.ref-layout').before(el('p',REFERENCE_LANGUAGE_NOTES[id],'ref-note'));
  let worker=null,timer=null,revision=0,page=0,total=0,text='',recordId=null,browser=null,deck='gearberry';
  let recordings=[];
  const query=$(id+'-query'),form=$(id+'-form'),output=$(id+'-results'),message=$(id+'-status');
  const setStatus=(s,error=false,tone='info')=>updateStatus(message,s,error?'error':tone);
  const buttons=()=>{setState($(id+'-run'),{busy:!!worker});$(id+'-run').disabled=!!worker;$(id+'-stop').disabled=!worker;$(id+'-copy').disabled=!text;$(id+'-download').disabled=!text;$(id+'-prev').disabled=!!worker||page<=0;$(id+'-next').disabled=!!worker||(page+1)*24>=total;};
  function stop(){worker?.terminate();worker=null;clearTimeout(timer);}
  function invalidate(s=''){for(const recording of recordings)recording.clear();recordings=[];revision++;stop();text='';page=0;total=0;recordId=null;output.replaceChildren();$(id+'-summary').textContent='';$(id+'-page').textContent='—';setStatus(s);browser?.clear();buttons();}
  const lifecycle=mountTaskLifecycle(panel,{isBusy:()=>Boolean(worker),invalidate:()=>invalidate(),dispose(){revision++;stop();}});
  const params=()=>({query:query.value,recordId,deck,mode:$(id+'-mode')?.value,region:$(id+'-region')?.value.trim(),filter:$(id+'-filter')?.value,maxMagnitude:$(id+'-max-magnitude')?.value,bits:id==='iching'&&$('iching-by-lines').checked?Array.from({length:$('iching-mode').value==='trigram'?3:6},(_,i)=>$('iching-lines').querySelector(`[data-line="${i}"]`).getAttribute('aria-pressed')==='true'?'1':'0').join(''):undefined,page});
  function details(fields){return DataList({className:'ref-data',items:fields});}
  function render(result){total=result.total;page=result.page;const items=result.items;text=items.map(r=>[r.title,...r.fields.map(f=>f.join('\t'))].join('\n')).join('\n\n');output.replaceChildren();$(id+'-summary').textContent=result.note||`找到 ${total} 项，当前显示 ${page*24+1}–${Math.min((page+1)*24,total)} 项。`;$(id+'-page').textContent=`${total?page+1:0} / ${Math.ceil(total/24)} 页`;
   for(const r of items){const card=el('article',undefined,'ref-item');card.dataset.record=r.id;const head=el('div',undefined,'ref-item-head');
    if(r.flag){const img=el('img');img.src=new URL('../vendor/reference/flags/'+r.flag+'.svg',import.meta.url).href;img.alt=r.title+'旗帜';img.className='ref-flag';img.loading='lazy';head.append(img);}
    if(r.swatch){const swatch=el('span',undefined,'ref-swatch');swatch.style.backgroundColor=r.swatch;swatch.setAttribute('aria-label','色值 '+r.swatch);head.append(swatch);}
    if(r.tarotImage){const img=el('img');img.src=new URL('../vendor/reference/'+r.tarotImage,import.meta.url).href;img.alt=r.title+'牌面';img.className='ref-tarot-thumbnail';img.loading='lazy';head.append(img);}
    if(r.marineFlag){const img=el('img');img.src=new URL('../vendor/discovery/'+r.marineFlag,import.meta.url).href;img.alt=r.title;img.className='marine-flag';img.loading='lazy';head.append(img);}
    head.append(el('h3',r.title));card.append(head);
    if(r.lines){const draw=el('div',undefined,'ref-hexagram');draw.setAttribute('aria-label','自下而上的爻：'+r.lines.join(''));for(const bit of [...r.lines].reverse()){const line=el('div',undefined,bit?'yang':'yin');line.append(el('span'));if(!bit)line.append(el('span'));draw.append(line);}card.append(draw);}
    card.append(details(r.fields));
    if(id==='marine'&&/^\/vendor\/completion\/marine\/Pub102bk\.pdf#page=\d+$/.test(r.sourceUrl||''))card.append(Link({text:'查看完整原书此页',attrs:{href:'.'+r.sourceUrl,target:'_blank',rel:'noopener noreferrer'}}));
    if(id==='marine'&&r.sourceImage==='/vendor/completion/marine/flag-chart.png')card.append(Box({tag:'img',attrs:{src:'.'+r.sourceImage,alt:'NGA 国际信号旗完整图版',class:'completion-barcode'}}));
    appendDiscoveryActions(card,r);
    const recording=resultRecording({id:id+'-record-'+r.id,anchor:card.lastElementChild,panel});recording.publish({text:[r.title,...r.fields.map(field=>field.join('\t'))].join('\n'),name:r.title+'.txt'});recordings.push(recording);
    output.append(card);
   }setStatus('查询完成',false,'success');browser?.results(result);buttons();
   document.dispatchEvent(new CustomEvent('arg:reference-result',{detail:{kind:id,result}}));
  }
  function run(){const nextPage=page,selected=recordId;invalidate('正在载入资料并查询…');page=nextPage;recordId=selected;browser?.loading();const current=revision;
   const fail=s=>{if(current!==revision)return;stop();setStatus(s,true);browser?.error(s);buttons();};
   try{worker=new Worker(new URL('./worker.js',import.meta.url));buttons();timer=setTimeout(()=>fail('查询超过 30 秒，已停止。请缩小条件后重试。'),30000);worker.onerror=e=>{e.preventDefault();fail('查询组件启动失败，请刷新页面后重试。');};worker.onmessage=({data})=>{if(current!==revision)return;stop();if(data.error){fail(data.error);return;}render(data.result);};worker.postMessage({kind:id,params:params(),resourceBase:new URL('../',import.meta.url).href});}catch{fail('无法启动查询，请检查浏览器是否支持本地后台运算。');}
  }
  form.onsubmit=e=>{e.preventDefault();page=0;run();};form.addEventListener('input',()=>{invalidate();if(id==='colors')browser?.refreshPlot();});form.addEventListener('change',()=>{invalidate();if(id==='iching')for(const b of $('iching-lines').children)b.hidden=$('iching-mode').value==='trigram'&&Number(b.dataset.line)>2;});
  $(id+'-stop').onclick=()=>invalidate('已停止，输入保留。');$(id+'-clear').onclick=()=>invalidate('结果已清空。');$(id+'-prev').onclick=()=>{page--;run();};$(id+'-next').onclick=()=>{page++;run();};$(id+'-copy').onclick=async()=>{try{await copy(text);setStatus('已复制当前页。');}catch(e){setStatus(e.message,true);}};$(id+'-download').onclick=()=>download(text,title+'-第'+(page+1)+'页.txt');
  if(id==='iching')for(const b of $('iching-lines').children)b.onclick=()=>{invalidate();const on=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',String(on));b.textContent=['初','二','三','四','五','上'][b.dataset.line]+'爻：'+(on?'阳 1':'阴 0');$('iching-by-lines').checked=true;};
  browser=mountReferenceBrowser(panel,tool,{invalidate,cancelIfBusy(){if(worker)invalidate();},getDeck:()=>deck,changeDeck(value){deck=tarotDeck(value).id;page=0;run();},previewQuery(value){if(query.value===value)return;query.value=value;invalidate();},invalidateQuery(value){query.value=value;invalidate('色值尚未完整，请输入 #RGB 或 #RRGGBB。');},select(selection){adoptWorldSelection(id,selection);query.value=selection.query??'';for(const key of ['mode','region','filter'])if(Object.hasOwn(selection,key)&&$(id+'-'+key))$(id+'-'+key).value=selection[key];if(id==='iching')$('iching-by-lines').checked=false;recordId=selection.recordId??null;page=0;browser.refreshPlot();run();}});
  const request=e=>{if(e.detail?.kind!==id)return;const s=e.detail.selection||{};adoptWorldSelection(id,s);query.value=s.query||'';for(const key of ['mode','region','filter'])if(Object.hasOwn(s,key)&&$(id+'-'+key))$(id+'-'+key).value=s[key];if(Object.hasOwn(s,'maxMagnitude')&&$(id+'-max-magnitude'))$(id+'-max-magnitude').value=s.maxMagnitude;recordId=s.recordId??null;page=0;browser?.refreshPlot();lifecycle.whenActive(()=>{recordId=s.recordId??null;run();});};
  document.addEventListener('arg:reference-request',request);onDisconnect(panel,()=>{revision++;stop();document.removeEventListener('arg:reference-request',request);});
  buttons();
 }
}
