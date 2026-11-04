import test from 'node:test';
import assert from 'node:assert/strict';
import { inputWarnings, errorGuidance } from '../public/chef-tools/input-diagnostics.js';
test('decoder diagnostics do not reject tolerant input or guess custom alphabets/preprocessing', () => {
  assert.match(
    inputWarnings('From Base64', '这不是Base64', ['A-Za-z0-9+/=', true, false])[0],
    /3 个/,
  );
  assert.deepEqual(inputWarnings('From Base64', 'SGVs\nbG8=', ['A-Za-z0-9+/=', true, false]), []);
  assert.deepEqual(inputWarnings('From Base64', '这不是Base64', ['custom', true, false]), []);
  assert.deepEqual(
    inputWarnings('From Base64', '这不是Base64', ['A-Za-z0-9+/=', true, false], 'base64'),
    [],
  );
  assert.deepEqual(inputWarnings('From Base64', '这不是Base64', ['A-Za-z0-9+/=', false, true]), []);
  assert.deepEqual(inputWarnings('To Base64', '这不是Base64', ['A-Za-z0-9+/=', true, false]), []);
});
test('AES diagnostics distinguish a measured bad key length from ambiguous decryption failure', () => {
  assert.equal(errorGuidance('AES Decrypt', 'Invalid key length: 0 bytes').field, 'Key');
  assert.match(
    errorGuidance('AES Decrypt', 'Unable to decrypt input').text,
    /不能单独证明密码错误/,
  );
  assert.equal(errorGuidance('AES Decrypt', 'Resource unavailable'), null);
  assert.equal(errorGuidance('DES Decrypt', 'Invalid key length: 0 bytes'), null);
});
