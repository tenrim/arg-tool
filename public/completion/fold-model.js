// FOLD validation preserves all unrecognized extension and metadata fields.
export function selectFoldFrame(value,index=0){
 if(!value||typeof value!=='object'||Array.isArray(value))throw Error('FOLD 须为 JSON 对象。');
 const frames=[value,...value.file_frames||[]];if(!Number.isInteger(index)||index<0||index>=frames.length)throw Error('FOLD 帧编号超出范围。');
 const seen=new Set();function frame(n){if(seen.has(n))throw Error('FOLD 帧继承存在循环。');seen.add(n);const current=frames[n];if(!current||typeof current!=='object')throw Error('FOLD 帧格式错误。');if(current.frame_inherit){const parent=current.frame_parent??0;if(!Number.isInteger(parent)||parent<0||parent>=frames.length)throw Error('FOLD 父帧不存在。');return {...frame(parent),...structuredClone(current)};}return structuredClone(current);}
 return frame(index);
}
export function validateFold(value,{deriveFaces}={}){
 if(!value||typeof value!=='object'||Array.isArray(value))throw Error('FOLD 须为 JSON 对象。');
 const fold=structuredClone(value),v=fold.vertices_coords,e=fold.edges_vertices;
 if(!Array.isArray(v)||v.length<3||v.length>50000||v.some(p=>!Array.isArray(p)||![2,3].includes(p.length)||p.some(n=>!Number.isFinite(n))))throw Error('顶点需要 2D／3D 有限坐标，最多 5 万点。');
 const validIndex=n=>Number.isInteger(n)&&n>=0&&n<v.length;
 if(!Array.isArray(e)||e.some(p=>!Array.isArray(p)||p.length!==2||p[0]===p[1]||!p.every(validIndex)))throw Error('边引用无效。');
 if(!fold.faces_vertices&&deriveFaces){if(v.some(p=>p.length!==2))throw Error('三维 FOLD 需提供面拓扑；不能从投影猜测。');deriveFaces(fold);}
 const f=fold.faces_vertices;fold.edges_assignment??=e.map(()=>'U');
 if(!Array.isArray(f)||!f.length||f.some(p=>!Array.isArray(p)||p.length<3||new Set(p).size!==p.length||!p.every(validIndex)))throw Error('面需要至少 3 个不同顶点。');
 if(!Array.isArray(fold.edges_assignment)||fold.edges_assignment.length!==e.length||fold.edges_assignment.some(a=>!['B','M','V','F','U','C'].includes(a)))throw Error('每条边需要 B／M／V／F／U／C 折痕属性。');
 fold.edges_foldAngle??=fold.edges_foldAngles??fold.edges_assignment.map(a=>a==='M'?-180:a==='V'?180:a==='F'?0:null);
 if(fold.edges_foldAngle.length!==e.length||fold.edges_foldAngle.some(a=>a!==null&&(!Number.isFinite(a)||Math.abs(a)>360)))throw Error('折角列表无效。');
 return fold;
}
export function foldSnapshot(original,triangulated,positions){
 if(positions.length!==triangulated.vertices_coords.length*3||Array.from(positions).some(n=>!Number.isFinite(n)))throw Error('模拟结果无效。');
 return {...structuredClone(original),...structuredClone(triangulated),vertices_coords:Array.from({length:positions.length/3},(_,i)=>Array.from(positions.slice(i*3,i*3+3))),frame_classes:['foldedForm'],mist_original:structuredClone(original)};
}
export function foldOBJ(fold){return fold.vertices_coords.map(v=>'v '+v.join(' ')).concat(fold.faces_vertices.map(f=>'f '+f.map(i=>i+1).join(' '))).join('\n');}
export function foldSTL(fold){const out=['solid origami'];for(const face of fold.faces_vertices)for(let i=1;i<face.length-1;i++){const a=fold.vertices_coords[face[0]],b=fold.vertices_coords[face[i]],c=fold.vertices_coords[face[i+1]],u=b.map((x,j)=>x-a[j]),v=c.map((x,j)=>x-a[j]),n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],norm=Math.hypot(...n)||1;out.push('facet normal '+n.map(x=>x/norm).join(' '),'outer loop',... [a,b,c].map(v=>'vertex '+v.join(' ')),'endloop','endfacet');}out.push('endsolid origami');return out.join('\n');}
