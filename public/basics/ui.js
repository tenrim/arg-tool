import {Box,Card,Field,Input,Select,Option,Button,Toolbar,CheckGroup,Table,DataList,Badge,ConversionWorkbench,ToolPanel,ToolHeader,Provenance,setTextareaValue,updateStatus,onDisconnect} from '../ui/index.js';
import {conversionSession,getConversionSession} from './session.js';
import {FAMILIES,ASCII_TABLE,characterRows} from './foundation.js';
import {squareModel,parseWords,formatWords,tapeSVG,CATEGORIES} from './model.js';
import {download} from '../round1/common.js';
const select = (id,items) => Select({id,children:items.map(([value,label])=>Option(label,value))});
const field = (label,control) => Field({label,control});
function mount(id,title,view,sources,extra=[]) {
  const panel=ToolPanel({id:'panel-'+id,className:'panel basics-panel',hidden:true,header:ToolHeader({className:'page-heading',title}),body:Box({className:'basics-workspace',children:[view.root,...extra]}),footer:Provenance({className:'tool-provenance',items:sources})});
  document.getElementById('main').append(panel);return panel;
}
const direction=id=>select(id+'-direction',[['encode','文字 → 编码'],['decode','编码 → 文字']]);
function scrollTable(columns,rows){return Box({className:'basics-table-scroll',attrs:{tabindex:0,role:'region','aria-label':'资料表，可横向滚动'},children:Table({columns,rows})});}

function initFoundation() {
  const family=select('basics-family',Object.entries(FAMILIES)),dir=direction('basics');
  const base=select('basics-base',[['10','十进制'],['16','十六进制'],['2','二进制'],['8','八进制']]);
  const from=Input({id:'basics-from',type:'number',value:10,attrs:{min:2,max:36,step:1}}),target=Input({id:'basics-target',type:'number',value:16,attrs:{min:2,max:36,step:1}});
  const format=select('basics-format',[]),baseField=field('字符码进制',base),fromField=field('原进制',from),targetField=field('目标进制',target),formatField=field('表示形式',format);
  const view=ConversionWorkbench({id:'basics',settings:[field('转换类型',family),field('方向',dir),baseField,fromField,targetField,formatField]});
  const ascii=Box({tag:'details',children:[Box({tag:'summary',text:'ASCII 对照表（0–127）'})]}),letter=Box({tag:'details',children:[Box({tag:'summary',text:'字母编号表（A1Z26）'}),scrollTable(['字母','编号'],Array.from({length:26},(_,i)=>[String.fromCharCode(65+i),i+1]))]});
  const table=scrollTable(['字符','十进制','十六进制','八进制','二进制'],ASCII_TABLE.map(r=>[r.label,r.value,r.hex,r.octal,r.binary]));
  table.querySelectorAll('tbody tr').forEach((row,i)=>{const cell=row.firstChild;cell.replaceChildren(Button({text:ASCII_TABLE[i].label,label:'输入 ASCII '+ASCII_TABLE[i].label,attrs:{'data-ascii':i},on:{click:()=>{const n=ASCII_TABLE[i].value;const token=dir.value==='decode'?n.toString(Number(base.value)).toUpperCase():String.fromCharCode(n),previous=session.getInput();session.adopt(previous+(dir.value==='decode'&&previous?' ':'')+token);view.input.focus();}}}));});ascii.append(table);
  const session=conversionSession(view,{id:'basics',options:()=>({family:family.value,direction:dir.value,base:family.value==='radix'?from.value:base.value,target:target.value,format:format.value}),draw:(result,text,opts)=>{
    if(opts.family==='characters')view.details.append(Card({title:'字符与字节对照',children:scrollTable(['UTF-16 位置','字符','码点','UTF-8 字节'],characterRows(opts.direction==='decode'?result.output:text).slice(0,256))}));
  }});
  function configure(){session.invalidate();const type=family.value;dir.querySelector('[value=encode]').textContent=type==='radix'?'原进制 → 目标进制':'文字 → 编码';dir.querySelector('[value=decode]').textContent=type==='radix'?'目标进制 → 原进制':'编码 → 文字';baseField.hidden=!['ascii','characters'].includes(type)||type==='characters'&&format.value!=='codepoint';fromField.hidden=targetField.hidden=type!=='radix';formatField.hidden=!['characters','escapes'].includes(type);
    const items=type==='characters'?[['codepoint','Unicode 码点'],['hex','UTF-8 十六进制字节'],['binary','UTF-8 二进制字节'],['decimal','UTF-8 十进制字节'],['octal','UTF-8 八进制字节']]:[['hex','\\x 转义'],['unicode','\\u Unicode 转义'],['html','HTML 实体'],['url','URL 百分号编码']];format.replaceChildren(...items.map(([v,l])=>Option(l,v)));baseField.hidden=!['ascii','characters'].includes(type)||type==='characters'&&format.value!=='codepoint';ascii.hidden=type!=='ascii';letter.hidden=type!=='letters';}
  family.onchange=configure;format.onchange=()=>{baseField.hidden=family.value==='characters'&&format.value!=='codepoint';};configure();
  mount('basics','基础转换',view,[['CyberChef','https://github.com/gchq/CyberChef','字符码、进制、转义、实体与 A1Z26 转换引擎']],[ascii,letter]);
  document.addEventListener('arg:panelchange',({detail})=>{if(detail.name==='basics'&&detail.group&&Object.hasOwn(FAMILIES,detail.group)&&family.value!==detail.group){family.value=detail.group;configure();}});
}
function initRoman(){const dir=select('roman-direction',[['encode','整数 → 罗马数字'],['decode','罗马数字 → 整数']]);const view=ConversionWorkbench({id:'roman',settings:[field('方向',dir)]});
  conversionSession(view,{id:'roman',options:()=>({direction:dir.value}),draw:result=>view.details.append(Card({title:'转换对照',children:scrollTable(['输入','输出'],result.rows.slice(0,256))}))});
  mount('roman','罗马数字转换',view,[['romanice','https://github.com/dkin-om/romanice','罗马数字双向转换']]);
}
function initTap(){const mode=select('tapcode-mode',[['polybius','坐标方阵'],['tap','敲击码']]),dir=direction('tapcode'),size=select('tapcode-size',[['5','5×5 · I/J 合并'],['6','6×6 · 字母与数字']]),keyword=Input({id:'tapcode-keyword',attrs:{maxlength:64}});
  const sizeField=field('方阵',size),keyField=field('关键词',keyword);
  const view=ConversionWorkbench({id:'tapcode',settings:[field('类型',mode),field('方向',dir),sizeField,keyField]}),grid=Box({id:'tapcode-grid',className:'basics-square'});
  const opts=()=>({mode:mode.value,direction:dir.value,size:size.value,keyword:keyword.value});
  const session=conversionSession(view,{id:'tapcode',options:opts});
  function draw(){sizeField.hidden=keyField.hidden=mode.value==='tap';size.disabled=keyword.disabled=mode.value==='tap';try{const model=squareModel(opts());grid.style.setProperty('--square-size',model.width);grid.replaceChildren(...model.cells.map(cell=>Button({label:`${cell.letter}，行列坐标 ${cell.coordinate}`,attrs:{'data-coordinate':cell.coordinate},children:[Box({tag:'strong',text:cell.letter}),Box({tag:'span',text:cell.coordinate})],on:{click:()=>{const token=dir.value==='encode'?cell.letter:mode.value==='tap'?'.'.repeat(+cell.coordinate[0])+' '+'.'.repeat(+cell.coordinate[1]):cell.coordinate,previous=session.getInput();session.adopt(previous+(dir.value==='decode'&&previous?(mode.value==='tap'?'  ':' '):'')+token);}}})));}catch(error){grid.replaceChildren();updateStatus(view.status,error.message,'error');}}
  mode.addEventListener('change',draw);size.addEventListener('change',draw);keyword.addEventListener('input',draw);draw();
  mount('tapcode','敲击码与坐标方阵',view,[['cryptii','https://github.com/cryptii/cryptii','敲击码及 Polybius 方阵转换引擎']],[Card({title:'点选方阵',children:grid})]);
}
function initInvisible(){const action=select('invisible-action',[['inspect','检查隐藏字符'],['clean','清理选中类别']]);const preserve=Input({id:'invisible-preserve',type:'checkbox'});preserve.checked=true;
  const checks=Object.entries(CATEGORIES).map(([category,label])=>{const control=Input({type:'checkbox',attrs:{'data-category':category}});control.checked=!['variation-selector','tag-char'].includes(category);return field(label,control);});
  const view=ConversionWorkbench({id:'invisible',settings:[field('操作',action),field('保留连接符、变体选择符与 Emoji 标签',preserve),CheckGroup({label:'要清理的字符类别',children:checks})]});view.run.textContent='检查';action.onchange=()=>{view.run.textContent=action.value==='clean'?'清理':'检查';};
  conversionSession(view,{id:'invisible',options:()=>({action:action.value,preserve:preserve.checked,categories:checks.filter(f=>f.querySelector('input').checked).map(f=>f.querySelector('input').dataset.category)}),draw:result=>{
    const markers=Box({className:'basics-visible-text',attrs:{dir:'ltr','aria-label':'隐藏字符显形'}});for(const segment of result.segments.slice(0,1024))markers.append(segment.hidden?Badge({text:segment.hex,attrs:{title:CATEGORIES[segment.category]}}):segment.text);
    view.details.append(Card({title:'检查结果',children:[DataList({items:[['隐藏字符',result.total],...Object.entries(result.counts).map(([k,v])=>[CATEGORIES[k],v])]}),markers,scrollTable(['码点位置（从0起）','UTF-16位置','码点','类型','保留保护'],result.findings.slice(0,256).map(f=>[f.position,f.index,f.hex,CATEGORIES[f.category],f.preserved?'是':'—']))]}));
  }});
  mount('invisible','隐藏字符检查',view,[['Invisibles','https://github.com/cig13zs/invisibles','隐藏字符分类扫描与按类别清理']]);
}
function initBaudot(){const dir=direction('baudot'),alphabet=select('baudot-alphabet',[['ITA2','ITA2 国际电传'],['US_TTY','US TTY 美式电传'],['ITA1','ITA1 早期波多码']]),format=select('baudot-format',[['binary','五位二进制'],['decimal','十进制码字'],['hex','十六进制码字']]);
  const view=ConversionWorkbench({id:'baudot',settings:[field('方向',dir),field('字母表',alphabet),field('码字形式',format)]}),tape=Box({id:'baudot-tape',className:'basics-tape-scroll',attrs:{tabindex:0,role:'region','aria-label':'五位纸带，行从上到下为 bit4 至 bit0，可横向滚动'}});
  const add=Button({id:'baudot-add',text:'添加一列'}),remove=Button({id:'baudot-remove',text:'删除末列'}),save=Button({id:'baudot-svg',text:'下载纸带 SVG'}),prev=Button({text:'上一组'}),next=Button({text:'下一组'}),count=Box({tag:'span',id:'baudot-tape-count'});
  let words=[],start=0,editing=false;
  const opts=()=>({direction:dir.value,alphabet:alphabet.value,format:format.value});
  const session=conversionSession(view,{id:'baudot',options:opts,draw:result=>{words=result.words;start=0;draw();}});
  function edit(values){if(values.length>4096){updateStatus(view.status,'纸带最多 4096 列。','error');return;}words=values;dir.value='decode';editing=true;try{session.adopt(formatWords(words,format.value));}finally{editing=false;}draw();}
  function draw(){const focused=tape.contains(document.activeElement)?{word:document.activeElement.dataset.word,bit:document.activeElement.dataset.bit}:null;start=Math.min(start,Math.max(0,Math.floor((words.length-1)/64)*64));tape.replaceChildren();
    const labels=Box({className:'basics-tape-column',children:[4,3,2,1,0].map(bit=>Box({tag:'span',text:'bit'+bit}))});tape.append(labels);
    words.slice(start,start+64).forEach((n,index)=>tape.append(Box({className:'basics-tape-column',children:[4,3,2,1,0].map(bit=>Button({label:`第 ${start+index+1} 列 bit${bit}，${n & 1<<bit?'已打孔':'未打孔'}`,attrs:{'data-word':start+index,'data-bit':bit,'aria-pressed':String(Boolean(n & 1<<bit))},text:n & 1<<bit?'●':'○',on:{click:()=>{const changed=words.slice();changed[start+index]^=1<<bit;edit(changed);}}}))})));
    count.textContent=words.length?`${start+1}–${Math.min(start+64,words.length)} / ${words.length} 列`:'0 列';prev.disabled=start===0;next.disabled=start+64>=words.length;remove.disabled=save.disabled=!words.length;
    if(focused?.word!==undefined)tape.querySelector(`[data-word="${focused.word}"][data-bit="${focused.bit}"]`)?.focus({preventScroll:true});
  }
  function fromInput(){if(dir.value!=='decode'){words=[];draw();return;}try{words=parseWords(view.input.value,format.value);}catch{words=[];}if(!editing)start=0;draw();}
  view.input.addEventListener('input',fromInput);dir.addEventListener('change',fromInput);alphabet.addEventListener('change',fromInput);format.addEventListener('change',fromInput);
  add.onclick=()=>edit([...words,0]);remove.onclick=()=>edit(words.slice(0,-1));save.onclick=()=>download(tapeSVG(words),'波多码-打孔纸带.svg','image/svg+xml');prev.onclick=()=>{start-=64;draw();};next.onclick=()=>{start+=64;draw();};draw();
  const leave=({detail})=>{if(detail.name==='baudot')fromInput();else{words=[];draw();}};document.addEventListener('arg:panelchange',leave);onDisconnect(view.root,()=>document.removeEventListener('arg:panelchange',leave));
  mount('baudot','波多码与打孔纸带',view,[['baudot.js','https://github.com/zenoamaro/baudot.js','三种电传字母表与有状态的五位码字转换']],[Card({title:'打孔纸带 · bit4 → bit0',children:[Toolbar({children:[add,remove,save,prev,count,next]}),tape]})]);
}
export const getBasicsSession=id=>getConversionSession(id);
export function initBasics(){initFoundation();initRoman();initTap();initInvisible();initBaudot();return {getSession:getBasicsSession};}
