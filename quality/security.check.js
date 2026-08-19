'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const {
  getPasswordErrors,
  isStrongPassword,
} = require('../src/utils/passwordRules');
const { hashPassword, verifyPassword } = require('../src/utils/passwordHash');
const { escapeHtml } = require('../src/views/html');
const toPublicUser = require('../src/utils/publicUser');

test('password policy rejects weak values', () => {
  assert.ok(getPasswordErrors('weak').length > 0);
  assert.equal(isStrongPassword('weak'), false);
  assert.equal(isStrongPassword('Strong#123'), true);
});

test('password hashes are salted and verifiable', async () => {
  const first = await hashPassword('Strong#123');
  const second = await hashPassword('Strong#123');

  assert.notEqual(first, second);
  assert.equal(await verifyPassword('Strong#123', first), true);
  assert.equal(await verifyPassword('wrong', first), false);
});

test('HTML renderer escapes user controlled values', () => {
  assert.equal(
    escapeHtml('<script>"x"</script>'),
    '&lt;script&gt;&quot;x&quot;&lt;/script&gt;',
  );
});

test('public user representation excludes authentication secrets', () => {
  const publicUser = toPublicUser({
    id: '1',
    name: 'Joel',
    email: 'joel@example.com',
    isActive: true,
    passwordHash: 'secret',
    activationTokenHash: 'activation',
    resetTokenHash: 'reset',
  });

  assert.deepEqual(publicUser, {
    id: '1',
    name: 'Joel',
    email: 'joel@example.com',
    isActive: true,
  });
});
