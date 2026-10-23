import {Box,Button,onDisconnect} from '../ui/index.js';

// Vditor's stock ECharts/WaveDrom use Function(), Markmap loads remote assets,
// and PlantUML sends source to a server. Route ONLY rendered code previews
// through this adapter; the source fences and official vendor files stay intact.
export const diagramLanguages=['mermaid','echarts','mindmap','markmap','flowchart','graphviz','wavedrom','abc','smiles','plantuml'];
export function createNoteRenderers({load,base,purifier}){
 const jobs=new Map();let serial=0,dead=false;
 purifier.addHook('uponSanitizeAttribute',(_node,data)=>{if(['href','xlink:href'].includes(data.attrName))data.keepAttr=/^#[a-z0-9_.:-]+$/i.test(data.attrValue);});
 function cleanSVG(value,scope){
  const fragment=purifier.sanitize(value,{USE_PROFILES:{svg:true,svgFilters:true},ADD_TAGS:['use'],FORBID_TAGS:['foreignObject','image','a','script'],RETURN_DOM_FRAGMENT:true});
  // SVG <use> creates a shadow tree where ancestor-scoped selectors no longer
  // match. Materialize the engine's static presentation on its source shapes.
  const original=new Map([...fragment.querySelectorAll('*')].map(node=>[node,new Set(node.style?[...node.style]:[])]));
  for(const style of fragment.querySelectorAll('style')){const sheet=new CSSStyleSheet();sheet.replaceSync(style.textContent);for(const rule of sheet.cssRules){if(rule.type!==1)continue;for(const node of fragment.querySelectorAll(rule.selectorText))for(const property of rule.style){if(!/^(?:animation|transition)/.test(property)&&!original.get(node).has(property))node.style.setProperty(property,rule.style.getPropertyValue(property));}}}
  const ids=new Map();for(const node of fragment.querySelectorAll('[id]')){ids.set(node.id,scope+'-'+node.id);node.id=ids.get(node.id);}
  const refs=text=>text.replace(/#([\w:.-]+)/g,(match,id)=>ids.has(id)?'#'+ids.get(id):match);
  for(const node of fragment.querySelectorAll('*'))for(const attr of [...node.attributes]){
   if(['href','xlink:href'].includes(attr.name)&&!ids.has(attr.value.slice(1))){node.removeAttribute(attr.name);continue;}
   if(attr.name!=='id'&&attr.value.includes('#'))node.setAttribute(attr.name,refs(attr.value));
  }
  // Generated SVG style sheets are document-global in HTML. Scope them to this
  // drawing so WaveDrom/SMILES cannot restyle headings, icons or other diagrams.
  for(const style of fragment.querySelectorAll('style')){const sheet=new CSSStyleSheet();sheet.replaceSync(style.textContent);style.textContent=[...sheet.cssRules].filter(rule=>rule.type===1).map(rule=>rule.selectorText.split(',').map(selector=>'#'+scope+' '+refs(selector)).join(',')+'{'+refs(rule.style.cssText)+'}').join('\n');}
  return fragment;
 }
 const script=(name,file=name+'.min.js')=>load(`vditor/dist/js/${name}/${file}`,'notebook-render-'+name);
 function clear(){for(const job of jobs.values())job.dispose?.();jobs.clear();}
 function sweep(){for(const [node,job]of jobs)if(!node.isConnected){job.dispose?.();jobs.delete(node);}}
 function render(root){sweep();for(const node of root.querySelectorAll('[data-notebook-language]')){
  if(jobs.has(node)||!node.isConnected)continue;
  const language=node.dataset.notebookLanguage,source=node.textContent,job={};jobs.set(node,job);
  const alive=()=>!dead&&node.isConnected&&jobs.get(node)===job;
  const target=Box({id:'notebook-drawing-'+(++serial),className:'notebook-diagram',attrs:{'aria-label':language+' 图示'}});
  onDisconnect(target,()=>{job.dispose?.();jobs.delete(node);});
  const done=()=>{if(alive()){node.replaceChildren(target);node.dataset.rendered='true';}};
  job.promise=(async()=>{
   if(source.length>50000)throw Error('图表代码最多 50,000 字符，请缩小图表。');
   if(language==='plantuml')throw Error('PlantUML 默认需要把正文发送到外部服务器；此处保留源码，可改用本地 Mermaid 图表。');
   // No configuration directives, external pictures, HTML labels or callbacks
   // enter diagram engines. Plain links in the note remain clickable.
   if(/(?:https?:|javascript:|data:|image:\/\/|%%\{|^---\s*$|<\/?[a-z][^>]*>)/im.test(source))throw Error('图表不支持外部资源、HTML 或自定义脚本配置。');
   if(language==='mermaid'){
    await script('mermaid');if(!alive())return;
    window.mermaid.initialize({startOnLoad:false,securityLevel:'strict',theme:'dark',fontFamily:'sans-serif',htmlLabels:false,flowchart:{htmlLabels:false},maxTextSize:50000,suppressErrorRendering:true});
    const result=await window.mermaid.render('notebook-diagram-'+(++serial),source);
    target.append(cleanSVG(result.svg,target.id));done();
   }else if(language==='echarts'||language==='mindmap'){
    await script('echarts');if(!alive())return;
    let option=JSON.parse(source);
    const check=value=>{if(typeof value==='string'&&/(?:https?:|data:|image:\/\/|javascript:)/i.test(value))throw Error('图表只接受本地数据，不支持外部资源。');if(value&&typeof value==='object')for(const [key,item]of Object.entries(value)){if(['image','__proto__','constructor','prototype'].includes(key))throw Error('图表包含不支持的配置项。');check(item);}};check(option);
    if(language==='mindmap')option={series:[{type:'tree',data:[option],initialTreeDepth:-1,label:{position:'left'},leaves:{label:{position:'right'}}}]};
    // JSON data only. No formatter functions or network image symbols.
    if(!option||typeof option!=='object'||Array.isArray(option))throw Error('图表需要一个 JSON 对象。');
    option.animation=false;option.tooltip={show:false};target.classList.add('notebook-chart');done();
    const chart=window.echarts.init(target,'dark',{renderer:'svg'});job.dispose=()=>chart.dispose();chart.setOption(option);
    const resize=new ResizeObserver(()=>{if(alive())chart.resize();});resize.observe(target);job.dispose=()=>{resize.disconnect();chart.dispose();};
   }else if(language==='markmap'){
    // The resource loader sets Prism's documented data-manual script flag.
    // A default page scan would rewrite Vditor's source/line-number DOM.
    await script('markmap');if(!alive())return;
    const {root:tree}=new window.markmap.Transformer().transform(source);
    const clean=item=>{item.content=purifier.sanitize(item.content,{ALLOWED_TAGS:['strong','em','code','s','span'],ALLOWED_ATTR:[]});item.children?.forEach(clean);};clean(tree);
    const svg=Box({tag:'svg',namespace:'http://www.w3.org/2000/svg',attrs:{class:'notebook-map',width:'800',height:'340',viewBox:'0 0 800 340'}});target.append(svg);done();
    const size=()=>{const width=Math.max(160,target.clientWidth);svg.setAttribute('viewBox',`0 0 ${width} 340`);svg.setAttribute('width',String(width));};size();
    const map=window.markmap.Markmap.create(svg,{duration:0,autoFit:true},tree),resize=new ResizeObserver(()=>{size();map.fit();});resize.observe(target);job.dispose=()=>{resize.disconnect();map.destroy();};
   }else if(language==='graphviz'){
    await script('graphviz','viz.js');if(!alive())return;
    const worker=new Worker(new URL('vditor/dist/js/graphviz/full.render.js',base));job.dispose=()=>worker.terminate();
    let timer;try{const result=await Promise.race([new window.Viz({worker}).renderSVGElement(source),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('图表渲染超时。')),10000);})]);target.append(cleanSVG(result.outerHTML,target.id));done();}finally{clearTimeout(timer);worker.terminate();}
   }else{
    const names={flowchart:['flowchart.js','flowchart.min.js'],abc:['abcjs','abcjs_basic.min.js'],wavedrom:['wavedrom','wavedrom.min.js'],smiles:['smiles-drawer','smiles-drawer.min.js']};
    await script(...names[language]);if(!alive())return;
    if(['flowchart','abc','wavedrom'].includes(language))target.classList.add('notebook-diagram-paper');
    // These engines measure glyphs with getBBox while drawing. Attach first so
    // they obtain real geometry; source validation precedes engine invocation.
    done();
    if(language==='flowchart')window.flowchart.parse(source.trim()).drawSVG(target);
    if(language==='abc')window.ABCJS.renderAbc(target,source.trim(),{responsive:'resize'});
    if(language==='wavedrom')window.wavedrom.renderWaveElement(++serial,JSON.parse(source),target,window.wavedrom.waveSkin,false);
    if(language==='smiles'){const svg=Box({tag:'svg',namespace:'http://www.w3.org/2000/svg'});target.append(svg);new window.SmiDrawer({},{}).draw(source.trim(),svg,'dark',()=>{},error=>{throw error;});}
    const clean=cleanSVG(target.innerHTML,target.id);target.replaceChildren(clean);done();
   }
  })().catch(error=>{if(!alive())return;job.dispose?.();job.dispose=null;node.replaceChildren(Box({tag:'pre',text:source}),Box({tag:'p',text:error.message||'图表渲染失败。'}),Button({text:'重试渲染',on:{click:()=>{jobs.delete(node);node.textContent=source;render(root);}}}));node.dataset.rendered='error';});
 }}
 return{render,clear,settled:()=>Promise.all([...jobs.values()].map(job=>job.promise)),destroy(){dead=true;clear();},custom:diagramLanguages.map(language=>({language:'notebook-'+language,render}))};
}
