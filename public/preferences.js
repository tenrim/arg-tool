import { toolPages } from './navigation.js';

export const PREFERENCES_KEY = 'arg.ui.preferences.v1';
export const FAVORITES_KEY = 'arg.ui.favorites.v1';
const LAST_KEY = 'arg.ui.last-tool.v1',
  validTools = new Set(toolPages.map((p) => p.route));
export const DEFAULT_PREFERENCES = Object.freeze({
  motion: 'system',
  scanlines: true,
  textSize: 'standard',
  density: 'compact',
  startPage: 'home',
  showRecent: true,
  showFavorites: true,
  sidebarCollapsed: false,
  inputWrap: 'wrap',
  resultWrap: 'wrap',
  editorSize: 14,
  rememberParameters: false,
  recordRecent: true,
  recentLimit: 6,
  favoriteSort: 'manual',
  runShortcut: true,
  masterVolume: 100,
  audioMuted: false,
  searchKnowledge: false,
});
const choices = {
  motion: ['system', 'reduce'],
  textSize: ['standard', 'large'],
  density: ['compact', 'comfortable'],
  startPage: ['home', 'last', ...validTools],
  inputWrap: ['wrap', 'scroll'],
  resultWrap: ['wrap', 'scroll'],
  editorSize: [12, 14, 16, 18, 20, 24],
  recentLimit: [6, 12, 20],
  favoriteSort: ['manual', 'name'],
};
let preferences,
  installed = false,
  recent = [],
  targets = null;
export function preferenceTarget(value) {
  return targets ? targets.resolve(value) : toolPages.find((page) => page.route === value);
}
export function startupTargets() {
  return targets?.options || [];
}
export function configurePreferenceTargets(value) {
  targets = value;
  preferences = undefined;
  sessionFavorites = undefined;
  apply();
  emit('arg:collectionschange');
}
const validTarget = (value) => Boolean(preferenceTarget(value));
const normalizedTarget = (value) => preferenceTarget(value)?.route;
function normalizeFavorites(ids) {
  const unique = new Map();
  for (const value of ids) {
    const target = preferenceTarget(value);
    if (target) unique.set(target.id || target.route, target.route);
  }
  return [...unique.values()];
}
function read(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function write(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}
function emit(name) {
  document.dispatchEvent(new Event(name));
}
export function validatePreferences(value, { strict = false } = {}) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw Error('设置格式无效。');
  const result = { ...DEFAULT_PREFERENCES };
  if (strict && Object.keys(value).some((key) => !Object.hasOwn(DEFAULT_PREFERENCES, key)))
    throw Error('设置包含无法识别的选项。');
  for (const key of Object.keys(DEFAULT_PREFERENCES)) {
    if (!Object.hasOwn(value, key)) continue;
    const valid =
      key === 'startPage'
        ? ['home', 'last'].includes(value[key]) || validTarget(value[key])
        : key === 'masterVolume'
          ? Number.isInteger(value[key]) && value[key] >= 0 && value[key] <= 100
          : choices[key]
            ? choices[key].includes(value[key])
            : typeof value[key] === 'boolean';
    if (!valid) {
      if (strict) throw Error('设置选项无效：' + key);
      continue;
    }
    result[key] =
      key === 'startPage' && validTarget(value[key]) ? normalizedTarget(value[key]) : value[key];
  }
  return result;
}
export function getPreferences() {
  if (!preferences) {
    try {
      preferences = validatePreferences(JSON.parse(read(PREFERENCES_KEY) || '{}'));
    } catch {
      preferences = { ...DEFAULT_PREFERENCES };
    }
  }
  return { ...preferences };
}
function apply() {
  const p = getPreferences(),
    root = document.documentElement;
  root.dataset.uiMotion = p.motion;
  root.dataset.uiText = p.textSize;
  root.dataset.uiDensity = p.density;
  root.dataset.uiScanlines = String(p.scanlines);
  root.dataset.uiRunShortcut = String(p.runShortcut);
  root.dataset.inputWrap = p.inputWrap;
  root.dataset.resultWrap = p.resultWrap;
  root.style?.setProperty('--ui-editor-size', p.editorSize + 'px');
  emit('arg:preferenceschange');
}
export function setPreferences(patch) {
  preferences = validatePreferences({ ...getPreferences(), ...patch }, { strict: true });
  const saved = write(PREFERENCES_KEY, JSON.stringify(preferences));
  if (!preferences.recordRecent) clearRecent();
  else recent = recent.slice(0, preferences.recentLimit);
  if (preferences.startPage === 'last' && recent[0])
    write(LAST_KEY, normalizedTarget(recent[0].route) || recent[0].toolRoute);
  apply();
  emit('arg:collectionschange');
  return saved;
}
export function resetPreferences() {
  return setPreferences({ ...DEFAULT_PREFERENCES });
}
export function getFavorites(value) {
  try {
    const raw = value ?? read(FAVORITES_KEY) ?? '[]';
    if (raw.length > 65536) return new Set();
    const list = JSON.parse(raw);
    return new Set(Array.isArray(list) ? normalizeFavorites(list) : []);
  } catch {
    return new Set();
  }
}
let sessionFavorites;
export function favorites() {
  return new Set((sessionFavorites ??= getFavorites()));
}
export function setFavorites(ids) {
  sessionFavorites = new Set(normalizeFavorites(ids));
  const saved = write(FAVORITES_KEY, JSON.stringify([...sessionFavorites]));
  emit('arg:collectionschange');
  return saved;
}
export function favoriteEntries() {
  const entries = [...favorites()].map(preferenceTarget).filter(Boolean);
  return getPreferences().favoriteSort === 'name'
    ? entries.sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'))
    : entries;
}
export function moveFavorite(route, offset) {
  const entries = [...favorites()],
    index = entries.indexOf(route),
    next = index + offset;
  if (index < 0 || next < 0 || next >= entries.length) return false;
  [entries[index], entries[next]] = [entries[next], entries[index]];
  return setFavorites(entries);
}
export function isFavorite(value) {
  const target = preferenceTarget(value);
  return Boolean(
    target &&
    favoriteEntries().some((entry) => (entry.id || entry.route) === (target.id || target.route)),
  );
}
export function getRecent() {
  return recent.map((entry) => entry.toolRoute);
}
export function getRecentEntries() {
  return recent.map((entry) => ({ ...entry }));
}
export function clearRecent() {
  recent = [];
  try {
    localStorage.removeItem(LAST_KEY);
  } catch {
    /* Session history still clears. */
  }
  emit('arg:collectionschange');
}
export function recordTool(route, selection) {
  const p = getPreferences();
  if (!p.recordRecent || !validTools.has(route)) return;
  const entry = selection
    ? { ...selection, toolRoute: route }
    : {
        id: 'page:' + route,
        title: toolPages.find((page) => page.route === route).title,
        route,
        toolRoute: route,
      };
  recent = [entry, ...recent.filter((old) => old.id !== entry.id)].slice(0, p.recentLimit);
  if (p.startPage === 'last') write(LAST_KEY, normalizedTarget(entry.route) || route);
  emit('arg:collectionschange');
}
export function initialRoute() {
  const p = getPreferences();
  return p.startPage === 'last'
    ? (p.recordRecent && normalizedTarget(read(LAST_KEY))) || 'home'
    : p.startPage;
}
export function exportPreferences() {
  return JSON.stringify(
    {
      format: 'arg-tool-preferences',
      version: 2,
      preferences: getPreferences(),
      favorites: [...favorites()],
    },
    null,
    2,
  );
}
export function parsePreferencesBackup(text) {
  if (typeof text !== 'string' || text.length > 65536) throw Error('设置文件超过 64 KB。');
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw Error('设置文件不是有效 JSON。');
  }
  if (data?.format !== 'arg-tool-preferences' || ![1, 2].includes(data.version))
    throw Error('不是支持的工具箱设置文件。');
  const next = validatePreferences(data.preferences, { strict: true });
  if (
    !Array.isArray(data.favorites) ||
    data.favorites.length > (targets?.limit || validTools.size) ||
    data.favorites.some((id) => !validTarget(id))
  )
    throw Error('收藏列表包含无效工具。');
  return { preferences: next, favorites: normalizeFavorites(data.favorites) };
}
export function importPreferences(text) {
  const next = parsePreferencesBackup(text);
  const saved = setPreferences(next.preferences);
  return setFavorites(next.favorites) && saved;
}
export function initPreferences() {
  if (installed) return;
  installed = true;
  apply();
  window.addEventListener('storage', (event) => {
    if (event.key === PREFERENCES_KEY || event.key === null) {
      preferences = undefined;
      const p = getPreferences();
      if (!p.recordRecent) clearRecent();
      else recent = recent.slice(0, p.recentLimit);
      apply();
      emit('arg:collectionschange');
    }
    if (event.key === FAVORITES_KEY || event.key === null) {
      sessionFavorites = getFavorites(event.newValue);
      emit('arg:collectionschange');
    }
  });
}
