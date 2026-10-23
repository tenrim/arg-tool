// Editable drawings are notebook attachments: one versioned source + one PNG.
// No DOM, routes with private data, or separate persistence database lives here.
export const DRAWING_MIME='application/vnd.mist-drawing+json';
export const MAX_DRAWING=24*1024*1024, MAX_NODES=2000;
const encoder=new TextEncoder(),decoder=new TextDecoder('utf-8',{fatal:true});
const idOK=value=>typeof value==='string'&&/^[a-z0-9_-]{1,100}$/i.test(value);
const fail=message=>{throw Error(message);};
export const drawingName=kind=>kind==='whiteboard'?'线索白板':'思维导图';
export const isDrawing=asset=>asset?.mime===DRAWING_MIME;
export function newDrawing(kind,title=drawingName(kind)){
 return {format:'mist-drawing',version:1,id:crypto.randomUUID(),previewId:crypto.randomUUID(),revision:0,kind,title,
  sources:[],scene:kind==='whiteboard'?{elements:[],files:{},appState:{}}:{nodeData:{id:crypto.randomUUID(),topic:title,root:true,children:[]},direction:1}};
}
function safeImage(value){return typeof value==='string'&&/^data:image\/(?:png|jpeg|webp|gif);base64,[a-z0-9+/=]+$/i.test(value);}
function validBase64(value){if(typeof value!=='string'||value.length%4||/[^A-Za-z0-9+/=]/.test(value))return false;const at=value.indexOf('=');return at<0||at>=value.length-2&&/^={1,2}$/.test(value.slice(at));}
const safeColor=value=>typeof value==='string'&&value.length<=80&&/^(?:#[0-9a-f]{3,4}|#[0-9a-f]{6}|#[0-9a-f]{8}|transparent|black|white|(?:rgb|hsl)a?\([\d.,% -]+\))$/i.test(value);
function cleanNodeStyle(style){const out={};for(const [key,raw]of Object.entries(style||{})){
 const value=String(raw);if(['color','background','borderColor'].includes(key)&&safeColor(value))out[key]=value;
 else if(['fontSize','width','borderWidth'].includes(key)&&/^\d+(?:\.\d+)?(?:px)?$/.test(value)&&parseFloat(value)<=1200)out[key]=value;
 else if(key==='fontWeight'&&/^(?:normal|bold|[1-9]00)$/.test(value))out[key]=value;
 else if(key==='textDecoration'&&['none','underline','line-through'].includes(value))out[key]=value;
 else if(key==='fontFamily'&&value.length<=200&&/^(?:var\(--(?:body|mono|serif)\)|[a-z0-9_ ,"'-]+)$/i.test(value))out[key]=value;
 else if(key==='border'&&/^\d(?:px)? (?:solid|dashed|dotted) .+$/.test(value)&&safeColor(value.replace(/^\S+ \S+ /,'')))out[key]=value;
 }return out;}
export function validateDrawing(value){
 if(!value||value.format!=='mist-drawing'||value.version!==1||!['whiteboard','mindmap'].includes(value.kind)||!idOK(value.id)||!idOK(value.previewId)||typeof value.title!=='string'||value.title.length>120||!Number.isInteger(value.revision)||value.revision<0||!Array.isArray(value.sources)||value.sources.length>100)fail('图稿格式无效。');
 if(encoder.encode(JSON.stringify(value)).length>MAX_DRAWING)fail('单份图稿及其来源最多 24 MB，请拆分保存。');
 const out=structuredClone(value),scene=out.scene;
 for(const source of out.sources){if(!source||!idOK(source.id)||typeof source.name!=='string'||source.name.length>180||typeof source.mime!=='string'||source.mime.length>100||!validBase64(source.base64)||typeof source.tool!=='string'||source.tool.length>120||typeof source.route!=='string'||!/^$|^[a-z][\w/-]*(?:\?(?:task|op|dir)=[^#\s]*)?$/.test(source.route))fail('图稿来源记录无效。');}
 if(out.kind==='whiteboard'){
  if(!scene||!Array.isArray(scene.elements)||scene.elements.length>MAX_NODES||!scene.files||typeof scene.files!=='object'||Array.isArray(scene.files))fail('白板最多 2,000 个对象。');
  const types=new Set(['rectangle','diamond','ellipse','line','arrow','text','image','freedraw','frame']);const ids=new Set();
  for(const element of scene.elements){
   if(!element||!idOK(element.id)||ids.has(element.id)||!types.has(element.type))fail('白板包含重复对象或不支持的嵌入内容。');ids.add(element.id);
   for(const key of ['x','y','width','height','angle'])if(!Number.isFinite(element[key])||Math.abs(element[key])>1000000)fail('白板坐标无效或超出范围。');
   if(element.text!==undefined&&(typeof element.text!=='string'||element.text.length>100000))fail('白板文字过长。');
   if(element.link&&!/^https?:\/\//i.test(element.link)&&!/^#[a-z][\w/?=%+&:.-]*$/i.test(element.link))element.link=null;
   delete element.customData;
  }
  for(const [id,file]of Object.entries(scene.files))if(!idOK(id)||!file||!safeImage(file.dataURL)||!['image/png','image/jpeg','image/webp','image/gif'].includes(file.mimeType))fail('白板图片必须为本地 PNG、JPEG、WebP 或 GIF。');
  // Persist only drawing preferences, never collaborators or transient UI state.
  scene.appState=Object.fromEntries(['viewBackgroundColor','gridSize','scrollX','scrollY','zoom','currentItemStrokeColor','currentItemBackgroundColor','currentItemStrokeWidth','currentItemFontSize'].filter(k=>scene.appState?.[k]!==undefined).map(k=>[k,scene.appState[k]]));
 }else{
  if(!scene?.nodeData)fail('脑图缺少中心节点。');let count=0;const ids=new Set();
  const visit=(node,depth)=>{
   if(++count>MAX_NODES||depth>60||!node||!idOK(node.id)||ids.has(node.id)||typeof node.topic!=='string'||node.topic.length>100000)fail('脑图节点无效，或超过 2,000 节点 / 60 层。');ids.add(node.id);
   const clean={id:node.id,topic:node.topic};
   for(const key of ['root','expanded','direction'])if(typeof node[key]==='boolean'||Number.isInteger(node[key]))clean[key]=node[key];
   if(node.style)clean.style=cleanNodeStyle(node.style);
   if(safeColor(node.branchColor))clean.branchColor=node.branchColor;
   if(node.note!==undefined){if(typeof node.note!=='string'||node.note.length>10000)fail('节点备注最多 10,000 字。');clean.note=node.note;}
   if(Array.isArray(node.tags)&&node.tags.length<=20)clean.tags=node.tags.map(tag=>typeof tag==='string'?tag.slice(0,80):{text:String(tag?.text||'').slice(0,80),style:cleanNodeStyle(tag?.style)});
   if(Array.isArray(node.icons)&&node.icons.length<=20)clean.icons=node.icons.map(v=>String(v).slice(0,80));
   if(node.hyperLink&&/^https?:\/\//i.test(node.hyperLink))clean.hyperLink=node.hyperLink;
   if(node.image){if(!safeImage(node.image.url)||![node.image.width,node.image.height].every(n=>Number.isFinite(n)&&n>0&&n<=8192))fail('脑图图片必须为本地图片，尺寸不超过 8192。');clean.image={url:node.image.url,width:node.image.width,height:node.image.height,...(['fill','contain','cover'].includes(node.image.fit)?{fit:node.image.fit}:{})};}
   if(node.children){if(!Array.isArray(node.children))fail('脑图子节点格式无效。');clean.children=node.children.map(n=>visit(n,depth+1));}return clean;
  };
  const nodeData=visit(scene.nodeData,0),direction=[0,1,2,3].includes(scene.direction)?scene.direction:1;
  const cleanEdge=(edge,summary)=>{
   if(!edge||!idOK(edge.id)||typeof edge.label!=='string'||edge.label.length>10000)fail('脑图关系数据无效。');
   const clean={id:edge.id,label:edge.label};
   for(const key of summary?['parent']:['from','to']){if(!ids.has(edge[key]))fail('脑图关联指向不存在的节点。');clean[key]=edge[key];}
   if(summary){if(!Number.isInteger(edge.start)||!Number.isInteger(edge.end)||edge.start<0||edge.end<edge.start||edge.end>MAX_NODES)fail('概要范围无效。');clean.start=edge.start;clean.end=edge.end;}
   else{clean.bidirectional=!!edge.bidirectional;for(const key of ['delta1','delta2'])if(edge[key]){if(![edge[key].x,edge[key].y].every(n=>Number.isFinite(n)&&Math.abs(n)<1e6))fail('关联线坐标无效。');clean[key]={x:edge[key].x,y:edge[key].y};}}
   if(edge.style){clean.style={};for(const [key,v]of Object.entries(edge.style))if(['stroke','strokeWidth','strokeDasharray','opacity','labelColor'].includes(key)&&/^(?:#[0-9a-f]{3,8}|[\d., ]+(?:px)?|transparent)$/i.test(String(v)))clean.style[key]=v;}
   return clean;
  };
  out.scene={nodeData,direction};
  if(typeof scene.compact==='boolean')out.scene.compact=scene.compact;
  for(const key of ['arrows','summaries']){if(scene[key]!==undefined&&(!Array.isArray(scene[key])||scene[key].length>MAX_NODES))fail('脑图关系数据无效。');out.scene[key]=(scene[key]||[]).map(e=>cleanEdge(e,key==='summaries'));}
 }
 return out;
}
export function decodeDrawing(asset){if(!isDrawing(asset)||!(asset.bytes instanceof Uint8Array)||asset.bytes.length>MAX_DRAWING)fail('不是受支持的图稿文件。');return validateDrawing(JSON.parse(decoder.decode(asset.bytes)));}
export const encodeDrawing=drawing=>encoder.encode(JSON.stringify(validateDrawing(drawing)));
export function drawingsIn(note){return note.assets.filter(isDrawing).map(asset=>{try{return {noteId:note.id,noteTitle:note.title,drawing:decodeDrawing(asset)};}catch{return null;}}).filter(Boolean);}
export function putDrawing(note,drawing,{preview,expectedRevision}={}){
 const next=structuredClone(note),old=next.assets.find(a=>a.id===drawing.id);
 if(expectedRevision!==undefined&&(old?decodeDrawing(old).revision:0)!==expectedRevision)fail('这份图稿已在其他窗口修改，请先导出当前图稿，再重新打开。');
 const saved=validateDrawing({...drawing,revision:(old?decodeDrawing(old).revision:0)+1});
 const asset={id:saved.id,name:saved.title+'.mist-drawing.json',mime:DRAWING_MIME,bytes:encodeDrawing(saved)};
 const title=saved.title.replace(/[\\`*_{}\[\]()<>#+.!|~-]/g,'\\$&');
 if(old)next.assets[next.assets.indexOf(old)]=asset;else{next.assets.push(asset);next.markdown+=`\n\n## ${title}\n\n[可编辑图稿](notebook-asset:${saved.id})\n`;}
 if(preview){const image={id:saved.previewId,name:saved.title+'.png',mime:'image/png',bytes:preview};const index=next.assets.findIndex(a=>a.id===image.id);if(index<0){next.assets.push(image);next.markdown=next.markdown.replace(`[可编辑图稿](notebook-asset:${saved.id})`,`![${title}](notebook-asset:${saved.previewId})\n\n[可编辑图稿](notebook-asset:${saved.id})`);}else next.assets[index]=image;}
 next.updated=new Date().toISOString();return{note:next,drawing:saved};
}
