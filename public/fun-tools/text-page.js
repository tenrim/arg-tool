import {
  workspace,
  select,
  number,
  check,
  fileInput,
  save,
  Field,
  Input,
  Textarea,
  Toolbar,
  Button,
  Box,
  implementation,
} from './common.js';
import { setTextareaValue, updateStatus } from '../ui/index.js';
export function mountText(host, meta) {
  const ui = workspace(host, meta);
  const direction = select('方向', [
    ['encode', '编码／嵌入'],
    ['decode', '解码／提取'],
  ]);
  const engine = select('隐写格式', [
    ['stegcloak', 'StegCloak'],
    ['watermark', '郭飞文本隐水印'],
  ]);
  const password = Input({
    type: 'password',
    attrs: { autocomplete: 'off', 'data-private': 'true' },
  });
  const alphabet = Input({ value: '嗷呜啊~', attrs: { 'aria-label': '四字符字典' } });
  const framed = check('添加兽音首尾标记', false),
    encrypted = check('启用加密', true),
    integrity = check('启用 HMAC 完整性校验', true);
  const zero = Input({ value: '2060', attrs: { 'aria-label': '零字符码点' } }),
    one = Input({ value: 'FEFF', attrs: { 'aria-label': '一字符码点' } });
  const position = select('水印位置', [
    ['random', '随机位置'],
    ['end', '文本末尾'],
    ['index', '指定字符位置'],
  ]);
  const index = number('插入位置（从 0 开始）', 0, 0, 1_000_000, 1);
  const secret = Textarea({ autoSize: true, minRows: 2, maxRows: 8, attrs: { maxlength: 250000 } });
  const text = Textarea({
    id: meta.id + '-input',
    autoSize: true,
    minRows: 4,
    maxRows: 14,
    attrs: { maxlength: 16000064, 'aria-label': '输入文字' },
  });
  const secretField = Field({ label: '需要隐藏的内容', control: secret });
  const stegFields = Box({ children: [encrypted.field, integrity.field] });
  const wmFields = Box({
    children: [
      position.field,
      index.field,
      Field({ label: '0 对应字符（十六进制码点）', control: zero }),
      Field({ label: '1 对应字符（十六进制码点）', control: one }),
    ],
  });
  const keyField = Field({
    label:
      meta.id === 'buddha-codec'
        ? '密码（留空使用佛又曰原版默认值）'
        : '密码（提取时须与嵌入时一致）',
    control: password,
  });
  const textField = Field({
    label: meta.id === 'text-steganography' ? '公开文本（承载隐藏内容）' : '输入文字',
    control: text,
  });
  ui.parameters.append(direction.field);
  if (meta.id === 'text-steganography')
    ui.parameters.append(engine.field, keyField, stegFields, wmFields);
  if (meta.id === 'buddha-codec') ui.parameters.append(keyField);
  if (meta.id === 'beast-codec')
    ui.parameters.append(Field({ label: '四字符字典', control: alphabet }), framed.field);
  const upload = fileInput(ui, '导入 UTF-8 文本文件', '.txt,text/plain');
  const load = Button({
    text: '读取文件到输入框',
    on: {
      click: () =>
        ui.execute(
          async () => {
            if (!upload.file || upload.file.size > 64_000_000)
              throw Error('请选择最多 64 MB 的 UTF-8 文件。');
            const content = new TextDecoder('utf-8', { fatal: true }).decode(
              await upload.file.arrayBuffer(),
            );
            if (content.length > 16000064) throw Error('文件文字超过 1600 万字符。');
            return content;
          },
          (value) => {
            setTextareaValue(text, value);
          },
        ),
    },
  });
  ui.input.append(upload.box, load, textField);
  if (meta.id === 'text-steganography') ui.input.append(secretField);
  function sync() {
    if (meta.id === 'text-steganography') implementation(ui, engine.control.value);
    const wm = engine.control.value === 'watermark';
    const encoding = direction.control.value === 'encode';
    if (meta.id === 'text-steganography') {
      textField.querySelector('[data-ui=field-label]').textContent = encoding
        ? '公开文本（承载隐藏内容）'
        : '含隐藏信息的文本';
      text.setAttribute('aria-label', textField.querySelector('[data-ui=field-label]').textContent);
      text.placeholder = encoding
        ? wm
          ? '输入需要加入水印的公开文本'
          : '例如：今天 一起去看电影（StegCloak 需至少两个词，以空格分隔）'
        : '粘贴需要提取或清除隐藏信息的完整文本';
    }
    stegFields.hidden = wm || !encoding;
    wmFields.hidden = !wm;
    position.field.hidden = !encoding;
    index.field.hidden = !encoding || position.control.value !== 'index';
    integrity.control.disabled = !encrypted.control.checked;
    framed.field.hidden = !encoding;
    secretField.hidden = direction.control.value !== 'encode';
    if (wm && !direction.control.querySelector('option[value=remove]'))
      direction.control.append(select('', [['remove', '移除水印']]).control.firstChild);
    if (!wm) {
      direction.control.querySelector('option[value=remove]')?.remove();
      if (!direction.control.value) direction.control.value = 'encode';
    }
  }
  engine.control.addEventListener('change', sync);
  direction.control.addEventListener('change', sync);
  encrypted.control.addEventListener('change', sync);
  position.control.addEventListener('change', sync);
  sync();
  const drafts = new Map();
  let draftKey = engine.control.value + '/' + direction.control.value;
  const controls = [
    text,
    secret,
    password,
    alphabet,
    framed.control,
    encrypted.control,
    integrity.control,
    zero,
    one,
    position.control,
    index.control,
  ];
  const snapshot = () => controls.map((c) => (c.type === 'checkbox' ? c.checked : c.value));
  const initial = snapshot();
  function switchDraft() {
    drafts.set(draftKey, snapshot());
    draftKey = engine.control.value + '/' + direction.control.value;
    const values = drafts.get(draftKey) || initial;
    controls.forEach((c, i) => {
      if (c.type === 'checkbox') c.checked = values[i];
      else if (c.tagName === 'TEXTAREA') setTextareaValue(c, values[i]);
      else c.value = values[i];
    });
    sync();
  }
  engine.control.addEventListener('change', switchDraft);
  direction.control.addEventListener('change', switchDraft);
  function cp(value) {
    if (!/^[\da-f]{1,6}$/i.test(value)) throw Error('码点需为十六进制数字。');
    const n = parseInt(value, 16);
    if (n > 0x10ffff || (n >= 0xd800 && n <= 0xdfff)) throw Error('码点无效。');
    return String.fromCodePoint(n);
  }
  ui.run.onclick = () =>
    ui.execute(
      (progress) => {
        const options = {
          direction: direction.control.value,
          engine: engine.control.value,
          password: password.value,
          alphabet: alphabet.value,
          framed: framed.control.checked,
          encrypt: encrypted.control.checked,
          integrity: encrypted.control.checked && integrity.control.checked,
          secret: secret.value,
          position: position.control.value,
          index: Number(index.control.value),
          zero: cp(zero.value),
          one: cp(one.value),
        };
        return ui.job.run({ kind: 'text', task: meta.id, text: text.value, options }, progress);
      },
      (value) => {
        const result = Textarea({
          id: meta.id + '-output',
          value,
          autoSize: true,
          minRows: 2,
          maxRows: 14,
          attrs: { readonly: true, 'aria-label': '处理结果' },
        });
        const blob = new Blob([value], { type: 'text/plain;charset=utf-8' });
        ui.output.append(
          result,
          Toolbar({
            children: [
              Button({
                text: '作为输入',
                on: {
                  click: () => {
                    setTextareaValue(text, value);
                    ui.invalidate();
                  },
                },
              }),
              Button({
                text: '复制',
                on: {
                  click: async () => {
                    try {
                      await navigator.clipboard.writeText(value);
                    } catch {
                      updateStatus(ui.status, '复制失败，请选中结果手动复制。', 'error');
                    }
                  },
                },
              }),
              Button({ text: '下载 TXT', on: { click: () => save(blob, meta.id + '.txt') } }),
            ],
          }),
        );
        ui.recording.publish({ text: value });
      },
    );
  return ui;
}
