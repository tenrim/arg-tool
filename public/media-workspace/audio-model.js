// PCM views and clip ranges follow the audible preview timeline. No DOM,
// codecs or routing here; the audio controller owns the decoded source.
export function audioClip(channels,rate,start,end,reversed=false){
 const length=channels[0]?.length||0,duration=length/rate;
 if(!Number.isFinite(start)||!Number.isFinite(end)||start<0||end<=start||end>duration+.01)throw Error('片段范围必须在音频时长内，且终点晚于起点。');
 const first=Math.round(start*rate),last=Math.min(length,Math.round(end*rate));
 if(last<=first)throw Error('片段过短，请至少选择一个采样点。');
 return channels.map(channel=>reversed?channel.slice(length-last,length-first).reverse():channel.slice(first,last));
}
