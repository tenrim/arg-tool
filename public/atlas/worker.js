// The page supplies an absolute same-origin base; blob/subdirectory workers
// must resolve both modules and datasets there, never relative to blob: URLs.
async function readDataset(url){
 const response=await fetch(url);if(!response.ok)throw Error('资料载入失败，请重试（HTTP '+response.status+'）。');
 // Compression is an HTTP transport concern. Request the JSON resource, not a
 // downloadable .gz archive; fetch decodes Content-Encoding automatically.
 const reader=response.body.getReader(),decoder=new TextDecoder(),parts=[];let bytes=0;
 for(;;){const {done,value}=await reader.read();if(done)break;bytes+=value.byteLength;if(bytes>48*1024*1024){await reader.cancel();throw Error('资料文件超过读取限额。');}parts.push(decoder.decode(value,{stream:true}));}
 parts.push(decoder.decode());return JSON.parse(parts.join(''));
}
self.onmessage=async({data})=>{
 try{
  const base=new URL(data.resourceBase);if(!/^https?:$/.test(base.protocol)||base.origin!==self.location.origin)throw Error('资料资源地址无效。');
  const celestial=['constellations','eclipses'].includes(data.kind),culture=['birds','classical-music'].includes(data.kind);if(!celestial&&!culture)throw Error('未知资料类型。');
  const area=celestial?'atlas-celestial':'atlas-life-culture',metadata=data.kind==='birds'&&data.params?.view==='metadata',file=metadata?'birds-metadata':data.kind==='classical-music'?'music':data.kind;
  const dataset=await readDataset(new URL('vendor/'+area+'/'+file+'.json',base));
  if(!dataset?.meta||!Array.isArray(metadata?dataset.sheets:dataset.records))throw Error('资料文件结构无效。');
  const core=await import(new URL(area+'/core.js',base).href),names={constellations:'queryConstellations',eclipses:'queryEclipses',birds:'queryBirds','classical-music':'queryMusic'};
  const result=core[metadata?'queryBirdMetadata':names[data.kind]](dataset,data.params);self.postMessage({result:{...result,meta:dataset.meta}});
 }catch(error){self.postMessage({error:error?.message||'资料查询失败。'});}
};
