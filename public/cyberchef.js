import {element as uiElement, Option as uiOption, Box, Button, Toolbar, Select, Input, Field, FormGrid, Textarea, setTextareaValue, onDisconnect, tabsController, updateStatus, setState, animatePresence} from './ui/index.js';
import {parseInert} from './ui/index.js';
import {schemas,defaults,renderParameters} from './chef-tools/schema.js';
import { CyberChefClient } from './cyberchef-client.js';
import {operationName, operationDescription, categories, localizedError} from './cyberchef-i18n.js';
import {loadRegistry} from './capabilities/registry.js';
import {classifyCatalogue} from './chef-tools/catalog.js';
import {operationFamilies,matchFamilies} from './chef-tools/families.js';
import {resultRecording} from './result-recording.js';
const $ = id => document.getElementById(id);
const elem = uiElement;
function download(data, filename, type) {
  const url = URL.createObjectURL(new Blob([data], { type })); const link = elem('a'); link.href = url; link.download = filename; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function initCyberChef() {
  const stage = $('cyberchef-stage'), input = $('chef-input'), output = $('chef-output'), status = $('cyberchef-status');
  let catalogue, families = [], client, loading, readingFile = false, fileRevision = 0, importRevision = 0, openRevision = 0, recipe = [], result = null, fileBytes = null, revision = 0, busy = false;
  let debugProgress=0,executedRecipe=null;
  let recorded=null;const recording=resultRecording({id:'chef-result',anchor:$('chef-download'),source:'chef'});
  function message(text, error = false, tone = 'info') { updateStatus(status,text,error?'error':tone); $('cyberchef-retry').hidden = !error; }
  const panes=tabsController($('chef-tabs'),[...$('chef-tabs').children].map(tab=>[tab.dataset.pane,tab.textContent,$(tab.getAttribute('aria-controls')),tab]),{initial:'input',visibility:false,onSelect:pane=>{stage.dataset.pane=pane;}});
  const selectPane=(pane,focus=false)=>panes.select(pane,{focus});
  function controls() { if(!result||busy){recorded=null;recording.clear();}else if(recorded!==result){recorded=result;recording.publish(result);}setState($('chef-run'), {busy: busy || readingFile}); $('chef-run').disabled = !catalogue || busy || readingFile; $('chef-cancel').hidden = !busy; $('chef-copy').disabled = !result; $('chef-download').disabled = !result; $('chef-to-input').disabled = !result; }
  function invalidate(text = '') {
    revision++; importRevision++;debugProgress=0;executedRecipe=null; if (busy) { client?.close(); client = null; busy = false; }
    result = null; magicHost.hidden=true;magicCandidates=[];output.value = ''; $('chef-output-info').textContent = '等待执行'; controls(); message(text);
  }
  function createClient() { client = new CyberChefClient(text => { if (busy) message('正在执行 · '+text); }); return client; }
  function renderOperations() {
    const term = $('chef-search').value.trim().toLowerCase(), category = $('chef-category').value;
    const names = new Set(category === 'all' ? Object.keys(catalogue.operations) : catalogue.categories.find(c => c.name === category)?.ops || []);
    const matches = matchFamilies(families.filter(family => family.rows.some(row => names.has(row.op))),term);
    $('chef-operation-count').textContent = `${matches.length} 个功能${matches.length > 80 ? ' · 显示前 80 个，请继续搜索' : ''}`;
    const list = $('chef-operations'); list.replaceChildren();
    for (const family of matches.slice(0,80)) {
      const add = name => { recipe.push({op:name,args:defaults(catalogue.operations[name])}); invalidate('已添加'+operationName(name)+'，可调整参数后执行'); renderRecipe(); selectPane('recipe'); };
      if (family.directions.length === 1) {
        const name = family.directions[0].op;
        list.append(Button({className:'chef-operation',children:elem('strong',family.title),attrs:{'data-operation':name,'data-family-id':family.id,title:`添加${operationName(name)}`},on:{click:()=>add(name)}}));
      } else {
        const choices = Toolbar({attrs:{role:'group','aria-label':`${family.title}的操作方向`},children:family.directions.map(direction => Button({className:'chef-operation',text:direction.label,attrs:{'data-operation':direction.op,title:`添加${operationName(direction.op)}`},on:{click:()=>add(direction.op)}}))});
        list.append(Box({className:'chef-operation-family',attrs:{'data-family-id':family.id},children:[elem('strong',family.title),choices]}));
      }
    }
    if (!matches.length) list.append(elem('p','没有匹配的操作，请尝试英文名称或其他分类','help'));
  }
  function renderRecipe() {
    const list = $('chef-recipe'); list.replaceChildren(); $('chef-step-count').textContent = `${recipe.length} 步`;
    if (!recipe.length) { list.append(elem('p','从左侧添加操作，依次构建你的处理链。空处理链会原样返回输入。','chef-empty')); return; }
    recipe.forEach((step,index) => {
      const card = elem('li',undefined,'chef-step'); card.classList.toggle('is-disabled',!!step.disabled); card.dataset.step = index;
      const heading = elem('div',undefined,'chef-step-heading'); heading.append(elem('span',String(index+1).padStart(2,'0'),'micro-label'),elem('strong',operationName(step.op)));
      const actions = elem('div',undefined,'chef-step-actions');
      for (const [action,label] of [['up','↑'],['down','↓'],['toggle',step.disabled?'启用':'停用'],['breakpoint',step.breakpoint?'移除断点':'断点'],['delete','×']]) {
        const b=elem('button',label,'quiet-button');b.type='button';b.dataset.action=action;b.setAttribute('aria-label',`${{up:'上移',down:'下移',toggle:step.disabled?'启用':'停用',delete:'删除',breakpoint:'断点'}[action]}第 ${index+1} 步`);
        b.disabled = action==='up'&&index===0 || action==='down'&&index===recipe.length-1;
        b.onclick=()=>{ if(action==='breakpoint')step.breakpoint=!step.breakpoint;else if(action==='delete')recipe.splice(index,1);else if(action==='toggle')step.disabled=!step.disabled;else {const dest=index+(action==='up'?-1:1);[recipe[index],recipe[dest]]=[recipe[dest],recipe[index]];} invalidate();renderRecipe(); }; actions.append(b);
      }
      heading.append(actions);card.append(heading);
      const definition = catalogue.operations[step.op], fields=elem('div',undefined,'chef-args'), args=schemas(definition);
      renderParameters(fields,definition,step,()=>invalidate());card.append(fields);
      if(!args.length)card.append(elem('p','无需参数','help'));
      const details=elem('details',undefined,'chef-description'),summary=elem('summary','操作说明');details.append(summary,elem('p',operationDescription(step.op,definition)));card.append(details);list.append(card);
    });
  }
  function checkedRecipe(value) {
    const list=Array.isArray(value)?value:value?.recipe;
    if(!Array.isArray(list)||list.length>500)throw Error('配方应包含最多 500 个操作');
    return list.map(step=>{
      if(!step||!Object.hasOwn(catalogue.operations,step.op)||!Array.isArray(step.args))throw Error('配方包含未知操作或无效参数');
      const args=defaults(catalogue.operations[step.op]);step.args.forEach((value,i)=>{if(i<args.length)args[i]=value;});
      return {op:step.op,args,...(step.disabled?{disabled:true}:{}),...(step.breakpoint?{breakpoint:true}:{})};
    });
  }
  async function run({step=false,ignoreBreakpoints=false}={}) {
    if(!catalogue||busy||readingFile)return; const runRevision=revision; busy=true;result=null;magicHost.hidden=true;magicCandidates=[];output.value='';controls();message('正在执行处理链…');
    try {
      const snapshot=structuredClone(recipe);if(ignoreBreakpoints)for(const op of snapshot)delete op.breakpoint;if(step){for(const op of snapshot)delete op.breakpoint;const next=Math.min(snapshot.length,debugProgress+1);if(next<snapshot.length)snapshot[next].breakpoint=true;}const payload=fileBytes?fileBytes.slice().buffer:input.value;
      const current=client&&!client.closed?client:createClient();const response=await current.bake(payload,snapshot);
      if(runRevision!==revision)return;
      executedRecipe=structuredClone(snapshot);debugProgress=response.progress;result=response; let presented=response.result;
      if(presented instanceof ArrayBuffer)presented=new TextDecoder().decode(presented);
      if(response.dish?.type===1)presented=response.dish.value;
      else if(response.dish?.type===6&&Array.isArray(response.dish.value)&&snapshot[response.progress-1]?.op==='Magic'){
        presented=JSON.stringify(response.dish.value,null,2);magicCandidates=response.dish.value;magicPrefix=snapshot.slice(0,response.progress-1);magicSuffix=snapshot.slice(response.progress);magicChoice.replaceChildren(...magicCandidates.map((candidate,i)=>uiOption(`${i+1}. ${candidate.recipe?.map(op=>operationName(op.op)).join(' → ')||'原始输入'} · ${String(candidate.data??'').slice(0,80)}`,String(i))));magicHost.hidden=!magicCandidates.length;
      }
      else if(String(response.type).toLowerCase()==='html'){const template=parseInert(presented);presented=template.content.textContent;}
      output.value=String(presented??'').slice(0,200000);
      $('chef-output-info').textContent=`${response.bytes.length.toLocaleString()} 字节 · ${Math.round(response.duration)} ms${String(presented).length>200000?' · 仅预览前 20 万字符':''}`;
      message(`${snapshot[response.progress]?.breakpoint?'已在断点暂停':'处理完成'} · 执行位置 ${response.progress} / ${recipe.length}`,false,'success');selectPane('output');animatePresence(output,{kind:'feedback'});
    } catch(error) {if(runRevision===revision)message(localizedError(error.message),true);}
    finally {if(runRevision===revision){busy=false;controls();}}
  }
  $('chef-run').onclick=()=>run();$('chef-cancel').onclick=()=>invalidate('已停止执行，可调整处理链后重试');
  const debugInfo=Box({tag:'p',attrs:{role:'status'},text:''}),debugToolbar=Toolbar({children:[Button({text:'单步执行',on:{click:()=>run({step:true})}}),Button({text:'忽略断点执行到底',on:{click:()=>run({ignoreBreakpoints:true})}}),Button({text:'Magic 自动识别',on:{click:()=>{if(!catalogue)return;recipe.push({op:'Magic',args:defaults(catalogue.operations.Magic)});invalidate('已加入官方 Magic，请执行查看候选。');renderRecipe();}}})]});
  $('chef-run').parentElement.after(debugToolbar,debugInfo);
  const highlights=async direction=>{if(!executedRecipe||!result||busy)return;try{const from=direction==='forward'?input:output,to=direction==='forward'?output:input;const data=await client.highlight(executedRecipe.slice(0,debugProgress).map(({breakpoint,...op})=>op),direction,[{start:from.selectionStart,end:from.selectionEnd}]);if(!data||!data.pos?.length){debugInfo.textContent='当前配方无法提供可靠的输入输出位置对应。';return;}const range=data.pos[0];to.focus();to.setSelectionRange(range.start,range.end);debugInfo.textContent='原生对应位置：'+JSON.stringify(data.pos);}catch(e){debugInfo.textContent=e.message;}};
  debugToolbar.append(Button({text:'输入选区对应输出',on:{click:()=>highlights('forward')}}),Button({text:'输出选区对应输入',on:{click:()=>highlights('reverse')}}));
  let magicCandidates=[],magicPrefix=[],magicSuffix=[];
  const magicChoice=Select({id:'chef-magic-choice',attrs:{'aria-label':'Magic 候选配方'}});
  const adoptMagic=()=>{try{const candidate=magicCandidates[Number(magicChoice.value)];if(!candidate)throw Error('请先选择候选');const next=checkedRecipe([...magicPrefix,...candidate.recipe,...magicSuffix]);recipe=next;invalidate('已采用候选配方，原始输入保持不变；点击执行验证结果。');renderRecipe();selectPane('recipe');}catch(e){message(e.message,true);}};
  const magicHost=Box({children:[Field({label:'Magic 原生候选（完整数据、评分和匹配项见结果）',control:magicChoice}),Button({text:'采用候选配方',on:{click:adoptMagic}})]});magicHost.hidden=true;output.before(magicHost);
  const inputTabs=Select({id:'chef-input-tabs',attrs:{'aria-label':'处理链输入标签'}}),addInput=Button({text:'新增输入'}),removeInput=Button({text:'删除当前输入'});let activeInput=0;const drafts=[{name:'输入 1',text:'',bytes:null}];
  const refreshInputs=()=>{inputTabs.replaceChildren(...drafts.map((d,i)=>uiOption(d.name,String(i))));inputTabs.value=String(activeInput);};
  const saveInput=()=>Object.assign(drafts[activeInput],{text:input.value,bytes:fileBytes?.slice()||null});
  const switchInput=index=>{saveInput();activeInput=index;fileRevision++;readingFile=false;input.value=drafts[index].text;fileBytes=drafts[index].bytes?.slice()||null;$('chef-file').value='';$('chef-input-info').textContent=(fileBytes?.length??new TextEncoder().encode(input.value).length)+' 字节';invalidate();refreshInputs();};
  inputTabs.onchange=()=>switchInput(Number(inputTabs.value));addInput.onclick=()=>{if(drafts.length>=32){message('最多 32 个输入标签',true);return;}drafts.push({name:'输入 '+(drafts.length+1),text:'',bytes:null});switchInput(drafts.length-1);};removeInput.onclick=()=>{if(drafts.length===1)return;saveInput();fileRevision++;readingFile=false;$('chef-file').value='';drafts.splice(activeInput,1);activeInput=Math.min(activeInput,drafts.length-1);input.value=drafts[activeInput].text;fileBytes=drafts[activeInput].bytes?.slice()||null;invalidate();refreshInputs();};refreshInputs();input.before(Toolbar({children:[inputTabs,addInput,removeInput]}));
  const leave=({detail})=>{if(detail?.name!=='cyberchef'&&busy)invalidate();};document.addEventListener('arg:panelchange',leave);onDisconnect(stage,()=>{client?.close();document.removeEventListener('arg:panelchange',leave);});
  $('chef-clear-recipe').onclick=()=>{recipe=[];invalidate();renderRecipe();};
  $('chef-search').oninput=()=>catalogue&&renderOperations();$('chef-category').onchange=()=>catalogue&&renderOperations();
  input.oninput=()=>{fileRevision++;readingFile=false;fileBytes=null;$('chef-input-info').textContent=`${new TextEncoder().encode(input.value).length} 字节 / UTF-8`;$('chef-file').value='';invalidate();};
  input.onkeydown=event=>{if((event.ctrlKey||event.metaKey)&&event.key==='Enter'){event.preventDefault();run();}};
  $('chef-file').onchange=async event=>{
    const file=event.target.files[0];if(!file)return;invalidate('正在读取文件…');const current=++fileRevision;fileBytes=null;input.value='';$('chef-input-info').textContent='正在读取新文件…';readingFile=true;controls();
    try {if(file.size>32*1024*1024)throw Error('输入文件超过 32 MB');const bytes=new Uint8Array(await file.arrayBuffer());if(current!==fileRevision)return;fileBytes=bytes;input.value=new TextDecoder().decode(bytes.slice(0,200000));$('chef-input-info').textContent=`${file.name} · ${bytes.length.toLocaleString()} 原始字节 · 文本预览`;message('文件已载入，执行时使用原始字节');}catch(error){if(current===fileRevision){fileBytes=null;input.value='';$('chef-input-info').textContent='文件未载入';message(localizedError(error.message),true);}}finally{if(current===fileRevision){readingFile=false;controls();}}
  };
  $('chef-clear-input').onclick=()=>{fileRevision++;readingFile=false;fileBytes=null;input.value='';$('chef-file').value='';$('chef-input-info').textContent='0 字节';invalidate();};
  $('chef-copy').onclick=async()=>{try{await navigator.clipboard.writeText(output.value);message('结果已复制');}catch{message('无法访问剪贴板，请选中结果手动复制',true);}};
  $('chef-download').onclick=()=>result&&download(result.bytes,'cyberchef-output.bin','application/octet-stream');
  $('chef-to-input').onclick=()=>{if(!result)return;fileBytes=result.bytes.slice();input.value=new TextDecoder().decode(fileBytes.slice(0,200000));$('chef-input-info').textContent=`${fileBytes.length} 字节 · 上一步结果`;$('chef-file').value='';invalidate();selectPane('input');};
  function saved(){try{const list=JSON.parse(localStorage.getItem('arg.cyberchef.recipes.v1')||'[]');return Array.isArray(list)?list.filter(item=>item&&typeof item.name==='string'&&Array.isArray(item.recipe)):[];}catch{return [];}}
  function renderSaved(){const select=$('chef-saved');select.replaceChildren(uiOption('选择已保存配方…', ''));saved().forEach((item,i)=>select.append(uiOption(item.name, String(i))));}
  $('chef-save').onclick=()=>{const name=$('chef-save-name').value.trim();if(!name){message('请先填写配方名称',true);return;}try{const list=saved().filter(item=>item.name!==name);list.push({name,recipe:structuredClone(recipe)});localStorage.setItem('arg.cyberchef.recipes.v1',JSON.stringify(list));renderSaved();message('配方已保存在本机浏览器');}catch{message('浏览器无法保存配方，请导出 JSON 文件',true);}};
  $('chef-load').onclick=()=>{try{const item=saved()[Number($('chef-saved').value)];if($('chef-saved').value===''||!item)throw Error('请先选择配方');recipe=checkedRecipe(item.recipe);invalidate('配方已载入，点击执行');renderRecipe();selectPane('recipe');}catch(error){message(localizedError(error.message),true);}};
  $('chef-export-recipe').onclick=()=>download(JSON.stringify(recipe,null,2),'cyberchef-recipe.json','application/json');
  $('chef-import-recipe').onchange=async event=>{const file=event.target.files[0];if(!file)return;const request=++importRevision;try{if(file.size>1024*1024)throw Error('配方文件超过 1 MB');const text=await file.text();if(request!==importRevision)return;const imported=checkedRecipe(JSON.parse(text));recipe=imported;invalidate('配方已导入，点击执行');renderRecipe();selectPane('recipe');}catch(error){if(request===importRevision)message('导入失败：'+error.message,true);}finally{if(event.target.files[0]===file)event.target.value='';}};
  async function load() {
    if(loading)return loading;if(catalogue)return;loading=(async()=>{message('正在准备 CyberChef 运算引擎…');
    try {
      const response=await fetch(new URL('./vendor/cyberchef/catalogue.json',import.meta.url));if(!response.ok)throw Error('操作目录加载失败');catalogue=await response.json();
      families=operationFamilies(classifyCatalogue(catalogue),await loadRegistry());
      $('chef-category').replaceChildren(uiOption('全部操作', 'all'));
      for(const category of catalogue.categories)$('chef-category').append(uiOption(categories[category.name]||category.name, category.name));
      $('chef-category').value='Favourites';renderOperations();renderSaved();renderRecipe();
      await createClient().ready;stage.dataset.ready='true';controls();message('已就绪 · 选择操作并输入内容后执行');
    } catch(error) {catalogue=null;message('加载失败：'+error.message,true);}
    finally {loading=null;}
    })();return loading;
  }
  $('cyberchef-retry').onclick=()=>{client?.close();client=null;if(catalogue)run();else load();};
  async function openRecipe(steps,payload,{isCurrent,navigate=true}={}){
    const request=++openRevision,editRevision=revision,originRoute=location.hash;
    const current=()=>request===openRevision&&revision===editRevision&&(isCurrent?isCurrent():location.hash===originRoute);
    await load();if(!current())return false;if(!catalogue)throw Error('处理链尚未就绪，请重试。');
    recipe=checkedRecipe(steps);invalidate('已从工具页带入操作，可继续添加步骤。');
    if(payload!==undefined){fileRevision++;readingFile=false;fileBytes=typeof payload==='string'?null:new Uint8Array(payload).slice();input.value=typeof payload==='string'?payload:new TextDecoder().decode(fileBytes.slice(0,200000));$('chef-input-info').textContent=`${fileBytes?.length??new TextEncoder().encode(input.value).length} 字节 · 来自工具页`;$('chef-file').value='';}
    renderRecipe();controls();selectPane('recipe');if(navigate)location.hash='cyberchef';return true;
  }
  controls();return {load,openRecipe};
}
