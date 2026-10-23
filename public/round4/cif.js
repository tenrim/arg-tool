// Restricted CIF 1.x reader. No eval, external resources, or inferred symmetry.
export function parseCIF(text) {
 if(typeof text!=='string'||new TextEncoder().encode(text).length>1024*1024)throw Error('CIF 最多 1 MB。');
 const tokens=[];let i=0;
 while(i<text.length){
  if(/\s/.test(text[i])){i++;continue;}
  if(text[i]==='#'){while(i<text.length&&text[i]!=='\n')i++;continue;}
  if(text[i]===';'&&(i===0||text[i-1]==='\n')){let end=text.indexOf('\n;',i+1);if(end<0)throw Error('CIF 多行文本未结束。');tokens.push({v:text.slice(i+1,end).trim(),quoted:true});i=end+2;continue;}
  if(text[i]==="'"||text[i]==='"'){const q=text[i++],start=i;while(i<text.length&&!(text[i]===q&&(i+1===text.length||/\s/.test(text[i+1]))))i++;if(i===text.length)throw Error('CIF 引号未结束。');tokens.push({v:text.slice(start,i++),quoted:true});}
  else{const start=i;while(i<text.length&&!/\s/.test(text[i]))i++;tokens.push({v:text.slice(start,i),quoted:false});}
  if(tokens.length>100000)throw Error('CIF 内容过多。');
 }
 const tags=Object.create(null),loops=[];let blocks=0;
 const control=t=>t&&!t.quoted&&(/^(?:loop_|stop_|data_|save_|global_)/i.test(t.v)||t.v.startsWith('_'));
 for(let p=0;p<tokens.length;){const t=tokens[p++],v=t.v.toLowerCase();
  if(!t.quoted&&v.startsWith('data_')){if(++blocks>1)throw Error('一次仅支持一个 CIF 数据块，请拆分后读取。');continue;}
  if(!t.quoted&&/^(save_|global_)/.test(v))throw Error('不支持 CIF 字典或保存帧。');
  if(v==='loop_'&&!t.quoted){const keys=[];while(tokens[p]&&!tokens[p].quoted&&tokens[p].v.startsWith('_'))keys.push(tokens[p++].v.toLowerCase());if(!keys.length)throw Error('CIF 循环缺少列名。');const values=[];while(p<tokens.length&&!control(tokens[p]))values.push(tokens[p++].v);if(values.length%keys.length)throw Error('CIF 循环行的列数不一致。');const rows=[];for(let j=0;j<values.length;j+=keys.length)rows.push(values.slice(j,j+keys.length));loops.push({keys,rows});if(tokens[p]?.v.toLowerCase()==='stop_')p++;}
  else if(!t.quoted&&v.startsWith('_')){if(!tokens[p]||control(tokens[p]))throw Error('CIF 字段缺少值：'+v);tags[v]=tokens[p++].v;}
 }
 const numeric=v=>{if(v===undefined||!/^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:\(\d+\))?(?:[eE][-+]?\d+)?$/.test(v))throw Error('CIF 数值缺失或格式不支持。');return Number(v.replace(/\(\d+\)/,''));};
 const cell=['a','b','c'].map(k=>numeric(tags['_cell_length_'+k]));const angles=['alpha','beta','gamma'].map(k=>numeric(tags['_cell_angle_'+k]));
 if(cell.some(n=>!Number.isFinite(n)||n<=0||n>1000)||angles.some(n=>!Number.isFinite(n)||n<=0||n>=180))throw Error('晶胞长度或角度无效。');
 const atomLoop=loops.find(l=>l.keys.includes('_atom_site_fract_x'));
 if(!atomLoop||atomLoop.rows.length>500)throw Error('需要分数坐标，且最多 500 个独立原子位点。');
 const atoms=atomLoop.rows.map(r=>{const get=k=>r[atomLoop.keys.indexOf(k)],raw=get('_atom_site_type_symbol')||get('_atom_site_label')||'',match=raw.match(/^([A-Z][a-z]?)/);if(!match)throw Error('无法识别 CIF 元素符号。');const xyz=['x','y','z'].map(k=>numeric(get('_atom_site_fract_'+k)));if(xyz.some(n=>!Number.isFinite(n)||Math.abs(n)>100))throw Error('原子坐标超出支持范围。');const occ=get('_atom_site_occupancy'),occupancy=occ===undefined?1:numeric(occ);if(occupancy<0||occupancy>1)throw Error('占位率须在 0–1 之间。');return{element:match[1],xyz,occupancy};});
 const key=['_space_group_symop_operation_xyz','_symmetry_equiv_pos_as_xyz'];let ops=[];
 for(const l of loops)for(const k of key)if(l.keys.includes(k))ops=l.rows.map(r=>r[l.keys.indexOf(k)]);
 if(!ops.length)ops=key.map(k=>tags[k]).filter(Boolean);
 const group=tags['_space_group_name_h-m_alt']||tags['_symmetry_space_group_name_h-m']||'';
 if(!ops.length){if(group.replace(/\s/g,'').toUpperCase()==='P1'||tags['_space_group_it_number']==='1')ops=['x,y,z'];else throw Error('CIF 未提供对称操作；仅 P1 可省略。');}
 if(ops.length>192)throw Error('对称操作超过 192 项。');
 const symmetry=ops.map(parseSymmetry);const citation=[tags['_publ_section_title'],tags['_journal_name_full'],tags['_journal_year']].filter(Boolean).join(' · ');
 return{cell,angles,atoms,symmetry,group,title:tags['_chemical_name_mineral']||tags['_chemical_name_common']||'本机晶体',formula:tags['_chemical_formula_sum']||'未提供',citation};
}
export function parseSymmetry(operation){
 return operation.toLowerCase().replace(/\s/g,'').split(',').map(expr=>{
  if(!expr||!/^[-+xyz0-9/.]+$/.test(expr))throw Error('不支持的晶体对称表达式。');
  const terms=expr.match(/[+-]?[^+-]+/g)||[];if(terms.join('')!==expr)throw Error('无效对称表达式。');const result=[0,0,0,0];
  for(const term of terms){const sign=term[0]==='-'?-1:1,s=term.replace(/^[+-]/,'');if(/^[xyz]$/.test(s))result['xyz'.indexOf(s)]+=sign;else{if(!/^\d+(?:\.\d+)?(?:\/\d+)?$/.test(s))throw Error('仅支持线性晶体对称操作。');const [n,d='1']=s.split('/');if(!Number(d))throw Error('对称操作分母不能为零。');result[3]+=sign*Number(n)/Number(d);}}
  if(result.some(n=>!Number.isFinite(n)||Math.abs(n)>12))throw Error('对称操作系数无效。');return result;
 }).map((r,i,a)=>{if(a.length!==3)throw Error('对称操作需要三维坐标。');return r;});
}
export function expandCrystal(crystal,repeat=1){
 if(![1,2,3].includes(Number(repeat)))throw Error('晶胞重复次数为 1、2 或 3。');repeat=Number(repeat);
 const [a,b,c]=crystal.cell,[alpha,beta,gamma]=crystal.angles.map(v=>v*Math.PI/180),cg=Math.cos(gamma),sg=Math.sin(gamma),cx=c*Math.cos(beta),cy=c*(Math.cos(alpha)-Math.cos(beta)*cg)/sg,cz2=c*c-cx*cx-cy*cy;
 if(!Number.isFinite(cz2)||cz2<=1e-10||Math.abs(sg)<1e-8)throw Error('晶胞角度不能构成有效三维晶格。');
 const basis=[[a,0,0],[b*cg,b*sg,0],[cx,cy,Math.sqrt(cz2)]];
 const cart=v=>[0,1,2].map(k=>v.reduce((sum,x,j)=>sum+x*basis[j][k],0));
 const unique=new Map();
 for(const atom of crystal.atoms){if(atom.occupancy===0)continue;for(const op of crystal.symmetry){const xyz=op.map(r=>{const value=r[3]+atom.xyz.reduce((s,n,j)=>s+n*r[j],0);return ((value%1)+1)%1;}).map(x=>Math.abs(x-1)<1e-7?0:x);const key=atom.element+':'+xyz.map(v=>Math.round(v*1e6)).join(',');if(!unique.has(key))unique.set(key,{...atom,xyz});}}
 if(unique.size*repeat**3>2000)throw Error('展开后超过 2,000 个原子，请减少晶胞重复次数。');
 const atoms=[];for(let x=0;x<repeat;x++)for(let y=0;y<repeat;y++)for(let z=0;z<repeat;z++)for(const atom of unique.values())atoms.push({element:atom.element,occupancy:atom.occupancy,position:cart(atom.xyz.map((v,i)=>v+[x,y,z][i]))});
 if(!atoms.length)throw Error('晶体没有可显示的原子。');
 const corners=[];for(let x=0;x<2;x++)for(let y=0;y<2;y++)for(let z=0;z<2;z++)corners.push(cart([x*repeat,y*repeat,z*repeat]));
 return{title:crystal.title,formula:crystal.formula,cell:crystal.cell,angles:crystal.angles,group:crystal.group,citation:crystal.citation,atoms,corners,repeat,sites:crystal.atoms.length,unitAtoms:unique.size};
}
