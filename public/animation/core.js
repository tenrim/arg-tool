import {parseGIF,decompressFrames,UPNG,pako} from '../vendor/animation/engines.js';
import {zipSync,strToU8} from '../vendor/round2/fflate.js';

export const LIMITS=Object.freeze({file:32*1024*1024,pixels:16*1024*1024,rgba:128*1024*1024,frames:4096,export:256*1024*1024});
const fail=message=>{throw Error(message);};
const text=(b)=>new TextDecoder('latin1').decode(b);
const crcTable=Uint32Array.from({length:256},(_,n)=>{for(let k=0;k<8;k++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
export function crc32(b){let c=0xffffffff;for(const v of b)c=crcTable[(c^v)&255]^(c>>>8);return(c^0xffffffff)>>>0;}
const join=parts=>{const out=new Uint8Array(parts.reduce((n,p)=>n+p.length,0));let i=0;for(const p of parts){out.set(p,i);i+=p.length;}return out;};
function chunk(type,data){const b=new Uint8Array(data.length+12),v=new DataView(b.buffer);v.setUint32(0,data.length);b.set(new TextEncoder().encode(type),4);b.set(data,8);v.setUint32(b.length-4,crc32(b.subarray(4,-4)));return b;}
const signature=new Uint8Array([137,80,78,71,13,10,26,10]);
function dimensions(w,h){if(!Number.isSafeInteger(w)||!Number.isSafeInteger(h)||w<1||h<1||w*h>LIMITS.pixels)fail('画布尺寸无效或超过 1600 万像素。');}
function budget(w,h,frames){dimensions(w,h);if(!frames.length||frames.length>LIMITS.frames)fail('帧数须为 1–4096；未截取部分结果。');let bytes=0;for(const f of frames){dimensions(f.width,f.height);if(f.x<0||f.y<0||f.x+f.width>w||f.y+f.height>h)fail('帧矩形超出画布。');bytes+=4*(w*h+f.width*f.height);}if(bytes>LIMITS.rgba)fail('全部帧解码需要超过 128 MB 像素内存；已拒绝整个文件，未截帧或缩小。');}

// Validate the complete container before invoking a permissive upstream parser.
function gifContainer(b){
 if(!['GIF87a','GIF89a'].includes(text(b.subarray(0,6)))||b.length<14)fail('不是完整 GIF 文件。');
 const v=new DataView(b.buffer,b.byteOffset,b.byteLength),u16=p=>v.getUint16(p,true);
 const width=u16(6),height=u16(8),globalCount=b[10]&128?2**((b[10]&7)+1):0;
 let p=13+globalCount*3,gce={delayNumerator:0,delayDenominator:100,dispose:0,transparentIndex:null},loops=null,ended=false;
 const frames=[],extensions=[];
 const need=n=>{if(p+n>b.length)fail('GIF 数据不完整。');};
 const blocks=()=>{const chunks=[];while(true){need(1);const n=b[p++];if(!n)break;need(n);chunks.push(b.slice(p,p+n));p+=n;}return join(chunks);};
 need(0);
 while(p<b.length){
  const at=p,kind=b[p++];
  if(kind===0x3b){ended=true;break;}
  if(kind===0x21){
   need(1);const label=b[p++],data=blocks();
   extensions.push({label,offset:at,length:p-at,data:Array.from(data)});
   if(label===0xf9){if(data.length!==4||b[at+2]!==4)fail('GIF 控制扩展损坏。');const dispose=data[0]>>2&7;if(dispose>3)fail('GIF 使用未定义的处置方式。');gce={delayNumerator:data[1]+256*data[2],delayDenominator:100,dispose,transparentIndex:data[0]&1?data[3]:null,userInput:!!(data[0]&2)};}
   if(label===0xff&&['NETSCAPE2.0','ANIMEXTS1.0'].includes(text(data.subarray(0,11)))&&data.length>=14&&data[11]===1)loops=data[12]+256*data[13];
   if(label===0x01)fail('此 GIF 含文本绘制帧；当前引擎无法忠实渲染，已拒绝而非忽略该帧。');
  }else if(kind===0x2c){
   need(9);const flags=b[p+8],f={x:u16(p),y:u16(p+2),width:u16(p+4),height:u16(p+6),...gce,interlaced:!!(flags&64),paletteScope:flags&128?'local':'global',offset:at};
   dimensions(f.width,f.height);p+=9;const count=flags&128?2**((flags&7)+1):globalCount;
   if(!count)fail('GIF 缺少颜色表。');
   if(flags&128){need(count*3);f.palette=Array.from(b.slice(p,p+count*3));p+=count*3;}
   need(1);f.minimumCodeSize=b[p++];if(f.minimumCodeSize<2||f.minimumCodeSize>8)fail('GIF LZW 码宽无效。');
   f.packed=blocks();validateLZW(f.packed,f.minimumCodeSize,f.width*f.height);
   f.length=p-at;f.paletteCount=count;frames.push(f);gce={delayNumerator:0,delayDenominator:100,dispose:0,transparentIndex:null};
   if(frames.length>LIMITS.frames)fail('GIF 超过 4096 帧。');
  }else fail('GIF 包含未知或损坏的数据块。');
 }
 if(!ended||!frames.length)fail('GIF 缺少结束标记或图像帧。');
 budget(width,height,frames);
 return{format:'GIF',width,height,loops,loopMeaning:'GIF Netscape 扩展中的重复次数；0 为无限，未声明则播放一次。',backgroundIndex:b[11],globalPalette:Array.from(b.slice(13,13+globalCount*3)),extensions,frames,trailingBytes:b.length-p};
}
function validateLZW(data,min,pixels){
 const clear=1<<min,end=clear+1,lengths=new Uint32Array(4096);for(let i=0;i<clear;i++)lengths[i]=1;
 let size=min+1,next=end+1,previous=-1,bit=0,total=0,ended=false,started=false;
 while(bit+size<=data.length*8){
  let code=0;for(let j=0;j<size;j++)code|=((data[(bit+j)>>3]>>((bit+j)&7))&1)<<j;bit+=size;
  if(code===clear){next=end+1;size=min+1;previous=-1;started=true;continue;}
  if(!started)fail('GIF LZW 缺少起始清除码。');
  if(code===end){ended=true;break;}
  if(code>next||(code===next&&previous<0))fail('GIF LZW 字典索引损坏。');
  const length=code===next?lengths[previous]+1:lengths[code];if(!length)fail('GIF LZW 数据无效。');
  total+=length;if(total>pixels)fail('GIF LZW 像素数超过帧尺寸。');
  if(previous>=0&&next<4096){lengths[next++]=lengths[previous]+1;if(next===1<<size&&size<12)size++;}
  previous=code;
 }
 if(!ended||total!==pixels)fail('GIF LZW 像素不完整。');
}

export function pngContainer(b){
 if(b.length<45||!signature.every((x,i)=>b[i]===x))fail('不是完整 PNG/APNG 文件。');
 const view=new DataView(b.buffer,b.byteOffset,b.byteLength),chunks=[],frames=[],globals=[],colorChunks=[];
 let p=8,header,width,height,animation=null,current=null,sequence=0,idat=[],seenIDAT=false,idatEnded=false,ended=false;
 while(p<b.length){
  if(p+12>b.length)fail('PNG 块头不完整。');
  const len=view.getUint32(p),type=text(b.subarray(p+4,p+8)),data=b.slice(p+8,p+8+len);
  if(p+len+12>b.length||crc32(b.subarray(p+4,p+8+len))!==view.getUint32(p+8+len))fail('PNG 数据块长度或 CRC 校验失败。');
  chunks.push({type,offset:p,length:len});p+=len+12;
  if(!header&&type!=='IHDR')fail('PNG 必须以 IHDR 开始。');
  const d=new DataView(data.buffer,data.byteOffset,data.byteLength),u32=o=>d.getUint32(o);
  if(type==='IHDR'){
   if(header||len!==13)fail('PNG IHDR 无效。');header=data;width=u32(0);height=u32(4);dimensions(width,height);
   const depths={0:[1,2,4,8,16],2:[8,16],3:[1,2,4,8],4:[8,16],6:[8,16]};
   if(!depths[data[9]]?.includes(data[8])||data[10]||data[11]||data[12]>1)fail('PNG 位深、颜色或压缩方式无效。');
  }else if(type==='acTL'){
   if(animation||seenIDAT||len!==8||!u32(0)||u32(0)>LIMITS.frames)fail('APNG 动画控制无效。');
   animation={count:u32(0),loops:u32(4)};
  }else if(type==='fcTL'){
   if(!animation||len!==26||u32(0)!==sequence++||current&&!current.parts.length)fail('APNG 帧控制或顺序无效。');
   current={x:u32(12),y:u32(16),width:u32(4),height:u32(8),delayNumerator:d.getUint16(20),delayDenominator:d.getUint16(22),dispose:data[24],blend:data[25],parts:[],usesIDAT:!seenIDAT};
   if(current.dispose>2||current.blend>1)fail('APNG 合成方式无效。');
   if(current.usesIDAT&&(frames.length||current.x||current.y||current.width!==width||current.height!==height))fail('APNG 默认图像帧必须覆盖画布。');
   frames.push(current);
  }else if(type==='IDAT'){
   if(idatEnded)fail('PNG IDAT 数据块不连续。');
   seenIDAT=true;idat.push(data);if(current?.usesIDAT)current.parts.push(data);
  }else if(type==='fdAT'){
   if(!animation||!seenIDAT||!current||current.usesIDAT||len<5||u32(0)!==sequence++)fail('APNG 帧数据或顺序无效。');
   current.parts.push(data.slice(4));
  }else if(type==='IEND'){if(len||!seenIDAT)fail('PNG 结束块无效。');ended=true;break;
  }else if(['PLTE','tRNS'].includes(type)){
   if(seenIDAT||globals.some(c=>c.type===type))fail('PNG 颜色表顺序无效。');
   if(type==='PLTE'&&(len%3||len<3||len>768))fail('PNG 颜色表无效。');
   globals.push({type,data});
  }else if(['cHRM','gAMA','iCCP','sRGB','cICP','mDCV','cLLI','sBIT','pHYs'].includes(type)){
   if(seenIDAT)fail('PNG 颜色或物理属性块顺序无效。');
   colorChunks.push({type,data});
  }else if(type[0]===type[0].toUpperCase())fail('不支持的 PNG 关键块：'+type);
  if(seenIDAT&&type!=='IDAT')idatEnded=true;
 }
 if(!ended||p!==b.length||!idat.length)fail('PNG 缺少结束块或含额外数据。');
 if(header[9]===3&&!globals.some(c=>c.type==='PLTE'))fail('索引 PNG 缺少调色板。');
 if(animation&&(frames.length!==animation.count||frames.some(f=>!f.parts.length)))fail('APNG 声明帧数与完整帧不一致。');
 const rawPNG=(f,withProfile=true)=>{const h=Uint8Array.from(header),v=new DataView(h.buffer);v.setUint32(0,f.width);v.setUint32(4,f.height);return join([signature,chunk('IHDR',h),...(withProfile?colorChunks:[]).map(c=>chunk(c.type,c.data)),...globals.map(c=>chunk(c.type,c.data)),...f.parts.map(b=>chunk('IDAT',b)),chunk('IEND',new Uint8Array())]);};
 if(!animation)frames.push({x:0,y:0,width,height,delayNumerator:0,delayDenominator:100,dispose:0,blend:0,parts:idat});
 budget(width,height,frames);
 const commonBytes=57+[...colorChunks,...globals].reduce((n,c)=>n+c.data.length+12,0);
 const rawBytes=frames.reduce((n,f)=>n+commonBytes+f.parts.reduce((s,p)=>s+p.length+12,0),0);
 if(rawBytes>LIMITS.export)fail('保留全部原始帧与颜色配置需要超过 256 MB，已拒绝整个文件。');
 const poster={width,height,parts:idat};validateInflate(poster,header);
 for(const f of frames){validateInflate(f,header);f.raw=rawPNG(f);f.decodeRaw=colorChunks.length?rawPNG(f,false):f.raw;delete f.parts;}
 return{format:animation?'APNG':'PNG',width,height,loops:animation?.loops??null,loopMeaning:'APNG num_plays 表示总播放次数，0 为无限。',depth:header[8],colorType:header[9],interlaced:!!header[12],chunks,colorChunks,globals:globals.map(c=>({type:c.type,data:Array.from(c.data)})),frames,poster:animation&&!frames[0].usesIDAT?rawPNG(poster):null};
}
function validateInflate(f,header){
 const channels={0:1,2:3,3:1,4:2,6:4}[header[9]],bits=channels*header[8],passes=header[12]?[[0,0,8,8],[4,0,8,8],[0,4,4,8],[2,0,4,4],[0,2,2,4],[1,0,2,2],[0,1,1,2]]:[[0,0,1,1]];
 let expected=0;const rows=[];
 for(const [x,y,dx,dy] of passes){const w=Math.max(0,Math.ceil((f.width-x)/dx)),h=Math.max(0,Math.ceil((f.height-y)/dy));if(w&&h){const stride=1+Math.ceil(w*bits/8);for(let i=0;i<h;i++)rows.push(expected+i*stride);expected+=stride*h;}}
 let total=0,row=0;const decoder=new pako.Inflate({chunkSize:16384});
 decoder.onData=data=>{if(total+data.length>expected)fail('PNG 解压长度超过声明尺寸。');while(row<rows.length&&rows[row]<total+data.length){if(data[rows[row]-total]>4)fail('PNG 滤波方式无效。');row++;}total+=data.length;};
 const packed=join(f.parts);for(let p=0;p<packed.length;p+=512){decoder.push(packed.subarray(p,p+512),p+512>=packed.length);if(decoder.err)fail('PNG 压缩数据或 Adler 校验无效。');}
 if(total!==expected||!decoder.ended)fail('PNG 解压像素不完整。');
}
function pngPixels(raw){
 const decoded=UPNG.decode(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength));
 // UPNG 2.1.0's low-bit grayscale converter assumes no row padding.
 // Keep upstream bytes intact and adapt its already-unfiltered samples by row.
 if(decoded.ctype===0&&decoded.depth<8){
  const rgba=new Uint8Array(decoded.width*decoded.height*4),depth=decoded.depth,stride=Math.ceil(decoded.width*depth/8),mask=(1<<depth)-1;
  for(let y=0;y<decoded.height;y++)for(let x=0;x<decoded.width;x++){const value=(decoded.data[y*stride+(x*depth>>3)]>>(8-depth-(x*depth%8)))&mask,i=(y*decoded.width+x)*4;rgba.fill(Math.round(value*255/mask),i,i+3);rgba[i+3]=decoded.tabs.tRNS===value?0:255;}return rgba;
 }
 return UPNG.toRGBA8(decoded).map(b=>new Uint8Array(b))[0];
}
export function decodeAnimation(input){
 const b=input instanceof Uint8Array?input:new Uint8Array(input);if(b.length>LIMITS.file)fail('文件超过 32 MB。');
 const gif=text(b.subarray(0,3))==='GIF',model=gif?gifContainer(b):pngContainer(b);
 let patches;
 if(gif){
  const parsed=parseGIF(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength));
  patches=decompressFrames(parsed,false);
  if(patches.length!==model.frames.length)fail('GIF 引擎解析帧数与容器不一致。');
  patches.forEach((decoded,i)=>{
   const f=model.frames[i],palette=f.palette||model.globalPalette;
   if(decoded.pixels.some(x=>x>=f.paletteCount))fail('GIF 像素索引超出颜色表。');
   f.indices=new Uint8Array(decoded.pixels);decoded.patch=new Uint8Array(f.width*f.height*4);
   // A GCE applies across intervening comment/application blocks. Use the
   // validated container's association, retaining upstream LZW/deinterlacing.
   f.indices.forEach((index,p)=>{decoded.patch.set(palette.slice(index*3,index*3+3),p*4);decoded.patch[p*4+3]=index===f.transparentIndex?0:255;});
  });
 }else patches=model.frames.map(f=>{const patch=pngPixels(f.decodeRaw);delete f.decodeRaw;return{patch};});
 const {width:w,height:h}=model,canvas=new Uint8Array(w*h*4),outputs=[];
 const background=gif&&model.globalPalette.length?model.globalPalette.slice(model.backgroundIndex*3,model.backgroundIndex*3+3):null;
 const opaqueBackground=background?.length===3?[...background,255]:[0,0,0,0],bg=model.frames[0].transparentIndex===null?opaqueBackground:[0,0,0,0];
 if(gif)for(let p=0;p<canvas.length;p+=4)canvas.set(bg,p);
 for(let i=0;i<model.frames.length;i++){
  const f=model.frames[i],patch=new Uint8Array(patches[i].patch),restore=canvas.slice();
  f.patch=patch;f.delayMs=1000*f.delayNumerator/(f.delayDenominator||100);
  for(let y=0;y<f.height;y++)for(let x=0;x<f.width;x++){
   const a=(y*f.width+x)*4,d=((y+f.y)*w+x+f.x)*4;
   if(gif){if(patch[a+3])canvas.set(patch.subarray(a,a+4),d);}
   else if(f.blend===0)canvas.set(patch.subarray(a,a+4),d);
   else{const sa=patch[a+3]/255,da=canvas[d+3]/255,alpha=sa+da*(1-sa);for(let c=0;c<3;c++)canvas[d+c]=alpha?Math.round((patch[a+c]*sa+canvas[d+c]*da*(1-sa))/alpha):0;canvas[d+3]=Math.round(alpha*255);}
  }
  outputs.push(canvas.slice());
  if(gif?f.dispose===2:f.dispose===1){const color=gif&&f.transparentIndex===null?opaqueBackground:[0,0,0,0];for(let y=0;y<f.height;y++)for(let x=0;x<f.width;x++)canvas.set(color,((y+f.y)*w+x+f.x)*4);}
  if(gif?f.dispose===3:f.dispose===2)canvas.set(restore);
 }
 return{...model,outputs,original:b.slice()};
}
export function metadata(model){const {outputs,original,poster,frames,colorChunks,...rest}=model;return{...rest,previewColor:'RGBA8 未应用 ICC 色彩转换；16 位样本及颜色配置完整保留在原始帧 PNG 和源文件中',colorChunks:colorChunks?.map(c=>({type:c.type,bytes:c.data.length})),posterExcluded:!!poster,totalDurationMs:frames.reduce((n,f)=>n+f.delayMs,0),frames:frames.map(({patch,raw,indices,packed,...f},i)=>({index:i+1,...f}))};}
export function framePixels(model,index,view='composite'){
 const f=model.frames[index];if(!f)fail('帧编号无效。');
 if(view==='raw')return{pixels:f.patch.slice(),width:f.width,height:f.height};
 const pixels=model.outputs[index].slice();
 if(view==='difference'){const previous=model.outputs[index-1]||new Uint8Array(pixels.length);for(let i=0;i<pixels.length;i+=4){let changed=false;for(let c=0;c<4;c++){const d=Math.abs(pixels[i+c]-previous[i+c]);if(d)changed=true;pixels[i+c]=d;}if(changed){if(!pixels[i]&&!pixels[i+1]&&!pixels[i+2])pixels[i]=pixels[i+1]=pixels[i+2]=255;pixels[i+3]=255;}else pixels[i+3]=0;}}
 return{pixels,width:model.width,height:model.height};
}
// Exact RGBA8 output, no quantization, color reduction or premultiplied canvas.
export function encodePNG(pixels,width,height){
 dimensions(width,height);if(pixels.length!==width*height*4)fail('导出像素尺寸不一致。');
 const header=new Uint8Array(13),v=new DataView(header.buffer);v.setUint32(0,width);v.setUint32(4,height);header[8]=8;header[9]=6;
 const rows=new Uint8Array((width*4+1)*height);for(let y=0;y<height;y++)rows.set(pixels.subarray(y*width*4,(y+1)*width*4),y*(width*4+1)+1);
 return join([signature,chunk('IHDR',header),chunk('IDAT',pako.deflate(rows)),chunk('IEND',new Uint8Array())]);
}
export function spriteSheet(model,columns=8){
 if(!Number.isInteger(columns)||columns<1||columns>model.frames.length)fail('拼图列数须介于 1 和总帧数之间。');
 const width=model.width*columns,height=model.height*Math.ceil(model.frames.length/columns);dimensions(width,height);
 const pixels=new Uint8Array(width*height*4);
 model.outputs.forEach((frame,i)=>{const x=i%columns*model.width,y=Math.floor(i/columns)*model.height;for(let row=0;row<model.height;row++)pixels.set(frame.subarray(row*model.width*4,(row+1)*model.width*4),((y+row)*width+x)*4);});
 return{pixels,width,height};
}
export function sliceSheet(model,{width,height,gap=0,margin=0}){
 for(const n of [width,height,gap,margin])if(!Number.isInteger(n)||n<0)fail('切片尺寸、间距和边距须为非负整数。');if(!width||!height)fail('切片宽高须大于零。');
 const cw=model.width-2*margin,ch=model.height-2*margin,columns=(cw+gap)/(width+gap),rows=(ch+gap)/(height+gap);
 if(columns<1||rows<1||!Number.isInteger(columns)||!Number.isInteger(rows))fail('切片网格不能完整覆盖图片，请检查宽高、间距和边距；不会丢弃剩余像素。');
 if(columns*rows>LIMITS.frames)fail('切片超过 4096 帧，已拒绝整个网格。');
 const frames=[];for(let y=0;y<rows;y++)for(let x=0;x<columns;x++)frames.push({x:0,y:0,width,height,delayNumerator:0,delayDenominator:100,delayMs:0,dispose:0,blend:0,sheetRect:{x:margin+x*(width+gap),y:margin+y*(height+gap),width,height}});
 budget(width,height,frames);const original=model.outputs[0];
 const outputs=frames.map(f=>{const p=new Uint8Array(width*height*4);for(let y=0;y<height;y++){const start=((f.sheetRect.y+y)*model.width+f.sheetRect.x)*4;p.set(original.subarray(start,start+width*4),y*width*4);}f.patch=p;return p;});
 return{format:'SPRITE',width,height,frames,outputs,original:model.original,loops:null,sourceSheet:{width:model.width,height:model.height,gap,margin},loopMeaning:'切片没有动画时间；不虚构帧延时。'};
}
export function exportAll(model){
 const files=Object.create(null);files['metadata.json']=strToU8(JSON.stringify(metadata(model),null,2));files['original.bin']=model.original;
 if(model.poster)files['default-image.png']=model.poster;
 let total=model.original.length;model.frames.forEach((f,i)=>{
  const name=String(i+1).padStart(4,'0');
  files[`composited/${name}.png`]=encodePNG(model.outputs[i],model.width,model.height);
  files[`raw/${name}.png`]=f.raw||encodePNG(f.patch,f.width,f.height);
  if(f.indices)files[`indices/${name}.bin`]=f.indices;
  total+=files[`composited/${name}.png`].length+files[`raw/${name}.png`].length+(f.indices?.length||0);
  if(total>LIMITS.export)fail('完整导出超过 256 MB，已停止；可分别保存帧和原文件。');
 });
 return zipSync(files,{level:0});
}
