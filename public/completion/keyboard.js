import {Box,Button,Card,Field,Select,Option,Textarea,ToolPanel,ToolHeader,Toolbar,Dialog,dialogController,onDisconnect,setTextareaValue,updateStatus,Status} from '../ui/index.js';
import {resultRecording} from '../result-recording.js';
import {saveFile} from '../expansion/session.js';
export function mountVirtualKeyboard(host){
 const id='virtual-keyboard',layout=Select({id:id+'-layout'}),layer=Select({id:id+'-layer'}),text=Textarea({id:id+'-input',minRows:4,autoSize:true}),keyboardHost=Box({className:'completion-keyboard'}),status=Status({id:id+'-status'});
 const copy=Button({text:'复制'}),save=Button({text:'下载文字'});
 const card=Card({children:[Toolbar({children:[Field({label:'语言布局',control:layout}),Field({label:'按键层',control:layer})]}),text,keyboardHost,Toolbar({children:[copy,save]}),status]});
 const panel=ToolPanel({id:'panel-'+id,className:'panel',hidden:true,header:ToolHeader({className:'page-heading',title:'多语言键盘'}),body:card});host.append(panel);
 const recording=resultRecording({id,anchor:card,panel});let engine,layouts,loading=false,disposed=false,target=null,lease=null;
 const trigger=Button({text:'输入键盘',className:'completion-keyboard-trigger',hidden:true}),insert=Button({text:'插入所选输入框',variant:'primary'}),close=Button({text:'关闭'}),dialog=Dialog({attrs:{'aria-label':'多语言输入键盘'},children:Toolbar({children:[insert,close]})});
 host.append(trigger,dialog);const dialogState=dialogController(dialog,{trigger,closeButton:close,initialFocus:text});
 const eligible=node=>node instanceof HTMLTextAreaElement||node instanceof HTMLInputElement&&['text','search','url','tel'].includes(node.type);
 const focus=event=>{const node=event.target;if(dialog.contains(node)||panel.contains(node)||node===trigger)return;if(eligible(node)&&!node.disabled&&!node.readOnly&&!node.closest('[hidden], [inert]')){target=node;trigger.hidden=false;}else if(node!==document.body){target=null;trigger.hidden=true;}};
 const publish=()=>text.value?recording.publish({text:text.value}):recording.clear();
 const syncLayer=()=>{const definition=layouts.get(layout.value);layer.replaceChildren(...Object.keys(definition.layout).map(key=>Option(key,key)));engine.setOptions({layoutCandidates:{},...definition,layoutName:layer.value});};
 const activate=async({detail})=>{if(detail?.name!==id)return;if(engine){publish();return;}if(loading)return;loading=true;try{
  const [{default:Keyboard},{default:Layouts}]=await Promise.all([import('../vendor/completion/simple-keyboard/build/index.modern.esm.js'),import('../vendor/completion/simple-keyboard-layouts/build/index.esm.js')]);if(disposed)return;
  layouts=new Layouts();layout.replaceChildren(...Object.keys(layouts.get()).map(key=>Option(key,key)));layout.value='english';
  engine=new Keyboard(keyboardHost,{...layouts.get('english'),preventMouseDownDefault:true,onChange:value=>{setTextareaValue(text,value);publish();},onKeyPress:button=>{if(['{shift}','{lock}'].includes(button)){const keys=Object.keys(layouts.get(layout.value).layout),next=layer.value==='default'?'shift':'default';if(keys.includes(next)){layer.value=next;engine.setOptions({layoutName:next});}}}});syncLayer();engine.setInput(text.value);updateStatus(status,`全部 ${Object.keys(layouts.get()).length} 套上游布局及其按键层已载入。`);
 }catch(e){updateStatus(status,e.message,'error');}finally{loading=false;}};
 layout.onchange=()=>{if(engine)syncLayer();};layer.onchange=()=>engine?.setOptions({layoutName:layer.value});text.oninput=()=>{engine?.setInput(text.value);publish();};text.addEventListener('select',()=>engine?.setCaretPosition(text.selectionStart,text.selectionEnd));text.addEventListener('click',()=>engine?.setCaretPosition(text.selectionStart,text.selectionEnd));
 copy.onclick=async()=>{try{await navigator.clipboard.writeText(text.value);updateStatus(status,'已复制');}catch{updateStatus(status,'请选中文字后复制。','error');}};save.onclick=()=>saveFile(text.value,'多语言输入.txt');
 document.addEventListener('arg:panelchange',activate);onDisconnect(panel,()=>{disposed=true;engine?.destroy();document.removeEventListener('arg:panelchange',activate);});
 trigger.onclick=()=>{if(!target?.isConnected||target.disabled||target.readOnly)return;lease={node:target,value:target.value,start:target.selectionStart,end:target.selectionEnd,draft:text.value};card.before(Box({id:'completion-keyboard-home',hidden:true}));dialog.append(card);setTextareaValue(text,target.value.slice(lease.start,lease.end));engine?.setInput(text.value);dialogState.open();void activate({detail:{name:id}});};
 insert.onclick=()=>{if(!lease?.node.isConnected||lease.node.value!==lease.value||lease.node.disabled||lease.node.readOnly){updateStatus(status,'原输入已经变化，请关闭后重新打开键盘。','error');return;}const {node,start,end}=lease;node.setRangeText(text.value,start,end,'end');node.dispatchEvent(new Event('input',{bubbles:true}));node.dispatchEvent(new Event('change',{bubbles:true}));dialogState.close();node.focus();};
 const restore=()=>{const marker=panel.querySelector('#completion-keyboard-home');if(marker)marker.replaceWith(card);if(lease){setTextareaValue(text,lease.draft);engine?.setInput(text.value);}lease=null;};dialog.addEventListener('close',restore);
 const leave=()=>{if(dialog.open)dialogState.close();restore();target=null;trigger.hidden=true;};document.addEventListener('focusin',focus);document.addEventListener('arg:panelchange',leave);
 onDisconnect(panel,()=>{document.removeEventListener('focusin',focus);document.removeEventListener('arg:panelchange',leave);dialogState.destroy();trigger.remove();dialog.remove();});
 return {panels:[panel],sessions:new Map([[id,{adoptInput:value=>{if(value?.kind!=='text')return false;setTextareaValue(text,value.text);engine?.setInput(value.text);publish();return true;}}]])};
}
