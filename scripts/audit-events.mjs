import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { moduleGraph } from './module-graph.mjs';
import { EVENT_CONTRACTS, PERFORMANCE_MARKS } from './event-contracts.mjs';

const graph = await moduleGraph(),
  participants = new Map(),
  senders = new Map();
for (const [file, { source }] of graph) {
  for (const [, name] of source.matchAll(/['"](arg:[\w-]+)['"]/g)) {
    if (PERFORMANCE_MARKS[name]) {
      assert.equal(file, PERFORMANCE_MARKS[name]);
      continue;
    }
    assert(EVENT_CONTRACTS[name], '未登记事件：' + name + ' in ' + file);
    if (!participants.has(name)) participants.set(name, new Set());
    participants.get(name).add(file);
  }
  for (const [, name] of source.matchAll(
    /(?:new\s+(?:CustomEvent|Event)|\bemit)\s*\(\s*['"](arg:[\w-]+)['"]/g,
  )) {
    assert(
      EVENT_CONTRACTS[name]?.[0].split(' ').includes(file.replace(/^public\//, '')),
      '事件发送者越界：' + file + ' -> ' + name,
    );
    if (!senders.has(name)) senders.set(name, new Set());
    senders.get(name).add(file);
  }
}
assert.deepEqual(
  [...participants.keys()].sort(),
  Object.keys(EVENT_CONTRACTS).sort(),
  '事件登记包含已废弃名称，请清理',
);
const lines = [
  '# 页面事件与联动边界',
  '',
  '由 `node scripts/audit-events.mjs --write` 从已登记契约和当前源码生成；修改事件时同时更新 `scripts/event-contracts.mjs`。',
  '',
  '## 使用约定',
  '',
  '- 应用壳层、偏好和动效管理器可以监听整个文档生命周期；动态挂载的页面、编辑器和结果工具栏必须在销毁或 onDisconnect 时取消监听。',
  '- 切换任务、修改输入和离页时，同步取消旧运算并作废结果；异步回调检查修订号，不能等待动画结束再失效。',
  '- 新的跨模块数据交接优先使用具名注入接口；事件只做必要通知。DOM 标识只用于原控制器已有节点的兼容适配，不建立第二套输入或数据库。',
  '- 本表列出实际引用者，包含发送与接收；它是有界源码检查，不能证明动态事件、每条监听清理或所有载荷都正确。相关运行时行为仍由功能测试验证。',
  '- `arg:startup-ready` 是 performance.mark 性能标记，不是页面事件。',
  '',
  '## 事件清单',
  '',
  '| 通知 | 发送所有者 | 用途与载荷 | 当前引用者 |',
  '| --- | --- | --- | --- |',
];
for (const [name, [owners, purpose, payload]] of Object.entries(EVENT_CONTRACTS)) {
  const links = [...participants.get(name)]
    .sort()
    .map((file) => '[' + file.replace(/^public\//, '') + '](../' + file + ')')
    .join('、');
  lines.push(
    '| `' +
      name +
      '` | ' +
      (owners || '当前无内建发送者') +
      ' | ' +
      purpose +
      '；' +
      payload +
      ' | ' +
      links +
      ' |',
  );
}
const output = lines.join('\n') + '\n',
  target = new URL('../docs/EVENT_CONTRACTS.md', import.meta.url);
if (process.argv.includes('--write')) await writeFile(target, output);
else
  assert.equal(
    await readFile(target, 'utf8'),
    output,
    '事件文档过期，请运行 node scripts/audit-events.mjs --write',
  );
console.log(
  'PASS: ' + participants.size + ' event contracts, literal senders and documented participants.',
);
