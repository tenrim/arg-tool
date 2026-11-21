import { CLASSICAL_CIPHERS } from '../expansion/classical-catalog.js';
import { parameter } from '../expansion/view-common.js';
import { Box, Button, Disclosure, Field, FormGrid, Option, Select, element } from '../ui/index.js';
import { CONDITIONAL_OPERATIONS } from '../clue-analysis/conditional-operations.js';
import { defaults, renderParameters } from '../chef-tools/schema.js';
import { operationName } from '../cyberchef-i18n.js';

export function analysisConditions({ invalidate, run, showError }) {
  let definition,
    step,
    loading,
    disposed = false;
  const select = Select({
    id: 'analysis-conditional-operation',
    children: [
      ...CLASSICAL_CIPHERS.map((cipher) => Option(cipher.label, 'native:' + cipher.id)),
      ...CONDITIONAL_OPERATIONS.map((op) => Option(operationName(op), op)),
    ],
  });
  const binaryOps = ['AMF Decode', 'CBOR Decode', 'From MessagePack', 'Protobuf Decode'];
  const inputFormat = Select({
    id: 'analysis-conditional-format',
    children: [
      Option('十六进制字节', 'hex'),
      Option('Base64 字节', 'base64'),
      Option('原文本 UTF-8 字节', 'utf8'),
    ],
  });
  const sourceField = Field({ label: '二进制记录的文本表示', control: inputFormat });
  sourceField.hidden = true;
  inputFormat.addEventListener('change', invalidate);
  const fields = FormGrid({ layout: 'flow' });
  const execute = Button({
    text: '按这些条件解密并继续分析',
    disabled: true,
    on: {
      click: () => {
        const selectedStep = step.adapter
          ? step
          : { adapter: 'cyberchef', params: { recipe: [step] } };
        const prefix =
          binaryOps.includes(select.value) && inputFormat.value !== 'utf8'
            ? [
                {
                  adapter: 'cyberchef',
                  params: {
                    recipe: [{ op: inputFormat.value === 'hex' ? 'From Hex' : 'From Base64' }],
                  },
                },
                selectedStep,
              ]
            : [selectedStep];
        run(structuredClone(prefix));
      },
    },
  });
  const root = Disclosure({
    children: [
      element('summary', { text: '已知算法、密钥或密码机设置' }),
      element('p', {
        text: '这些算法不能仅凭密文确定参数。选择题目给出的算法并填写条件，使用原引擎执行；结果会继续进入文字分析。这里不会猜造密钥、IV 或转子设置。',
      }),
      Field({ label: '已知算法', control: select }),
      sourceField,
      fields,
      Box({ children: [execute] }),
    ],
  });
  async function refresh() {
    invalidate();
    execute.disabled = true;
    sourceField.hidden = !binaryOps.includes(select.value);
    try {
      if (select.value.startsWith('native:')) {
        const cipher = CLASSICAL_CIPHERS.find((item) => 'native:' + item.id === select.value);
        step = { adapter: 'puzzle/classical:' + cipher.id, params: { options: {} } };
        fields.replaceChildren(
          ...cipher.fields.map((field) => {
            const control = parameter(
              'analysis-native-' + field.id,
              field.label,
              field.default,
              field.type,
              field.options,
            );
            step.params.options[field.id] = control.node.value;
            control.node.addEventListener('input', () => {
              step.params.options[field.id] = control.node.value;
              invalidate();
            });
            control.node.addEventListener('change', () => {
              step.params.options[field.id] = control.node.value;
              invalidate();
            });
            return control.field;
          }),
        );
        fields.append(element('p', { text: cipher.limitation }));
        execute.disabled = false;
        return;
      }
      const selectedOperation = select.value;
      loading ||= fetch(new URL('../vendor/cyberchef/catalogue.json', import.meta.url))
        .then(async (response) => {
          if (!response.ok) throw Error('原操作目录加载失败。');
          return (await response.json()).operations;
        })
        .catch((error) => {
          loading = null;
          throw error;
        });
      const operations = await loading;
      if (disposed || select.value !== selectedOperation) return;
      definition = operations[select.value];
      if (!definition) throw Error('原引擎未登记此操作。');
      step = { op: select.value, args: defaults(definition) };
      renderParameters(fields, definition, step, invalidate);
      execute.disabled = false;
    } catch (error) {
      if (!disposed) showError(error.message);
    }
  }
  select.addEventListener('change', refresh);
  root.addEventListener('toggle', () => {
    if (root.open && !step) refresh();
  });
  return {
    root,
    busy: (value) => {
      execute.disabled = value || !step;
    },
    dispose: () => {
      disposed = true;
    },
  };
}
