// Discovery metadata only; no engines, UI, dictionaries or user state.
import {CLASSICAL_CIPHERS} from './classical-catalog.js';
import {ALPERTRON_CALCULATORS} from './alpertron-catalog.js';
import {CONSTRAINT_PRESETS} from './hunt-constraints-catalog.js';
import {KEYBOARD_TASKS} from './keyboard-catalog.js';
import {COMPLETION_TASKS} from '../completion/catalog.js';
const control=(selector,value,event='change')=>({selector,value,event});
export const EXPANSION_TASKS=Object.freeze([
 ...COMPLETION_TASKS,
 ...CLASSICAL_CIPHERS.map(c=>({id:'classical-'+c.id,panel:'classical-'+c.id,title:c.label,group:'classical',aliases:[c.id],directions:c.directions.map(d=>({id:d.value,label:d.label,controls:[control('#classical-'+c.id+'-direction',d.value)]}))})),
 ...ALPERTRON_CALCULATORS.map(c=>({id:'number-'+c.id,panel:'number-'+c.id,title:c.title,group:'maths',aliases:['Alpertron',c.id]})),
 {id:'morse-audio',panel:'morse',title:'摩斯音频识别与生成',group:'audio',aliases:['ggmorse','Morse audio','摩尔斯音频','长短音解码'],directions:[{id:'decode',label:'音频 → 文字',controls:[control('#morse-direction','decode')]},{id:'encode',label:'文字 → 音频',controls:[control('#morse-direction','encode')]}]},
 {id:'score',panel:'score',title:'五线谱与节奏录入',group:'audio',aliases:['staff','rhythm','简谱','五线谱','ABC','MIDI']},
 {id:'element-spelling',panel:'element-spelling',title:'元素符号拼词',group:'matter',controls:[control('#element-spelling-mode','elements')],aliases:['元素拆词','BaCoN','元素序号']},
 {id:'element-words',panel:'element-spelling',title:'元素符号单词筛选',group:'matter',controls:[control('#element-spelling-mode','element-words')],aliases:['元素词库','元素组成单词']},
 {id:'stroke-endpoints',panel:'stroke-endpoints',title:'汉字笔画端点匹配',group:'text-language',aliases:['ChinesePuzzleTool','焖肉面分面','笔画首尾','汉字几何']},
 ...CONSTRAINT_PRESETS.map(c=>({id:'hunt-constraints-'+c.id,panel:'hunt-constraints',title:c.id==='custom'?'中文规则自定义约束':c.label+'中文约束',group:'logic',controls:[control('#hunt-constraints-preset',c.id)],aliases:['cipher_machine',c.id,'约束求解']})),
 {id:'dictionary-substitution',panel:'dictionary-substitution',title:'词库约束替换求解',group:'cipher-analysis',aliases:['cipher_machine','substitution dictionary','带空格替换密码']},
 ...KEYBOARD_TASKS.map(c=>({id:'keyboard-'+c.id,panel:'keyboard',title:c.label,group:'characters',aliases:[c.id],controls:[control('#keyboard-mode',c.id)],directions:c.directions.map(d=>({id:d.value,label:d.label,controls:[control('#keyboard-mode',c.id),control('#keyboard-direction',d.value)]}))})),
 {id:'words-contains',panel:'words',title:'包含字母与字母子集查词',group:'text-language',controls:[control('[data-word-tab="english"]',undefined,'click'),control('#word-mode','contains')],aliases:['contains','超集单词','字母子集']},
 {id:'words-code',panel:'words',title:'自定义代码查词',group:'text-language',controls:[control('[data-word-tab="english"]',undefined,'click'),control('#word-mode','code')],aliases:['QuickJS','JavaScript 查词','自定义谓词']},
].map(Object.freeze));
