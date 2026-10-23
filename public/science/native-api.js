// Declarative calls to pinned engines. No eval, Function, DOM or network access.
const forbidden=new Set(['constructor','prototype','__proto__','call','apply','bind','deleteLater','isAliasOf']);
export function publicMethods(object){
 const names=new Set();for(let p=object;p&&p!==Object.prototype&&p!==Function.prototype;p=Object.getPrototypeOf(p))for(const name of Object.getOwnPropertyNames(p))if(!forbidden.has(name)&&!name.startsWith('_')&&typeof Object.getOwnPropertyDescriptor(p,name)?.value==='function')names.add(name);
 return [...names].sort();
}
export function encodeValue(value,seen=new Set()){
 if(value===undefined)return null;if(value===null||typeof value!=='object')return typeof value==='bigint'?String(value):value;
 if(value instanceof Date)return value.toISOString();if(ArrayBuffer.isView(value))return Array.from(value);if(value instanceof ArrayBuffer)return Array.from(new Uint8Array(value));
 if(seen.has(value))return '[循环引用]';seen.add(value);
 let result;if(Array.isArray(value))result=value.map(v=>encodeValue(v,seen));else {result={};for(const key of Object.keys(value))if(!forbidden.has(key)&&!key.startsWith('$')&&!key.startsWith('_')&&typeof value[key]!=='function')result[key]=encodeValue(value[key],seen);}
 seen.delete(value);return result;
}
export async function runNativeProgram(library,program,{constructors=[],objects={}}={}){
 if(!Array.isArray(program)||program.length>128)throw Error('原生工作表须为最多 128 条指令的 JSON 数组。');
 const refs=new Map(Object.entries(objects)),allocated=new Set(),results=[];
 const decode=value=>{
  if(Array.isArray(value))return value.map(decode);
  if(value&&typeof value==='object'){
   if(Object.keys(value).length===1&&Object.hasOwn(value,'ref')){if(!refs.has(value.ref))throw Error('未知对象引用：'+value.ref);return refs.get(value.ref);}
   if(Object.keys(value).length===1&&Object.hasOwn(value,'date')){const d=new Date(value.date);if(!Number.isFinite(+d))throw Error('无效日期');return d;}
   if(Object.keys(value).length===1&&Object.hasOwn(value,'bytes')){if(!Array.isArray(value.bytes)||value.bytes.some(x=>!Number.isInteger(x)||x<0||x>255))throw Error('字节应为 0–255 的整数数组。');return Uint8Array.from(value.bytes);}
   const out={};for(const [k,v]of Object.entries(value)){if(forbidden.has(k))throw Error('无效属性');out[k]=decode(v);}return out;
  }return value;
 };
 try{
  for(const step of program){
   if(!step||typeof step!=='object'||Array.isArray(step))throw Error('无效指令');
   const target=step.on===undefined?library:refs.get(step.on);if(!target)throw Error('目标对象不存在：'+step.on);
   const name=step.call||step.new;if(typeof name!=='string'||forbidden.has(name)||name.startsWith('_'))throw Error('无效原生方法名');
   const args=decode(step.args||[]);if(!Array.isArray(args))throw Error('args 须为数组');
   let result;
   if(step.new){if(target!==library||!constructors.includes(name))throw Error('此类型不能直接构造，请使用上游工厂函数');result=new target[name](...args);}
   else {if(!publicMethods(target).includes(name))throw Error('该对象没有公开方法：'+name);result=await target[name](...args);}
   if(result&&typeof result.delete==='function')allocated.add(result);
   if(step.id){if(typeof step.id!=='string'||refs.has(step.id)||forbidden.has(step.id))throw Error('对象名无效或重复');refs.set(step.id,result);}
   const methods=result&&typeof result==='object'?publicMethods(result):[];
   results.push({id:step.id||null,method:name,value:methods.length?{data:encodeValue(result),methods}:encodeValue(result)});
  }
  const text=JSON.stringify(results,null,2);if(new TextEncoder().encode(text).length>16*1024*1024)throw Error('完整结果超过 16 MB；请缩小工作表。');
  return {title:'原生工作表结果',rows:[['完整结果',text]]};
 }finally{for(const value of [...allocated].reverse())try{if(!value.isDeleted?.())value.delete();}catch{/* Worker lifetime also owns all WASM memory. */}}
}

export function rdkitReport(R,input,query=''){
 let mol,q;try{
  mol=R.get_mol(input);if(!mol||!mol.is_valid())throw Error('无法解析分子结构');if(mol.get_num_atoms()>5000)throw Error('单个分子最多 5000 个显式原子');
  const fields={版本:R.version(),规范SMILES:mol.get_smiles(),CXSMILES:mol.get_cxsmiles(),SMARTS:mol.get_smarts(),InChI:mol.get_inchi(),Molblock:mol.get_molblock(),V3000:mol.get_v3Kmolblock(),原始JSON:JSON.parse(mol.get_json()),全部描述符:JSON.parse(mol.get_descriptors()),立体化学:JSON.parse(mol.get_stereo_tags()),芳香形式:mol.get_aromatic_form(),Kekule形式:mol.get_kekule_form()};
  for(const [label,method]of [['Morgan','get_morgan_fp'],['Pattern','get_pattern_fp'],['RDKit','get_rdkit_fp'],['MACCS','get_maccs_fp'],['AtomPair','get_atom_pair_fp'],['TopologicalTorsion','get_topological_torsion_fp']])fields[label+'指纹']=mol[method]();
  let svg=mol.get_svg(640,400);
  if(query.trim()){q=R.get_qmol(query.trim());if(!q)throw Error('无法解析 SMARTS 查询');const matches=JSON.parse(mol.get_substruct_matches(q));fields.子结构匹配=matches;const atoms=[...new Set(matches.flatMap(x=>x.atoms||[]))],bonds=[...new Set(matches.flatMap(x=>x.bonds||[]))];svg=mol.get_svg_with_highlights(JSON.stringify({width:640,height:400,atoms,bonds}));}
  return {title:'RDKit 完整结构与描述符',rows:Object.entries(fields).map(([key,value])=>[key,typeof value==='object'?JSON.stringify(value,null,2):String(value)]),svg};
 }finally{q?.delete();mol?.delete();}
}

// The player form asks for identification and an inspectable structure, rather
// than drug-design descriptors or arbitrary calls into WASM objects.
export function rdkitClue(R,input){
 let mol;try{
  mol=R.get_mol(input);if(!mol||!mol.is_valid())throw Error('无法解析分子结构');if(mol.get_num_atoms()>5000)throw Error('单个分子最多 5000 个显式原子');
  const descriptors=JSON.parse(mol.get_descriptors());
  return {title:'分子结构观察',rows:[['规范 SMILES',mol.get_smiles()],['显式原子数',String(mol.get_num_atoms())],['键数',String(mol.get_num_bonds())],['相对分子质量',String(descriptors.amw)],['InChI',mol.get_inchi()]],svg:mol.get_svg(640,400),note:'显式原子数不含结构式中省略的氢；需要按元素计数时，请使用分子式与原子计数。'};
 }finally{mol?.delete();}
}
