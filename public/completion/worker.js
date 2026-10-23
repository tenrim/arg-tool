import {encodeBytes,decodeBytes,inputBytes,displayBytes} from './bytes.js';
import {integerCode,nato,keyboardCode,t9Matches,resistor,capacitor,encodeComponent,cable,permutation,radix} from './codes.js';
import {loadEnglishRecords} from '../expansion/hunt-data.js';
import {extendedInteger} from './numerals.js';
import {obfuscation} from './obfuscation.js';
import {semaphore,prussian} from './signals.js';
import {hamming} from './hamming.js';
import {gs8} from './gs8.js';
import {marine} from './marine.js';
import {keyboardLayouts,layoutCode} from './keyboard-layout.js';
self.onmessage=async({data:{task,input,options:o={}}})=>{try{
 if(typeof input!=='string'||input.length>2000000)throw Error('单次输入最多 200 万字符。');
 let output,bytes,svg;
 if(task==='byte-codecs'){if(['aaencode','jjencode'].includes(o.codec))output=await obfuscation(input,o);else if(o.direction==='encode')output=encodeBytes(inputBytes(input,o.format),o.codec);else{bytes=decodeBytes(input,o.codec);output=displayBytes(bytes,o.format);}}
 else if(task==='integer-codecs'){let text=input;if(['base26','base26-zero'].includes(o.codec)&&o.reverseLetters==='yes'&&o.direction==='decode')text=input.split(/(\s+)/).map(s=>[...s].reverse().join('')).join('');output=o.codec==='hamming'?hamming(text,o):['fibonacci','gamma','delta'].includes(o.codec)?integerCode(text,o.codec,o.direction):extendedInteger(text,o.codec,o.direction,o);if(o.codec==='base26'&&o.reverseLetters==='yes'&&o.direction==='encode')output=output.split(' ').map(s=>[...s].reverse().join('')).join(' ');}
 else if(task==='nato')output=nato(input,o.direction);
 else if(task==='semaphore-batch')({output,svg}=semaphore(input,o));
 else if(task==='marine-signals')({output,svg}=await marine(input,o));
 else if(task==='prussian')({output,svg}=await prussian(input,o));
 else if(task==='gs8'){const response=await fetch(new URL('../vendor/completion/gs8/symbols.json',import.meta.url));if(!response.ok)throw Error('GS8 完整码表加载失败。');output=gs8(input,o,await response.json());}
 else if(task==='keyboard-extra')output=o.mode.startsWith('layout-')?layoutCode(input,o,await keyboardLayouts()):keyboardCode(input,o.mode,o.direction);
 else if(task==='t9'){const rows=await loadEnglishRecords(o.dictionary);const matches=t9Matches(rows,input.trim());output=matches.join('\n');}
 else if(task==='color-codes'){const value=['resistor','capacitor'].includes(o.mode)?o.direction==='encode'?encodeComponent(input,o):o.mode==='resistor'?resistor(input):capacitor(input,o):o.mode==='cable'?cable(input,o.direction):permutation(input,o.alphabet,o.direction);output=typeof value==='string'?value:JSON.stringify(value,null,2);}
 else if(task==='radix64')output=radix(input,+o.from,+o.to);
 else if(task==='barcode-generate'){
  const {default:bwip}=await import('../vendor/completion/bwip-js/bwip-js.mjs');
  const options=JSON.parse(o.options||'{}');if(!options||Array.isArray(options)||Object.getPrototypeOf(options)!==Object.prototype||Object.entries(options).some(([k,v])=>['__proto__','constructor','prototype','text','bcid'].includes(k)||!['string','number','boolean'].includes(typeof v)))throw Error('附加参数须为普通 JSON 对象，参数值为字符串、数字或布尔值。');
  let text=input;if(o.format!=='utf8'){bytes=inputBytes(input,o.format);text=Array.from(bytes,b=>'^'+String(b).padStart(3,'0')).join('');options.parse=true;}
  svg=bwip.toSVG({...options,bcid:o.symbology,text});output=svg;
 }else throw Error('未知操作。');
 const files=bytes?[{name:'结果.bin',type:'application/octet-stream',bytes}]:[];
 if(svg)files.push({name:task==='barcode-generate'?'条码.svg':'旗语.svg',type:'image/svg+xml',bytes:new TextEncoder().encode(svg)});
 self.postMessage({result:{output,svg,value:{text:output,...(files.length?{files}: {})}}});
 }catch(e){self.postMessage({error:e.message||String(e)});}};
