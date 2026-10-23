import {localToUTC,utcToLocal,parseDateTime} from './core.js';
export function selectInstant(zone,dateTime,choice='ask'){
 const answer=localToUTC(zone,parseDateTime(dateTime));
 if(answer.status==='nonexistent')throw Error('所选当地时间因时区跳时而不存在，请改选时间。');
 if(answer.candidates.length>1&&choice==='ask')return {ambiguous:true,candidates:answer.candidates};
 if(!['ask','earlier','later'].includes(choice))throw Error('请选择重复时间的先后次序。');
 return {instant:answer.candidates[choice==='later'?answer.candidates.length-1:0].utc,ambiguous:false};
}
function clock(value){const m=/^(\d{2}):(\d{2})$/.exec(value);if(!m||+m[1]>23||+m[2]>59)throw Error('可用时段须为 HH:mm。');return +m[1]*60+ +m[2];}
export function validateParticipants(participants){
 if(!Array.isArray(participants)||participants.length<1||participants.length>12)throw Error('请添加 1 至 12 个参与地点。');
 return participants.map(p=>{const start=clock(p.start),end=clock(p.end);if(start>=end)throw Error('可用时段结束须晚于开始；跨午夜时段请拆成两个地点条件。');return {...p,startMinute:start,endMinute:end};});
}
export function meetingAt(utc,duration,participants,zones){
 if(!Number.isInteger(duration)||duration<1||duration>1440)throw Error('会议时长须为 1 至 1440 分钟。');
 return participants.map(p=>{
  const zone=zones.get(p.zone);if(!zone)throw Error('请选择有效时区。');let available=true;
  // Sample every occupied minute. Fixed duration is elapsed UTC time, including
  // jumps/folds; do not compare just local endpoints across a DST transition.
  for(let t=0;t<=duration;t++){
   const local=utcToLocal(zone,utc+(t===duration?duration*60-1:t*60)),d=new Date(local.local*1000),minute=d.getUTCHours()*60+d.getUTCMinutes()+d.getUTCSeconds()/60;
   if(minute<p.startMinute||minute>=p.endMinute||p.weekdays&&[0,6].includes(d.getUTCDay())){available=false;break;}
  }
  return {zone:p.zone,name:String(p.name||p.zone).slice(0,100),start:utcToLocal(zone,utc),end:utcToLocal(zone,utc+duration*60),available};
 });
}
export function planMeeting({utc,duration,participants,zones,search=false}){
 const list=validateParticipants(participants),rows=meetingAt(utc,duration,list,zones),suggestions=[];
 if(search){const first=Math.ceil(utc/1800)*1800;for(let i=0;i<336&&suggestions.length<12;i++){const time=first+i*1800,answer=meetingAt(time,duration,list,zones);if(answer.every(r=>r.available))suggestions.push({utc:time,rows:answer});}}
 return {utc,duration,rows,suggestions};
}
