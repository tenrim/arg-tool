import {deflateSync} from 'node:zlib';
// Independently generated, original test images; no third-party/user media.
const table=Array.from({length:256},(_,i)=>{for(let n=0;n<8;n++)i=i&1?0xedb88320^(i>>>1):i>>>1;return i>>>0;});
function crc(b){let c=0xffffffff;for(const x of b)c=table[(c^x)&255]^(c>>>8);return(c^0xffffffff)>>>0;}
export function chunk(type,data){data=Buffer.from(data);const b=Buffer.alloc(data.length+12);b.writeUInt32BE(data.length);b.write(type,4);data.copy(b,8);b.writeUInt32BE(crc(b.subarray(4,-4)),b.length-4);return b;}
export function png({width=2,height=1,depth=8,color=6,rows=[0,255,0,0,255,255,0,0,255],frames=null,poster=false,plays=0}={}){
 const header=Buffer.alloc(13);header.writeUInt32BE(width);header.writeUInt32BE(height,4);header[8]=depth;header[9]=color;
 const chunks=[Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header)];let seq=0;
 if(frames){const a=Buffer.alloc(8);a.writeUInt32BE(frames.length);a.writeUInt32BE(plays,4);chunks.push(chunk('acTL',a));}
 if(!frames||poster)chunks.push(chunk('IDAT',deflateSync(Buffer.from(rows))));
 for(const [i,f]of(frames||[]).entries()){
  const fc=Buffer.alloc(26);fc.writeUInt32BE(seq++);fc.writeUInt32BE(f.width??width,4);fc.writeUInt32BE(f.height??height,8);fc.writeUInt32BE(f.x||0,12);fc.writeUInt32BE(f.y||0,16);fc.writeUInt16BE(f.num??10,20);fc.writeUInt16BE(f.den??100,22);fc[24]=f.dispose||0;fc[25]=f.blend||0;chunks.push(chunk('fcTL',fc));
  const data=deflateSync(Buffer.from(f.rows||rows));
  if(i===0&&!poster)chunks.push(chunk('IDAT',data));else{const n=Buffer.alloc(4);n.writeUInt32BE(seq++);chunks.push(chunk('fdAT',Buffer.concat([n,data])));}
 }
 chunks.push(chunk('IEND',[]));return Buffer.concat(chunks);
}
export function gif({count=35,frames=null,loops=0}={}){
 const header=Buffer.from([71,73,70,56,57,97,2,0,1,0,0x81,0,0,255,0,0,0,0,255,0,255,0,0,0,0]);
 const all=[header,Buffer.from([0x21,0xff,11,...Buffer.from('NETSCAPE2.0'),3,1,loops&255,loops>>8,0])];
 for(let i=0;i<(frames?.length||count);i++){
  const f=frames?.[i]||{},pixels=f.pixels||[i%3,(i+1)%3],w=f.width||pixels.length;
  all.push(Buffer.from([0x21,0xf9,4,((f.dispose||1)<<2)|(f.transparent!==undefined?1:0),f.delay||0,0,f.transparent||0,0,0x2c,f.x||0,0,0,0,w,0,1,0,0,2]));
  const codes=[];for(const px of pixels)codes.push(4,px);codes.push(5);const data=Buffer.alloc(Math.ceil(codes.length*3/8));let bit=0;for(const code of codes)for(let j=0;j<3;j++,bit++)data[bit>>3]|=((code>>j)&1)<<(bit&7);
  all.push(Buffer.from([data.length]),data,Buffer.from([0]));
 }
 all.push(Buffer.from([0x3b]));return Buffer.concat(all);
}
