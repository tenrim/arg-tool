import {decompose,remapColours} from './vendor/aperisolve/visual.js';
import {HelpersService} from './vendor/stegonline/helpers.service.js';
import {ExtractDataService} from './vendor/stegonline/extract-data.service.js';
import {BitPlaneBrowserComponent} from './vendor/stegonline/bitplane-browser.component.js';
import {EmbedDataService} from './vendor/stegonline/embed-data.service.js';
function imageService(rgba,width,height) {
 const channels=[0,1,2,3].map(c=>Uint8ClampedArray.from({length:width*height},(_,i)=>rgba[i*4+c]));
 return {rgba,width,height,r:channels[0],g:channels[1],b:channels[2],a:channels[3],rgbaChars:['r','g','b','a'],opaque:new Uint8ClampedArray(width*height).fill(255),createImage(r,g,b,a){const result=new Uint8ClampedArray(r.length*4);for(let i=0;i<r.length;i++)result.set([r[i],g[i],b[i],a[i]],i*4);return result;}};
}
export function stegPlane(rgba,width,height,channel,bit) {
 if(!['r','g','b','a'].includes(channel)||!Number.isInteger(bit)||bit<0||bit>7)throw Error('通道或位平面无效');
 return new BitPlaneBrowserComponent(imageService(rgba,width,height),new HelpersService(),{}).viewBitPlane('rgba'.indexOf(channel),bit,false);
}
export async function stegExtract(rgba,width,height,selectedBits,pixelOrder,bitOrder,channelOrder,trim=false,offset=0) {
 for(const c of 'rgba')if(!Array.isArray(selectedBits[c])||selectedBits[c].some(b=>!Number.isInteger(b)||b<0||b>7))throw Error('请选择有效位平面');
 if(!['Row','Column'].includes(pixelOrder)||!['MSB','LSB'].includes(bitOrder)||!/^[rgba]{4}$/.test(channelOrder)||new Set(channelOrder).size!==channelOrder.length||/[^rgba]/.test(channelOrder))throw Error('提取顺序无效');
 const bitsPerPixel=Object.values(selectedBits).reduce((count,bits)=>count+new Set(bits).size,0);
 if(!bitsPerPixel)throw Error('请至少选择一个位平面');
 const completeBytes=Math.floor(width*height*bitsPerPixel/8);
 if(!Number.isInteger(offset)||offset<0)throw Error('起始字节应为非负整数');
 if(completeBytes>1024*1024)throw Error('提取结果超过 1 MB，请减少所选位平面或使用较小图片');
 const service=new ExtractDataService(imageService(rgba,width,height),new HelpersService());
 let hex=await service.extract(selectedBits,pixelOrder,bitOrder,[...channelOrder],false);
 // Original code appends a partial nibble. Only export complete bytes.
 hex=hex.slice(Math.min(offset,completeBytes)*2,completeBytes*2);if(trim)hex=hex.replace(/(?:00)+$/,'');
 return Uint8Array.from({length:hex.length/2},(_,i)=>parseInt(hex.slice(i*2,i*2+2),16));
}
export {decompose,remapColours};
export async function stegEmbed(rgba,width,height,payload,selectedBits,pixelOrder,bitOrder,channelOrder,pad=false){
 if(!(payload instanceof Uint8Array)||payload.length>1024*1024)throw Error('载荷须为最多 1 MB 的原始字节');
 if(!['Row','Column'].includes(pixelOrder)||!['MSB','LSB'].includes(bitOrder)||!/^([rgba]){4}$/.test(channelOrder)||new Set(channelOrder).size!==4)throw Error('无效顺序');
 for(const c of 'rgba')if(!Array.isArray(selectedBits[c])||new Set(selectedBits[c]).size!==selectedBits[c].length||selectedBits[c].some(b=>!Number.isInteger(b)||b<0||b>7))throw Error('无效位平面');
 if(selectedBits.a.length)throw Error('上游 EmbedDataService 不支持 Alpha 嵌入，请选择 RGB 位平面');
 const capacity=width*height*'rgb'.split('').reduce((n,c)=>n+selectedBits[c].length,0);if(payload.length*8>capacity)throw Error('载荷超过完整位平面容量，不会截断');
 const service=new EmbedDataService(imageService(rgba,width,height),new HelpersService()),bits=Array.from(payload,x=>x.toString(2).padStart(8,'0')).join('');
 const value=await service.embed(bits,structuredClone(selectedBits),pixelOrder,bitOrder,[...channelOrder],pad);return value.data||value;
}
// Direct port of the pinned EmbedImageComponent.startEmbedImage pixel loop.
export function stegEmbedImage(rgba,width,height,hidden,channel,bit){
 if(!'rgb'.includes(channel)||!Number.isInteger(bit)||bit<0||bit>7||hidden.width>width||hidden.height>height)throw Error('隐藏图片必须完整放入载体，且选择 RGB 通道及 0–7 位平面');
 const result=new Uint8ClampedArray(rgba),c='rgb'.indexOf(channel);for(let y=0;y<hidden.height;y++)for(let x=0;x<hidden.width;x++){const to=(y*width+x)*4+c,from=(y*hidden.width+x)*4+c;result[to]=(result[to]&~(1<<bit))|((hidden.pixels[from]>127?0:1)<<bit);}for(let i=3;i<result.length;i+=4)result[i]=255;return result;
}
