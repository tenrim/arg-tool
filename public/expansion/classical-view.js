import {ConversionWorkbench,DataList} from '../ui/index.js';
import {CLASSICAL_CIPHERS} from './classical-catalog.js';
import {panel,parameter} from './view-common.js';
import {taskSession,startWorkerJob} from './session.js';
export function mountClassical(host){
 const panels=[],sessions={};
 for(const cipher of CLASSICAL_CIPHERS){
  const id='classical-'+cipher.id,fields={};
  const direction=parameter(id+'-direction','方向','encrypt','select',cipher.directions);
  const settings=[direction.field,...cipher.fields.map(f=>{const value=parameter(id+'-'+f.id,f.label,f.default,f.type,f.options);fields[f.id]=value.node;return value.field;})];
  const view=ConversionWorkbench({id,settings});view.input.maxLength=65536;
  panels.push(panel(host,id,cipher.label,view.root));
  sessions[id]=taskSession(view,{id,options:()=>({direction:direction.node.value,...Object.fromEntries(Object.entries(fields).map(([k,node])=>[k,node.value]))}),
   execute:async(input,options,hooks)=>{const value=await startWorkerJob({task:'classical',cipher:cipher.id,input,options},hooks);return {...value,output:value.text,value:{text:value.text},status:value.warnings?.length?value.warnings.join('；'):'转换完成'};},
   render:value=>{if(value.details)view.details.append(DataList({items:Object.entries(value.details).map(([k,v])=>[k,Array.isArray(v)?v.join(' '):v])}));}});
 }
 return {panels,sessions};
}
