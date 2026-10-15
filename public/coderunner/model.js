import {LANGUAGES} from './catalog.js';
export {LANGUAGES} from './catalog.js';
export const MAX_SOURCE=256*1024,MAX_OUTPUT=256*1024,MAX_STEPS=2000000;
const OOK={'.?':'>','?.':'<','..':'+','!!':'-','!.':'.','.!':',','!?':'[','?!':']'};
export function ookToBrainfuck(source){
 const tokens=[...source.matchAll(/Ook[.!?]/g)];
 if(source.replace(/Ook[.!?]/g,'').trim())throw Error('Ook! 只接受 Ook.、Ook?、Ook! 和空白。');
 if(tokens.length%2)throw Error('Ook! 指令必须成对，最后一个词缺少配对。');
 let code='';const positions=[];
 for(let i=0;i<tokens.length;i+=2){const op=OOK[tokens[i][0][3]+tokens[i+1][0][3]];if(!op)throw Error('Ook? Ook? 不是有效指令。');code+=op;positions.push(tokens[i].index);}
 return {code,positions};
}
export function visibleWhitespace(s){return s.replace(/ /g,'·').replace(/\t/g,'→').replace(/\n/g,'↵\n');}
export function errorText(error){
 let message=String(error?.message||error||'运行失败');
 const replacements=[[/Unmatched '\['/g,'左方括号 [ 缺少配对'],[/Unmatched '\]'/g,'右方括号 ] 缺少配对'],[/end of input/gi,'程序输入已用尽'],[/empty stack/gi,'栈为空'],[/unknown label/gi,'跳转标签不存在'],[/unexpected end/gi,'程序意外结束'],[/out of memory/gi,'内存不足'],[/interrupted/gi,'执行被中断（超过时限）'],[/syntax error/gi,'语法错误'],[/Cannot move left[^\n]*/g,'指针不能越过内存带的左边界']];
 for(const [a,b]of replacements)message=message.replace(a,b);
 return message.slice(0,8000);
}
