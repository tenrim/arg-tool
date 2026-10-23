import {decodeAnimation,metadata,framePixels,encodePNG,spriteSheet,sliceSheet,exportAll} from './core.js';
let model,source;
self.onmessage=({data:{id,op,...data}})=>{
 try{
  let result;
  if(op==='decode'){source=model=decodeAnimation(data.bytes);result=metadata(model);}
  else{
   if(!model)throw Error('请先分析文件。');
   if(op==='frame'){result=framePixels(model,data.index,data.view);if(!data.previewOnly)result.png=data.view==='raw'&&model.frames[data.index].raw?model.frames[data.index].raw:encodePNG(result.pixels,result.width,result.height);}
   else if(op==='all')result={bytes:exportAll(model)};
   else if(op==='sprite'){result=spriteSheet(model,data.columns);result.png=encodePNG(result.pixels,result.width,result.height);}
   else if(op==='slice'){model=sliceSheet(source,data.options);result=metadata(model);}
   else if(op==='restore'){model=source;result=metadata(model);}
   else throw Error('未知动画操作。');
  }
  self.postMessage({id,result});
 }catch(error){self.postMessage({id,error:String(error.message||error)});}
};
