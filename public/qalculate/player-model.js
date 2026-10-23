import {translate} from './model.js';

const categoryNames={Mass:'质量',Force:'力',Information:'数据容量',Typography:'印刷尺寸','Molar Flux':'摩尔通量','Acceleration Change':'加速度变化率'};
const common=['Length','Area','Volume','Mass','Time','Temperature','Speed','Angle/Plane Angle','Information','Time/Frequency','Energy','Energy/Power','Force/Pressure'];
const volume=new Set(['Volume','Volume/Cooking','Volume/Imperial Capacity','Volume/U.S. Capacity']);
export function unitGroups(catalogue,definitions,translations={}){
 const groups=new Map();
 for(const unit of catalogue.units){
  const expression=definitions.notation[unit.name]||(unit.currency&&/^[A-Z]{3}$/.test(unit.name)?unit.name:null);
  if(!expression)throw Error('缺少可执行的单位定义：'+unit.name);
  const category=volume.has(unit.category)?'Volume':unit.category;
  if(!groups.has(category))groups.set(category,{id:category,label:category.split('/').map(p=>categoryNames[p]||translate(p,translations)).join(' / '),units:[]});
  groups.get(category).units.push({...unit,expression,label:translate(unit.title,translations)||unit.title});
 }
 return [...groups.values()].sort((a,b)=>{const rank=g=>common.includes(g.id)?common.indexOf(g.id):common.length;return rank(a)-rank(b)||a.label.localeCompare(b.label,'zh-Hans');});
}
export function findUnit(groups,value){const clean=s=>String(s).replace(/[()\s]/g,'');return groups.flatMap(g=>g.units).find(u=>u.name===value||clean(u.expression)===clean(value)||u.aliases.includes(value));}
export function calculatorInsertion(source,start,end,token){
 const selected=source.slice(start,end);
 let text=token;
 if(token==='±')text=selected?'-('+selected+')':source?'-('+source+')':'-';
 else if(token==='x²')text=selected?'('+selected+')^2':'^2';
 else if(token==='1/x')text=selected?'1/('+selected+')':'1/(';
 else if(token.endsWith('(')&&selected)text=token+selected+')';
 if(token==='±'&&!selected)return {text,caret:text.length};
 const result=source.slice(0,start)+text+source.slice(end);
 return {text:result,caret:start+text.length};
}
export function memoryExpression(memory,value,action){
 if(!value)throw Error('请先完成一次计算。');
 if(action==='store')return value;
 if(!memory)return action==='subtract'?'-('+value+')':value;
 return '('+memory+')'+(action==='subtract'?'-':'+')+'('+value+')';
}
// Live conversions accept numbers only. Definitions and arbitrary expressions
// remain in the explicit calculator, so a warm units worker has no draft state.
export function unitAmount(input){
 const value=String(input).trim().replace(/−/g,'-');
 if(/^[+-]?(?:\.?|(?:\d+(?:\.\d*)?|\.\d+)[eE][+-]?)$/.test(value))return null;
 if(value.length>1000||!(/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/).test(value))throw Error('请输入数值，可使用小数或科学计数法。');
 if(value.includes('e')||value.includes('E'))if(Math.abs(Number(value.split(/[eE]/)[1]))>10000)throw Error('科学计数法的指数需在 −10000 至 10000 之间。');
 return value;
}
