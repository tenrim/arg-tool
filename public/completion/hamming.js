// Complete binary Hamming family for the selectable parity counts, with SECDED.
// Blocks are never padded or truncated implicitly.
export function hamming(text,{direction,parityBits=3,extended='no',parityPosition='first',display='data'}={}){
 const r=Number(parityBits);if(!Number.isInteger(r)||r<2||r>16)throw Error('校验位数量须为 2–16。');
 const n=2**r-1,k=n-r,extra=extended==='yes',width=direction==='encode'?k:n+Number(extra);
 const bits=text.replace(/\s/g,'');if(!/^[01]*$/.test(bits)||bits.length%width)throw Error(`每块必须完整包含 ${width} 位，不能自动补零。`);
 const results=[];
 for(let offset=0;offset<bits.length;offset+=width){
  const block=[...bits.slice(offset,offset+width)].map(Number),a=Array(n+1).fill(0);let at=0,overall=0,position=0;
  if(direction==='encode'){
   for(let i=1;i<=n;i++)if(i&(i-1))a[i]=block[at++];
   for(let p=1;p<=n;p*=2){let sum=0;for(let i=1;i<=n;i++)if(i&p)sum^=a[i];a[p]=sum;}
   const encoded=a.slice(1);overall=encoded.reduce((s,b)=>s^b,0);if(extra)parityPosition==='last'?encoded.push(overall):encoded.unshift(overall);results.push(encoded.join(''));continue;
  }
  if(extra)overall=parityPosition==='last'?block.pop():block.shift();for(let i=1;i<=n;i++)a[i]=block[i-1];
  let syndrome=0;for(let i=1;i<=n;i++)if(a[i])syndrome^=i;
  const odd=block.reduce((s,b)=>s^b,overall);
  if(extra&&syndrome&&!odd)throw Error(`第 ${offset/width+1} 块检测到双位错误，未伪造纠正结果。`);
  if(syndrome){a[syndrome]^=1;position=syndrome+(extra&&parityPosition==='first'?1:0);}else if(extra&&odd){overall^=1;position=parityPosition==='first'?1:n+1;}
  if(display==='positions')results.push(String(position));else if(display==='corrected'){const corrected=a.slice(1);if(extra)parityPosition==='last'?corrected.push(overall):corrected.unshift(overall);results.push(corrected.join(''));}else results.push(a.filter((_,i)=>i>0&&(i&(i-1))).join(''));
 }
 return results.join(' ');
}
