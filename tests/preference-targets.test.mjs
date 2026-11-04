import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRegistry } from '../public/capabilities/registry.js';
import { createPreferenceTargets } from '../public/capabilities/preference-targets.js';
import * as preferences from '../public/preferences.js';
const registry = createRegistry(
  JSON.parse(await readFile(new URL('../public/vendor/cyberchef/catalogue.json', import.meta.url))),
);
const targets = createPreferenceTargets(registry);
test('偏好目标只接受真实工具及具名路由参数，旧页面键仍能迁移', () => {
  assert.equal(targets.resolve('it-reference').id, 'native:it-ports');
  assert.equal(
    targets.resolve('unitconvert?task=native%3Aunits-thermal').id,
    'native:units-thermal',
  );
  for (const value of [
    'missing',
    'javascript:alert(1)',
    'unitconvert?task=native%3Aunits-thermal&input=private',
    'unitconvert?task=missing',
    'unitconvert?task=native%3Aunits-thermal&op=missing',
    'unitconvert?task=native%3Aunits-thermal&dir=missing',
    'unitconvert?task=native%3Aunits-thermal&task=native%3Aunits-light',
  ])
    assert.equal(targets.resolve(value), null, value);
  assert.equal(new Set(targets.options.map((entry) => entry.id)).size, targets.options.length);
  assert.equal(targets.options.filter((entry) => entry.id === 'topic:braille').length, 1);
});
test('收藏和启动恢复保存真实成员，备份仍兼容原格式且不接受输入数据', () => {
  const original = { document: globalThis.document, localStorage: globalThis.localStorage },
    storage = new Map();
  globalThis.document = { documentElement: { dataset: {} }, dispatchEvent() {} };
  globalThis.localStorage = {
    getItem: (key) => storage.get(key) || null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key),
  };
  try {
    preferences.configurePreferenceTargets(targets);
    const ports = 'it-reference?task=native%3Ait-ports',
      http = 'it-reference?task=native%3Ait-http',
      thermal = 'unitconvert?task=native%3Aunits-thermal';
    preferences.setFavorites([ports]);
    assert(preferences.isFavorite(ports));
    assert(!preferences.isFavorite(http));
    const braille = targets.options.find((entry) => entry.id === 'topic:braille').route;
    const languages = targets.resolve('braille-languages').route;
    preferences.setFavorites([braille, languages]);
    assert.equal(preferences.favoriteEntries().length, 1);
    assert.equal(preferences.favoriteEntries()[0].route, languages);
    preferences.setPreferences({ startPage: 'last' });
    preferences.recordTool('unitconvert', {
      id: 'native:units-thermal',
      title: '热学与能量单位',
      route: thermal,
    });
    assert.equal(preferences.initialRoute(), thermal);
    preferences.configurePreferenceTargets(targets);
    assert.equal(preferences.initialRoute(), thermal, 'cold initialization restores the same tool');
    preferences.setPreferences({ startPage: thermal });
    preferences.setFavorites([http, languages]);
    const backup = preferences.exportPreferences();
    assert.equal(JSON.parse(backup).version, 2);
    preferences.setFavorites([]);
    preferences.importPreferences(backup);
    assert.equal(preferences.getPreferences().startPage, thermal);
    assert.deepEqual(
      preferences.favoriteEntries().map((entry) => entry.id),
      ['native:it-http', 'topic:braille'],
    );
    const old = JSON.stringify({
      format: 'arg-tool-preferences',
      version: 1,
      preferences: { startPage: 'it-reference' },
      favorites: ['it-reference'],
    });
    preferences.importPreferences(old);
    assert.equal(preferences.favoriteEntries()[0].id, 'native:it-ports');
    const before = preferences.exportPreferences();
    assert.throws(() =>
      preferences.importPreferences(
        JSON.stringify({
          format: 'arg-tool-preferences',
          version: 1,
          preferences: { startPage: thermal },
          favorites: [http + '&input=secret'],
        }),
      ),
    );
    assert.equal(preferences.exportPreferences(), before);
    preferences.setFavorites(
      registry.entries
        .filter((entry) => entry.listed !== false)
        .map(
          (entry) => (entry.route || entry.open.route) + '?task=' + encodeURIComponent(entry.id),
        ),
    );
    assert(
      preferences.favoriteEntries().length > targets.options.length,
      'tool and article favorites share the complete registered catalogue',
    );
    assert.equal(
      preferences.parsePreferencesBackup(preferences.exportPreferences()).favorites.length,
      preferences.favoriteEntries().length,
    );
  } finally {
    preferences.clearRecent();
    preferences.configurePreferenceTargets(null);
    Object.assign(globalThis, original);
  }
});
