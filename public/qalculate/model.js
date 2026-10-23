// The catalogue is a projection of the actual engine, never a function or unit
// allowlist. Translation keys come from the matching upstream Chinese PO file.
export function translate(text,translations={}){
 return translations[text]||(typeof text==='string'?text.split('/').map(part=>translations[part]||part).join(' / '):text);
}
export function catalogueItems(catalogue,kind,query='',category='',translations={}){
 const terms=query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
 return (catalogue?.[kind]||[]).filter(item=>(!category||item.category===category)&&terms.every(term=>
  [item.name,item.title,item.description,item.category,...item.aliases||[],translate(item.title,translations),translate(item.description,translations),translate(item.category,translations)].join(' ').toLocaleLowerCase().includes(term)));
}
export function unitExpression(value,from,to){
 if(!value.trim()||!from.trim()||!to.trim())throw Error('请填写数值、原单位和目标单位。');
 return `(${value}) ${from} to ${to}`;
}
export function reportResult(result){
 return result.values.map(value=>[value.expression,'= '+value.output,...value.messages.map(m=>m.text)].join('\n')).join('\n\n');
}
export function recordJSON(value){
 return JSON.stringify(value,(_key,item)=>{
  if(!(item instanceof Uint8Array))return item;
  const chunks=[];for(let i=0;i<item.length;i+=8192)chunks.push(String.fromCharCode(...item.subarray(i,i+8192)));
  return{encoding:'base64',data:btoa(chunks.join(''))};
 },2);
}
export function validateSession(value){
 if(value?.format!=='mist-qalculate-session'||value.version!==1||typeof value.expression!=='string'||value.definitionDraft!==undefined&&typeof value.definitionDraft!=='string'||!Array.isArray(value.definitions)||value.definitions.some(x=>typeof x!=='string'||x.length>4_000_000)||typeof value.options!=='string'||!value.settings||typeof value.settings!=='object'||Object.values(value.settings).some(x=>typeof x!=='string')||!Array.isArray(value.history)||value.history.some(x=>!x||typeof x.output!=='string'||!Array.isArray(x.expressions)||x.expressions.some(e=>typeof e!=='string')))throw Error('不是受支持的 Qalculate 工作表。');
 return value;
}
