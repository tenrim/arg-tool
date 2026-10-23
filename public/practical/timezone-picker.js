import {Box,Option,Select,SearchField} from '../ui/index.js';
import {input,field} from './view-helpers.js';
import {normalizeChineseSearch} from '../reference/chinese-search.js';
export function zonePicker(id,initial='Asia/Shanghai'){
 const search=input(id+'-search','','search',{placeholder:'搜索城市、国家或 IANA 时区'}),select=Select({id,children:[Option(initial,initial)]});let items=[];
 function filter(){if(!items.length)return;const selected=select.value||initial,term=normalizeChineseSearch(search.value).trim();const options=items.filter(z=>z.id===selected||normalizeChineseSearch([z.id,z.canonical,z.chineseName,...z.countryNames,...z.chineseAliases].join(' ')).includes(term));select.replaceChildren(...options.map(z=>Option((z.chineseName?z.chineseName+' · ':'')+z.id,z.id)));select.value=selected;}
 search.oninput=filter;return {node:Box({children:[SearchField({label:'查找城市或时区',control:search}),field('时区',select)]}),select,load(list){items=list;filter();}};
}
