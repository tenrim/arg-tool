import {element as uiElement, Textarea, setTextareaValue, setState} from '../ui/index.js';
import {download} from '../round1/common.js';
import {parseInert} from '../ui/index.js';
const node=uiElement;
export function fileKind(bytes,op='',args=[]){
 const head=new TextDecoder().decode(bytes.slice(0,150)).trim();
 if(bytes[0]===137&&bytes[1]===80)return{mime:'image/png',ext:'png',image:true};
 if(bytes[0]===255&&bytes[1]===216)return{mime:'image/jpeg',ext:'jpg',image:true};
 if(head.startsWith('GIF8'))return{mime:'image/gif',ext:'gif',image:true};
 if(head.startsWith('BM'))return{mime:'image/bmp',ext:'bmp',image:true};
 if(head.startsWith('RIFF')&&head.includes('WEBP'))return{mime:'image/webp',ext:'webp',image:true};
 if(head.startsWith('II*')||head.startsWith('MM\u0000'))return{mime:'image/tiff',ext:'tiff'};
 if((op==='Generate QR Code'&&args[0]==='SVG')||/^<svg\b|^<\?xml/.test(head)&&head.includes('<svg'))return{mime:'image/svg+xml',ext:'svg',image:true};
 if(head.startsWith('%PDF-'))return{mime:'application/pdf',ext:'pdf'};
 if(bytes[0]===31&&bytes[1]===139)return{mime:'application/gzip',ext:'gz'};
 if(bytes[0]===80&&bytes[1]===75)return{mime:'application/zip',ext:'zip'};
 if(head.startsWith('BZh'))return{mime:'application/x-bzip2',ext:'bz2'};
 if(op==='Generate QR Code'&&args[0]==='EPS')return{mime:'application/postscript',ext:'eps'};
 if(op==='Play Media')return{mime:head.startsWith('RIFF')?'audio/wav':head.startsWith('ID3')||bytes[0]===255?'audio/mpeg':'video/mp4',ext:'media',media:true};
 return{mime:'application/octet-stream',ext:'bin'};
}
export function htmlText(html){const t=parseInert(html);t.content.querySelectorAll('script,style,iframe,object,embed').forEach(e=>e.remove());for(const br of t.content.querySelectorAll('br'))br.replaceWith('\n');for(const row of t.content.querySelectorAll('tr,p,div,li'))row.append('\n');return t.content.textContent.trim();}
function chart(values,label){const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 640 180');svg.setAttribute('role','img');svg.setAttribute('aria-label',label);svg.classList.add('ct-chart');const title=document.createElementNS(ns,'title');title.textContent=label;svg.append(title);const max=Math.max(1,...values);for(let i=0;i<values.length;i++){const r=document.createElementNS(ns,'rect');r.setAttribute('x',i*640/values.length);r.setAttribute('y',170-values[i]/max*160);r.setAttribute('width',Math.max(.5,640/values.length-1));r.setAttribute('height',values[i]/max*160);r.setAttribute('fill','#43bfd0');const tip=document.createElementNS(ns,'title');tip.textContent=`${i}：${values[i]}`;r.append(tip);svg.append(r);}return svg;}
// Rebuild only chart geometry. Never run upstream HTML scripts or attach user markup.
function safeChart(html){const t=parseInert(html);const original=t.content.querySelector('svg');if(!original)return null;const tags=new Set(['svg','g','path','rect','circle','ellipse','line','polyline','polygon','text','tspan','title','defs','clipPath']);const attrs=new Set(['viewBox','d','x','y','x1','x2','y1','y2','width','height','cx','cy','r','rx','ry','points','transform','fill','stroke','stroke-width','opacity','font-size','text-anchor','dominant-baseline']);let count=0;function clone(e){if(++count>10000||!tags.has(e.localName))return null;const n=document.createElementNS('http://www.w3.org/2000/svg',e.localName);for(const a of e.attributes)if(attrs.has(a.name)&&!/(url\s*\(|https?:|javascript:|data:)/i.test(a.value))n.setAttribute(a.name,a.value);for(const key of ['fill','stroke','stroke-width','opacity','font-size','text-anchor']){const value=e.style?.getPropertyValue(key);if(value&&!/(url\s*\(|https?:|javascript:|data:)/i.test(value))n.setAttribute(key,value);}for(const c of e.childNodes){if(c.nodeType===3)n.append(document.createTextNode(c.textContent));else if(c.nodeType===1){const v=clone(c);if(v)n.append(v);}}return n;}const result=clone(original);result.classList.add('ct-chart');if(!result.hasAttribute('viewBox'))result.setAttribute('viewBox',`0 0 ${+original.getAttribute('width')||640} ${+original.getAttribute('height')||360}`);result.removeAttribute('width');result.removeAttribute('height');return result;}
export function resultView(root){let urls=[],revision=0,current=null;const clear=()=>{revision++;for(const u of urls)URL.revokeObjectURL(u);urls=[];current=null;setState(root,{state:'empty'});root.replaceChildren(Textarea({autoSize:true,minRows:4,maxRows:12,attrs:{readonly:true,'aria-label':'结果',placeholder:'暂无结果'}}));};
 function url(blob){const u=URL.createObjectURL(blob);urls.push(u);return u;}
 async function show(response,op,args){clear();root.replaceChildren();setState(root,{state:'ready'});const gen=revision;if(response.bytes.length>32*1024*1024)throw Error('结果超过 32 MB，请缩小输入。');current={response,op,args};
  if(response.files){const list=node('div');list.className='ct-files';root.append(node('p',`提取到 ${response.files.length} 个文件。`),list);for(const file of response.files){const row=node('div');row.className='ct-file-row';const name=node('span',`${file.name||'未命名文件'} · ${file.size.toLocaleString()} 字节`),save=node('button','下载');save.className='secondary-button';save.onclick=()=>download(file,file.name||'提取文件.bin');row.append(name,save);if(/^image\/(png|jpeg|gif|webp|bmp)$/.test(file.type)||/\.(png|jpe?g|gif|webp|bmp)$/i.test(file.name)){const img=node('img');img.alt=file.name||'提取图片';img.className='ct-file-preview';img.src=url(file);row.append(img);}list.append(row);}return;}
  const raw=response.dish?.value,kind=fileKind(response.bytes,op,args);if(kind.ext==='bin'&&[1,2,6].includes(response.dish?.type)){kind.ext=response.dish.type===6?'json':'txt';kind.mime=response.dish.type===6?'application/json':'text/plain;charset=utf-8';}current.kind=kind;
  if(kind.image&&!['Hex Density chart','Scatter chart','Series chart','Heatmap chart'].includes(op)){const img=node('img');img.alt='处理结果预览';img.className='ct-result-image';img.src=url(new Blob([response.bytes],{type:kind.mime}));root.append(img);const note=node('p','正在读取图片尺寸…');note.className='help';root.append(note);try{await img.decode();if(gen!==revision)return;if(img.naturalWidth*img.naturalHeight>8_000_000)throw Error('结果超过 8 百万像素。');note.textContent=`${img.naturalWidth} × ${img.naturalHeight} · ${kind.ext.toUpperCase()} · ${response.bytes.length.toLocaleString()} 字节`;current.image=true;}catch(e){if(gen!==revision)return;img.remove();note.textContent=e.message.includes('像素')?e.message:'此格式无法在浏览器预览，可下载原始结果。';}return;}
  if(op==='Play Media'){const media=node('video');media.controls=true;media.preload='metadata';media.src=url(new Blob([response.bytes],{type:kind.mime}));root.append(media);media.onerror=()=>{if(gen===revision)root.append(node('p','浏览器不支持此媒体编码，可下载后使用本地播放器。'));};return;}
  if(op==='Entropy'&&typeof raw==='number'){const value=node('p',`香农熵：${raw.toFixed(6)} / 8`);value.className='ct-metric';const meter=node('meter');meter.min=0;meter.max=8;meter.value=raw;meter.setAttribute('aria-label','香农熵');root.append(value,meter);}
  else if(op==='Frequency distribution'&&raw?.distribution){root.append(node('p',`共 ${raw.dataLength} 字节，出现 ${raw.bytesRepresented} 种字节值。`),chart(raw.distribution,'字节频率分布：横轴为 0–255，纵轴为出现次数'));}
  else if(op==='Entropy'&&Array.isArray(raw))root.append(chart(raw,'字节频率或分段熵，详细数值见下方文本'));
  else if(['Hex Density chart','Scatter chart','Series chart','Heatmap chart'].includes(op)){const svg=safeChart(response.result);if(svg){root.append(svg);current.export={bytes:new TextEncoder().encode(new XMLSerializer().serializeToString(svg)),kind:{mime:'image/svg+xml',ext:'svg'}};}}
  let text;if(response.dish?.type===6)text=JSON.stringify(raw,null,2);else if(response.dish?.type===1||response.dish?.type===2)text=String(raw);else if(response.dish?.type===3)text=htmlText(response.result);else text=new TextDecoder().decode(response.bytes);
  if(kind.mime==='application/pdf')text='PDF 文件';
  // Raw cipher output is a byte string in CyberChef, not decoded Unicode.
  // Show valid UTF-8 without changing the bytes used by download/continue.
  if(/(?:Decrypt|Encrypt)$/.test(op)&&args.includes('Raw')&&response.dish?.type===1){try{text=new TextDecoder('utf-8',{fatal:true}).decode(response.bytes);}catch{/* Preserve the byte-string preview when it is not UTF-8. */}}
  if(!text&&response.bytes.length)text=`二进制结果 · ${response.bytes.length.toLocaleString()} 字节\n${[...response.bytes.slice(0,256)].map(b=>b.toString(16).padStart(2,'0')).join(' ')}`;
  const output=Textarea({autoSize:true,minRows:4,maxRows:12,className:'ct-output',value:String(text||'').slice(0,200000),attrs:{readonly:true,'aria-label':'处理结果文本'}});root.append(output);current.text=text;
  if(['Generate PGP Key Pair','Generate RSA Key Pair'].includes(op)){
   const keys=[...String(text).matchAll(/-----BEGIN ((?:PGP )?(?:RSA )?(?:PUBLIC|PRIVATE) KEY(?: BLOCK)?)-----[\s\S]*?-----END \1-----/g)];
   if(keys.length>1){const tabs=node('div');tabs.className='ct-key-tabs';tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','密钥结果预览');const choices=[['完整结果',String(text)],...keys.map(key=>[/PRIVATE/.test(key[1])?'私钥':'公钥',key[0]])];let active=0;
    function select(index){active=index;current.previewText=choices[index][1];setTextareaValue(output,choices[index][1]);[...tabs.children].forEach((b,i)=>{b.setAttribute('aria-selected',String(i===index));b.tabIndex=i===index?0:-1;});}
    for(const [index,[title]]of choices.entries()){const b=node('button',title);b.type='button';b.setAttribute('role','tab');b.onclick=()=>select(index);tabs.append(b);}
    tabs.onkeydown=e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const index=e.key==='Home'?0:e.key==='End'?choices.length-1:(active+(e.key==='ArrowRight'?1:-1)+choices.length)%choices.length;select(index);tabs.children[index].focus();};root.prepend(tabs);select(0);
   }
  }
 }
 return{clear,show,get:()=>current};
}
