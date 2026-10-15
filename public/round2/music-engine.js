import {PitchDetector} from '../vendor/round2/pitchy.js';
import {Note,Chord,Scale,Interval} from '../vendor/round2/tonal.js';
export {Note,Chord,Scale,Interval};
export function detectPitch(samples,sampleRate,clarity=.9){
 if(!Number.isFinite(sampleRate)||sampleRate<8000||sampleRate>192000||samples.length>sampleRate*300)throw Error('音频需在 5 分钟以内，采样率 8–192 kHz。');
 if(!Number.isFinite(clarity)||clarity<.5||clarity>1)throw Error('置信度需在 0.5–1 之间。');
 const size=2048,hop=Math.max(1,Math.round(sampleRate*.04)),detector=PitchDetector.forFloat32Array(size),frames=[];detector.minVolumeDecibels=-45;
 for(let start=0;start<samples.length;start+=hop){const window=new Float32Array(size);window.set(samples.subarray(start,Math.min(start+size,samples.length)));const [frequency,quality]=detector.findPitch(window,sampleRate),midi=quality>=clarity&&frequency>=50&&frequency<=2200?Math.round(69+12*Math.log2(frequency/440)):null;frames.push({start:start/sampleRate,end:Math.min(start+hop,samples.length)/sampleRate,midi,frequency,quality});}
 const segments=[];for(const frame of frames){const last=segments.at(-1);if(last&&last.midi===frame.midi){last.end=frame.end;last.count++;last.frequency+=frame.frequency;last.quality+=frame.quality;}else segments.push({...frame,count:1});}
 return segments.map(s=>({...s,frequency:s.frequency/s.count,quality:s.quality/s.count,note:s.midi===null?'R':Note.fromMidi(s.midi)}));
}
export function segmentsToMelody(segments,bpm){if(!Number.isFinite(bpm)||bpm<30||bpm>240)throw Error('速度需为 30–240 BPM。');const parts=[];for(const s of segments){let beats=Math.max(.125,Math.round((s.end-s.start)*bpm/60*8)/8);while(beats>0){const n=Math.min(16,beats);parts.push(`${s.note}:${n}`);beats-=n;if(parts.length>256)throw Error('识别结果超过 256 项，请裁剪更短的音频。');}}return parts.join(' ');}
export function theory(mode,input,kind){
 if(mode==='scale'){const scale=Scale.get(input+' '+kind);if(scale.empty)throw Error('请输入有效主音，例如 C、F#、Bb。');return{notes:scale.notes,text:`音阶主音：${input}\n音符：${scale.notes.join(' ')}\n音程：${scale.intervals.join(' ')}`};}
 if(mode==='chord'){const chord=Chord.get(input);if(chord.empty)throw Error('和弦写法如 C、Am、G7、F#m7。');return{notes:chord.notes,text:`和弦：${chord.symbol}\n音符：${chord.notes.join(' ')}\n音程：${chord.intervals.join(' ')}`};}
 const notes=input.trim().split(/[\s,，]+/);if(notes.length<1||notes.length>32||notes.some(n=>Note.get(n).empty))throw Error('请输入 1–32 个音符，如 C4 E4 G4。');const chords=Chord.detect(notes);return{notes:notes.map(n=>Note.pitchClass(n)),text:notes.map(n=>{const p=Note.get(n);return `${n} · 音级 ${p.chroma}${p.midi!==null?` · MIDI ${p.midi} · ${p.freq.toFixed(3)} Hz`:''}`;}).join('\n')+`\n\n候选和弦：${chords.join(' / ')||'未匹配'}\n相邻音程：${notes.slice(1).map((n,i)=>Interval.distance(notes[i],n)).join(' / ')||'—'}`};
}
