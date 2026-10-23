import {Box,Button,Field,Option,Select} from '../ui/index.js';
import {brailleDecode} from '../engine.js';

// Keyboard and dot entry are two views over the SAME six-dot selection.
export function mountBraille(panel,{onInput}){
 const dots=panel.querySelector('#braille-dots'),symbol=panel.querySelector('#braille-symbol'),letter=panel.querySelector('#braille-letter'),add=panel.querySelector('#braille-add');
 const mode=Select({id:'braille-entry-mode',children:[Option('盲文按键','keyboard'),Option('逐点输入','dots')]}),keys=Box({className:'symbol-keyboard',id:'braille-keyboard',attrs:{role:'group','aria-label':'六点盲文按键'}});
 const input=dots.parentElement;let bits=0;
 const decode=value=>{if(!value)return '空白';try{return brailleDecode(String.fromCharCode(0x2800+value)).trim()||'数字标记';}catch{return '未对应英文字母';}};
 const points=value=>Array.from({length:6},(_,i)=>value&(1<<i)?i+1:null).filter(Boolean).join('、')||'无';
 function draw(){
  symbol.textContent=String.fromCharCode(0x2800+bits);letter.textContent=decode(bits);add.disabled=!/^[A-Z]$/.test(decode(bits));
  for(const node of dots.children){const active=!!(bits&(1<<Number(node.dataset.brailleDot)));node.classList.toggle('selected',active);node.setAttribute('aria-pressed',String(active));}
  for(const node of keys.children)node.setAttribute('aria-pressed',String(Number(node.dataset.brailleCell)===bits));
 }
 for(const bit of [0,3,1,4,2,5])dots.append(Button({text:String(bit+1),attrs:{'data-braille-dot':bit,'aria-label':`盲文第 ${bit+1} 点`,'aria-pressed':'false'},on:{click:()=>{bits^=1<<bit;draw();}}}));
 const cells=Array.from({length:64},(_,value)=>({value,label:decode(value)}))
  .filter(({label})=>/^[A-Z]$/.test(label)||label==='数字标记')
  .sort((a,b)=>a.label.length-b.label.length||a.label.localeCompare(b.label,'en'));
 for(const {value,label} of cells){
  keys.append(Button({layout:'stacked',variant:'choice',children:[Box({tag:'span',text:String.fromCharCode(0x2800+value),attrs:{'data-symbol':'braille','aria-hidden':'true'}}),Box({tag:'small',text:label})],attrs:{'data-braille-cell':value,'aria-label':`盲文 ${label}，点位 ${points(value)}`,'aria-pressed':'false'},on:{click:()=>{bits=value;draw();if(/^[A-Z]$/.test(label))onInput(label);}}}));
 }
 input.before(Field({label:'录入方式',control:mode}),keys);
 add.onclick=()=>{if(mode.value==='dots'&&!add.disabled)onInput(decode(bits));};
 const show=()=>{keys.hidden=mode.value!=='keyboard';dots.hidden=mode.value!=='dots';add.hidden=mode.value!=='dots';};mode.onchange=show;show();draw();
}
