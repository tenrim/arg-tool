// Gnuplot is an independent, local WASM program. SVG is consumed as an image,
// never inserted into the page DOM as executable markup.
let pending=[];
var Module={noInitialRun:true,print:()=>{},printErr:()=>{},locateFile:name=>new URL('../vendor/qalculate/'+name,self.location.href).href,
 postRun:()=>{const jobs=pending;pending=null;for(const data of jobs)plot(data);}};
self.onmessage=({data})=>pending?pending.push(data):plot(data);
function plot({id,plot}){
 try{
  const files=[];
  for(const [name,text] of Object.entries(plot.data)){
   if(!/^\/tmp\/gnuplot_data\d+$/.test(name))throw Error('绘图数据路径无效。');
   FS.writeFile(name,text);files.push(name);
  }
  const commands=plot.commands.replace(/set terminal pop/g,"set terminal svg size 960,600; set output '/output.svg'");
  FS.writeFile('/commands',commands);callMain(['/commands']);
  const svg=FS.readFile('/output.svg',{encoding:'utf8'});
  for(const path of ['/commands','/output.svg',...files])FS.unlink(path);
  self.postMessage({id,svg});
 }catch(e){self.postMessage({id,error:e.message});}
}
importScripts('../vendor/qalculate/gnuplot.js');
