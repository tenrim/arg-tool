import {schemas, defaults} from '../chef-tools/schema.js';
export const FAMILIES = {ascii:'ASCII 转换',radix:'数字进制转换',characters:'字符与 UTF-8 字节',escapes:'转义与实体',letters:'字母与数字（A1Z26）'};
export const ESCAPES = {hex:['Escape string','Unescape string'],unicode:['Escape Unicode Characters','Unescape Unicode Characters'],html:['To HTML Entity','From HTML Entity'],url:['URL Encode','URL Decode']};
// The upstream Space delimiter is literal: repeated spaces insert NUL, while
// tabs/newlines can discard trailing codes. Match the validator's token model
// before calling the unchanged engine; never normalize literal input text.
export function foundationInput(text,options){if(options.family==='radix')return text.trim();if(options.direction==='decode'&&['ascii','characters','letters'].includes(options.family))return text.trim().replace(/\s+/g,' ');return text;}
export function foundationRecipe(catalogue, text, options) {
  if (new TextEncoder().encode(text).length > 65536) throw Error('输入最多 64 KB。');
  const {family,direction,base='10',target='16',format='codepoint'} = options, decode=direction==='decode';
  if (!Object.hasOwn(FAMILIES,family) || !['encode','decode'].includes(direction)) throw Error('转换设置无效。');
  if(!text.length||decode&&['ascii','characters','letters'].includes(family)&&!text.trim())throw Error('请输入待转换内容。');
  const step = (op, values={}) => {const definition=catalogue.operations[op];if(!definition)throw Error('引擎目录缺少 '+op);const args=defaults(definition);schemas(definition).forEach((arg,i)=>{if(Object.hasOwn(values,arg.name))args[i]=values[arg.name];});return {op,args};};
  if(family==='radix') {
    const from=Number(decode?target:base),to=Number(decode?base:target);
    if(!Number.isInteger(from)||!Number.isInteger(to)||from<2||from>36||to<2||to>36)throw Error('进制范围为 2–36。');
    const token=text.trim();if(!/^[+-]?[0-9a-z]+$/i.test(token)||[...token.replace(/^[+-]/,'').toLowerCase()].some(c=>parseInt(c,36)>=from))throw Error('请输入当前进制的一个有符号整数。');
    return [step('From Base',{Radix:from}),step('To Base',{Radix:to})];
  }
  if(family==='ascii'||family==='characters'&&format==='codepoint') {
    if(!['2','8','10','16'].includes(String(base)))throw Error('字符码进制无效。');
    if(family==='ascii') {
      if(!decode&&[...text].some(c=>c.codePointAt(0)>127))throw Error('ASCII 只包含 0–127；其他字符请使用字符与 UTF-8 字节。');
      if(decode)validateCodes(text,Number(base),127);
    }else if(decode)validateCodes(text,Number(base),0x10FFFF,true);
    else if([...text].some(c=>c.codePointAt(0)>=0xD800&&c.codePointAt(0)<=0xDFFF))throw Error('输入含有孤立代理码元，无法表示有效 Unicode 码点。');
    return [step(decode?'From Charcode':'To Charcode',{Delimiter:'Space',Base:Number(base)})];
  }
  if(family==='characters') {
    const names={hex:['To Hex','From Hex'],binary:['To Binary','From Binary'],decimal:['To Decimal','From Decimal'],octal:['To Octal','From Octal']};
    if(!names[format])throw Error('字节格式无效。');
    if(decode){validateCodes(text,{hex:16,binary:2,decimal:10,octal:8}[format],255);}
    return [step(names[format][decode?1:0],{Delimiter:'Space'})];
  }
  if(family==='escapes') {
    const pair=ESCAPES[format];if(!pair)throw Error('转义格式无效。');
    return [step(pair[decode?1:0],{'Escape level':'Everything','Encode all chars':true,'Convert all characters':true,'Convert to':'Hex entities','Encode all special chars':true})];
  }
  if(family==='letters') {
    if(decode){if(text.trim()&&!/^\d+(?:\s+\d+)*$/.test(text.trim()))throw Error('数字之间使用空格。');if(text.trim().split(/\s+/).some(s=>s&&(+s<1||+s>26)))throw Error('字母编号范围为 1–26。');}
    else if(/[^a-z\s]/i.test(text))throw Error('A1Z26 只支持英文字母；空白不编码。');
    return [step(decode?'A1Z26 Cipher Decode':'A1Z26 Cipher Encode',{Delimiter:'Space'})];
  }
}
function validateCodes(text,base,max,scalar=false) {
  if(!text.trim())return;
  for(const token of text.trim().split(/\s+/)) {if(!/^[0-9a-f]+$/i.test(token)||[...token].some(c=>parseInt(c,16)>=base))throw Error('字符码须按所选进制填写，以空格分隔。');const n=parseInt(token,base);if(!Number.isSafeInteger(n)||n>max||scalar&&n>=0xD800&&n<=0xDFFF)throw Error('字符码超出有效范围。');}
}
const controls=['NUL','SOH','STX','ETX','EOT','ENQ','ACK','BEL','BS','TAB','LF','VT','FF','CR','SO','SI','DLE','DC1','DC2','DC3','DC4','NAK','SYN','ETB','CAN','EM','SUB','ESC','FS','GS','RS','US'];
export const ASCII_TABLE=Array.from({length:128},(_,n)=>({value:n,label:controls[n]||(n===32?'SPACE':n===127?'DEL':String.fromCharCode(n)),binary:n.toString(2).padStart(7,'0'),octal:n.toString(8),hex:n.toString(16).toUpperCase().padStart(2,'0')}));
export function characterRows(text) {let index=0;return [...text].map(c=>{const row=[index,c===' '?'SPACE':c==='\n'?'LF':c==='\t'?'TAB':c==='\r'?'CR':c,'U+'+c.codePointAt(0).toString(16).toUpperCase().padStart(4,'0'),[...new TextEncoder().encode(c)].map(b=>b.toString(16).toUpperCase().padStart(2,'0')).join(' ')];index+=c.length;return row;});}
