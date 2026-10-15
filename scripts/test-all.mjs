import {spawnSync} from 'node:child_process';
import {sourceFiles} from './module-graph.mjs';
const files=(await sourceFiles('tests')).filter(file=>file.endsWith('.test.mjs'));
const result=spawnSync(process.execPath,['--test','--test-reporter=spec','--test-isolation=none',...files],{stdio:'inherit'});
if(result.error)throw result.error;
process.exitCode=result.status??1;
