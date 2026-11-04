import {
  element as uiElement,
  Option as uiOption,
  Box,
  Field,
  CheckGroup,
  uid,
  Disclosure,
  FormGrid,
} from '../ui/index.js';
import { parameterName, optionName, operationName } from '../cyberchef-i18n.js';
const elem = uiElement;
export const schemas = (operation) => operation.args.filter((arg) => arg.type !== 'label');
export function defaults(operation) {
  const args = schemas(operation).map((arg) => {
    if (arg.type === 'toggleString')
      return { option: arg.toggleValues[0], string: arg.value || '' };
    if (Array.isArray(arg.value)) {
      const option = arg.value[arg.defaultIndex || 0];
      return typeof option === 'object'
        ? arg.type.startsWith('editable')
          ? option.value
          : option.name
        : option;
    }
    if (
      arg.type === 'number' &&
      typeof arg.value === 'string' &&
      arg.value.trim() &&
      Number.isFinite(Number(arg.value))
    )
      return Number(arg.value);
    return arg.value ?? '';
  });
  schemas(operation).forEach((arg, i) => {
    if (arg.type.startsWith('populate')) populate(arg, args[i], args);
  });
  return args;
}
export function populate(arg, name, args) {
  const selected = arg.value.find((v) => v.name === name);
  if (!selected) return;
  if (Array.isArray(arg.target))
    arg.target.forEach((index, i) => {
      args[index] = selected.value[i];
    });
  else args[arg.target] = selected.value;
}

export function renderParameters(fields, definition, step, onChange) {
  const expanded = fields.querySelector('.ct-advanced')?.open || false;
  fields.replaceChildren();
  let refreshSummary = () => {};
  const args = schemas(definition);
  let checks;
  args.forEach((arg, i) => {
    const composite = arg.type === 'toggleString' || arg.type.startsWith('editable');
    const field = Field({
      tag: composite ? 'div' : 'label',
      className: 'chef-arg',
      label: parameterName(arg.name),
      span: composite ? 'wide' : undefined,
    });
    field.dataset.arg = i;
    if (composite) {
      field.classList.add('chef-composite');
      field.firstChild.id = uid('parameter-label');
      field.setAttribute('role', 'group');
      field.setAttribute('aria-labelledby', field.firstChild.id);
    }
    let control;
    const change = (value) => {
      step.args[i] = value;
      onChange();
      refreshSummary();
      if (arg.type === 'argSelector') visibility();
      if (arg.type.startsWith('populate')) {
        populate(arg, value, step.args);
        renderParameters(fields, definition, step, onChange);
      }
    };
    if (arg.type === 'boolean') {
      control = elem('input');
      control.type = 'checkbox';
      control.checked = !!step.args[i];
      control.onchange = () => change(control.checked);
      field.classList.add('chef-check');
    } else if (arg.type === 'toggleString') {
      const row = elem('div', undefined, 'chef-toggle-string'),
        format = elem('select'),
        value = elem('input');
      value.type = 'text';
      for (const option of arg.toggleValues) format.append(uiOption(optionName(option), option));
      format.value = step.args[i]?.option || arg.toggleValues[0];
      value.value = step.args[i]?.string || '';
      value.setAttribute('aria-label', `${operationName(step.op)} ${parameterName(arg.name)}`);
      format.setAttribute('aria-label', `${operationName(step.op)} ${parameterName(arg.name)}格式`);
      value.oninput = () => change({ option: format.value, string: value.value });
      format.onchange = () => change({ option: format.value, string: value.value });
      row.append(format, value);
      control = row;
    } else if (
      ['option', 'argSelector', 'populateOption', 'populateMultiOption'].includes(arg.type)
    ) {
      control = elem('select');
      for (const option of arg.value) {
        const name = typeof option === 'object' ? option.name : String(option);
        control.append(uiOption(optionName(name), name));
      }
      control.value = String(step.args[i]);
      control.onchange = () => change(control.value);
    } else {
      // Only upstream multiline text/byte arguments need an editor. String
      // fields (names, emails, passwords, separators) stay on one line.
      const multiline =
        ['text', 'binaryString'].includes(arg.type) ||
        arg.name === 'Text' ||
        (typeof step.args[i] === 'string' && /[\r\n]/.test(step.args[i]));
      control = elem(multiline ? 'textarea' : 'input');
      if (control.tagName === 'INPUT')
        control.type =
          arg.type === 'number'
            ? 'number'
            : /password|passphrase/i.test(arg.name)
              ? 'password'
              : 'text';
      if (control.tagName === 'TEXTAREA') {
        control.rows = 3;
        field.dataset.span = 'full';
      }
      control.value = step.args[i] ?? '';
      if (arg.type === 'number') {
        control.step = arg.integer ? '1' : 'any';
        for (const key of ['min', 'max']) if (arg[key] !== undefined) control[key] = arg[key];
      }
      if (arg.type.startsWith('editable')) {
        const choices = elem('select');
        choices.setAttribute('aria-label', `${parameterName(arg.name)}预设`);
        choices.append(uiOption('选择预设…', ''));
        for (const option of arg.value)
          choices.append(uiOption(optionName(option.name), option.value));
        choices.onchange = () => {
          control.value = choices.value;
          change(control.value);
        };
        field.append(choices);
      }
      control.oninput = () =>
        change(arg.type === 'number' ? parseFloat(control.value) : control.value);
    }
    if (control.tagName !== 'DIV')
      control.setAttribute('aria-label', `${operationName(step.op)} ${parameterName(arg.name)}`);
    if (!composite) {
      control.id = uid('parameter');
      field.htmlFor = control.id;
    }
    if (arg.type.startsWith('editable')) {
      const choices = field.querySelector('select');
      const syncPreset = () => {
        choices.value = [...choices.options].some((option) => option.value === control.value)
          ? control.value
          : '';
      };
      control.addEventListener('input', syncPreset);
      syncPreset();
      field.append(Box({ className: 'chef-editable-value', children: [choices, control] }));
    } else field.append(control);
    if (arg.type === 'boolean') {
      if (!checks) {
        checks = CheckGroup();
        fields.append(checks);
      }
      checks.append(field);
    } else {
      checks = null;
      fields.append(field);
    }
  });
  function visibility() {
    const labels = [...fields.querySelectorAll('[data-arg]')].sort(
      (a, b) => +a.dataset.arg - +b.dataset.arg,
    );
    for (const field of labels) field.hidden = false;
    args.forEach((arg, i) => {
      if (arg.type === 'argSelector') {
        const option = arg.value.find((v) => v.name === step.args[i]);
        for (const n of option?.off || []) if (labels[n]) labels[n].hidden = true;
        for (const n of option?.on || []) if (labels[n]) labels[n].hidden = false;
      }
    });
  }
  visibility();
  const compactBase = /^(?:From|To) Base(?:32|45|58|62|64|85|92)$/.test(step.op);
  const advancedNames = compactBase
    ? args.map((a) => a.name)
    : step.op === 'Magic'
      ? ['Depth', 'Intensive mode', 'Extensive language support']
      : /^AES /.test(step.op)
        ? ['IV from input', 'IV length', 'Additional Authenticated Data']
        : [];
  if (advancedNames.length && fields.closest('.ct-tool')) {
    const summary = elem('summary');
    const advanced = Disclosure({ className: 'ct-advanced', children: [summary] });
    advanced.open = expanded;
    const body = FormGrid({ layout: 'flow' });
    for (const field of [...fields.querySelectorAll('[data-arg]')]) {
      if (advancedNames.includes(args[+field.dataset.arg].name)) body.append(field);
    }
    for (const group of fields.querySelectorAll('[data-ui=check-group]'))
      if (!group.children.length) group.remove();
    const original = defaults(definition);
    refreshSummary = () => {
      const changed = args.filter(
        (a, i) =>
          advancedNames.includes(a.name) &&
          JSON.stringify(step.args[i]) !== JSON.stringify(original[i]),
      ).length;
      summary.textContent =
        `高级参数 · ${changed ? '已调整 ' + changed + ' 项' : '默认设置'}` +
        (step.op === 'From Base64'
          ? (step.args[1] ? ' · 忽略非字符表字符' : ' · 保留非字符表字符') +
            (step.args[2] ? ' · 严格模式' : ' · 宽松模式')
          : '');
    };
    refreshSummary();
    advanced.append(body);
    fields.append(advanced);
  }
  if (step.op === 'Generate PGP Key Pair' && fields.closest('.ct-tool')) {
    const password = fields.querySelector('[data-arg="1"]');
    const advanced = elem('details', undefined, 'ct-advanced');
    advanced.append(elem('summary', '私钥密码（可选）'), password);
    fields.append(advanced);
  }
}
