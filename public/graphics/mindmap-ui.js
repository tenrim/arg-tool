import {Box,Button,IconButton,Toolbar,Card,Field,FormGrid,Input,Select,Option,Textarea,Status,updateStatus,setTextareaValue,disclosureController} from '../ui/index.js';

// A native Mind Elixir extension: editing, selection, history, menus and layout
// remain owned by the actual instance. These shared controls live in its canvas.
export function mountMindmapControls(mind,host,{onText,onImage,onError}){
 const disposers=[];let dead=false,propertyIds=[],baseline={};
 const invoke=fn=>Promise.resolve().then(fn).catch(error=>{updateStatus(status,error.message,'error');onError?.(error);});
 const picked=()=>mind.currentNodes.length?mind.currentNodes:[mind.findEle(mind.nodeData.id)];
 const chosen=()=>{if(!mind.currentNodes.length)mind.selectNode(picked()[0]);return mind.currentNodes;};
 const hideMenu=()=>{const menu=host.querySelector('.context-menu');if(menu)menu.hidden=true;};
 const menu=Button({text:'节点菜单',attrs:{'aria-label':'打开原生节点菜单'},on:{click:()=>{const node=chosen()[0],rect=node.getBoundingClientRect();mind.bus.fire('showContextMenu',{target:node,clientX:rect.left,clientY:Math.min(rect.bottom,host.getBoundingClientRect().top+100)});}}});
 const properties=Button({text:'属性',attrs:{'aria-label':'节点属性'}});
 const multi=Button({text:'多选',attrs:{'aria-pressed':'false'},on:{click:()=>{mind.enableMobileMultiSelect(!mind.mobileMultiSelect);multi.setAttribute('aria-pressed',String(mind.mobileMultiSelect));}}});
 const undo=IconButton({text:'↶',label:'撤销',attrs:{title:'撤销 · Ctrl Z'},on:{click:()=>invoke(()=>mind.undo())}});
 const redo=IconButton({text:'↷',label:'重做',attrs:{title:'重做 · Ctrl Shift Z'},on:{click:()=>invoke(()=>mind.redo())}});
 const source=Button({text:'加线索',attrs:{'aria-label':'添加线索'}});
 const sourcePanel=Card({className:'mindmap-source-menu',hidden:true,attrs:{'data-motion':'popover'},children:[
  Button({text:'添加文字线索',on:{click:()=>{sourceDisclosure.toggle(false);onText();}}}),
  Button({text:'添加图片节点',on:{click:()=>{sourceDisclosure.toggle(false);onImage();}}})
 ]});const sourceDisclosure=disclosureController(source,sourcePanel);
 const toolbar=Toolbar({className:'mindmap-canvas-actions',attrs:{'aria-label':'脑图画布操作'},children:[menu,properties,undo,redo,multi,source]});
 const selection=Box({tag:'strong',text:'节点属性'}),close=Button({text:'关闭属性',on:{click:()=>propertyDisclosure.toggle(false)}}),status=Status({tag:'span',className:'mindmap-control-status'});
 const fontSize=Input({type:'number',attrs:{min:8,max:96,'aria-label':'节点字号'}});
 const width=Input({type:'number',attrs:{min:40,max:1200,'aria-label':'节点宽度'},placeholder:'自动'});
 const font=Select({attrs:{'aria-label':'节点字体'},children:[Option('默认字体',''),Option('等宽字体','var(--mono)'),Option('衬线字体','var(--serif)')]}),weight=Select({attrs:{'aria-label':'字体粗细'},children:[Option('正常','normal'),Option('加粗','bold')]}),decoration=Select({attrs:{'aria-label':'文字装饰'},children:[Option('无','none'),Option('下划线','underline'),Option('删除线','line-through')]});
 const color=Input({type:'color',attrs:{'aria-label':'节点文字颜色'}}),background=Input({type:'color',attrs:{'aria-label':'节点背景颜色'}}),branch=Input({type:'color',attrs:{'aria-label':'分支颜色'}});
 const tags=Input({attrs:{'aria-label':'节点标签',maxlength:1600},placeholder:'用逗号分隔'}),icons=Input({attrs:{'aria-label':'节点图标',maxlength:1600},placeholder:'例如：🔎, ✅'}),link=Input({type:'url',attrs:{'aria-label':'节点网址',maxlength:2000},placeholder:'https://'}),note=Textarea({attrs:{'aria-label':'节点备注',maxlength:10000},minRows:2,maxRows:5,autoSize:true});
 const colorHex=(value,fallback)=>{if(/^#[0-9a-f]{6}$/i.test(value||''))return value;if(/^#[0-9a-f]{3}$/i.test(value||''))return'#'+value.slice(1).split('').map(c=>c+c).join('');return fallback;};
 const fields={fontSize,width,fontFamily:font,fontWeight:weight,textDecoration:decoration,color,background,branchColor:branch,tags,icons,hyperLink:link,note};
 const apply=Button({text:'应用到选中节点',variant:'primary',on:{click:()=>invoke(async()=>{
  const targets=propertyIds.map(id=>mind.findEle(id));if(!targets.length)throw Error('请先选择节点。');
  if(link.value&&!/^https?:\/\//i.test(link.value))throw Error('网址需以 http:// 或 https:// 开头。');
  if(!fontSize.checkValidity()||!width.checkValidity())throw Error('请检查字号和宽度范围。');
  const list=value=>value.split(/[,，]/).map(v=>v.trim()).filter(Boolean).slice(0,20);
  const edits=Object.fromEntries(Object.entries(fields).filter(([key,input])=>input.value!==baseline[key]).map(([key,input])=>[key,input.value]));
  for(const target of targets){const patch={},style={...target.nodeObj.style};let styleChanged=false;
   for(const [key,value]of Object.entries(edits)){
    if(['fontSize','width','fontFamily','fontWeight','textDecoration','color','background'].includes(key)){style[key]=key==='width'&&value?value+'px':value;styleChanged=true;}
    else patch[key]=['tags','icons'].includes(key)?list(value):key==='hyperLink'?value.trim():value;
   }
   if(styleChanged)patch.style=style;if(Object.keys(patch).length)await mind.reshapeNode(target,patch);
  }
  baseline=Object.fromEntries(Object.entries(fields).map(([key,input])=>[key,input.value]));
  updateStatus(status,'节点属性已应用','success');
 })}});
 const image=Button({text:'给此节点添加本地图片',on:{click:()=>{if(propertyIds.length!==1){updateStatus(status,'添加图片时请选择一个节点。','error');return;}onImage(propertyIds[0]);}}});
 const removeImage=Button({text:'移除节点图片',on:{click:()=>invoke(async()=>{for(const id of propertyIds)await mind.reshapeNode(mind.findEle(id),{image:undefined});})}});
 const reset=Button({text:'恢复默认样式',on:{click:()=>invoke(async()=>{for(const id of propertyIds)await mind.reshapeNode(mind.findEle(id),{style:undefined,branchColor:undefined});syncProperties();})}});
 const panel=Card({className:'mindmap-node-properties',hidden:true,attrs:{role:'region','aria-label':'节点属性面板','data-motion':'popover'},children:[Toolbar({children:[selection,close]}),FormGrid({minColumnWidth:'120px',children:[Field({label:'字号',control:fontSize}),Field({label:'宽度',control:width}),Field({label:'字体',control:font}),Field({label:'粗细',control:weight}),Field({label:'文字装饰',control:decoration}),Field({label:'文字颜色',control:color}),Field({label:'背景颜色',control:background}),Field({label:'分支颜色',control:branch})]}),Field({label:'标签',control:tags}),Field({label:'图标',control:icons}),Field({label:'网址',control:link}),Field({label:'备注',control:note}),Toolbar({children:[apply,reset,image,removeImage]}),status]});
 const propertyDisclosure=disclosureController(properties,panel);
 function syncProperties(){
  if(dead)return;const nodes=picked();propertyIds=nodes.map(n=>n.nodeObj.id);const obj=nodes[0].nodeObj,style=obj.style||{};
  selection.textContent=nodes.length>1?`已选择 ${nodes.length} 个节点`:obj.topic.slice(0,60);
  fontSize.value=parseInt(style.fontSize)||16;width.value=parseInt(style.width)||'';font.value=['var(--mono)','var(--serif)'].includes(style.fontFamily)?style.fontFamily:'';weight.value=['bold','700','800','900'].includes(style.fontWeight)?'bold':'normal';decoration.value=['underline','line-through'].includes(style.textDecoration)?style.textDecoration:'none';
  color.value=colorHex(style.color,'#edf1f7');background.value=colorHex(style.background,'#171d2c');branch.value=colorHex(obj.branchColor,'#e9ab00');tags.value=(obj.tags||[]).map(v=>typeof v==='string'?v:v.text).join(', ');icons.value=(obj.icons||[]).join(', ');link.value=obj.hyperLink||'';setTextareaValue(note,obj.note||'');
  baseline=Object.fromEntries(Object.entries(fields).map(([key,input])=>[key,input.value]));
  updateStatus(status,'');
 }
 properties.addEventListener('click',()=>{hideMenu();syncProperties();});
 const listen=(event,fn)=>{mind.bus.addListener(event,fn);disposers.push(()=>mind.bus.removeListener(event,fn));};
 listen('selectNodes',()=>{if(!panel.hidden)syncProperties();});listen('unselectNodes',()=>{if(!panel.hidden&&!mind.currentNodes.length)propertyDisclosure.toggle(false);});
 // Improve keyboard access on the real upstream toolbar rather than replacing it.
 for(const [id,label]of [['tbltl','向左展开'],['tbltr','向右展开'],['tblts','左右展开'],['fullscreen','全屏画布'],['toCenter','画布居中'],['zoomout','缩小脑图'],['zoomin','放大脑图']]){
  const node=host.querySelector('#'+id);if(!node)continue;node.setAttribute('role','button');node.setAttribute('aria-label',label);node.title=label;node.tabIndex=0;const key=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();node.click();}};node.addEventListener('keydown',key);disposers.push(()=>node.removeEventListener('keydown',key));
 }
 const down=Button({text:'↓',label:'向下展开',attrs:{title:'向下展开'},on:{click:()=>mind.initDown()}});host.querySelector('.mind-elixir-toolbar.lt').append(down);
 const fit=IconButton({text:'⤢',label:'适应画布',attrs:{title:'适应画布'},on:{click:()=>mind.scaleFit()}});host.querySelector('.mind-elixir-toolbar.rb').append(fit);
 host.append(toolbar,sourcePanel,panel);
 const dismiss=e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'&&mind.container.contains(e.target))e.stopPropagation();if(e.key==='Escape'){if(!panel.hidden){propertyDisclosure.toggle(false);properties.focus();}sourceDisclosure.toggle(false);hideMenu();}};host.addEventListener('keydown',dismiss);disposers.push(()=>host.removeEventListener('keydown',dismiss));
 return{openProperties(){hideMenu();syncProperties();propertyDisclosure.toggle(true);},destroy(){dead=true;disposers.forEach(fn=>fn());propertyDisclosure.destroy();sourceDisclosure.destroy();toolbar.remove();sourcePanel.remove();panel.remove();down.remove();fit.remove();}};
}
