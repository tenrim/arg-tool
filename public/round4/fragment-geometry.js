export const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
export function zoomAt(view,point,scale){const factor=scale/view.scale;return{scale,x:point.x-(point.x-view.x)*factor,y:point.y-(point.y-view.y)*factor};}
export function pinchView(view,start,current,min,max){const distance=p=>Math.hypot(p[1].x-p[0].x,p[1].y-p[0].y);const center=p=>({x:(p[0].x+p[1].x)/2,y:(p[0].y+p[1].y)/2});const a=center(start),b=center(current),next=zoomAt(view,a,clamp(view.scale*distance(current)/Math.max(1,distance(start)),min,max));return{...next,x:next.x+b.x-a.x,y:next.y+b.y-a.y};}
