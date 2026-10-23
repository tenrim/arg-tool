import {decompose,remapColours,stegPlane,stegExtract,stegEmbed,stegEmbedImage} from './image-projects.js';
import {transformPixels} from './media.js';
self.onmessage=async({data})=>{
 try {
  const {action,pixels,width,height}=data;let result;
  if(action==='adjust')result=transformPixels(pixels,data.mode,data.bit,data.contrast);
  else if(action==='aperi-plane')result=decompose(pixels,data.channel,data.bit);
  else if(action==='steg-plane')result=stegPlane(pixels,width,height,data.channel,data.bit);
  else if(action==='remap')result=remapColours(pixels,data.map);
  else if(action==='extract')result=await stegExtract(pixels,width,height,data.selectedBits,data.pixelOrder,data.bitOrder,data.channelOrder,data.trim,data.offset);
  else if(action==='embed')result=await stegEmbed(pixels,width,height,data.payload,data.selectedBits,data.pixelOrder,data.bitOrder,data.channelOrder,data.pad);
  else if(action==='embed-image')result=stegEmbedImage(pixels,width,height,data.hidden,data.channel,data.bit);
  else throw Error('未知图片操作');
  self.postMessage({result},[result.buffer]);
 }catch(error){self.postMessage({error:error.message});}
};
