// Maintenance report: account for every operation without changing the pinned runtime.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {classifyCatalogue,GROUPS} from '../public/chef-tools/catalog.js';
import {operationName} from '../public/cyberchef-i18n.js';
const catalogue=JSON.parse(await readFile('public/vendor/cyberchef/catalogue.json','utf8'));
const entries=classifyCatalogue(catalogue).map(entry=>({...entry,title:operationName(entry.op),group_title:GROUPS[entry.group].title,route:entry.panel==='cyberchef'?'#cyberchef':'#'+entry.panel+'/'+entry.group,module:catalogue.operations[entry.op].module,input_type:catalogue.operations[entry.op].inputType,presentation_type:catalogue.operations[entry.op].outputType}));
const report={version:'11.5.0',commit:'8cd426dd4f40f1423912d5fad91b578a86a65112',total:entries.length,note:'Catalogue outputType describes the web presentation in this extracted release. Runtime raw Dish values are used for images, JSON and multi-file outputs. Task/existing/chain labels describe entrypoints, not a claim that every operation was individually executed.',counts:Object.fromEntries(['task','existing','chain','retained'].map(mode=>[mode,entries.filter(e=>e.mode===mode).length])),operations:entries};
await mkdir('upstream/cyberchef',{recursive:true});await writeFile('upstream/cyberchef/task-map.json',JSON.stringify(report,null,2)+'\n');
const modeLabels={task:'独立任务表单',existing:'沿用现有工具',chain:'完整处理链',retained:'保留上游，暂不提供快捷入口'};
const lines=['# CyberChef 功能分布记录','','固定版本 11.5.0，逐项对应全部 505 个上游操作。此表记录入口归属；实测范围见 VERIFICATION.md，不表示 505 项均已逐一验证。','','| 分类 | 操作数 | 页面 |','| --- | ---: | --- |',...Object.entries(GROUPS).map(([key,g])=>`| ${g.title} | ${entries.filter(e=>e.group===key).length} | #${g.panel}${g.panel==='cyberchef'?'':'/'+key} |`),'','## 各操作归属','','| 中文功能 | 上游操作名 | 分类 | 接入方式 / 边界 |','| --- | --- | --- | --- |',...entries.map(e=>`| ${e.title} | ${e.op} | ${e.group_title} | ${e.reason||modeLabels[e.mode]} |`)];
await writeFile('CYBERCHEF_TOOLS.md',lines.join('\n')+'\n');console.log(JSON.stringify({total:report.total,...report.counts}));
