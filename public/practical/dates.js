// Gregorian civil dates; never use the computer's local timezone for day maths.
const DAY=86400000;
export const leap=year=>year%4===0&&(year%100!==0||year%400===0);
export const daysInMonth=(y,m)=>[31,leap(y)?29:28,31,30,31,30,31,31,30,31,30,31][m-1];
const pad=n=>String(n).padStart(2,'0');
function stamp(y,m,d){const date=new Date(0);date.setUTCFullYear(y,m-1,d);date.setUTCHours(0,0,0,0);return date.getTime();}
export function civil(value){
 const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value));if(!m)throw Error('请填写完整日期。');
 const [y,mo,d]=m.slice(1).map(Number);if(y<1||y>9999||mo<1||mo>12||d<1||d>daysInMonth(y,mo))throw Error('日期不存在；年份须为 0001 至 9999。');
 return {y,m:mo,d,ms:stamp(y,mo,d)};
}
export function dateText(ms){const d=new Date(ms),y=d.getUTCFullYear();if(y<1||y>9999)throw Error('计算结果超出 0001 至 9999 年。');return String(y).padStart(4,'0')+'-'+pad(d.getUTCMonth()+1)+'-'+pad(d.getUTCDate());}
export const dayOfWeek=ms=>(new Date(ms).getUTCDay()+6)%7+1;
export function integer(value,label,min=-10000000,max=10000000){const n=Number(value);if(String(value).trim()===''||!Number.isSafeInteger(n)||n<min||n>max)throw Error(label+'须为 '+min+' 至 '+max+' 的整数。');return n;}
export function shiftDate(value,{years=0,months=0,weeks=0,days=0}={}){
 const a=civil(value);years=integer(years,'年数',-9998,9998);months=integer(months,'月数',-119987,119987);weeks=integer(weeks,'周数');days=integer(days,'天数');
 const target=(a.y-1+years)*12+a.m-1+months,y=Math.floor(target/12)+1,m=(target%12+12)%12+1;
 if(y<1||y>9999)throw Error('计算结果超出 0001 至 9999 年。');const d=Math.min(a.d,daysInMonth(y,m));
 return {date:dateText(stamp(y,m,d)+(weeks*7+days)*DAY),clamped:d!==a.d};
}
function workdays(start,count){let result=Math.floor(count/7)*5;for(let i=0;i<count%7;i++)if(dayOfWeek(start+i*DAY)<=5)result++;return result;}
export function dateDifference(start,end,inclusive=false){
 const a=civil(start),b=civil(end),signed=(b.ms-a.ms)/DAY,n=Math.abs(signed),first=Math.min(a.ms,b.ms),count=n+(inclusive?1:0);
 // Calendar span: complete clamped months, followed by remaining civil days.
 const lo=civil(dateText(first)),hi=civil(dateText(Math.max(a.ms,b.ms)));let months=(hi.y-lo.y)*12+hi.m-lo.m;
 if(civil(shiftDate(dateText(first),{months}).date).ms>hi.ms)months--;
 const anchor=civil(shiftDate(dateText(first),{months}).date).ms;
 return {signedDays:signed,days:count,weeks:Math.floor(count/7),remainingDays:count%7,weekdays:workdays(first,count),years:Math.floor(months/12),months:months%12,calendarDays:(hi.ms-anchor)/DAY,inclusive};
}
export function ageAt(birth,at,leapBirthday='feb28'){
 const a=civil(birth),b=civil(at);if(b.ms<a.ms)throw Error('参考日期不能早于出生日期。');if(!['feb28','mar1'].includes(leapBirthday))throw Error('请选择闰日生日规则。');
 const birthday=y=>a.m===2&&a.d===29&&!leap(y)?String(y).padStart(4,'0')+(leapBirthday==='mar1'?'-03-01':'-02-28'):String(y).padStart(4,'0')+'-'+pad(a.m)+'-'+pad(a.d);
 let years=b.y-a.y;if(b.ms<civil(birthday(b.y)).ms)years--;
 const thisBirthday=birthday(b.y),next=b.ms<=civil(thisBirthday).ms?thisBirthday:b.y<9999?birthday(b.y+1):null;
 const span=dateDifference(birth,at);return {...span,age:years,birthday:next,until:next?(civil(next).ms-b.ms)/DAY:null,isBirthday:next===at};
}
export function isoWeek(value){
 const a=civil(value),weekday=dayOfWeek(a.ms),thursday=a.ms+(4-weekday)*DAY,year=new Date(thursday).getUTCFullYear();
 const jan4=stamp(year,1,4),monday=jan4-(dayOfWeek(jan4)-1)*DAY,week=Math.floor((a.ms-monday)/DAY/7)+1;
 const first=a.ms-(weekday-1)*DAY,last=first+6*DAY;
 return {year,week,weekday,iso:String(year).padStart(4,'0')+'-W'+pad(week)+'-'+weekday,monday:dateText(first),sunday:last>civil('9999-12-31').ms?'超出 9999 年':dateText(last),ordinal:Math.floor((a.ms-stamp(a.y,1,1))/DAY)+1,yearDays:leap(a.y)?366:365};
}
export function fromISOWeek(year,week,weekday=1){
 year=integer(year,'周所属年',1,9999);week=integer(week,'周数',1,53);weekday=integer(weekday,'星期',1,7);
 const jan4=stamp(year,1,4),ms=jan4-(dayOfWeek(jan4)-1)*DAY+((week-1)*7+weekday-1)*DAY,value=dateText(ms);
 const actual=isoWeek(value);if(actual.year!==year||actual.week!==week)throw Error('该周所属年没有第 53 周。');return value;
}
export function countdown(target,now=Date.now()){
 if(!Number.isFinite(target)||!Number.isFinite(now))throw Error('目标时刻无效。');const diff=target-now,n=Math.floor(Math.abs(diff)/1000);
 return {remaining:diff>0,complete:diff===0,totalSeconds:Math.trunc(diff/1000)||0,days:Math.floor(n/86400),hours:Math.floor(n%86400/3600),minutes:Math.floor(n%3600/60),seconds:n%60};
}
