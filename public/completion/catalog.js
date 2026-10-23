import {BARCODE_NAMES} from './barcode-catalog.js';
// Pure discovery metadata. Engine inventories remain in their pinned packages.
export const COMPLETION_TASKS=Object.freeze([
 ['byte-codecs','扩展字节编码','encoding',['Base91','Base100','Base65536','UUencode','XXencode','Bubble Babble','Manchester','差分 Manchester','AAencode','JJencode','Crockford','z-base-32','Chuck Norris','一元编码','Excess-3','余 3 码','Gray','Hamming']],
 ['integer-codecs','通用整数编码','encoding',['Fibonacci','Elias Gamma','Elias Delta','NegaFibonacci','负斐波那契','Base26','Base37','Shadoks','Crockford 校验','Gray','Hamming SECDED']],
 ['keyboard-extra','键盘位置与替换','characters',['Dvorak','键盘偏移','键盘对称','多击编码']],
 ['t9','T9 词库查询','text-language',['手机预测','电话号码查词']],
 ['color-codes','色码与排列编码','communication',['电阻色环','电容色码','25 对线缆','康托展开']],
 ['nato','无线电拼读字母','communication',['NATO','北约字母','Alfa Bravo']],
 ['semaphore-batch','旗语编解码与输出','communication',['旗语角度','时钟旗语','裤子旗语','Semaphore']],
 ['prussian','普鲁士光学电报','communication',['Prussian Semaphore','光学电报码本']],
 ['braille-languages','多语言盲文','communication',['Liblouis','缩写盲文','Braille']],
 ['gs8','GS8 盲文','communication',['Gardner Salinas','科学盲文','八点盲文']],
 ['marine-signals','海事组合旗语','characters-reference',['国际信号旗','代用旗','ICS']],
 ['barcode-generate','条码完整生成','image',['bwip-js','BWIPP','Aztec','Code 128','二进制二维码',...BARCODE_NAMES]],
 ['virtual-keyboard','多语言键盘','text-language',['simple-keyboard','多语言输入']],
 ['origami','折纸模拟','simulation',['OrigamiSimulator','FOLD','曲线折纸']],
].map(([id,title,group,aliases])=>Object.freeze({id,panel:id,title,group,aliases})));
