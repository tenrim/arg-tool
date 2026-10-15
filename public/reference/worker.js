self.onmessage=async({data:{kind,params,resourceBase}})=>{
 try{
  const base=new URL(resourceBase);if(!['https:','http:'].includes(base.protocol)||base.origin!==self.location.origin)throw Error('查询组件地址无效，请刷新页面。');
  const url=path=>new URL(path,base).href;
  if(['currencies','marine','sky'].includes(kind)){
   const {discoveryQuery}=await import(url('discovery/reference-worker.js'));
   self.postMessage({result:await discoveryQuery(kind,params,base)});return;
  }
  const read=async name=>{let response;try{response=await fetch(url('vendor/reference/'+name+'.json'));}catch{throw Error('本地资料载入失败，请重试。');}if(!response.ok)throw Error('本地资料载入失败，请重试。');return response.json();};
  if(kind==='crystal-model'){
   const {parseCIF,expandCrystal}=await import(url('reference/cif.js'));let text=params.cif;
   if(text===undefined){const catalog=await read('crystals');if(!catalog.some(r=>r.file===params.file))throw Error('未收录的晶体记录。');const response=await fetch(url('vendor/reference/crystals/'+params.file));if(!response.ok)throw Error('晶体文件载入失败，请重试。');text=await response.text();}
   const crystal=parseCIF(text),model=expandCrystal(crystal,Number(params.repeat||1));self.postMessage({model});return;
  }
  const allowed=['countries','airports','ports','unicode','iching','tarot','colors','geology','integerseq','crystals'];if(!allowed.includes(kind))throw Error('未知资料库。');
  const {queryRecords}=await import(url('reference/core.js'));const data=await read(kind),countries=['airports','ports'].includes(kind)?await read('countries'):[];
  self.postMessage({result:queryRecords(kind,params,data,countries)});
 }catch(e){self.postMessage({error:e instanceof TypeError?'查询组件载入失败，请刷新页面后重试。':e.message||'查询失败，请检查输入。'});}
};
