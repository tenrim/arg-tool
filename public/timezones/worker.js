// Classic worker entry can run at its original URL, as a Blob, or below a
// static-host subdirectory: every resource is rooted in the page-supplied base.
let resourceBase,core,index,source;
const cache=new Map();
async function get(url,json=true){const response=await fetch(url);if(!response.ok)throw Error('本地时区资料载入失败：'+response.status);return json?response.json():response.arrayBuffer();}
onmessage=async({data})=>{
 try{
  const base=new URL(data.resourceBase);if(!['http:','https:'].includes(base.protocol)||base.origin!==location.origin)throw Error('时区资源基址必须同源。');
  if(resourceBase&&base.href!==resourceBase)throw Error('时区资源基址已变化。');resourceBase=base.href;
  if(!core){try{core=await import(new URL('timezones/core.js',resourceBase).href);}catch{throw Error('本地时区组件载入失败，请重试。');}}index??=await get(new URL('vendor/timezones/index.json',resourceBase));
  if(data.type==='search'){postMessage({id:data.id,result:{...core.searchZones(index,data.query,data.page),version:index.version,zoneCount:index.zoneCount}});return;}
  if(data.type==='list'){postMessage({id:data.id,result:{items:index.zones.map(z=>core.localizedZone(index,z)),version:index.version}});return;}
  const loadZone=async id=>{if(!index.zones.some(z=>z.id===id))throw Error('请选择登记的 IANA 时区。');if(!cache.has(id))cache.set(id,core.parseTZif(await get(new URL('vendor/timezones/zoneinfo/'+id,resourceBase),false)));return cache.get(id);};
  if(data.type==='plan'||data.type==='instant'){
   const planner=await import(new URL('timezones/planner.js',resourceBase).href),selected=planner.selectInstant(await loadZone(data.zone),data.dateTime,data.choice);
   if(selected.ambiguous){postMessage({id:data.id,result:{...selected,version:index.version}});return;}
   if(data.type==='instant'){postMessage({id:data.id,result:{...selected,version:index.version}});return;}
   const participants=planner.validateParticipants(data.participants),zones=new Map();for(const p of participants)zones.set(p.zone,await loadZone(p.zone));
   const result=planner.planMeeting({utc:selected.instant,duration:data.duration,participants,zones,search:!!data.search});
   postMessage({id:data.id,result:{...result,version:index.version}});return;
  }
  const originalEntry=index.zones.find(z=>z.id===data.zone);if(!originalEntry)throw Error('请选择登记的 IANA 时区或别名。');const entry=core.localizedZone(index,originalEntry);
  if(!cache.has(entry.id)){const bytes=await get(new URL('vendor/timezones/zoneinfo/'+entry.id,resourceBase),false);cache.set(entry.id,core.parseTZif(bytes));}const zone=cache.get(entry.id);
  source??=await get(new URL('vendor/timezones/source-records.json',resourceBase));
  const seconds=core.parseDateTime(data.dateTime),answer=data.mode==='utc'?{status:'unique',candidates:[core.utcToLocal(zone,seconds)],nearbyTransitions:[]}:core.localToUTC(zone,seconds);
  postMessage({id:data.id,result:{...answer,entry,version:index.version,zoneCount:index.zoneCount,mode:data.mode,input:data.dateTime,footer:zone.footer,source:core.sourceRecords(source,entry.id,entry.canonical),pre1970:seconds<0}});
 }catch(error){postMessage({id:data.id,error:error.message||'时区查询失败。'});}
};
