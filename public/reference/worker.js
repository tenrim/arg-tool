self.onmessage=async({data:{kind,params,resourceBase}})=>{
 try{
  const base=new URL(resourceBase);if(!['https:','http:'].includes(base.protocol)||base.origin!==self.location.origin)throw Error('查询组件地址无效，请刷新页面。');
  const url=path=>new URL(path,base).href;
  if(['currencies','marine','sky'].includes(kind)){
   const {discoveryQuery}=await import(url('discovery/reference-worker.js'));
   self.postMessage({result:await discoveryQuery(kind,params,base)});return;
  }
  const read=async name=>{let response;try{response=await fetch(url('vendor/reference/'+name+'.json'));}catch{throw Error('本地资料载入失败，请重试。');}if(!response.ok)throw Error('本地资料载入失败，请重试。');return response.json();};
  const {queryRecords,REFERENCE_DATASETS}=await import(url('reference/core.js'));
  if(!REFERENCE_DATASETS.includes(kind))throw Error('未知资料库。');
  const loadChinese=async()=>{
   if(kind==='countries')return(await import(url('vendor/reference-chinese/capitals.js'))).CHINESE_CAPITALS;
   if(kind==='airports')return(await import(url('vendor/reference-chinese/airports.js'))).CHINESE_AIRPORTS;
   if(kind==='ports')return(await import(url('vendor/reference-chinese/ports.js'))).CHINESE_PORTS;
   return {};
  };
  const [data,countries,chineseNames]=await Promise.all([read(kind),['airports','ports'].includes(kind)?read('countries'):[],loadChinese()]);
  self.postMessage({result:queryRecords(kind,params,data,countries,chineseNames)});
 }catch(e){self.postMessage({error:e instanceof TypeError?'查询组件载入失败，请刷新页面后重试。':e.message||'查询失败，请检查输入。'});}
};
