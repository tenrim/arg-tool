import {Box, Card, FormGrid, SplitView, Toolbar} from './layout.js';
import {Button, Field, Textarea} from './controls.js';
import {Status} from './feedback.js';

// Shared composition only. Engines, revision state and format rules belong to
// controllers, so every tool gets the same accessible input/result workflow.
export function ConversionLayout({parameters, actions = [], status, input, result, details} = {}) {
  const controls = Card({children: [parameters, Toolbar({children: actions}), status]});
  const inputCard = Card({children: input}), resultCard = Card({children: result});
  const root = Box({className: 'ui-conversion', children: [controls,
    SplitView({minPaneWidth: '320px', children: [inputCard, resultCard]}), details]});
  return {root, controls, inputCard, resultCard};
}
export function ConversionWorkbench({id, settings = [], inputLabel = '输入', resultLabel = '结果'} = {}) {
  const input = Textarea({id: id + '-input', autoSize: true, minRows: 4, maxRows: 12, attrs: {spellcheck: 'false', maxlength: 65536}});
  const output = Textarea({id: id + '-output', autoSize: true, minRows: 4, maxRows: 12, attrs: {readonly: true, spellcheck: 'false'}});
  const run = Button({id: id + '-run', text: '转换', variant: 'primary'}), stop = Button({id: id + '-stop', text: '停止', disabled: true});
  const use = Button({id: id + '-use', text: '作为输入', disabled: true}), copy = Button({id: id + '-copy', text: '复制', disabled: true}), save = Button({id: id + '-save', text: '下载', disabled: true});
  const status = Status({id: id + '-status'}), details = Box({id: id + '-details'});
  const parameters = FormGrid({children: settings});
  const {root} = ConversionLayout({parameters, actions: [run, stop], status,
    input: Field({label: inputLabel, control: input}),
    result: [Field({label: resultLabel, control: output}), Toolbar({children: [use, copy, save]})], details});
  return {root, parameters, input, output, run, stop, use, copy, save, status, details};
}
