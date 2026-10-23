import {compare} from '../vendor/expansion/hunt/stroke-matching.js';
export function normalizeEndpoints(points){
 if(!Array.isArray(points)||points.length<2||points.length>96||points.length%2||points.some(p=>!Number.isFinite(p.x)||!Number.isFinite(p.y)))throw Error('每笔需要首尾两个点，支持1–48笔。');
 const xs=points.map(p=>p.x),ys=points.map(p=>p.y),left=Math.min(...xs),right=Math.max(...xs),top=Math.min(...ys),bottom=Math.max(...ys);
 if(right===left&&bottom===top)throw Error('首尾点不能全部重合。');
 return points.map(p=>({x:right===left?499.5:(p.x-left)*999/(right-left),y:bottom===top?499.5:(p.y-top)*999/(bottom-top)}));
}
export function matchStrokeEndpoints(points,data,{limit=10000}={}){
 const normalized=normalizeEndpoints(points);if(!Number.isInteger(limit)||limit<1||limit>10000)throw Error('候选数应为1–10000。');
 const rows=[];for(const [char,strokes]of Object.entries(data)){if(strokes.length*2!==points.length)continue;const target=strokes.flatMap(code=>{const tail=code%1000000,head=Math.floor(code/1000000);return[{x:Math.floor(head/1000),y:head%1000},{x:Math.floor(tail/1000),y:tail%1000}];});const match=compare(normalized,target);rows.push({char,score:match.score,matched:match.match.matched?.slice(1)});}
 rows.sort((a,b)=>b.score-a.score||a.char.localeCompare(b.char,'zh'));return{total:rows.length,rows:rows.slice(0,limit),points:normalized};
}
