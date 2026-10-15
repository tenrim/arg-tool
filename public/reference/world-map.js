import {element as uiElement} from '../ui/index.js';
import {projectPoint} from './visual-core.js';
const ns='http://www.w3.org/2000/svg';
const svgNode=(tag,attrs={})=>{const n=document.createElementNS(ns,tag);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,v);return n;};
const node=uiElement;
export function worldMap(host,features,countries,onCountry,onPoint){
 const names=new Map(countries.map(c=>[c.id,c.name])),toolbar=node('div',undefined,'ref-visual-toolbar');
 const svg=svgNode('svg',{viewBox:'0 0 1000 500',class:'ref-world',role:'group','aria-label':'可点击的国家地区世界地图'});
 const land=svgNode('g'),points=svgNode('g'),label=node('p','世界地图','ref-note ref-map-label');
 let view=[0,0,1000,500],zoom=1,selected='',pan=null,pinch=null,suppress=false;
 const pointers=new Map(),paths=[];
 const apply=()=>{svg.setAttribute('viewBox',view.join(' '));svg.style.touchAction=zoom>1?'none':'pan-y';toolbar.querySelector('[data-map-zoom]').textContent=Math.round(zoom*100)+'%';};
 const clamp=()=>{view[0]=Math.max(0,Math.min(1000-view[2],view[0]));view[1]=Math.max(0,Math.min(500-view[3],view[1]));};
 function scale(factor,anchor=[.5,.5]){const next=Math.max(1,Math.min(12,zoom*factor)),w=1000/next,h=500/next;view=[view[0]+(view[2]-w)*anchor[0],view[1]+(view[3]-h)*anchor[1],w,h];zoom=next;clamp();apply();}
 for(const [text,action,aria]of [['＋',()=>scale(1.6),'放大地图'],['−',()=>scale(1/1.6),'缩小地图'],['复位',()=>{zoom=1;view=[0,0,1000,500];apply();},'复位世界地图']]){const b=node('button',text,'secondary-button');b.type='button';b.setAttribute('aria-label',aria);b.onclick=action;toolbar.append(b);}
 const percent=node('span','100%');percent.dataset.mapZoom='';toolbar.append(percent);host.append(toolbar,svg,label);
 const grid=svgNode('g',{class:'ref-graticule','aria-hidden':'true'});
 for(let lon=-120;lon<=120;lon+=60){const x=projectPoint(lon,0)[0];grid.append(svgNode('path',{d:`M${x} 0V500`}));}
 for(let lat=-60;lat<=60;lat+=30){const y=projectPoint(0,lat)[1];grid.append(svgNode('path',{d:`M0 ${y}H1000`}));}
 svg.append(grid,land,points);
 for(const feature of features){const name=names.get(feature.id)||feature.name,p=svgNode('path',{d:feature.path,'fill-rule':'evenodd',class:'ref-country','data-country':feature.id,'vector-effect':'non-scaling-stroke'}),title=svgNode('title');title.textContent=name;p.append(title);
  if(names.has(feature.id)){p.setAttribute('tabindex','0');p.setAttribute('role','button');p.setAttribute('aria-label',name+' · '+feature.id);p.setAttribute('aria-pressed','false');const choose=()=>{if(suppress)return;select(feature.id);onCountry(feature.id);};p.onclick=choose;p.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select(feature.id);onCountry(feature.id);}};p.onfocus=p.onpointerenter=()=>label.textContent=name+' · '+feature.id;}
  else p.classList.add('ref-map-unlisted');land.append(p);paths.push(p);
 }
 function select(code){selected=code;for(const p of paths){const active=!!code&&p.dataset.country===code;p.classList.toggle('is-selected',active);if(p.hasAttribute('aria-pressed'))p.setAttribute('aria-pressed',String(active));}label.textContent=code?(names.get(code)||code)+' · '+code:'世界地图';}
 svg.addEventListener('wheel',e=>{if(!e.ctrlKey)return;e.preventDefault();const r=svg.getBoundingClientRect();scale(Math.exp(-e.deltaY*.002),[(e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height]);},{passive:false});
 const distance=()=>{const a=[...pointers.values()];return Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);};
 svg.onpointerdown=e=>{suppress=false;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(zoom<=1&&e.pointerType==='touch')return;e.target.setPointerCapture?.(e.pointerId);pan={x:e.clientX,y:e.clientY,view:[...view]};if(pointers.size===2)pinch={distance:distance(),zoom,view:[...view]};};
 svg.onpointermove=e=>{if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pinch&&pointers.size===2){const target=pinch.zoom*distance()/Math.max(1,pinch.distance);scale(target/zoom);suppress=true;return;}if(!pan||zoom<=1)return;const dx=e.clientX-pan.x,dy=e.clientY-pan.y;if(Math.hypot(dx,dy)>6)suppress=true;const box=svg.getBoundingClientRect();view[0]=pan.view[0]-dx*view[2]/box.width;view[1]=pan.view[1]-dy*view[3]/box.height;clamp();apply();};
 const release=e=>{pointers.delete(e.pointerId);pan=null;pinch=null;if(e.target.hasPointerCapture?.(e.pointerId))e.target.releasePointerCapture(e.pointerId);};svg.onpointerup=release;svg.onpointercancel=release;
 function setPoints(records){points.replaceChildren();for(const r of records){if(!r.point)continue;const xy=projectPoint(...r.point);if(!xy)continue;const g=svgNode('g',{role:'button',tabindex:'0','aria-label':r.title,class:'ref-map-point','data-record':r.id}),c=svgNode('circle',{cx:xy[0],cy:xy[1],r:5,'vector-effect':'non-scaling-stroke'}),hit=svgNode('circle',{cx:xy[0],cy:xy[1],r:10,class:'ref-point-hit'}),t=svgNode('title');t.textContent=r.title;g.append(hit,c,t);const choose=()=>{if(!suppress)onPoint(r);};g.onclick=choose;g.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onPoint(r);}};points.append(g);}}
 function focusCountry(code){select(code);const countryPaths=paths.filter(p=>p.dataset.country===code);if(!countryPaths.length)return;const boxes=countryPaths.map(p=>p.getBBox()),x=Math.min(...boxes.map(b=>b.x)),y=Math.min(...boxes.map(b=>b.y)),right=Math.max(...boxes.map(b=>b.x+b.width)),bottom=Math.max(...boxes.map(b=>b.y+b.height)),w=right-x,h=bottom-y;zoom=Math.max(1,Math.min(8,Math.min(900/Math.max(30,w),430/Math.max(20,h))));view=[x+w/2-500/zoom,y+h/2-250/zoom,1000/zoom,500/zoom];clamp();apply();}
 return {select,focusCountry,setPoints,get selected(){return selected;}};
}
