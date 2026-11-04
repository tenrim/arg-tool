import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_PREFERENCES,
  validatePreferences,
  parsePreferencesBackup,
  recordTool,
  getRecentEntries,
  getRecent,
  clearRecent,
} from '../public/preferences.js';
test('search knowledge defaults off, accepts only booleans and restores old backups safely', () => {
  assert.equal(DEFAULT_PREFERENCES.searchKnowledge, false);
  assert.equal(validatePreferences({}).searchKnowledge, false);
  assert.equal(
    validatePreferences({ searchKnowledge: true }, { strict: true }).searchKnowledge,
    true,
  );
  for (const searchKnowledge of ['true', 'false', 0, 1, null])
    assert.throws(() => validatePreferences({ searchKnowledge }, { strict: true }));
  for (const version of [1, 2]) {
    const backup = { format: 'arg-tool-preferences', version, preferences: {}, favorites: [] };
    assert.equal(parsePreferencesBackup(JSON.stringify(backup)).preferences.searchKnowledge, false);
    backup.preferences.searchKnowledge = true;
    assert.equal(parsePreferencesBackup(JSON.stringify(backup)).preferences.searchKnowledge, true);
  }
});
test('session recents replace the latest member of one workspace without merging other tools on the same panel', () => {
  const oldDocument = globalThis.document;
  globalThis.document = { dispatchEvent() {} };
  try {
    clearRecent();
    recordTool('symbols', {
      id: 'topic:braille',
      title: '盲文工具',
      route: 'symbols?task=topic%3Abraille&view=native%3Abraille',
    });
    recordTool('braille-languages', {
      id: 'topic:braille',
      title: '盲文工具',
      route: 'braille-languages?task=topic%3Abraille&view=native%3Abraille-languages',
    });
    assert.equal(getRecentEntries().length, 1);
    assert.deepEqual(getRecent(), ['braille-languages']);
    assert.match(getRecentEntries()[0].route, /view=native%3Abraille-languages/);
    recordTool('symbols', {
      id: 'native:pigpen',
      title: '猪圈密码',
      route: 'symbols?task=native%3Apigpen',
    });
    assert.equal(getRecentEntries().length, 2);
    assert.equal(getRecentEntries()[1].title, '盲文工具');
  } finally {
    clearRecent();
    globalThis.document = oldDocument;
  }
});

test('preferences recover invalid stored fields without applying unsafe values', () => {
  const p = validatePreferences({
    motion: 'always',
    density: 'comfortable',
    scanlines: 'false',
    startPage: 'missing',
    textSize: 'large',
  });
  assert.equal(p.motion, 'system');
  assert.equal(p.scanlines, true);
  assert.equal(p.startPage, 'home');
  assert.equal(p.density, 'comfortable');
  assert.equal(p.textSize, 'large');
});
test('strict preference imports reject unknown keys and invalid types', () => {
  for (const value of [
    { constructor: 'x' },
    { scanlines: 0 },
    { startPage: 'resources' },
    { textSize: '999' },
    { motion: 'always' },
    JSON.parse('{"__proto__":{"polluted":true}}'),
  ])
    assert.throws(() => validatePreferences(value, { strict: true }));
  assert.equal({}.polluted, undefined);
});
test('preference defaults are immutable and callers cannot change the schema', () => {
  assert.ok(Object.isFrozen(DEFAULT_PREFERENCES));
  const p = validatePreferences({});
  p.motion = 'reduce';
  assert.equal(DEFAULT_PREFERENCES.motion, 'system');
  assert.equal(validatePreferences({}).startPage, 'home');
});
test('versioned preference backups preserve only supported settings and tool IDs', () => {
  const text = JSON.stringify({
    format: 'arg-tool-preferences',
    version: 1,
    preferences: { ...DEFAULT_PREFERENCES, motion: 'reduce' },
    favorites: ['crypto', 'image', 'crypto'],
  });
  assert.deepEqual(parsePreferencesBackup(text), {
    preferences: { ...DEFAULT_PREFERENCES, motion: 'reduce' },
    favorites: ['crypto', 'image'],
  });
});
test('invalid backup payloads are rejected before any preferences can apply', () => {
  for (const value of [
    '{',
    'x'.repeat(65537),
    JSON.stringify({ version: 2 }),
    JSON.stringify({
      format: 'arg-tool-preferences',
      version: 1,
      preferences: { motion: 'reduce' },
      favorites: ['settings'],
    }),
    JSON.stringify({
      format: 'arg-tool-preferences',
      version: 1,
      preferences: { code: 'secret' },
      favorites: [],
    }),
  ])
    assert.throws(() => parsePreferencesBackup(value));
});

test('new preference bounds reject malformed imports and keep old backup defaults', () => {
  for (const patch of [
    { masterVolume: -1 },
    { masterVolume: 101 },
    { masterVolume: 0.5 },
    { masterVolume: '40' },
    { masterVolume: NaN },
    { editorSize: 99 },
    { recentLimit: 0 },
    { recentLimit: '12' },
    { inputWrap: 'truncate' },
    { favoriteSort: 'recent' },
    { recordRecent: 0 },
    { runShortcut: 'false' },
    { audioMuted: 1 },
    { rememberParameters: 'yes' },
  ]) {
    assert.throws(() => validatePreferences(patch, { strict: true }));
    const key = Object.keys(patch)[0];
    assert.equal(validatePreferences(patch)[key], DEFAULT_PREFERENCES[key]);
  }
  for (const masterVolume of [0, 40, 100])
    assert.equal(
      validatePreferences({ masterVolume }, { strict: true }).masterVolume,
      masterVolume,
    );
  const old = parsePreferencesBackup(
    JSON.stringify({
      format: 'arg-tool-preferences',
      version: 1,
      preferences: { motion: 'reduce' },
      favorites: [],
    }),
  );
  assert.equal(old.preferences.editorSize, 14);
  assert.equal(old.preferences.rememberParameters, false);
  assert.equal(old.preferences.runShortcut, true);
});
