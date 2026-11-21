import { Box, Button, Dialog, Toolbar, dialogController, onDisconnect } from '../ui/index.js';
import { analysisAccess } from './analysis-access.js';

export function mountAnalysisUnlock(host, { navigate }) {
  const later = Button({ text: '留在当前页面', variant: 'quiet' });
  const enter = Button({ text: '打开文本线索分析', variant: 'primary' });
  const note = Box({ tag: 'p' });
  const dialog = Dialog({
    className: 'ui-flow-dialog',
    attrs: { 'aria-labelledby': 'analysis-unlock-title' },
    children: [
      Box({ tag: 'h2', id: 'analysis-unlock-title', text: '迷雾已拨开' }),
      Box({ tag: 'p', text: '已解锁文本线索分析，可以自动尝试解谜用的文字、编码与密码工具。' }),
      note,
      Toolbar({ children: [later, enter] }),
    ],
  });
  host.append(dialog);
  const modal = dialogController(dialog, { closeButton: later, initialFocus: enter });
  enter.addEventListener('click', () => {
    modal.close();
    navigate('analysis?task=native%3Acipher-detect');
  });
  const abort = new AbortController();
  const composing = new WeakSet();
  const isSearch = (node) => node?.matches?.('input[data-tool-search]');
  function accept(event) {
    const input = event.target;
    if (!isSearch(input) || event.isComposing || composing.has(input)) return;
    const result = analysisAccess.submit(input.value);
    if (!result) return;
    note.textContent = result.persisted
      ? '此浏览器已记住解锁状态。'
      : '此浏览器无法保存状态，本次打开期间保持解锁。';
    modal.open();
  }
  // Only explicitly marked tool-search controls participate. Tool inputs,
  // notebook search and rendered results never submit an answer.
  const listen = (name, fn) => document.addEventListener(name, fn, { signal: abort.signal });
  listen('compositionstart', (event) => {
    if (isSearch(event.target)) composing.add(event.target);
  });
  listen('compositionend', (event) => {
    composing.delete(event.target);
    accept(event);
  });
  listen('input', accept);
  onDisconnect(dialog, () => {
    abort.abort();
    modal.destroy();
  });
}
