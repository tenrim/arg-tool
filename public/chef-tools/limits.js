// Bound requested raster allocations before entering the upstream image routines.
export function checkImageSize(op,args,inputBytes,dimensions){
 const check=(w,h)=>{if(!Number.isFinite(w*h)||w<1||h<1||w>8192||h>8192||w*h>8_000_000)throw Error('图片尺寸超出范围：每边最多 8192，合计最多 8 百万像素。');};
 if(dimensions)check(...dimensions);
 if(['Resize Image','Cover Image','Contain Image'].includes(op)){let [w,h]=args;if(op==='Resize Image'&&args[2]==='Percent'){if(!dimensions)return;w=dimensions[0]*w/100;h=dimensions[1]*h/100;}check(w,h);}
 if(op==='Generate Image'){const channels={Greyscale:1,RG:2,RGB:3,RGBA:4,Bits:1}[args[0]],pixels=args[0]==='Bits'?inputBytes*8:Math.ceil(inputBytes/channels);check(args[2]*args[1],Math.max(1,Math.ceil(pixels/args[2]))*args[1]);}
 if(op==='Rotate Image'&&dimensions){const radians=args[0]*Math.PI/180,[w,h]=dimensions;check(Math.max(1,Math.round(Math.abs(w*Math.cos(radians))+Math.abs(h*Math.sin(radians)))),Math.max(1,Math.round(Math.abs(h*Math.cos(radians))+Math.abs(w*Math.sin(radians)))));}
 if(op==='Crop Image'&&!args[4]){check(args[2],args[3]);if(dimensions&&(args[0]+args[2]>dimensions[0]||args[1]+args[3]>dimensions[1]))throw Error('裁剪区域超出输入图片边界。');}
 if(op==='Generate QR Code'){if(inputBytes>2953)throw Error('二维码输入过长，请缩短内容。');check((177+args[2]*2)*args[1],(177+args[2]*2)*args[1]);}
}
