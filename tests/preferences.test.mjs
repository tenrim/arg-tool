import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULT_PREFERENCES,validatePreferences,parsePreferencesBackup} from '../public/preferences.js';

test('preferences recover invalid stored fields without applying unsafe values',()=>{
 const p=validatePreferences({motion:'always',density:'comfortable',scanlines:'false',startPage:'missing',textSize:'large'});
 assert.equal(p.motion,'system');assert.equal(p.scanlines,true);assert.equal(p.startPage,'home');assert.equal(p.density,'comfortable');assert.equal(p.textSize,'large');
});
test('strict preference imports reject unknown keys and invalid types',()=>{
 for(const value of [{constructor:'x'},{scanlines:0},{startPage:'resources'},{textSize:'999'},{motion:'always'},JSON.parse('{"__proto__":{"polluted":true}}')])assert.throws(()=>validatePreferences(value,{strict:true}));
 assert.equal({}.polluted,undefined);
});
test('preference defaults are immutable and callers cannot change the schema',()=>{
 assert.ok(Object.isFrozen(DEFAULT_PREFERENCES));const p=validatePreferences({});p.motion='reduce';assert.equal(DEFAULT_PREFERENCES.motion,'system');assert.equal(validatePreferences({}).startPage,'home');
});
test('versioned preference backups preserve only supported settings and tool IDs',()=>{
 const text=JSON.stringify({format:'arg-tool-preferences',version:1,preferences:{...DEFAULT_PREFERENCES,motion:'reduce'},favorites:['crypto','image','crypto']});
 assert.deepEqual(parsePreferencesBackup(text),{preferences:{...DEFAULT_PREFERENCES,motion:'reduce'},favorites:['crypto','image']});
});
test('invalid backup payloads are rejected before any preferences can apply',()=>{
 for(const value of ['{','x'.repeat(65537),JSON.stringify({version:2}),JSON.stringify({format:'arg-tool-preferences',version:1,preferences:{motion:'reduce'},favorites:['settings']}),JSON.stringify({format:'arg-tool-preferences',version:1,preferences:{code:'secret'},favorites:[]})])assert.throws(()=>parsePreferencesBackup(value));
});
