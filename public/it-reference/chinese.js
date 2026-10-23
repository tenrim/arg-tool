import {MDN_ZH} from '../vendor/reference-mdn-zh/data.js';

// Pure additive view: original identifiers, registration fields and record counts survive.
export function withChineseIT(data){
 if(!['http','formats','ports'].includes(data.kind))return data;
 let covered=0;
 const records=data.records.map(record=>{
  const key=record.id.startsWith('header:')?record.id.slice(7):record.id.startsWith('mime:')?record.id.slice(5):null;
  const description=key?(record.id.startsWith('header:')?MDN_ZH.headers[key]:MDN_ZH.mime[key]?.join('；')):null;
  if(!description)return record;
  covered++;
  return {...record,summary:description,fields:[...record.fields,{label:'原有中文说明',value:record.summary},{label:'MDN 中文说明（CC-BY-SA-2.5）',value:description},{label:'中文说明来源',value:record.id.startsWith('header:')?'https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Reference/Headers':'https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Guides/MIME_types/Common_types'}]};
 });
 const notice=data.kind==='ports'?'服务名、协议名称及登记描述以 IANA 原文为准；仅部分常用项已有中文说明，尚未找到可完整批量对应的中文注册表。':`中文补充：按标准标识自动对应 MDN 中文参考的 ${covered} 项；未对应的字段、类型及字符集保留来源原文，现有中文说明仍保留。这不是完整中文译库。`;
 return {...data,records,meta:{...data.meta,scope:data.meta.scope+' '+notice,chineseCoverage:covered}};
}
