/* All engines and data are served locally. Each execution gets a fresh Worker. */
self.onmessage=async({data:{kind,params,resourceBase}})=>{try{
 // Worker hosts may use blob: bootstraps. Resolve every resource against the
 // original page module's directory, never the worker's temporary location.
 const base=new URL(resourceBase);
 if(!['http:','https:'].includes(base.protocol)||base.origin!==self.location.origin)throw Error('组件资源地址无效，请刷新页面后重试。');
 const asset=path=>new URL(path,base).href;
 const loadEngine=(file,label)=>{try{importScripts(asset('vendor/science/'+file));}catch{throw Error(label+'载入失败，请刷新页面后重试。');}};
 let core;try{core=await import(asset('science/core.js'));}catch{throw Error('计算组件载入失败，请刷新页面后重试。');}
 let result;
 if(kind==='astronomy'){loadEngine('astronomy.js','天文引擎');result=core.astronomy(params,self.Astronomy);}
 else if(kind==='calendar'){loadEngine('lunar.js','历法引擎');result=core.calendar(params,self);}
 else if(kind==='sequence'){loadEngine('sequence.js','序列引擎');result=core.sequence(params,self.SeqOps);}
 else if(kind==='chemistry'){
  if(params.mode==='molecule'){
   if(!params.input.trim()||params.input.length>2000)throw Error('请输入不超过 2,000 字符的 SMILES 结构式。');
   loadEngine('RDKit_minimal.js','分子引擎');let R;try{R=await self.initRDKitModule({locateFile:p=>asset('vendor/science/'+p)});}catch{throw Error('分子运算组件载入失败，请刷新页面后重试。');}let mol;
   try{mol=R.get_mol(params.input.trim());if(!mol||!mol.is_valid())throw Error('无法解析 SMILES，请检查环编号、括号和价态。');if(mol.get_num_atoms()>500)throw Error('最多查看 500 个原子的分子。');const desc=JSON.parse(mol.get_descriptors());result={title:'分子结构',rows:[['规范 SMILES',mol.get_smiles()],['原子数（引擎显式原子）',String(mol.get_num_atoms())],['平均分子量',String(desc.amw??'未提供')],['精确分子量',String(desc.exactmw??'未提供')]],svg:mol.get_svg(640,400),note:'SMILES 表示结构；普通分子式请切换到分子式计算。相同分子式可能对应不同结构。'};}finally{mol?.delete();}
  }else{let response;try{response=await fetch(asset('vendor/science/elements.json'));}catch{throw Error('元素数据载入失败，请重试。');}if(!response.ok)throw Error('元素数据载入失败，请重试。');const elements=await response.json();result=params.mode==='formula'?core.formula(params.input,elements):core.splitElements(params.input,elements);}
 }else throw Error('未知工具。');
 self.postMessage({result});
 }catch(e){self.postMessage({error:typeof e?.message==='string'?e.message:'计算失败，请检查输入格式后重试。'});}};
