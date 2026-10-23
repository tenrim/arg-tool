const letters='CDEFGAB',semitones={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
export function parseScore(text,{bpm=100,meter='4/4',key='C',clef='treble'}={}){
 if(!Number.isFinite(+bpm)||+bpm<20||+bpm>300)throw Error('速度需为20–300 BPM。');
 if(!/^(?:[1-9]|1[0-6])\/(?:2|4|8|16)$/.test(meter))throw Error('拍号无效。');
 if(!['treble','bass','alto','tenor'].includes(clef))throw Error('谱号无效。');
 if(!/^[A-G](?:#|b)?(?:m)?$/.test(key))throw Error('调号写法如C、G、Bb、Am。');
 const tokens=String(text).trim().split(/\s+/u).filter(Boolean);if(tokens.length>4096)throw Error('单份乐谱最多4096个事件。');
 let beat=0;
 const events=tokens.filter(t=>t!=='|').map((token,index)=>{
  const match=/^(R|[A-Ga-g](?:#|b)?[0-8]):(\d+(?:\.\d+)?)$/.exec(token);
  if(!match)throw Error(`第${index+1}项应写成C4:1或R:0.5，竖线可分小节。`);
  const note=match[1].toUpperCase(),duration=Number(match[2]);if(duration<.0625||duration>32||!Number.isInteger(duration*16))throw Error('拍数需为1/16拍的倍数，范围0.0625–32。');
  let midi=null,abc='z';
  if(note!=='R'){const n=/^([A-G])([#B]?)([0-8])$/.exec(note),letter=n[1],accidental=n[2],octave=+n[3];midi=(octave+1)*12+semitones[letter]+(accidental==='#'?1:accidental==='B'?-1:0);if(midi<12||midi>119)throw Error('音符超出C0–B8。');abc=(accidental==='#'?'^':accidental==='B'?'_':'=')+(octave>=5?letter.toLowerCase()+"'".repeat(octave-5):letter+','.repeat(Math.max(0,4-octave)));}
  const units=Math.round(duration*16),gcd=(a,b)=>b?gcd(b,a%b):a,div=gcd(units,16),length=16/div===1?String(units/div):`${units/div}/${16/div}`;
  const event={note:note==='R'?'R':match[1][0].toUpperCase()+match[1].slice(1),midi,beats:duration,startBeat:beat,start:beat*60/bpm,duration:duration*60/bpm,abc:abc+length};beat+=duration;return event;
 });
 const [numerator,denominator]=meter.split('/').map(Number),barBeats=numerator*4/denominator;
 let used=0;const notation=[];for(const e of events){notation.push(e.abc);used+=e.beats;if(Math.abs(used/barBeats-Math.round(used/barBeats))<1e-9)notation.push('|');}
 const abc=`X:1\nT:迷雾工具箱旋律\nM:${meter}\nL:1/4\nQ:1/4=${bpm}\nK:${key} clef=${clef}\n${notation.join(' ')}\n`;
 return {events,bpm:+bpm,meter,key,clef,beats:beat,duration:beat*60/bpm,abc,sequence:events.map(e=>e.note+':'+e.beats).join(' '),csv:'开始秒,时长秒,音符,MIDI,拍数\n'+events.map(e=>[e.start,e.duration,e.note,e.midi??'',e.beats].join(',')).join('\n')};
}
export function staffPitch(step,{clef='treble',accidental='',octaveShift=0}={}){
 if(!Number.isInteger(step)||step< -20||step>30)throw Error('五线谱位置无效。');
 const reference={treble:4*7+2,bass:2*7+4,alto:3*7+3,tenor:3*7+1}[clef];if(reference===undefined)throw Error('谱号无效。');
 const pitch=reference+step+octaveShift*7,octave=Math.floor(pitch/7),letter=letters[((pitch%7)+7)%7];if(octave<0||octave>8)throw Error('音符超出C0–B8。');
 return letter+accidental+octave;
}
export function scorePCM(score,sampleRate=22050){
 if(!Number.isInteger(sampleRate)||sampleRate<8000||sampleRate>48000||score.duration>180)throw Error('音频导出最多3分钟，采样率8–48kHz。');
 const out=new Float32Array(Math.ceil((score.duration+.1)*sampleRate));
 for(const e of score.events){if(e.midi===null)continue;const frequency=440*2**((e.midi-69)/12),start=Math.round(e.start*sampleRate),len=Math.round(e.duration*.9*sampleRate);for(let i=0;i<len&&start+i<out.length;i++){const t=i/sampleRate,envelope=Math.min(1,t/.01)*Math.min(1,(len-i)/sampleRate/.03);out[start+i]=.2*envelope*Math.sin(2*Math.PI*frequency*t);}}
 return {samples:out,sampleRate};
}
