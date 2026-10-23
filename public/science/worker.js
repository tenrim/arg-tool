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
 if(kind==='native'){
  const api=await import(asset('science/native-api.js'));
  if(params.engine==='chemistry'){loadEngine('RDKit_minimal.js','分子引擎');const R=await self.initRDKitModule({locateFile:p=>asset('vendor/science/'+p)});result=await api.runNativeProgram(R,params.program,{constructors:['StringList','JSMolListList','MolList','SubstructLibrary']});}
  else if(params.engine==='astronomy'){loadEngine('astronomy.js','天文引擎');result=await api.runNativeProgram(self.Astronomy,params.program,{constructors:["AstroTime","LibrationInfo","Vector","StateVector","Spherical","EquatorialCoordinates","RotationMatrix","HorizontalCoordinates","EclipticCoordinates","Observer","JupiterMoonsInfo","IlluminationInfo","MoonQuarter","AtmosphereInfo","HourAngleEvent","SeasonInfo","ElongationEvent","Apsis","ConstellationInfo","LunarEclipseInfo","GlobalSolarEclipseInfo","EclipseEvent","LocalSolarEclipseInfo","TransitInfo","NodeEventInfo","AxisInfo","GravitySimulator"]});}
  else if(params.engine==='calendar'){loadEngine('lunar.js','历法引擎');const L=Object.fromEntries(['Solar','Lunar','SolarYear','SolarMonth','SolarWeek','SolarSeason','SolarHalfYear','LunarYear','LunarMonth','LunarTime','Foto','Tao','NineStar','EightChar','HolidayUtil','LunarUtil','SolarUtil','FotoUtil','TaoUtil'].filter(n=>self[n]).map(n=>[n,self[n]]));result=await api.runNativeProgram(L,params.program,{objects:L});}
  else throw Error('未知原生引擎');
 }
 else if(kind==='astronomy'){loadEngine('astronomy.js','天文引擎');result=core.astronomy(params,self.Astronomy);}
 else if(kind==='calendar'){loadEngine('lunar.js','历法引擎');result=core.calendar(params,self);}
 else if(kind==='sequence'){loadEngine('sequence.js','序列引擎');result=core.sequence(params,self.SeqOps);}
 else if(kind==='chemistry'){
  if(params.mode==='molecule'||params.mode==='molecule-full'){
   if(!params.input.trim()||params.input.length>2000)throw Error('请输入不超过 2,000 字符的 SMILES 结构式。');
   loadEngine('RDKit_minimal.js','分子引擎');let R;try{R=await self.initRDKitModule({locateFile:p=>asset('vendor/science/'+p)});}catch{throw Error('分子运算组件载入失败，请刷新页面后重试。');}let mol;
   const api=await import(asset('science/native-api.js'));result=params.mode==='molecule-full'?api.rdkitReport(R,params.input.trim(),params.query||''):api.rdkitClue(R,params.input.trim());
  }else{let response;try{response=await fetch(asset('vendor/science/elements.json'));}catch{throw Error('元素数据载入失败，请重试。');}if(!response.ok)throw Error('元素数据载入失败，请重试。');const elements=await response.json();result=params.mode==='formula'?core.formula(params.input,elements):core.splitElements(params.input,elements);}
 }else throw Error('未知工具。');
 self.postMessage({result});
 }catch(e){self.postMessage({error:typeof e?.message==='string'?e.message:'计算失败，请检查输入格式后重试。'});}};
