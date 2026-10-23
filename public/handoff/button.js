import {Button,onDisconnect} from '../ui/index.js';
import {sendToGraphics} from '../graphics/bridge.js';
let receiver = null;
let notebookReceiver=null;
export function connectNotebook(handler){notebookReceiver=handler;return()=>{if(notebookReceiver===handler)notebookReceiver=null;};}
export function connectHandoff(handler) { receiver=handler;return()=>{if(receiver===handler)receiver=null;}; }
// New workspaces can record their actual result without restoring the retired
// generic cross-tool button. Both destinations use the same immutable lease.
export function notebookActions({id,source='text',snapshot}) {
  let enabled=false,generation=0;
  const request=()=>{
    const captured=++generation,lease=snapshot();let value,read=false;
    return {source,read:()=>{if(!enabled||captured!==generation||!lease||lease!==snapshot())throw Error('结果已失效，请重新执行。');if(!read){value=lease.value;read=true;}return value;},isCurrent:()=>enabled&&captured===generation&&!!lease&&lease===snapshot()};
  };
  const note=Button({id:id+'-notebook',text:'加入笔记本',disabled:true,attrs:{'data-notebook-result':source},on:{click:()=>{if(enabled)notebookReceiver?.(request());}}});
  const graphic=Button({id:id+'-graphics',text:'加入白板 / 脑图',disabled:true,attrs:{'data-graphics-result':source},on:{click:()=>{if(enabled)sendToGraphics(request());}}});
  const setEnabled=value=>{enabled=Boolean(value);note.disabled=graphic.disabled=!enabled;if(!enabled)generation++;};
  onDisconnect(note,()=>setEnabled(false));onDisconnect(graphic,()=>setEnabled(false));
  return {buttons:[note,graphic],setEnabled};
}
