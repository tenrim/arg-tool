import {Box, Button, Card, DataList, Field, Option, Select, Status, Toolbar, disclosureController, element, onDisconnect, updateStatus} from '../ui/index.js';
import {appendDiscoveryActions} from './bridge.js';
import {filterSky, skyName} from './reference-core.js';
const ns = 'http://www.w3.org/2000/svg';
const svg = (tag, attrs = {}, text) => {const n = document.createElementNS(ns, tag); for (const [k,v] of Object.entries(attrs)) n.setAttribute(k,v); if (text !== undefined) n.textContent = text; return n;};
export function mountDiscoveryBrowser(panel, tool, api) {
  const id = tool.id, stage = Box({id: id + '-visual-stage'}), detail = Box({id: id + '-visual-detail', className: 'ref-visual-detail'}), body = Box({id: id + '-visual-body', className: 'ref-visual-body', children: [stage, detail]});
  const toggle = Button({text: '收起图形'}), root = Card({id: id + '-browser', className: 'ref-browser ref-card', children: [Toolbar({children: [Box({tag:'h2',text:id==='marine'?'信号旗':id==='sky'?'天体图':'国家与货币'}), toggle]}), body]});
  panel.querySelector('.ref-layout').before(root);
  const disclosure = disclosureController(toggle, body, {openLabel:'收起图形', closedLabel:'展开图形'});
  let ready = false, loading = false, disposed = false, records = null, chart = null, picker = null, selected = '', version = 0, latestResult=null;
  const note = Status({className:'sky-stat'}); stage.append(note);
  const pick = selection => api.select(selection);
  async function read(path) {const response = await fetch(new URL('../vendor/' + path, import.meta.url)); if (!response.ok) throw Error('浏览资料载入失败，请重试。'); return response.json();}
  const showEmpty = () => detail.replaceChildren(Box({tag:'h3',text:'点选后查看资料'})); showEmpty();
  async function activate() {
    if (ready || loading || disposed) return; loading = true; const current = ++version; updateStatus(note, '正在载入浏览资料…');
    stage.querySelector('[data-retry]')?.remove();
    try {
      const data = await read(id==='currencies'?'reference/countries.json':id==='marine'?'discovery/marine-flags.json':'discovery/sky-index.json');
      if (disposed || current !== version) return; records = data;
      if (id === 'currencies') buildCurrencies(); else if (id === 'marine') buildMarine(); else buildSky();
      ready = true; root.dataset.ready = 'true'; if(id!=='sky')updateStatus(note, '');if(latestResult)result(latestResult);
    } catch (error) {if (disposed || current !== version) return; updateStatus(note, error.message, 'error'); stage.append(Button({text:'重新载入',attrs:{'data-retry':id},on:{click:activate}}));}
    finally {if (current === version) loading = false;}
  }
  function buildCurrencies() {
    stage.querySelector('[data-retry]')?.remove(); const select = Select({id:'currencies-country-picker'});
    select.append(Option('选择国家／地区', ''));
    for (const c of [...records].sort((a,b)=>a.name.localeCompare(b.name,'zh'))) select.append(Option(c.name + ' · ' + c.id, c.id));
    select.onchange = () => {if (select.value) pick({query:'',region:select.value,filter:'current'});};
    const popular = Toolbar({children:['CNY','USD','EUR','JPY','GBP','HKD','TWD','KRW','CHF','AUD','CAD','INR'].map(code=>Button({text:code,on:{click:()=>pick({query:code,region:'',filter:'current'})}}))});
    stage.append(Field({label:'按国家／地区查找货币',control:select}), popular);
  }
  function buildMarine() {
    stage.querySelector('[data-retry]')?.remove(); const grid = Box({className:'marine-grid'});
    for (const r of records) {
      const image = element('img',undefined,'marine-flag'); image.src = new URL('../vendor/discovery/'+r.file,import.meta.url).href; image.alt = ''; image.loading = 'lazy';
      const b = Button({className:'marine-choice',children:[image,Box({tag:'strong',text:r.id})],attrs:{'data-flag':r.id,'aria-label':r.name+' '+r.phonetic},on:{click:()=>{
        const sequence = document.getElementById('marine-mode').value === 'sequence';
        pick(sequence ? {query:document.getElementById('marine-query').value.replace(/\s/g,'').toUpperCase()+r.id,mode:'sequence',filter:''} : {query:r.id,recordId:r.id,mode:'lookup',filter:''});
      }}}); grid.append(b);
    }
    stage.append(grid);
  }
  function buildSky() {
    stage.querySelector('[data-retry]')?.remove(); chart = svg('svg',{viewBox:'0 0 900 450',class:'sky-chart',role:'group','aria-label':'天体赤道坐标图，赤经从右向左增大，赤纬从下向上增大'});
    picker = Select({id:'sky-chart-picker'}); picker.onchange=()=>{if(picker.value)pick({query:'',recordId:picker.value});};
    stage.append(chart, Field({label:'选择图中的天体',control:picker})); drawSky();
  }
  function drawSky() {
    if (!chart || !records) return;
    const p={query:document.getElementById('sky-query').value,filter:document.getElementById('sky-filter').value,maxMagnitude:document.getElementById('sky-max-magnitude').value};
    let items; try {items=filterSky(p,records);} catch(error){chart.replaceChildren();picker.replaceChildren(Option('条件无效',''));updateStatus(note,error.message,'error');return;}
    const plotted=items.filter(r=>r.ra!==null&&r.dec!==null&&!['Dup','NonEx'].includes(r.type)).sort((a,b)=>(a.mag??99)-(b.mag??99)).slice(0,300);
    chart.replaceChildren(); picker.replaceChildren(Option('选择天体查看资料',''));
    for(const dec of [-60,-30,0,30,60]){const y=30+(90-dec)/180*390;chart.append(svg('path',{d:`M45 ${y}H870`,class:'sky-gridline'}),svg('text',{x:4,y:y+5,class:'sky-gridlabel'},dec+'°'));}
    for(const ra of [0,6,12,18,24]){const x=45+(24-ra)/24*825;chart.append(svg('path',{d:`M${x} 30V420`,class:'sky-gridline'}),svg('text',{x:Math.min(845,x),y:443,class:'sky-gridlabel'},ra+'h'));}
    for(const r of plotted){const x=45+(24-r.ra)/24*825,y=30+(90-r.dec)/180*390,c=svg('circle',{cx:x,cy:y,r:3,class:'sky-point'+(selected===r.id?' is-selected':''),'data-sky-point':r.id,tabindex:'0',role:'button','aria-label':skyName(r)+' '+r.id});c.append(svg('title',{},skyName(r)+' · '+r.id));const choose=()=>pick({query:'',recordId:r.id});c.onclick=choose;c.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose();}};chart.append(c);picker.append(Option(skyName(r)+' · '+r.id,r.id));}
    updateStatus(note,`匹配 ${items.length} 项 · 图中显示 ${plotted.length} 个最亮的有坐标记录`); picker.value=plotted.some(r=>r.id===selected)?selected:'';
  }
  function result(result) {
    latestResult=result;
    detail.replaceChildren();
    if (result.sequence) {
      const sequence = Box({className:'marine-sequence',attrs:{'aria-label':'旗语组合 '+result.sequence}});
      for (const c of result.sequence) {const r=records?.find(r=>r.id===c);if(!r)continue;const image=element('img');image.src=new URL('../vendor/discovery/'+r.file,import.meta.url).href;image.alt=r.name;sequence.append(Box({tag:'figure',children:[image,Box({tag:'figcaption',text:c})]}));}
      detail.append(sequence);
    }
    const r=result.items[0];if(!r){detail.append(Box({tag:'p',text:result.note||'没有匹配资料'}));return;}
    selected=r.id;
    if(r.marineFlag){const image=element('img',undefined,'marine-flag');image.src=new URL('../vendor/discovery/'+r.marineFlag,import.meta.url).href;image.alt=r.title;detail.append(image);}
    detail.append(Box({tag:'h3',text:r.title}),DataList({className:'ref-data',items:r.fields.slice(0,8)}));appendDiscoveryActions(detail,r);
    if(id==='sky')drawSky();
  }
  const changed=event=>{if(event.detail.name===id)activate();};document.addEventListener('arg:panelchange',changed);
  onDisconnect(root,()=>{disposed=true;version++;disclosure.destroy();document.removeEventListener('arg:panelchange',changed);});
  queueMicrotask(()=>{if(location.hash.slice(1).split('/')[0]===id)activate();});
  return {loading(){detail.replaceChildren(Status({text:'正在查询…'}));},clear(){latestResult=null;selected='';showEmpty();if(id==='sky')drawSky();},results:result,error(message){detail.replaceChildren(Status({text:message,attrs:{'data-state':'error'}}));},refreshPlot(){if(id==='sky')drawSky();}};
}
