import {readFile,writeFile,mkdir,cp,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
for(const fixed of JSON.parse(await readFile('upstream/completion-20261017/SOURCE_FILES.json','utf8'))){if(createHash('sha256').update(await readFile('upstream/completion-20261017/'+fixed.path)).digest('hex')!==fixed.sha256)throw Error('Extracted original changed: '+fixed.path);}
const base='upstream/completion-20261017/origami/',out='public/vendor/completion/origami';await mkdir(out,{recursive:true});
const read=p=>readFile(base+p,'utf8');
const html=await read('index.html'),shaders=Object.fromEntries([...html.matchAll(/<script[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/script>/g)].filter(m=>/void main\s*\(/.test(m[2])).map(m=>[m[1],m[2]]));
const wrap=async(name,file)=>`const ${name}=(function(){var module={exports:{}},exports=module.exports;\n${await read(file)}\nreturn module.exports;}).call(globalThis);\n`;
let code='// Generated from pinned OrigamiSimulator. See upstream source and NOTICE.\n';
for(const [name,file]of [['THREE','three.min.js'],['_','underscore-min.js'],['numeric','numeric-1.2.6.js'],['jquery','jquery-3.2.1.min.js']])code+=await wrap(name,'dependencies/'+file);
code+=await read('dependencies/path-data-polyfill.js');
code+='\nexport function createOrigamiRuntime({root,gpuCanvas,warn,isCurrent=()=>true,onLoaded=()=>{}}){\nconst shaders='+JSON.stringify(shaders)+';\n';
code+=`const document=new Proxy(globalThis.document,{get(target,key){if(key==='getElementById')return id=>id==='gpuMathCanvas'?gpuCanvas:shaders[id]?{text:shaders[id]}:root.querySelector('#'+id);const v=Reflect.get(target,key,target);return typeof v==='function'?v.bind(target):v;}});\nconst $=Object.assign(function(value){if(typeof value==='string'&&value[0]==='#')return jquery(Array.from(root.querySelectorAll(value)));if(value==='body')return jquery(root);return jquery(value);},jquery);\nconst gtag=()=>{};let require;\n`;
for(const file of ['dependencies/fold.js','dependencies/cdt2d.js','dependencies/svgpath.js','dependencies/earcut.js','dependencies/SVGLoader.js','dependencies/OrbitControls.js','js/globals.js','js/node.js','js/beam.js','js/crease.js','js/model.js','js/dynamic/GLBoilerplate.js','js/dynamic/GPUMath.js','js/dynamic/dynamicSolver.js','js/pattern.js','js/curvedFolding.js']){
 // Origami's bundled FOLD fork has different mutation/return contracts.
 // Keep that exact fork for its solver, and expose official FOLD separately.
 if(file==='dependencies/fold.js')code+='\nconst modernFOLD=(()=>{let require;\n'+await readFile('upstream/completion-20261017/fold/dist/fold.js','utf8')+'\nreturn require("fold");})();\n';
 let s=await read(file);
 // Dependency loader remains local. Missing GPU capabilities fail explicitly.
 if(file.endsWith('GPUMath.js')){const start=s.indexOf('    function notSupported(){'),end=s.indexOf('    function GPUMath()',start);if(start<0||end<0)throw Error('GPU adapter source changed');s=s.slice(0,start)+`    function notSupported(){throw Error('此设备不支持浮点纹理折纸模拟。');}\n`+s.slice(end);s=s.replace('var floatTextures = gl.getExtension',"if(!gl)throw Error('无法创建 WebGL 折纸引擎。');\n    var floatTextures = gl.getExtension");}
 // These calls only drove the upstream Bootstrap controls. State is owned by our form.
 if(file.endsWith('GPUMath.js'))s=s.replace(/canvas\.client(?:Width|Height)\s*=\s*(?:width|height);/g,'');
 if(file.endsWith('dynamicSolver.js'))s=s.replace('globals.controls.setDeltaT(dt);','globals.deltaT = dt;');
 if(file.endsWith('globals.js')){s=s.replaceAll('.slider({value:percent})','.val(percent)');s=s.replace("$('#warningModal').on('hidden.bs.modal', function () {", "$('#warningModal').on('hidden.bs.modal', function () {");}
 if(file.endsWith('pattern.js')||file.endsWith('curvedFolding.js')){
  s=s.replaceAll("$(svg).appendTo('body')","$(svg).appendTo(root)").replaceAll('SVGloader.load(url, function(svg){','SVGloader.load(url, function(svg){ if(!isCurrent(url))return; const sourceSvg=svg; try {').replaceAll('function(error){','function(error){ if(!isCurrent(url))return;');
  const offset=s.indexOf('SVGloader.load(url,');
  const boundary=/\s*},\s*function\(\)\{\}/.exec(s.slice(offset));
  const end=boundary?offset+boundary.index:-1;
  if(end<0)throw Error('SVG callback boundary changed');
  s=s.slice(0,end)+'            onLoaded(getFoldData(true));\n } catch(error){warn(error.message||String(error));} finally {if(sourceSvg.parentNode)sourceSvg.remove();}\n'+s.slice(end);
 }
 code+='\n'+s+'\n';
}
code+=`const globals=initGlobals();globals.warn=warn;return {THREE,FOLD:modernFOLD,globals,createModel:()=>initModel(globals),createSolver:()=>initDynamicSolver(globals),createPattern:()=>initPattern(globals),createCurves:()=>initCurvedFolding(globals)};}\n`;
await writeFile(out+'/engine.js',code);await cp(base+'LICENSE',out+'/LICENSE');await cp(base+'assets',out+'/assets',{recursive:true});
const models=[];async function scan(dir,prefix=''){for(const f of await readdir(dir,{withFileTypes:true})){if(f.isDirectory())await scan(dir+'/'+f.name,prefix+f.name+'/');else if(/\.(svg|fold)$/i.test(f.name))models.push(prefix+f.name);}}await scan(base+'assets');
if(models.length!==90)throw Error('Upstream crease-pattern inventory changed');await writeFile(out+'/models.json',JSON.stringify(models.sort()));
console.log('Origami complete solver, SVG/FOLD/curved-pattern processing and '+Object.keys(shaders).length+' shaders packaged.');
