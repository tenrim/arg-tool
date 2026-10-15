import {access, writeFile} from 'node:fs/promises';
import {moduleGraph, closure, cyclesOf} from './module-graph.mjs';
import {bridges, boundaryViolations} from './architecture-policy.mjs';

const graph = await moduleGraph(), cycles = cyclesOf(graph), issues = boundaryViolations(graph, closure);
const incoming = new Map(), events = {}, globals = [], resources = [];
for (const [file, {imports,source}] of graph) {
  for (const target of imports) {
    try {await access(target);} catch {issues.push(`${file}: missing import ${target}`);}
    incoming.set(target,[...(incoming.get(target)||[]),file]);
  }
  for (const [, name] of source.matchAll(/['"](arg:[\w-]+)['"]/g)) (events[name] ||= new Set()).add(file);
  for (const [, name] of source.matchAll(/\b(?:window|globalThis)\.([\w$]+)\s*=(?!=)/g)) globals.push({file,name});
  for (const match of source.matchAll(/(?:new Worker\(|importScripts\(|\bimport\((?!\s*['"])|new URL\(\s*['"][^'"]+['"])/g))
    resources.push({file,expression:match[0]});
}
const report = {scope:'All first-party public JS modules; vendor bytes excluded. Literal ESM imports enforced; computed resources, event participants and global writes inventoried for review.',
  modules:graph.size,import_edges:[...graph.values()].reduce((n,node)=>n+node.imports.length,0),cycles,issues,
  dependencies:Object.fromEntries([...graph].map(([file,node])=>[file,node.imports])),
  highest_fan_in:[...incoming].sort((a,b)=>b[1].length-a[1].length).slice(0,12).map(([file,consumers])=>({file,consumers})),
  bridges:bridges.map(([from,to,reason])=>({from,to,reason})),
  events:Object.fromEntries(Object.entries(events).sort().map(([name,files])=>[name,[...files].sort()])),globals,resources};
const index=process.argv.indexOf('--report');if(index>=0){if(!process.argv[index+1])throw Error('--report needs a path');await writeFile(process.argv[index+1],JSON.stringify(report,null,2)+'\n');}
console.log(`Architecture: ${report.modules} modules, ${report.import_edges} literal import edges, ${cycles.length} cycles, ${issues.length} boundary violations, ${Object.keys(events).length} event channels.`);
for(const issue of issues) console.error(issue);
for(const cycle of cycles) console.error('Cycle: '+cycle.join(' -> '));
if(issues.length||cycles.length)process.exitCode=1;
