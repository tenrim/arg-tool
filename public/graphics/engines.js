import {element,Box} from '../ui/index.js';
import {mountMindmapControls} from './mindmap-ui.js';
const base=new URL('../vendor/graphics/',import.meta.url),styles=new Map();
async function style(path){
 if(styles.has(path))return styles.get(path);
 const task=new Promise((resolve,reject)=>{const node=element('link',{attrs:{rel:'stylesheet',href:new URL(path,base).href}});let timer;
  const fail=()=>{clearTimeout(timer);node.remove();styles.delete(path);reject(Error('绘图样式加载失败，请重试。'));};
  node.onload=()=>{clearTimeout(timer);resolve();};node.onerror=fail;timer=setTimeout(fail,15000);document.querySelector('link[href$="ui/components.css"]').before(node);
 });styles.set(path,task);return task;
}
const bytes=async blob=>{if(!blob)throw Error('图片导出失败。');return new Uint8Array(await blob.arrayBuffer());};
async function dimensions(dataURL){const blob=await(await fetch(dataURL)).blob(),image=await createImageBitmap(blob);try{if(image.width*image.height>32e6)throw Error('图片最多 3,200 万像素。');return{width:image.width,height:image.height};}finally{image.close();}}
export async function createGraphicEngine(kind,parent,scene,{changed,onText,onImage,onError}={}){
 const host=Box({className:'graphic-engine-mount'});parent.replaceChildren(host);
 if(kind==='whiteboard'){
  window.EXCALIDRAW_ASSET_PATH=new URL('excalidraw/',base).href;
  await style('excalidraw/style.css');const lib=await import('../vendor/graphics/excalidraw/excalidraw-entry.js');
  let api,quiet=true,dead=false,resolveReady,rejectReady,lastScene='';
  const ready=new Promise((resolve,reject)=>{resolveReady=resolve;rejectReady=reject;});
  const timer=setTimeout(()=>rejectReady(Error('白板加载超时，请重试。')),15000);
  const defaults={theme:'dark',currentItemRoughness:0,currentItemFillStyle:'solid',currentItemFontFamily:2,currentItemStrokeColor:'#f0f3f8',viewBackgroundColor:'#0b1019',currentItemBackgroundColor:'transparent'};
  // Imported drawings also start with straight lines and a regular typeface.
  const regular=items=>items.map(e=>({...e,roughness:0,fillStyle:'solid',...(e.type==='text'?{fontFamily:2}:{} )}));
  const destroy=lib.mount(host,{langCode:'zh-CN',theme:'dark',detectScroll:true,autoFocus:false,
   initialData:{elements:lib.restoreElements(regular(scene.elements),null),files:scene.files,appState:{...scene.appState,...defaults},scrollToContent:true},
   excalidrawAPI:value=>{api=value;resolveReady();},onChange:(elements,appState,files)=>{const signature=elements.map(e=>e.id+':'+e.version+':'+e.isDeleted).join('|')+';'+Object.keys(files).join('|')+';'+appState.viewBackgroundColor;if(signature!==lastScene){lastScene=signature;if(!quiet&&!dead)changed?.();}},
   validateEmbeddable:()=>false,UIOptions:{canvasActions:{loadScene:false,saveToActiveFile:false,export:false,saveAsImage:false,toggleTheme:false}},
   onLinkOpen:(element,event)=>{if(element.link&&!/^https?:\/\//i.test(element.link)&&!/^#[a-z]/i.test(element.link))event.preventDefault();}
  });
  try{await ready;}catch(error){destroy();host.remove();throw error;}finally{clearTimeout(timer);}quiet=false;
  const get=()=>({elements:structuredClone(api.getSceneElements()),files:structuredClone(api.getFiles()),appState:Object.fromEntries(['viewBackgroundColor','gridSize','scrollX','scrollY','zoom','currentItemStrokeColor','currentItemBackgroundColor','currentItemStrokeWidth','currentItemFontSize'].map(k=>[k,api.getAppState()[k]]))});
  return{get,
   async add(source){const elements=api.getSceneElements(),x=elements.length?Math.max(...elements.map(e=>e.x+e.width))+60:100,y=100;
    const title=[source.name,source.tool?`来源：${source.tool}`:''].filter(Boolean).join('\n');
    const text=source.text===null?title:title+'\n'+source.text.slice(0,3000)+(source.text.length>3000?'\n…（完整内容保存在来源附件）':'');
    const additions=[];
    if(/^image\/(png|jpeg|webp|gif)$/.test(source.mime)){const url=`data:${source.mime};base64,${source.base64}`,size=await dimensions(url),scale=Math.min(1,520/size.width,420/size.height),id=crypto.randomUUID();api.addFiles([{id,dataURL:url,mimeType:source.mime,created:Date.now()}]);additions.push({type:'image',fileId:id,x,y,width:size.width*scale,height:size.height*scale,status:'saved',scale:[1,1]});}
    additions.push({type:'text',text,x,y:y+(additions[0]?.height||0)+20,fontSize:20,fontFamily:2,strokeColor:'#f0f3f8',roughness:0});
    api.updateScene({elements:[...elements,...lib.convertToExcalidrawElements(additions)],captureUpdate:lib.CaptureUpdateAction.IMMEDIATELY});api.scrollToContent();
   },
   async png(){const elements=api.getSceneElements();if(!elements.length)return blankPNG();return bytes(await lib.exportToBlob({elements,files:api.getFiles(),appState:{...api.getAppState(),exportBackground:true,exportWithDarkMode:false},mimeType:'image/png',maxWidthOrHeight:2048}));},
   async svg(){return (await lib.exportToSvg({elements:api.getSceneElements(),files:api.getFiles(),appState:{...api.getAppState(),exportBackground:true,exportWithDarkMode:false}})).outerHTML;},
   focus(){host.querySelector('canvas')?.focus();},fit(){api.scrollToContent();},destroy(){dead=true;destroy();host.remove();}
  };
 }
 await style('mind-elixir/MindElixir.css');const [{default:MindElixir},{zh_CN}]=await Promise.all([import('../vendor/graphics/mind-elixir/MindElixir.js'),import('../vendor/graphics/mind-elixir/i18n.js')]);
 let controls;
 const closeMenu=()=>{const menu=host.querySelector('.context-menu');if(menu)menu.hidden=true;};
 const mind=new MindElixir({el:host,direction:2,toolBar:true,keypress:true,newTopicName:'新节点',contextMenu:{locale:zh_CN,focus:true,link:true,extend:[
  {name:'编辑节点',key:'F2',onclick:()=>{closeMenu();mind.beginEdit();}},
  {name:'节点属性',onclick:()=>controls.openProperties()},
  {name:'添加本地图片',onclick:()=>{closeMenu();onImage(mind.currentNode?.nodeObj.id);}},
  {name:'展开全部',onclick:()=>{closeMenu();mind.expandNodeAll(mind.findEle(mind.nodeData.id),true);}},
  {name:'折叠全部',onclick:()=>{closeMenu();mind.expandNodeAll(mind.findEle(mind.nodeData.id),false);}},
  {name:'切换紧凑布局',onclick:()=>{closeMenu();mind.changeCompact(!mind.compact);}}
 ]},
  allowUndo:true,theme:{...MindElixir.DARK_THEME,name:'迷雾',palette:['#e9ab00','#42b6cf','#8095db'],cssVar:{...MindElixir.DARK_THEME.cssVar,'--bgcolor':'#0b1019','--main-bgcolor':'#171d2c','--main-color':'#edf1f7','--color':'#c4d2e5','--selected':'#e9ab00','--accent-color':'#e9ab00'}},
  imageProxy:url=>/^data:image\/(?:png|jpeg|webp|gif);base64,/i.test(url)?url:''});
 const initial=mind.init(structuredClone(scene));if(initial instanceof Error){mind.destroy();host.remove();throw initial;}
 const get=()=>{const value=JSON.parse(mind.getDataString());if(mind.isFocusMode&&mind.tempDirection!==null)value.direction=mind.tempDirection;return value;};
 let signature=JSON.stringify(get());
 const notify=()=>{const next=JSON.stringify(get());if(next!==signature){signature=next;changed?.();}};
 for(const event of ['operation','changeDirection','expandNode'])mind.bus.addListener(event,info=>{if(info?.name!=='beginEdit')notify();});
 // Curve handles emit every pointer move. Mark immediately but leave full
 // scene serialization to the debounced save, especially with local images.
 mind.bus.addListener('updateArrowDelta',()=>changed?.());
 // Native history, compact mode and Ctrl K depth-folding refresh the scene
 // without an operation event. Observe that shared boundary; view-only focus
 // and repeated notifications do not dirty an unchanged complete document.
 const refresh=mind.refresh.bind(mind);mind.refresh=(...args)=>{const result=refresh(...args);notify();return result;};
 const summary=mind.createSummary.bind(mind);mind.createSummary=(...args)=>{try{return summary(...args);}catch(error){if(/No selected node|Can not select root node|same main topic/.test(error.message)){onError?.(Error('摘要需要选择同一主分支内的节点，请不要选择中心主题或跨主分支节点。'));return;}throw error;}};
 controls=mountMindmapControls(mind,host,{onText,onImage,onError});
 mind.scaleFit();
 const viewport=new ResizeObserver(()=>{if(host.clientWidth&&host.clientHeight)mind.scaleFit();});viewport.observe(host);
 // Focus is a temporary view. Saved previews must still cover the complete
 // document, including branches outside the focused subtree.
 const fullSvg=()=>{if(!mind.isFocusMode)return mind.exportSvg(true);const mount=Box({className:'graphic-engine-mount'}),stage=Box({className:'mindmap-export-stage',attrs:{'aria-hidden':'true'},children:[mount]});host.append(stage);const whole=new MindElixir({el:mount,theme:mind.theme,toolBar:false,contextMenu:false,keypress:false,allowUndo:false,editable:false,imageProxy:mind.imageProxy});try{whole.init(get());return whole.exportSvg(true);}finally{whole.destroy();stage.remove();}};
 return{get,
  async add(source,{nodeId}={}){const node={id:crypto.randomUUID(),topic:source.text===null?source.name:source.text.slice(0,3000),children:[]};if(source.tool)node.tags=[source.tool];
   if(/^image\/(png|jpeg|webp|gif)$/.test(source.mime)){const url=`data:${source.mime};base64,${source.base64}`,size=await dimensions(url),scale=Math.min(1,240/size.width,180/size.height);node.image={url,width:Math.round(size.width*scale),height:Math.round(size.height*scale)};}
   if(nodeId&&node.image)await mind.reshapeNode(mind.findEle(nodeId),{image:node.image});else await mind.addChild(mind.currentNodes[0]||mind.findEle(mind.nodeData.id),node);mind.scaleFit();},
  async png(){return rasterSVG(fullSvg());},async svg(){return fullSvg().text();},
  focus(){mind.container.focus();},fit(){mind.scaleFit();},destroy(){viewport.disconnect();controls.destroy();mind.destroy();host.remove();}
 };
}
async function blankPNG(){const canvas=Box({tag:'canvas'});canvas.width=640;canvas.height=360;const ctx=canvas.getContext('2d');ctx.fillStyle='#0b1019';ctx.fillRect(0,0,640,360);return bytes(await new Promise(r=>canvas.toBlob(r)));}
async function rasterSVG(blob){
 const url=URL.createObjectURL(blob),img=Box({tag:'img'});try{img.src=url;await img.decode();const scale=Math.min(1,2048/Math.max(img.naturalWidth,img.naturalHeight)),canvas=Box({tag:'canvas'});canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));const ctx=canvas.getContext('2d');ctx.fillStyle='#0b1019';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);return bytes(await new Promise(r=>canvas.toBlob(r)));}finally{URL.revokeObjectURL(url);}
}
