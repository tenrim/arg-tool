import {Button} from '../ui/index.js';
let receiver = null;
export function connectHandoff(handler) { receiver=handler;return()=>{if(receiver===handler)receiver=null;}; }
export function continueButton({id,read,source,isCurrent=()=>true}) {
  return Button({id,text:'用其他工具处理',disabled:true,attrs:{'data-continue-result':source},on:{click:()=>receiver?.({read,source,isCurrent})}});
}
