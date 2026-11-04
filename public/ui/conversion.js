import { Box, Card, FormGrid, SplitView, Toolbar } from './layout.js';
import { Button, Field, Textarea } from './controls.js';
import { Status } from './feedback.js';
import { bindRunShortcut } from './shortcuts.js';

// Shared composition only. Engines, revision state and format rules belong to
// controllers, so every tool gets the same accessible input/result workflow.
export function ConversionLayout({
  parameters,
  actions = [],
  status,
  input,
  result,
  details,
} = {}) {
  const settings = Box({ className: 'ui-conversion-settings', children: parameters });
  const jump = Button({
    text: '查看结果 ↓',
    className: 'ui-result-jump',
    hidden: true,
    on: {
      click: () => {
        resultCard.scrollIntoView({ block: 'start' });
        resultCard.focus({ preventScroll: true });
      },
    },
  });
  const execution = Toolbar({
    className: 'ui-conversion-execution',
    children: [Toolbar({ className: 'ui-conversion-run', children: [...actions, jump] }), status],
  });
  const controls = Box({ className: 'ui-conversion-controls', children: [settings, execution] });
  const inputCard = Card({ title: '输入', className: 'ui-conversion-input', children: input });
  const resultCard = Card({ title: '结果', className: 'ui-conversion-result', children: result });
  const panes = SplitView({
    className: 'ui-conversion-panes',
    minPaneWidth: '360px',
    children: [inputCard, resultCard],
  });
  const root = Card({ className: 'surface ui-conversion', children: [controls, panes, details] });
  resultCard.tabIndex = -1;
  if (actions[0]) bindRunShortcut(root, actions[0]);
  return {
    root,
    controls,
    inputCard,
    resultCard,
    panes,
    setResultReady: (ready) => {
      jump.hidden = !ready;
    },
  };
}
export function ConversionWorkbench({
  id,
  settings = [],
  inputLabel = '输入',
  resultLabel = '结果',
} = {}) {
  const input = Textarea({
    id: id + '-input',
    autoSize: true,
    minRows: 4,
    maxRows: 12,
    attrs: { spellcheck: 'false', maxlength: 65536 },
  });
  const output = Textarea({
    id: id + '-output',
    autoSize: true,
    minRows: 2,
    maxRows: 12,
    placeholder: '运行后在这里查看结果',
    attrs: { readonly: true, spellcheck: 'false' },
  });
  const run = Button({ id: id + '-run', text: '转换', variant: 'primary' }),
    stop = Button({ id: id + '-stop', text: '停止', disabled: true });
  const use = Button({ id: id + '-use', text: '作为输入', variant: 'quiet', disabled: true }),
    copy = Button({ id: id + '-copy', text: '复制', variant: 'quiet', disabled: true }),
    save = Button({ id: id + '-save', text: '下载', variant: 'quiet', disabled: true });
  const status = Status({ id: id + '-status' }),
    details = Box({ id: id + '-details' });
  const parameters = FormGrid({ layout: 'flow', children: settings });
  const { root, panes, inputCard, resultCard } = ConversionLayout({
    parameters,
    actions: [run, stop],
    status,
    input: Field({ label: inputLabel, control: input }),
    result: [
      Field({ label: resultLabel, control: output }),
      Toolbar({ attrs: { 'data-variant': 'result-actions' }, children: [use, copy, save] }),
    ],
    details,
  });
  inputCard.querySelector('[data-ui=card-title]').textContent = inputLabel;
  resultCard.querySelector('[data-ui=card-title]').textContent = resultLabel;
  for (const field of [input.closest('[data-ui=field]'), output.closest('[data-ui=field]')]) {
    field.querySelector('[data-ui=field-label]')?.remove();
  }
  input.setAttribute('aria-label', inputLabel);
  output.setAttribute('aria-label', resultLabel);
  return {
    root,
    panes,
    inputCard,
    resultCard,
    parameters,
    input,
    output,
    run,
    stop,
    use,
    copy,
    save,
    status,
    details,
  };
}
