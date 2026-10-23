import {Box,Toolbar} from './layout.js';
import {Button} from './controls.js';
import {onDisconnect} from './core.js';
import {animateLayoutChange,animateDialog,cancelMotion,motionAllowed} from './motion.js';

// Non-modal companion pane. Move the live workspace, never clone its editor.
export function resizableDock({layout,content,label,onClose,onExpand,onNarrow}){
 const home=content.parentElement,anchor=Box({hidden:true}),body=Box({className:'ui-dock-body'});
 home.insertBefore(anchor,content);
 const expand=Button({text:'完整页面',attrs:{'aria-label':'打开完整'+label+'页面'},on:{click:onExpand}});
 const closeButton=Button({text:'关闭',attrs:{'aria-label':'关闭'+label+'侧栏'},on:{click:()=>close()}});
 const handle=Box({className:'ui-dock-resizer',attrs:{role:'separator',tabindex:0,'aria-label':'调整'+label+'宽度','aria-orientation':'vertical','aria-controls':content.id}});
 const pane=Box({tag:'aside',className:'ui-dock',hidden:true,attrs:{'aria-label':label+'侧栏','data-motion':'dock'},children:[handle,Toolbar({className:'ui-dock-actions',children:[expand,closeButton]}),body]});
 layout.append(pane);
 const desktop=matchMedia('(min-width:1100px)');let opened=false,width=460,drag=null,returnFocus=null,dead=false,exitRevision=0,exiting=false;
 function limits(){const available=layout.clientWidth-parseFloat(getComputedStyle(layout).paddingLeft||0);return{min:360,max:Math.max(360,Math.floor(Math.min(available*.65,available-400)))};}
 function resize(value){const {min,max}=limits();width=Math.round(Math.max(min,Math.min(max,value)));layout.style.setProperty('--ui-dock-width',width+'px');handle.setAttribute('aria-valuemin',String(min));handle.setAttribute('aria-valuemax',String(Math.floor(max)));handle.setAttribute('aria-valuenow',String(width));handle.setAttribute('aria-valuetext',width+' 像素');}
 function endDrag(){if(drag!==null&&handle.hasPointerCapture(drag))handle.releasePointerCapture(drag);drag=null;layout.classList.remove('ui-dock-dragging');}
 function finishClose(){exiting=false;pane.dataset.instantClose='true';cancelMotion(pane,true);content.hidden=true;anchor.after(content);}
 function open(){if(dead||!desktop.matches)return false;if(opened)return true;exitRevision++;exiting=false;delete pane.dataset.instantClose;returnFocus=document.activeElement;opened=true;pane.inert=false;animateLayoutChange(layout,()=>{body.append(content);content.hidden=false;pane.hidden=false;layout.classList.add('ui-dock-open');resize(width);});animateDialog(pane,true);closeButton.focus();return true;}
 function close({restoreFocus=true}={}){
  if(!opened){if(exiting&&!restoreFocus){exitRevision++;finishClose();}return;}
  endDrag();opened=false;pane.inert=true;const revision=++exitRevision;
  const animated=restoreFocus&&!dead&&desktop.matches&&motionAllowed();
  const finished=animated?animateDialog(pane,false):Promise.resolve();exiting=animated;
  animateLayoutChange(layout,()=>{pane.hidden=true;layout.classList.remove('ui-dock-open');});onClose?.();
  const settle=()=>{if(exitRevision===revision&&!opened)finishClose();};
  if(animated)finished.then(settle,settle);else finishClose();
  if(restoreFocus&&returnFocus?.isConnected)returnFocus.focus({preventScroll:true});
 }
 function viewport(){cancelMotion(layout);cancelMotion(pane);if(exiting){exitRevision++;finishClose();}if(!opened)return;if(!desktop.matches){endDrag();onNarrow?.();cancelMotion(layout);}else resize(width);}
 handle.addEventListener('pointerdown',event=>{if(event.button!==0)return;event.preventDefault();cancelMotion(layout);cancelMotion(pane);drag=event.pointerId;handle.setPointerCapture(drag);handle.focus();layout.classList.add('ui-dock-dragging');});
 handle.addEventListener('pointermove',event=>{if(drag===event.pointerId)resize(layout.getBoundingClientRect().right-event.clientX);});
 handle.addEventListener('pointerup',endDrag);handle.addEventListener('pointercancel',endDrag);handle.addEventListener('lostpointercapture',endDrag);
 handle.addEventListener('keydown',event=>{const {min,max}=limits(),step=event.shiftKey?50:20;const value={ArrowLeft:width+step,ArrowRight:width-step,Home:min,End:max}[event.key];if(value!==undefined){event.preventDefault();cancelMotion(layout);cancelMotion(pane);resize(value);}});
 pane.addEventListener('keydown',event=>{if(event.key==='Escape'&&!event.defaultPrevented&&!document.querySelector('dialog[open]')&&event.target===closeButton){event.preventDefault();close();}});
 const observer=new ResizeObserver(()=>{if(opened&&desktop.matches)resize(width);});observer.observe(layout);
 window.addEventListener('resize',viewport);desktop.addEventListener('change',viewport);
 onDisconnect(pane,()=>{dead=true;close({restoreFocus:false});cancelMotion(layout);cancelMotion(pane,true);observer.disconnect();window.removeEventListener('resize',viewport);desktop.removeEventListener('change',viewport);anchor.remove();});
 return{open,close,get opened(){return opened;},get available(){return desktop.matches;}};
}
