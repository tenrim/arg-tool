import {Field,FormGrid,Input,Option,Select} from '../ui/index.js';

// Stateless view construction and text formatting only. Pickers can reuse
// these helpers without importing calculation or result-recording lifetimes.
export const today=()=>{const d=new Date();return `${String(d.getFullYear()).padStart(4,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
export const input=(id,value,type='number',attrs={})=>Input({id,value:String(value),type,attrs:{...type==='number'?{step:'any'}:{},...attrs}});
export const choose=(id,items)=>Select({id,children:items.map(([v,t])=>Option(t,v))});
export const field=(label,control)=>Field({label,control});
export const grid=(children,options={})=>FormGrid({...options,children});
export const textRows=rows=>rows.map(([a,b])=>a+'：'+b).join('\n');
