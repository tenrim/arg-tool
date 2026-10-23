import {Box,Button,ConversionWorkbench,Field,Input,Option,Select,Textarea,ToolPanel,ToolHeader,Link,onDisconnect,updateStatus} from '../ui/index.js';
import {taskSession,saveFile} from '../expansion/session.js';
import {ENGLISH_DATASETS} from '../expansion/hunt-data.js';
import {COMPLETION_TASKS} from './catalog.js';
import {completionJob} from './job.js';
import {mountVirtualKeyboard} from './keyboard.js';
import {mountOrigami} from './origami.js';
import {BASE37_ALPHABETS} from './numerals.js';
import {keyboardLayouts} from './keyboard-layout.js';
const choice=(id,rows)=>Select({id,children:rows.map(r=>Option(Array.isArray(r)?r[1]:r,Array.isArray(r)?r[0]:r))});
const direction=[['encode','编码'],['decode','解码']];
const byteCodecs=['base91','base100','base65536','crockford32','zbase32','uuencode','xxencode','bubblebabble',['unary7','Chuck Norris（7 位 ASCII）'],['unary','一元编码（8 位字节）'],'aaencode','jjencode','excess3','gray','hamming74','manchester','differential-manchester'];
const fields={
 gs8:[['direction','操作',[['encode','文字／标记转盲文'],['decode','盲文转文字／标记'],['table','完整码表查询']]],['syntax','输入解释',[['text','原样文字'],['tokens','允许 {条目ID} 结构标记']]]],
 'marine-signals':[['direction','方向',direction],['substitutes','重复字符',[['yes','使用国际信号规则的三个代用旗'],['no','直接重复旗帜（文字图形）']]]],
 'byte-codecs':[['codec','编码',byteCodecs],['direction','方向',direction],['format','字节表示',[['utf8','UTF-8 文字'],['hex','十六进制字节'],['base64','Base64 字节']]]],
 'integer-codecs':[['codec','编码',[['fibonacci','Fibonacci'],['negafibonacci','NegaFibonacci（有符号整数）'],['gamma','Elias Gamma'],['delta','Elias Delta'],['base26','Base26 双射（A=1）'],['base37','Base37（0–9、A–Z、空格）'],['shadoks','Shadoks（Ga / Bu / Zo / Meu）'],['excess3-digits','十进制数字余 3 码'],['crockford-integer','Crockford Base32 整数'],['crockford-check','Crockford Base32 整数与校验符']]],['direction','方向',direction]],
 'keyboard-extra':[['mode','规则',[['coordinates','行、列坐标'],['column-row','列、行坐标'],['shift-left','逐行左移（循环）'],['shift-right','逐行右移（循环）'],['mirror','逐行镜像'],['dvorak','QWERTY → Dvorak 键位'],['multitap','手机多击编码']]],['direction','方向',direction]],
 t9:[['dictionary','完整词库',ENGLISH_DATASETS.map(x=>[x.id,x.title])]],
 'color-codes':[['mode','规则',[['resistor','电阻 3–6 色环'],['capacitor','电容三色数值'],['cable','25 对线缆'],['permutation','排列与排名']]],['direction','方向',direction],['alphabet','排列符号顺序','A B C D']],
 nato:[['direction','方向',direction]],
 'semaphore-batch':[['direction','方向',direction],['representation','符号表示',[['angle','角度：上方 0°，顺时针'],['clock','钟面：12 点为上方']]],['style','图形',[['flags','双旗'],['clock','时钟'],['trousers','裤形']]],['animation','输出',[['static','整页图形'],['animated','逐字 SVG 动画']]]],
 prussian:[['direction','操作',[['encode','全文检索完整码本'],['decode','电报码与六臂图形'],['visual','六臂位置转报码']]]],
 'braille-languages':[['direction','方向',direction],['table','翻译规则',[]]],
 'barcode-generate':[['symbology','条码制式',[]],['format','输入格式',[['utf8','文字'],['hex','十六进制原始字节'],['base64','Base64 原始字节']]],['options','完整引擎参数 JSON','{}']],
};
fields['integer-codecs'][0][2].push(['base26-zero','Base26 位值（A=0）'],['gray-integer','Gray 整数'],['hamming','Hamming 完整二进制块']);
fields['keyboard-extra'][0][2].push(['layout-change','完整语言布局换位'],['layout-positions','完整语言布局坐标']);
fields['keyboard-extra'].push(['fromLayout','来源布局',[]],['fromLayer','来源按键层',[]],['toLayout','目标布局',[]],['toLayer','目标按键层',[]],['rowOrigin','首行坐标','1'],['columnOrigin','首列坐标','1']);
fields['integer-codecs'].push(['reverseLetters','Base26 字母顺序',[['no','正常'],['yes','反向']]],['base37Alphabet','Base37 字母表',BASE37_ALPHABETS.map((s,i)=>[String(i),s.replaceAll(' ','_')])],['separator','Base37 分隔符',[['space','空格'],['underscore','下划线']]],['numberBase','Gray 数字进制',[['2','二进制'],['10','十进制'],['16','十六进制']]],['parityBits','Hamming 校验位',Array.from({length:15},(_,i)=>String(i+2))],['extended','扩展总体校验',[['no','不添加'],['yes','添加（SECDED）']]],['parityPosition','总体校验位位置',[['first','第一位'],['last','最后一位']]],['display','Hamming 解码结果',[['data','原始数据'],['corrected','纠正后的完整码字'],['positions','错误位置（0 为未检出）']]]);
fields['color-codes'][0][2][1][1]='电容 3–5 色环';
fields['color-codes'].push(['bands','环数',['3','4','5','6']],['tolerancePercent','容差（%）','5'],['temperaturePPM','温度系数（ppm/K）','100'],['series','电容色码系列',[['polyester','聚酯 5 环'],['precision','精密容差色码']]],['volts','额定电压',[['250','250 V'],['400','400 V']]]);
export function mountCompletion(host){
 const keyboard=mountVirtualKeyboard(host),origami=mountOrigami(host),sessions=keyboard.sessions,panels=[...keyboard.panels,...origami.panels];
 for(const task of COMPLETION_TASKS.filter(t=>fields[t.id])){
  const controls={},settings=fields[task.id].map(([name,label,values])=>{const control=Array.isArray(values)?choice(task.id+'-'+name,values):name==='options'?Textarea({id:task.id+'-'+name,value:values,autoSize:true,minRows:2,maxRows:8}):Input({id:task.id+'-'+name,value:values});controls[name]=control;return Field({label,control,span:name==='options'?'full':undefined});});
  const view=ConversionWorkbench({id:task.id,settings});
  const panel=ToolPanel({id:'panel-'+task.id,className:'panel',hidden:true,header:ToolHeader({className:'page-heading',title:task.title}),body:view.root});host.append(panel);panels.push(panel);
  if(task.id==='integer-codecs')controls.parityBits.value='3';
  if(task.id==='color-codes'){controls.direction.value='decode';controls.bands.value='4';}
  const reveal=()=>{
   const show=(key,yes)=>{if(controls[key])controls[key].closest('[data-ui=field]').hidden=!yes;};
   if(task.id==='integer-codecs'){const c=controls.codec.value;show('reverseLetters',['base26','base26-zero'].includes(c));for(const k of ['base37Alphabet','separator'])show(k,c==='base37');show('numberBase',c==='gray-integer');for(const k of ['parityBits','extended'])show(k,c==='hamming');show('parityPosition',c==='hamming'&&controls.extended.value==='yes');show('display',c==='hamming'&&controls.direction.value==='decode');}
   if(task.id==='keyboard-extra'){for(const k of ['fromLayout','fromLayer'])show(k,controls.mode.value.startsWith('layout-'));for(const k of ['toLayout','toLayer'])show(k,controls.mode.value==='layout-change');for(const k of ['rowOrigin','columnOrigin'])show(k,controls.mode.value==='layout-positions');}
   if(task.id==='color-codes'){const m=controls.mode.value,e=controls.direction.value==='encode';show('alphabet',m==='permutation');show('bands',e&&['resistor','capacitor'].includes(m));show('tolerancePercent',e&&['resistor','capacitor'].includes(m)&&controls.bands.value!=='3');show('temperaturePPM',e&&m==='resistor'&&controls.bands.value==='6');show('series',m==='capacitor');show('volts',e&&m==='capacitor'&&controls.bands.value==='5'&&controls.series.value==='polyester');}
  };for(const control of Object.values(controls))control.addEventListener('change',reveal);reveal();
  if(task.id==='byte-codecs'){
   const announce=()=>{controls.format.closest('.ui-field')?.toggleAttribute('hidden',['aaencode','jjencode'].includes(controls.codec.value));document.dispatchEvent(new CustomEvent('arg:taskimplementationchange',{detail:{name:task.id,codec:controls.codec.value,direction:controls.direction.value}}));};
   controls.codec.addEventListener('change',announce);controls.direction.addEventListener('change',announce);announce();
  }
  if(task.id==='keyboard-extra'){const announce=()=>document.dispatchEvent(new CustomEvent('arg:taskimplementationchange',{detail:{name:task.id,mode:controls.mode.value}}));controls.mode.addEventListener('change',announce);announce();}
  let previewURL=null;
  const session=taskSession(view,{id:task.id,options:()=>Object.fromEntries(Object.entries(controls).map(([k,v])=>[k,v.value])),execute:(input,options,hooks)=>completionJob({task:task.id,input,options},hooks),onInvalidate:()=>{if(previewURL)URL.revokeObjectURL(previewURL);previewURL=null;},render:r=>{if(r.svg){previewURL=URL.createObjectURL(new Blob([r.svg],{type:'image/svg+xml'}));view.details.append(Box({tag:'img',attrs:{src:previewURL,alt:task.title+'图形结果',class:'completion-barcode'}}));}},save:r=>saveFile(r.svg||r.output,task.title+(r.svg?'.svg':'.txt'),r.svg?'image/svg+xml':'text/plain;charset=utf-8')});sessions.set(task.id,session);
  let loaded=false,disposed=false;
  const load=async({detail})=>{if(detail?.name!==task.id||loaded||disposed)return;loaded=true;try{
   if(task.id==='keyboard-extra'){const definitions=await keyboardLayouts();if(disposed)return;for(const prefix of ['from','to']){const layout=controls[prefix+'Layout'],layer=controls[prefix+'Layer'];layout.replaceChildren(...Object.keys(definitions).map(key=>Option(key,key)));layout.value=prefix==='from'?'english':'french';const sync=()=>layer.replaceChildren(...Object.keys(definitions[layout.value].layout).map(key=>Option(key,key)));layout.addEventListener('change',sync);sync();}}
   if(task.id==='braille-languages'){const res=await fetch(new URL('../vendor/completion/liblouis/tables.json',import.meta.url));if(!res.ok)throw Error('盲文规则目录加载失败。');const tables=await res.json();if(disposed)return;controls.table.replaceChildren(...tables.map(t=>Option(t.name+' · '+t.file,t.file)));controls.table.value='en-ueb-g2.ctb';updateStatus(view.status,`已载入全部 ${tables.length} 份规则表。`);}
   if(task.id==='barcode-generate'){const {symbolList}=await import('../vendor/completion/bwip-js/bwip-js.mjs');if(disposed)return;const list=typeof symbolList==='function'?symbolList():symbolList;controls.symbology.replaceChildren(...list.map(t=>Option(t.desc||t.bcid,t.bcid)));controls.symbology.value='qrcode';view.details.append(Link({text:'完整制式与参数说明',attrs:{href:'https://github.com/bwipp/postscriptbarcode/wiki/Barcode-Reference',target:'_blank',rel:'noopener noreferrer'}}));}
  }catch(e){loaded=false;updateStatus(view.status,e.message,'error');}};
  document.addEventListener('arg:panelchange',load);onDisconnect(panel,()=>{disposed=true;document.removeEventListener('arg:panelchange',load);if(previewURL)URL.revokeObjectURL(previewURL);});
 }
 return {panels,sessions};
}
