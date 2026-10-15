import {element as uiElement} from '../ui/index.js';
// Data diagrams only: moon illumination and a north-up azimuth compass.
export function drawAstronomy(container,{phase,lit,azimuth,altitude}){
 const wrap=uiElement('div');wrap.className='science-visuals';container.append(wrap);
 function chart(caption){const f=uiElement('figure'),canvas=uiElement('canvas'),text=uiElement('figcaption');canvas.width=380;canvas.height=380;canvas.setAttribute('role','img');canvas.setAttribute('aria-label',caption);text.textContent=caption;f.append(canvas,text);wrap.append(f);return canvas.getContext('2d');}
 if(Number.isFinite(phase)&&Number.isFinite(lit)){
 const moon=chart(`月面照亮 ${(lit*100).toFixed(1)}% · 月相示意`),pixels=moon.createImageData(380,380),angle=phase*Math.PI/180;
 for(let y=0;y<380;y++)for(let x=0;x<380;x++){const nx=(x-190)/140,ny=(y-190)/140,r=nx*nx+ny*ny;if(r>1)continue;const z=Math.sqrt(1-r),sun=nx*Math.sin(angle)-z*Math.cos(angle),bright=sun>0,idx=(y*380+x)*4;pixels.data[idx]=bright?231:35;pixels.data[idx+1]=bright?217:47;pixels.data[idx+2]=bright?179:62;pixels.data[idx+3]=255;}moon.putImageData(pixels,0,0);
 }
 const ctx=chart(`方位 ${azimuth.toFixed(1)}° · 高度 ${altitude.toFixed(1)}°`);ctx.translate(190,190);ctx.lineWidth=2;ctx.strokeStyle='#697e92';ctx.beginPath();ctx.arc(0,0,135,0,Math.PI*2);ctx.stroke();ctx.font='28px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#c9d5e1';for(const [label,x,y]of [['北',0,-166],['东',166,0],['南',0,166],['西',-166,0]])ctx.fillText(label,x,y);const a=azimuth*Math.PI/180,x=Math.sin(a)*120,y=-Math.cos(a)*120;ctx.strokeStyle='#e7b75b';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(x,y);ctx.stroke();ctx.fillStyle='#e7b75b';ctx.beginPath();ctx.arc(x,y,9,0,Math.PI*2);ctx.fill();
}
