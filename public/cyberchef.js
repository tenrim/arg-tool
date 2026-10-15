import {element as uiElement, Option as uiOption, Box, Button, Toolbar, tabsController, updateStatus, setState, animatePresence} from './ui/index.js';
import {parseInert} from './ui/index.js';
import {schemas,defaults,renderParameters} from './chef-tools/schema.js';
import { CyberChefClient } from './cyberchef-client.js';
import {operationName, operationDescription, categories, localizedError} from './cyberchef-i18n.js';
import {loadRegistry} from './capabilities/registry.js';
import {classifyCatalogue} from './chef-tools/catalog.js';
import {operationFamilies,matchFamilies} from './chef-tools/families.js';
import {continueButton} from './handoff/button.js';
const $ = id => document.getElementById(id);
const elem = uiElement;
function download(data, filename, type) {
  const url = URL.createObjectURL(new Blob([data], { type })); const link = elem('a'); link.href = url; link.download = filename; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function initCyberChef() {
  const stage = $('cyberchef-stage'), input = $('chef-input'), output = $('chef-output'), status = $('cyberchef-status');
  let catalogue, families = [], client, loading, readingFile = false, fileRevision = 0, importRevision = 0, openRevision = 0, recipe = [], result = null, fileBytes = null, revision = 0, busy = false;
  let handedResult;const next=continueButton({id:'chef-continue',source:'chef',read:()=>handedResult=result,isCurrent:()=>!!handedResult&&handedResult===result});$('chef-download').before(next);
  function message(text, error = false, tone = 'info') { updateStatus(status,text,error?'error':tone); $('cyberchef-retry').hidden = !error; }
  const panes=tabsController($('chef-tabs'),[...$('chef-tabs').children].map(tab=>[tab.dataset.pane,tab.textContent,$(tab.getAttribute('aria-controls')),tab]),{initial:'input',visibility:false,onSelect:pane=>{stage.dataset.pane=pane;}});
  const selectPane=(pane,focus=false)=>panes.select(pane,{focus});
  function controls() { next.disabled=!result||busy;setState($('chef-run'), {busy: busy || readingFile}); $('chef-run').disabled = !catalogue || busy || readingFile; $('chef-cancel').hidden = !busy; $('chef-copy').disabled = !result; $('chef-download').disabled = !result; $('chef-to-input').disabled = !result; }
  function invalidate(text = '输入或处理链已更改，点击执行查看结果') {
    revision++; importRevision++; if (busy) { client?.close(); client = null; busy = false; }
    result = null; output.value = ''; $('chef-output-info').textContent = '等待执行'; controls(); message(text);
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
      for (const [action,label] of [['up','↑'],['down','↓'],['toggle',step.disabled?'启用':'停用'],['delete','×']]) {
        const b=elem('button',label,'quiet-button');b.type='button';b.dataset.action=action;b.setAttribute('aria-label',`${{up:'上移',down:'下移',toggle:step.disabled?'启用':'停用',delete:'删除'}[action]}第 ${index+1} 步`);
        b.disabled = action==='up'&&index===0 || action==='down'&&index===recipe.length-1;
        b.onclick=()=>{ if(action==='delete')recipe.splice(index,1);else if(action==='toggle')step.disabled=!step.disabled;else {const dest=index+(action==='up'?-1:1);[recipe[index],recipe[dest]]=[recipe[dest],recipe[index]];} invalidate();renderRecipe(); }; actions.append(b);
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
      return {op:step.op,args,...(step.disabled?{disabled:true}:{})};
    });
  }
  async function run() {
    if(!catalogue||busy||readingFile)return; const runRevision=revision; busy=true;result=null;output.value='';controls();message('正在执行处理链…');
    try {
      const snapshot=structuredClone(recipe);const payload=fileBytes?fileBytes.slice().buffer:input.value;
      const current=client&&!client.closed?client:createClient();const response=await current.bake(payload,snapshot);
      if(runRevision!==revision)return;
      result=response; let presented=response.result;
      if(presented instanceof ArrayBuffer)presented=new TextDecoder().decode(presented);
      if(response.dish?.type===1)presented=response.dish.value;
      else if(String(response.type).toLowerCase()==='html'){const template=parseInert(presented);presented=template.content.textContent;}
      output.value=String(presented??'').slice(0,200000);
      $('chef-output-info').textContent=`${response.bytes.length.toLocaleString()} 字节 · ${Math.round(response.duration)} ms${String(presented).length>200000?' · 仅预览前 20 万字符':''}`;
      message(`处理完成 · ${recipe.filter(s=>!s.disabled).length} 个操作`,false,'success');selectPane('output');animatePresence(output,{kind:'feedback'});
    } catch(error) {if(runRevision===revision)message(localizedError(error.message),true);}
    finally {if(runRevision===revision){busy=false;controls();}}
  }
  $('chef-run').onclick=run;$('chef-cancel').onclick=()=>invalidate('已停止执行，可调整处理链后重试');
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
