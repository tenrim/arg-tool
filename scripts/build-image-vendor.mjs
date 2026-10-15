import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {stripTypeScriptTypes} from 'node:module';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url);
const read=path=>readFile(new URL(path,root),'utf8');
const hash=value=>createHash('sha256').update(value).digest('hex');
await mkdir(new URL('public/vendor/stegonline/',root),{recursive:true});
const files=['helpers.service.ts','extract-data.service.ts','bitplane-browser.component.ts'];
const records=[];
for(const file of files){
 const original=await read('upstream/stegonline/'+file);
 let source=original.replace(/^import .*;\r?\n/gm,'').replace(/@Injectable\(\{[\s\S]*?\}\)\s*/g,'').replace(/@Component\(\{[\s\S]*?\}\)\s*/g,'').replace(' implements OnInit','').replace(/@Output\(\) bitPlaneDataEmitter:.*?;/,'bitPlaneDataEmitter = {emit: (_data: any) => {}};');
 if(file==='extract-data.service.ts')source="import {HelpersService} from './helpers.service.js';\n"+source;
 if(file==='bitplane-browser.component.ts')source="import {HelpersService} from './helpers.service.js';\n"+source;
 const output='public/vendor/stegonline/'+file.replace('.ts','.js');
 const compiled='// Adapted from Ge0rg3/StegOnline, WTFPL. See LICENSE.txt and UPSTREAM.json.\n'+stripTypeScriptTypes(source,{mode:'transform'});
 await writeFile(new URL(output,root),compiled);records.push({source:'upstream/stegonline/'+file,source_sha256:hash(original),output,output_sha256:hash(compiled)});
}
await writeFile(new URL('public/vendor/stegonline/UPSTREAM.json',root),JSON.stringify({project:'StegOnline',repository:'https://github.com/Ge0rg3/StegOnline',commit:'b9996d5e4830f3bd0e229b82f8b1b987adcce6a2',license:'WTFPL (declared in upstream README); bundled pngtoy MIT',adaptation:'Remove Angular imports/decorators/event emitter and erase TypeScript; preserve extraction and bit-plane algorithms. The caller discards partial trailing bytes and limits extraction size.',files:records,pngtoy:{path:'pngtoy.min.js',sha256:hash(await read('public/vendor/stegonline/pngtoy.min.js'))}},null,2)+'\n');
// The Python ndarray routines are ported to RGBA typed-array loops for browsers.
const aperi=`// Ported from Zeecka/AperiSolve, MIT, Copyright (c) 2026 Zeecka.
// See LICENSE.txt, UPSTREAM.json and preserved Python sources.
export function decompose(rgba, channel, bit) {
 if(!Number.isInteger(bit)||bit<0||bit>7)throw Error('位平面应为 0–7');
 if(!['rgb','r','g','b','a'].includes(channel))throw Error('未知通道');
 const result=new Uint8ClampedArray(rgba.length),mask=1<<bit;
 for(let i=0;i<rgba.length;i+=4){
  if(channel==='rgb')for(let c=0;c<3;c++)result[i+c]=((rgba[i+c]&mask)>>bit)*255;
  else {const c='rgba'.indexOf(channel),value=((rgba[i+c]&mask)>>bit)*255;result[i]=result[i+1]=result[i+2]=value;}
  result[i+3]=255;
 }return result;
}
export function remapColours(rgba, colourMap) {
 if(colourMap.length!==256)throw Error('颜色映射表需要 256 项');
 const result=new Uint8ClampedArray(rgba.length);
 for(let i=0;i<rgba.length;i+=4){for(let c=0;c<3;c++)result[i+c]=colourMap[rgba[i+c]];result[i+3]=rgba[i+3];}return result;
}
`;
await writeFile(new URL('public/vendor/aperisolve/visual.js',root),aperi);
const aperiFiles=[];for(const file of ['decomposer.py','color_remapping.py'])aperiFiles.push({path:'upstream/aperisolve/'+file,sha256:hash(await read('upstream/aperisolve/'+file))});
await writeFile(new URL('public/vendor/aperisolve/UPSTREAM.json',root),JSON.stringify({project:'AperiSolve',repository:'https://github.com/Zeecka/AperiSolve',commit:'2a675c206cf7a4108682d6d96459c03680c9b2c4',license:'MIT',adaptation:'Port the ndarray bit decomposition, RGB superposition and random colour-map application to browser RGBA loops; no server analyzers bundled.',sources:aperiFiles,output:{path:'visual.js',sha256:hash(aperi)},script:'scripts/build-image-vendor.mjs'},null,2)+'\n');
