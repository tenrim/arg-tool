// Explicit resource base works for native, Blob and subdirectory workers.
// The UI owns pacing/pause, so one bounded batch can never monopolize messages.
let core = null, session = null, resourceBase = null;
let commands = Promise.resolve();
self.onmessage = ({data}) => {
  commands = commands.then(() => command(data)).catch(() => {});
};
async function command(data) {
  const id = data?.id;
  try {
    if (!data || typeof data !== 'object') throw Error('图灵机指令格式无效。');
    const action = data.action ?? data.type;
    if (action === 'init') {
      session = null;
      const base = new URL(data.resourceBase);
      if (!['http:', 'https:'].includes(base.protocol) || base.origin !== self.location.origin || !base.pathname.endsWith('/')) throw Error('图灵机组件资源地址无效。');
      if (!core || resourceBase !== base.href) {
        try {core = await import(new URL('turing/core.js', base)); resourceBase = base.href;}
        catch {self.postMessage({id, error: '图灵机运算组件载入失败，请重试。'}); self.close(); return;}
      }
      const definition = core.compileDefinition(data.rules);
      session = core.createSession(definition, data.input ?? definition.input, data.head ?? 0);
      self.postMessage({id, definition, snapshot: core.snapshotSession(session)});
      return;
    }
    if (!session || !core) throw Error('请先载入图灵机规则。');
    if (action === 'step') core.stepSession(session, data.count ?? 1);
    else if (action === 'back') core.undoSession(session);
    else if (action === 'reset') session = core.resetSession(session);
    else if (action !== 'snapshot') throw Error('无法识别图灵机指令。');
    self.postMessage({id, snapshot: core.snapshotSession(session, {radius: data.radius ?? 7, includeTape: !!data.includeTape})});
  } catch (error) {self.postMessage({id, error: error.message || '图灵机运行失败。'});}
}
