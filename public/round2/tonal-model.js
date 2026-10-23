import * as Tonal from '../vendor/round2/tonal-full.js';
export function musicClue(operation,first,second){
 const a=Tonal.Note.get(first.trim());if(a.empty)throw Error('第一个音符无效，例如 C4、F#3 或 Bb4。');
 if(operation==='distance'){
  const b=Tonal.Note.get(second.trim());if(b.empty)throw Error('第二个音符无效，例如 G4。');
  const name=Tonal.Interval.distance(a.name,b.name),interval=Tonal.Interval.get(name);
  return [['起始音',a.name],['终止音',b.name],['音程',name],['半音数',String(interval.semitones)],['音程级数',String(interval.num)]];
 }
 const steps=Number(second);if(!second.trim()||!Number.isInteger(steps)||Math.abs(steps)>120)throw Error('移调半音数应为 −120 到 120 的整数；负数向下。');
 const interval=Tonal.Interval.fromSemitones(steps),note=Tonal.Note.transpose(a.name,interval);
 if(!note)throw Error('无法移调，请检查音符。');
 return [['原音符',a.name],['移动半音数',String(steps)],['移调结果',note],['音程',interval]];
}
