import {Box, Card, ConversionWorkbench, Field, Input, Option, Select, Table, Textarea, ToolHeader, ToolPanel, Provenance, onDisconnect, setTextareaValue} from '../ui/index.js';
import {KEYBOARD_TASKS} from './keyboard-catalog.js';
import {KEYBOARD_MAPPINGS} from '../vendor/expansion/keyboard/mappings.js';
import {saveFile, startWorkerJob, taskSession} from './session.js';

export const KEYBOARD_HELP = Object.freeze({steps: ['通过具体任务进入 QWERTY 字母替换或手机九键坐标，并选择文字与编码之间的方向。手机九键 a=21、s=74、z=94，第一位是键位，第二位是键内序号。', '可在参数模板中查看上游完整 12 行映射，或直接编辑两行映射；两行项数须一致，项之间用空白分隔。转换采用实际最长匹配，支持多字符编码。', '运行后查看完整结果与本次实际使用的映射表；I/J 同坐标等歧义默认明确列出，不能当作唯一解。', '“作为输入”明确采用结果；再切换方向不会自动覆盖原输入。结果可复制、下载、加入笔记本或图稿。'], tip: '纯本地运行，不含 T9 词库预测或键盘布局识别。九键编码不保留大小写；词间标记保留单词边界，不能还原原始连续空白。历史元素模板完整保留原项目旧符号，与当前元素资料区分。'});

const select = (id, options) => Select({id, children: options.map(([value, label]) => Option(label, value))});
export function mountKeyboard(host) {
  const id = 'keyboard';
  const mode = Select({id: id + '-mode', hidden: true, children: KEYBOARD_TASKS.map(item => Option(item.label, item.id))});
  const direction = select(id + '-direction', [['encrypt', '文字 → 编码'], ['decrypt', '编码 → 文字']]);
  const mapping = Select({id: id + '-table', children: KEYBOARD_MAPPINGS.map(item => Option(item.label, item.id))});
  const source = Textarea({id: id + '-source-map', autoSize: true, minRows: 2, maxRows: 5, attrs: {maxlength: 32768, spellcheck: 'false'}});
  const target = Textarea({id: id + '-target-map', autoSize: true, minRows: 2, maxRows: 5, attrs: {maxlength: 32768, spellcheck: 'false'}});
  const separator = Input({id: id + '-separator', value: '', attrs: {maxlength: 8}}), wordSeparator = Input({id: id + '-word-separator', value: '/', attrs: {maxlength: 8}});
  const unknown = select(id + '-unknown', [['preserve', '保留并标明未转换字符'], ['reject', '遇到未知字符报错'], ['remove', '移除未知字符']]);
  const ambiguity = select(id + '-ambiguity', [['all', '列出全部歧义值'], ['reject', '遇到歧义报错'], ['first', '明确取首项（可能丢失区别）']]);
  const letterCase = select(id + '-case', [['preserve', '保留可用的字母大小写'], ['upper', '输出英文字母大写'], ['lower', '输出英文字母小写']]);
  const view = ConversionWorkbench({id, settings: [Field({label: '方向', control: direction}), Field({label: '映射参数模板', control: mapping}), Field({label: '来源项（空白分隔）', control: source, span: 'full'}), Field({label: '目标项（对应顺序）', control: target, span: 'full'}), Field({label: '编码项间分隔符', control: separator}), Field({label: '词间标记', control: wordSeparator}), Field({label: '未知字符', control: unknown}), Field({label: '歧义处理', control: ambiguity}), Field({label: '大小写', control: letterCase}), mode]});
  const apply = value => { const template = KEYBOARD_MAPPINGS.find(item => item.id === value); if (!template) return; mapping.value = value; setTextareaValue(source, template.from.join(' '), {feedback: false}); setTextareaValue(target, template.to.join(' '), {feedback: false}); separator.value = template.to.some(token => token.length > 1) || template.to.every(token => /^\d+$/u.test(token)) ? ' ' : ''; };
  apply('qwerty');
  const panel = ToolPanel({id: 'panel-' + id, className: 'panel', hidden: true, header: ToolHeader({className: 'page-heading', title: '键盘编码'}), body: view.root, footer: Provenance({className: 'tool-provenance', items: [['cipher_machine', 'https://github.com/philippica/cipher_machine', '全部原始 12 行映射数据；QWERTY / 九键及最长匹配转换适配 · BSD-3-Clause']]})});
  host.append(panel);
  const session = taskSession(view, {
    id, options: () => ({mode: mode.value, direction: direction.value, mapping: mapping.value, sourceMap: source.value, targetMap: target.value, separator: separator.value, wordSeparator: wordSeparator.value, unknown: unknown.value, ambiguity: ambiguity.value, case: letterCase.value}),
    execute: async (input, options, hooks) => {
      const result = await startWorkerJob({task: 'keyboard', mode: options.mode, input, options}, hooks);
      return {output: result.text, result, value: {text: result.text}, status: result.warnings.length ? '已转换；请查看本次规则与提示' : '已转换'};
    },
    render: value => {
      const result = value.result;
      view.details.append(Card({title: '本次实际映射', children: [Box({attrs: {'data-layout': 'table-scroll', tabindex: '0', role: 'region', 'aria-label': '本次实际映射'}, children: Table({columns: ['来源', '目标'], rows: result.details.mappingRows})}), ...result.warnings.map(text => Box({tag: 'p', text}))]}));
    },
    save: value => saveFile(value.output, '迷雾工具箱-键盘转换.txt'),
  });
  const drafts = new Map(); let current = 'qwerty';
  const currentFields = () => ({mapping: mapping.value, source: source.value, target: target.value, separator: separator.value, wordSeparator: wordSeparator.value, unknown: unknown.value, ambiguity: ambiguity.value, case: letterCase.value});
  const modeChange = () => {
    if (current === mode.value) return;
    drafts.set(current, currentFields()); current = mode.value;
    const draft = drafts.get(current);
    if (draft) { mapping.value = draft.mapping; setTextareaValue(source, draft.source, {feedback: false}); setTextareaValue(target, draft.target, {feedback: false}); separator.value = draft.separator; wordSeparator.value = draft.wordSeparator; unknown.value = draft.unknown; ambiguity.value = draft.ambiguity; letterCase.value = draft.case; }
    else apply(current);
    session.invalidate();
  };
  const mappingChange = () => { apply(mapping.value); session.invalidate(); };
  mode.addEventListener('change', modeChange); mapping.addEventListener('change', mappingChange);
  onDisconnect(panel, () => { mode.removeEventListener('change', modeChange); mapping.removeEventListener('change', mappingChange); });
  return {panels: [panel], sessions: new Map([[id, session]])};
}
