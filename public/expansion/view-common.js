import {ToolPanel,ToolHeader,Box,Field,Input,Select,Option,Textarea} from '../ui/index.js';
export function panel(host,id,title,body){const node=ToolPanel({id:'panel-'+id,className:'panel expansion-panel',hidden:true,header:ToolHeader({className:'page-heading',title}),body});host.append(node);return node;}
export function select(id,items,value){const node=Select({id,children:items.map(item=>Option(item.label??item.title??item[1],item.value??item.id??item[0]))});if(value!==undefined)node.value=String(value);return node;}
export function parameter(id,label,value='',type='text',items){const node=type==='select'?select(id,items,value):type==='textarea'?Textarea({id,value,autoSize:true,minRows:3,maxRows:8}):Input({id,type,value});return {node,field:Field({label,control:node})};}
export const pre=text=>Box({tag:'pre',className:'expansion-literal',text});
