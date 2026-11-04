import { presetControls, PRESETS_KEY } from './parameter-presets.js';
import { getPreferences } from './preferences.js';

export const TOOL_PARAMETERS_KEY = 'arg.ui.tool-parameters.v1';
const SELECTIONS_KEY = 'arg.ui.tool-selections.v1';
const LIMIT = 131072;
const PARAMETER_AREA = '.ui-conversion-controls,[data-parameter-scope]';
const PARAMETER_CONTROLS =
  '.ui-conversion-controls select,.ui-conversion-controls input,[data-parameter-scope] select,[data-parameter-scope] input';
function read(key) {
  try {
    const raw = localStorage.getItem(key) || '{}';
    if (raw.length > LIMIT) return {};
    const value = JSON.parse(raw);
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}
function write(key, value) {
  try {
    const rows = Object.entries(value).slice(-256),
      text = JSON.stringify(Object.fromEntries(rows));
    if (text.length > LIMIT) return false;
    localStorage.setItem(key, text);
    return true;
  } catch {
    return false;
  }
}
export function clearToolPreferences() {
  let saved = true;
  for (const key of [TOOL_PARAMETERS_KEY, SELECTIONS_KEY, PRESETS_KEY])
    try {
      localStorage.removeItem(key);
    } catch {
      saved = false;
    }
  return saved;
}
export function rememberedToolSelection(id) {
  if (!getPreferences().rememberParameters) return null;
  const value = read(SELECTIONS_KEY)[id];
  return value && typeof value === 'object'
    ? Object.fromEntries(
        ['op', 'direction', 'variant']
          .filter((k) => typeof value[k] === 'string' && value[k].length < 256)
          .map((k) => [k, value[k]]),
      )
    : null;
}
export function rememberToolSelection(id, selection) {
  if (!getPreferences().rememberParameters || !id) return;
  const rows = read(SELECTIONS_KEY);
  rows[id] = Object.fromEntries(
    ['op', 'direction', 'variant']
      .filter((k) => typeof selection[k] === 'string' && selection[k].length < 256)
      .map((k) => [k, selection[k]]),
  );
  write(SELECTIONS_KEY, rows);
}

let presets;
let active = null,
  installed = false,
  restoring = false;
const restored = new Set();
// Only parameter controls are eligible. Never inspect editor/file contents or
// persist free-form text, credentials, result sources, record/query selectors.
function parameter(control) {
  if (
    !active ||
    !active.panel.contains(control) ||
    !control.closest(PARAMETER_AREA) ||
    control.closest('[hidden]') ||
    control.closest('[data-parameter-presets]')
  )
    return null;
  if (
    !control.matches('select,input[type=number],input[type=range],input[type=checkbox]') ||
    control.disabled ||
    control.multiple
  )
    return null;
  if (control.matches('.ct-direction') || active.directions.some((s) => control.matches(s)))
    return null;
  const field = control.closest('[data-ui=field]'),
    label = field?.querySelector('[data-ui=field-label]')?.textContent || '';
  if (
    /password|passphrase|secret|private|nonce|salt|token|\bkey\b|\biv\b|密码|口令|密钥|私钥|令牌|随机种子|初始化向量/i.test(
      control.id + ' ' + control.getAttribute('aria-label') + ' ' + label,
    )
  )
    return null;
  if (control.matches('.ct-source') && !['text', 'hex', 'base64'].includes(control.value))
    return null;
  const key = control.matches('.ct-source')
    ? 'source'
    : field?.hasAttribute('data-arg')
      ? 'arg:' +
        field.dataset.arg +
        ':' +
        [...field.querySelectorAll('input,select')].indexOf(control)
      : control.id;
  if (!key || key.length > 160) return null;
  const value =
    control.type === 'checkbox'
      ? control.checked
      : control.matches('input[type=number],input[type=range]')
        ? control.valueAsNumber
        : control.value;
  if (
    (typeof value === 'number' && (!Number.isFinite(value) || !control.checkValidity())) ||
    (typeof value === 'string' && value.length > 256)
  )
    return null;
  return { key, value };
}
export function initToolPreferences() {
  if (installed) return;
  installed = true;
  document.addEventListener(
    'change',
    (event) => {
      if (restoring || !getPreferences().rememberParameters) return;
      const item = parameter(event.target);
      if (!item) return;
      const rows = read(TOOL_PARAMETERS_KEY),
        values = rows[active.key];
      rows[active.key] = {
        ...(values && typeof values === 'object' && !Array.isArray(values) ? values : {}),
        [item.key]: item.value,
      };
      write(TOOL_PARAMETERS_KEY, rows);
    },
    true,
  );
}
export function deactivateToolPreferences() {
  active = null;
  presets?.hide();
}
export function activateToolPreferences(panel, entry, operation) {
  active = {
    panel,
    key: entry.id + '|' + (operation || entry.variantId || ''),
    directions: (entry.open.nativeDirections || [])
      .flatMap((d) => (d.controls || []).map((c) => c.selector))
      .filter(Boolean),
  };
  presets ||= presetControls({ snapshot: parameterSnapshot, apply: applyParameters });
  const area = panel.querySelector(PARAMETER_AREA);
  if (area) presets.activate(area, active.key);
  else presets.hide();
  if (!getPreferences().rememberParameters || restored.has(active.key)) return;
  const values = read(TOOL_PARAMETERS_KEY)[active.key];
  if (!values || typeof values !== 'object' || Array.isArray(values)) return;
  restored.add(active.key);
  applyParameters(values);
}
export function parameterSnapshot() {
  if (!active) return {};
  return Object.fromEntries(
    [...active.panel.querySelectorAll(PARAMETER_CONTROLS)]
      .map(parameter)
      .filter(Boolean)
      .map((v) => [v.key, v.value]),
  );
}
export function applyParameters(values) {
  if (!active) return 0;
  const panel = active.panel;
  let applied = 0;
  restoring = true;
  try {
    // Re-query each field after change: operation selectors may rebuild children.
    const visited = new Set();
    for (let count = 0; count < 512; count++) {
      const control = [...panel.querySelectorAll(PARAMETER_CONTROLS)].find((c) => {
        const key = parameter(c)?.key;
        return key && !visited.has(key) && Object.hasOwn(values, key);
      });
      if (!control) break;
      const key = parameter(control).key;
      visited.add(key);
      const value = values[key],
        old = control.value;
      if (control.type === 'checkbox') {
        if (typeof value !== 'boolean') continue;
        control.checked = value;
      } else if (control.tagName === 'SELECT') {
        if (
          typeof value !== 'string' ||
          !Array.from(control.options).some((o) => o.value === value && !o.disabled) ||
          (control.matches('.ct-source') && !['text', 'hex', 'base64'].includes(value))
        )
          continue;
        control.value = value;
      } else {
        if (typeof value !== 'number' || !Number.isFinite(value)) continue;
        control.value = String(value);
        if (!control.checkValidity()) {
          control.value = old;
          continue;
        }
      }
      applied++;
      control.dispatchEvent(new Event('input', { bubbles: true }));
      control.dispatchEvent(new Event('change', { bubbles: true }));
    }
  } finally {
    restoring = false;
  }
  return applied;
}
