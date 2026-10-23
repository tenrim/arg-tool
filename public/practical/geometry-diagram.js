import {SHAPES} from './geometry.js';
export function drawShape(canvas,id){
 const ctx=canvas.getContext('2d'),shape=SHAPES.find(s=>s.id===id);ctx.clearRect(0,0,360,190);ctx.strokeStyle='#66d7e5';ctx.lineWidth=2;ctx.fillStyle='#b8c7dc';ctx.font='14px "Noto Sans SC", sans-serif';ctx.beginPath();
 const line=(x,y,a,b)=>{ctx.moveTo(x,y);ctx.lineTo(a,b);},ellipse=(x,y,rx,ry)=>{ctx.moveTo(x+rx,y);ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);};
 if(['circle','annulus','sphere'].includes(id)){
  ellipse(180,85,58,58);if(id==='annulus')ellipse(180,85,30,30);if(id==='sphere')ellipse(180,85,58,18);line(180,85,238,85);ctx.fillText('r',207,78);
 }else if(id==='hemisphere'){
  ctx.arc(180,110,65,Math.PI,Math.PI*2);ellipse(180,110,65,18);line(180,110,245,110);ctx.fillText('r',209,105);
 }else if(id==='sector'){
  ctx.moveTo(145,120);ctx.lineTo(145,40);ctx.arc(145,120,80,-Math.PI/2,0);ctx.closePath();ctx.fillText('r',180,139);ctx.fillText('圆心角',155,105);
 }else if(id==='cylinder'){
  ellipse(180,40,75,18);ellipse(180,135,75,18);line(105,40,105,135);line(255,40,255,135);line(180,40,255,40);ctx.fillText('r',212,34);ctx.fillText('h',263,92);
 }else if(id==='cone'){
  ctx.moveTo(180,25);ctx.lineTo(100,130);ellipse(180,130,80,20);line(260,130,180,25);line(180,25,180,130);line(180,130,260,130);ctx.fillText('h',187,85);ctx.fillText('r',219,124);
 }else if(id==='pyramid'){
  ctx.moveTo(95,120);ctx.lineTo(220,110);ctx.lineTo(275,150);ctx.lineTo(150,155);ctx.closePath();for(const [x,y]of [[95,120],[220,110],[275,150],[150,155]])line(185,25,x,y);line(185,25,185,135);ctx.fillText('h',191,85);ctx.fillText('a',207,154);
 }else if(id==='right-triangle'){
  ctx.moveTo(90,140);ctx.lineTo(90,30);ctx.lineTo(270,140);ctx.closePath();ctx.rect(90,128,12,12);ctx.fillText('a',175,156);ctx.fillText('b',73,90);
 }else if(['triangle','triangle-height'].includes(id)){
  ctx.moveTo(80,140);ctx.lineTo(155,30);ctx.lineTo(275,140);ctx.closePath();line(155,30,155,140);ctx.fillText('底',175,156);ctx.fillText('高',161,96);
 }else if(['cuboid','cube'].includes(id)){
  ctx.rect(95,65,id==='cube'?110:145,85);const right=id==='cube'?205:240;line(95,65,130,30);line(130,30,right+35,30);line(right+35,30,right+35,115);line(right+35,115,right,150);line(right,65,right+35,30);ctx.fillText('长',140,166);ctx.fillText('高',74,115);
 }else if(id==='polygon'){
  for(let i=0;i<6;i++){const x=180+70*Math.cos(i*Math.PI/3),y=85+65*Math.sin(i*Math.PI/3);i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.closePath();ctx.fillText('边长',186,157);
 }else if(['parallelogram','trapezoid','trapezoid-area'].includes(id)){
  const left=id==='parallelogram'?120:130,right=id==='parallelogram'?320:230;ctx.moveTo(80,140);ctx.lineTo(280,140);ctx.lineTo(right,40);ctx.lineTo(left,40);ctx.closePath();line(left,40,left,140);ctx.fillText('高',left+7,95);ctx.fillText('底',190,157);
 }else {ctx.rect(80,40,id==='square'?100:200,100);ctx.fillText('长 / 边长',125,157);}
 ctx.stroke();ctx.fillText(shape.title+' · 示意，非按比例',45,182);
}
