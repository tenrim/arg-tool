import {element as uiElement} from '../ui/index.js';
import {appendToolHelpContent} from '../tool-help.js';
import {normalizeColorHex,hexToHsv,hsvToHex,hsvToRGB,colorWheelPoint,colorValues} from './visual-core.js';
const el=uiElement;

export function mountColorPicker(host,api){
 host.append(el('h3','自由色盘'));
 const layout=el('div',undefined,'ref-color-picker'),wheel=el('div',undefined,'ref-color-wheel'),canvas=el('canvas'),marker=el('span',undefined,'ref-color-marker');
 canvas.width=canvas.height=360;canvas.setAttribute('aria-hidden','true');wheel.id='colors-wheel';wheel.tabIndex=0;wheel.setAttribute('role','group');wheel.setAttribute('aria-label','自由色盘');wheel.setAttribute('aria-describedby','colors-wheel-help');wheel.append(canvas,marker);
 const controls=el('div',undefined,'ref-color-controls'),preview=el('div',undefined,'ref-color-preview'),values=el('p',undefined,'ref-color-values');values.id='colors-values';
 preview.setAttribute('role','img');controls.append(preview,values);const sliders={};
 for(const [key,name,max] of [['h','色相',359],['s','饱和度',100],['v','明度',100]]){
  const label=el('label',undefined,'ref-color-slider'),line=el('span',undefined,'ref-color-slider-label'),output=el('output'),input=el('input');
  input.type='range';input.min=0;input.max=max;input.step=key==='h'?1:.1;input.id='colors-'+key;label.htmlFor=input.id;output.htmlFor=input.id;line.append(el('span',name),output);label.append(line,input);controls.append(label);sliders[key]={input,output};
 }
 const row=el('div',undefined,'ref-color-hex-row'),hexLabel=el('label','HEX 色值'),hex=el('input'),find=el('button','查找相近色名','primary-button'),error=el('p',undefined,'ref-note');
 hex.id='colors-hex';hexLabel.htmlFor=hex.id;hex.maxLength=7;hex.spellcheck=false;hex.autocomplete='off';hex.placeholder='#RRGGBB';hex.setAttribute('aria-describedby','colors-hex-error');error.id='colors-hex-error';error.setAttribute('role','status');find.type='button';row.append(hexLabel,hex,find);controls.append(row,error);
 layout.append(wheel,controls);host.append(layout);const help=el('p','色盘键盘操作：←/→ 调色相，↑/↓ 调饱和度，Home/End 设为灰阶/满饱和；明度可用滑条调节。');help.id='colors-wheel-help';appendToolHelpContent('colors',help);
 let state=hexToHsv('#E9AD28'),paintedValue=-1,pointer=null,hexValue='#E9AD28';const ctx=canvas.getContext('2d');
 function paint(){if(paintedValue===1)return;paintedValue=1;const image=ctx.createImageData(360,360);for(let y=0;y<360;y++)for(let x=0;x<360;x++){
   const dx=(x-179.5)/178,dy=(y-179.5)/178,r=Math.hypot(dx,dy);if(r>1.008)continue;const {h,s}=colorWheelPoint(dx,dy),rgb=hsvToRGB(h,s,1),offset=(y*360+x)*4;image.data.set([...rgb,Math.round(Math.min(1,Math.max(0,(1.008-r)*125))*255)],offset);
  }ctx.putImageData(image,0,0);
 }
 function display(notify=true,exact=null,preserveInput=false){
  hexValue=exact||hsvToHex(state.h,state.s,state.v);if(!preserveInput)hex.value=hexValue;hex.removeAttribute('aria-invalid');error.textContent='';const c=colorValues(hexValue);preview.style.backgroundColor=hexValue;preview.setAttribute('aria-label','当前颜色 '+hexValue);values.textContent=`${c.hex} · RGB(${c.rgb}) · HSL(${c.hsl})`;canvas.style.filter=`brightness(${state.v})`;
  const angle=state.h*Math.PI/180;marker.style.left=(50+state.s*49.45*Math.cos(angle))+'%';marker.style.top=(50+state.s*49.45*Math.sin(angle))+'%';marker.style.backgroundColor=hexValue;wheel.setAttribute('aria-label','自由色盘，当前 '+hexValue);
  for(const key of ['h','s','v']){const value=key==='h'?state.h:state[key]*100;sliders[key].input.value=String(value);sliders[key].output.value=Number(value.toFixed(1))+(key==='h'?'°':'%');}
  paint();if(notify)api.preview(hexValue);
 }
 const use=()=>api.select({query:hexValue});
 const fromHex=()=>{try{const value=normalizeColorHex(hex.value);state=hexToHsv(value);display(true,value);return true;}catch(e){hex.setAttribute('aria-invalid','true');error.textContent=e.message;return false;}};
 find.onclick=()=>{if(fromHex())use();};hex.oninput=()=>{if(/^(?:#?[0-9a-f]{3}|#?[0-9a-f]{6})$/i.test(hex.value.trim())){const value=normalizeColorHex(hex.value);state=hexToHsv(value);display(true,value,true);}else{hex.setAttribute('aria-invalid','true');error.textContent='请输入 #RGB 或 #RRGGBB 格式的颜色。';api.invalidate(hex.value);}};
 hex.onchange=()=>{if(fromHex())use();};hex.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();if(fromHex())use();}};
 for(const key of ['h','s','v']){sliders[key].input.oninput=()=>{state[key]=Number(sliders[key].input.value)/(key==='h'?1:100);display();};sliders[key].input.onchange=use;}
 const move=e=>{const box=wheel.getBoundingClientRect();const p=colorWheelPoint((e.clientX-box.left-box.width/2)/(box.width*.4945),(e.clientY-box.top-box.height/2)/(box.height*.4945));state.h=p.s<.003?state.h:p.h;state.s=p.s;display();};
 wheel.onpointerdown=e=>{if(pointer!==null||e.button!==0||!e.isPrimary)return;const box=wheel.getBoundingClientRect();if(Math.hypot(e.clientX-box.left-box.width/2,e.clientY-box.top-box.height/2)>box.width/2)return;e.preventDefault();pointer=e.pointerId;wheel.setPointerCapture(pointer);wheel.focus({preventScroll:true});move(e);};
 wheel.onpointermove=e=>{if(e.pointerId===pointer)move(e);};wheel.onpointerup=e=>{if(e.pointerId!==pointer)return;move(e);pointer=null;if(wheel.hasPointerCapture(e.pointerId))wheel.releasePointerCapture(e.pointerId);use();};
 wheel.onpointercancel=wheel.onlostpointercapture=()=>{pointer=null;};
 wheel.onkeydown=e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(e.key))return;e.preventDefault();const step=e.shiftKey?10:1;if(e.key==='ArrowLeft'||e.key==='ArrowRight')state.h=(state.h+(e.key==='ArrowRight'?step:-step)+360)%360;else if(e.key==='Home'||e.key==='End')state.s=e.key==='Home'?0:1;else state.s=Math.max(0,Math.min(1,state.s+(e.key==='ArrowUp'?step:-step)/100));display();use();};
 display(false);
 return {syncQuery(value){try{const normalized=normalizeColorHex(value);if(normalized===hexValue)return;state=hexToHsv(normalized);display(false,normalized);}catch{/* A name query has no single selected colour. */}}};
}
