import {Box,DataList,Disclosure,EmptyState,Table} from '../ui/index.js';

export function readingSections(reading){
 const sections=reading.sections.map(section=>{const body=Box({tag:'section',className:'online-query-reading-section',children:[
  ...(!section.collapsed?[Box({tag:'h4',text:section.title})]:[]),
  ...(section.fields.length?[DataList({items:section.fields})]:[]),
  ...section.paragraphs.map(text=>Box({tag:'p',className:'online-query-reading-text',text})),
  ...(section.table?[Box({className:'online-query-reading-table',attrs:{role:'region',tabindex:'0','aria-label':section.title+'资料表'},children:Table({columns:section.table.columns,rows:section.table.rows,caption:section.title})})]:[])
 ]});return section.collapsed?Disclosure({attrs:{'data-reading-section':true},children:[Box({tag:'summary',text:section.title}),body]}):body;});
 return Box({className:'online-query-reading',attrs:{'data-query-reading':true},children:[
  ...(sections.length?sections:[EmptyState({text:'该记录暂无摘要，请查看原文。'})]),
  ...(reading.truncated?[Box({tag:'p',text:'内容已节选，完整资料可查看原文或下载。'})]:[])
 ]});
}

