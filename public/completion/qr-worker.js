// Upstream QRazyBox scripts remain byte-for-byte intact in an isolated worker.
importScripts('../vendor/completion/qrazybox/table.js','../vendor/completion/qrazybox/sqrd.js','../vendor/completion/qrazybox/reedsolomon.js');
// Decode both independent BCH(15,5) format copies. Upstream reads unknown
// modules as zero; that must never silently select an unrelated RS layout.
function checkedFormat(matrix){
 const n=matrix.length,positions=[[],[]];
 for(let i=0;i<15;i++){
  positions[0].push(i<6?[i,8]:i<8?[i+1,8]:[8,15-i-(i>8?1:0)]);
  positions[1].push(i<8?[8,n-i-1]:[n-15+i,8]);
 }
 const candidates=[];
 for(let data=0;data<32;data++){
  let rem=data<<10;for(let i=14;i>=10;i--)if(rem>>i&1)rem^=0x537<<(i-10);
  const bits=((data<<10)|rem)^0x5412;
  const scores=positions.map(copy=>copy.reduce((score,[r,c],i)=>score+(matrix[r][c]<0?1:matrix[r][c]!==((bits>>i)&1)?2:0),0));
  if(scores.some(s=>s<7))candidates.push({data,bits,scores});
 }
 if(candidates.length!==1)throw Error('格式信息缺失、冲突或损坏超出 BCH 恢复能力；请先明确纠错等级和掩码。');
 const chosen=candidates[0],result=matrix.map(row=>row.slice());
 for(const copy of positions)copy.forEach(([r,c],i)=>result[r][c]=(chosen.bits>>i)&1);
 result[n-8][8]=1;
 return {matrix:result,scores:chosen.scores};
}
self.onmessage=({data:{matrix,mode,codewords}})=>{try{
 const n=matrix?.length;if(!Number.isInteger(n)||n<21||n>177||(n-17)%4||matrix.some(r=>r.length!==n||r.some(c=>![-1,0,1].includes(c))))throw Error('无效二维码矩阵。');
 const checked=checkedFormat(matrix);matrix=checked.matrix;
 const version=(n-17)/4,format=getFormatInfo(matrix),read=readDataBlock(matrix),words=read.blocks.match(/.{8}/g)||[];
 const count=RS_block_num_table[version-1][format.ecc],dataCount=data_code_num_table[version-1][format.ecc],parity=(words.length-dataCount)/count,short=Math.floor(dataCount/count),long=dataCount%count;
 if(!Number.isInteger(parity)||parity<1)throw Error('无法确定 RS 分块，请先明确纠错等级和掩码。');
 const blocks=Array.from({length:count},(_,i)=>({indices:[],dataLength:short+(i>=count-long?1:0)}));
 let at=0;for(let j=0;j<short;j++)for(const b of blocks)b.indices.push(at++);for(let i=count-long;i<count;i++)blocks[i].indices.push(at++);for(let j=0;j<parity;j++)for(const b of blocks)b.indices.push(at++);
 const info={version,format:{ecc:['M','L','H','Q'][format.ecc],mask:format.mask,bchScores:checked.scores},codewords:words,unmaskedMatrix:maskData(matrix,format.mask),blocks:blocks.map(b=>({dataLength:b.dataLength,parity,indices:b.indices,bytes:b.indices.map(i=>words[i].includes('?')?null:parseInt(words[i],2))})),moduleOrder:read.module_order};
 let repaired;
 if(mode==='padding'){const result=recoverPaddingBits(matrix);if(typeof result==='string')throw Error(result);repaired=result.result_array;info.padding=result;}
 if(mode==='recover'){
  const fixed=[...words];for(const b of blocks){const erasures=[],bytes=b.indices.map((i,j)=>{if(words[i].includes('?'))erasures.push(j);return parseInt(words[i].replaceAll('?','0'),2);});if(erasures.length>parity)throw Error('未知码字多于此块纠错容量。');const result=RS.decode(bytes,parity,erasures);if(typeof result==='string')throw Error(result);const encoded=RS.encode(result,parity);if(typeof encoded==='string')throw Error(encoded);b.indices.forEach((i,j)=>fixed[i]=encoded[j].toString(2).padStart(8,'0'));}info.correctedCodewords=fixed;repaired=write(fixed.join(''));
 }
 if(mode==='write'){const bits=String(codewords||'').replace(/\s/g,'');if(bits.length!==words.length*8||!/^[01?]+$/.test(bits))throw Error(`须输入完整 ${words.length} 个 8 位码字，可用 ? 表示未知。`);repaired=write(bits);}
 function write(bits){const unmasked=maskData(matrix,format.mask);for(let i=0;i<bits.length;i++){const [r,c]=read.module_order[i].split('-').map(Number);unmasked[r][c]=bits[i]==='?'?-1:Number(bits[i]);}return maskData(unmasked,format.mask);}
 self.postMessage({result:{info,matrix:repaired}});
 }catch(e){self.postMessage({error:e.message||String(e)});}};
