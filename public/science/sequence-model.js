export function clueViewerOptions({seq,seqType,frame,start,end,name}){
 const result={showComplement:!['aa','protein'].includes(seqType),showIndex:true,annotations:[],translations:[]};
 if(name.length>200)throw Error('标记名称最多 200 字符。');
 if(name.trim()){
  const a=Number(start),b=end.trim()?Number(end):seq.length;
  if(!Number.isInteger(a)||!Number.isInteger(b)||a<1||b<a||b>seq.length)throw Error('标记位置须在序列范围内，起点从 1 开始，终点不小于起点。');
  result.annotations.push({name:name.trim(),start:a-1,end:b,direction:1});
 }
 if(frame!=='none'){
  if(['aa','protein'].includes(seqType))throw Error('氨基酸序列不再按密码子翻译；请选择不叠加翻译。');
  if(!['1','2','3','-1','-2','-3'].includes(frame))throw Error('无效阅读框');
  const offset=Math.abs(Number(frame))-1,length=Math.floor((seq.length-offset)/3)*3;if(length<=0)throw Error('该阅读框不足一个完整密码子。');
  result.translations.push(Number(frame)>0?{start:offset,end:offset+length,direction:1}:{start:seq.length-offset-length,end:seq.length-offset,direction:-1});
 }
 return result;
}
