import {Toolbar,onDisconnect} from './ui/index.js';
import {notebookActions} from './handoff/button.js';

// Controllers publish their real result, never a reconstruction of its DOM
// preview. A lazy serializer runs only after the player chooses a destination.
export function resultRecording({id,anchor,panel=null,source='text',onLeave=()=>{}}) {
  let lease=null;
  const actions=notebookActions({id,source,snapshot:()=>lease});
  const toolbar=Toolbar({className:'result-recording',children:actions.buttons});
  anchor.after(toolbar);
  // Lazy forms are built detached and QR/audio sections move as real nodes.
  // Resolve ownership where the toolbar lives now, never its former shell.
  const owner=()=>panel||toolbar.closest('.panel');
  const clear=()=>{lease=null;actions.setEnabled(false);};
  const publish=value=>{if(owner()?.hidden||value==null){clear();return;}lease={get value(){return typeof value==='function'?value():value;}};actions.setEnabled(true);};
  const leave=({detail})=>{const panel=owner();if(panel?.hidden||detail?.name&&detail.name!==panel?.id?.replace(/^panel-/,'')){clear();onLeave();}};
  const task=({detail})=>{if(detail?.panel===owner()?.id?.replace(/^panel-/,'')){clear();onLeave();}};
  document.addEventListener('arg:panelchange',leave);document.addEventListener('arg:nativetaskchange',task);
  onDisconnect(toolbar,()=>{clear();document.removeEventListener('arg:panelchange',leave);document.removeEventListener('arg:nativetaskchange',task);});
  return{publish,clear,buttons:actions.buttons,toolbar};
}

export function canvasRecord(canvas,name='结果.png') {
  return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve({files:[new File([blob],name,{type:'image/png'})]}):reject(Error('无法生成图片，请缩小结果后重试。')),'image/png'));
}
