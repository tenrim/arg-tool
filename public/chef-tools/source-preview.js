import {Box,Textarea,onDisconnect} from '../ui/index.js';
import {fileKind} from './result-view.js';

// Presentation only: never decode bytes back into the computation input.
// A bounded preview also avoids building huge textareas for binary files.
export function sourcePreview(root){
  let url=null,current=null,revision=0;
  function clear(){revision++;if(url)URL.revokeObjectURL(url);url=null;current=null;root.replaceChildren();}
  function show(bytes){
    if(current===bytes&&root.childNodes.length)return;
    clear();current=bytes;const generation=revision;if(!bytes)return;
    const kind=fileKind(bytes),limit=16384;
    root.append(Box({tag:'p',text:`上一步结果 · ${bytes.length.toLocaleString()} 字节`}));
    if(['image/png','image/jpeg','image/gif','image/webp','image/bmp'].includes(kind.mime)){
      url=URL.createObjectURL(new Blob([bytes],{type:kind.mime}));
      const image=Box({tag:'img',className:'ct-input-image',attrs:{src:url,alt:'上一步结果图片预览'}});
      image.addEventListener('error',()=>{if(generation===revision){image.remove();renderBytes(bytes);}}, {once:true});root.append(image);return;
    }
    let text=null;
    try{text=new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}).decode(bytes.subarray(0,limit),{stream:bytes.length>limit});}catch{/* Show non-UTF-8 data as bytes. */}
    if(text!==null&&!/[\x00-\x08\x0E-\x1F]/.test(text)){
      root.append(Textarea({className:'ct-previous-text',value:text,autoSize:true,minRows:3,maxRows:8,attrs:{readonly:true,'aria-label':'上一步结果文本预览'}}));
      if(bytes.length>limit)root.append(Box({tag:'p',text:'这里只预览开头内容，执行时使用全部原始字节。'}));
    }else renderBytes(bytes);
  }
  function renderBytes(bytes){
    const head=bytes.subarray(0,256),lines=[];
    for(let i=0;i<head.length;i+=16)lines.push(i.toString(16).padStart(8,'0')+'  '+[...head.subarray(i,i+16)].map(b=>b.toString(16).padStart(2,'0')).join(' '));
    root.append(Box({tag:'p',text:`二进制十六进制预览${bytes.length>256?' · 前 256 字节':''}，执行时使用全部原始字节。`}),Textarea({className:'ct-previous-hex',value:lines.join('\n'),autoSize:true,minRows:3,maxRows:8,attrs:{readonly:true,'aria-label':'上一步结果十六进制预览'}}));
  }
  onDisconnect(root,clear);return {show,clear};
}
