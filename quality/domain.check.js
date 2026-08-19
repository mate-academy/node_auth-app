'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const createAuthService = require('../src/services/authService');
const createProfileService = require('../src/services/profileService');
const createSessionService = require('../src/services/sessionService');
const { verifyPassword } = require('../src/utils/passwordHash');
const { createMemoryAdapters } = require('./helpers');

function createResponse() {
  const headers = new Map();

  return {
    getHeader(name) {
      return headers.get(name.toLowerCase());
    },
    setHeader(name, value) {
      headers.set(name.toLowerCase(), value);
    },
  };
}

function getCookieHeader(res) {
  const cookies = res.getHeader('Set-Cookie');
  const first = Array.isArray(cookies) ? cookies[0] : cookies;

  return first.split(';')[0];
}

test('full auth domain flow works', async () => {
  const adapters = createMemoryAdapters();
  const auth = createAuthService(adapters.users, adapters.mailer);
  const sessions = createSessionService(adapters.sessions);
  const profile = createProfileService(
    adapters.users,
    adapters.sessions,
    adapters.mailer,
  );

  const user = await auth.register({
    name: ' Joel ',
    email: 'JOEL@example.com',
    password: 'Strong#123',
  });

  assert.equal(user.name, 'Joel');
  assert.equal(user.email, 'joel@example.com');
  assert.equal(user.isActive, false);
  assert.equal(adapters.mailer.getOutbox()[0].type, 'activation');

  await assert.rejects(
    auth.login({
      email: 'joel@example.com',
      password: 'Strong#123',
    }),
    (error) => error.statusCode === 403,
  );

  const activationToken = adapters.mailer.getOutbox()[0].token;
  const activeUser = await auth.activate(activationToken);

  assert.equal(activeUser.isActive, true);

  const loggedIn = await auth.login({
    email: 'joel@example.com',
    password: 'Strong#123',
  });
  const response = createResponse();

  await sessions.createSession(loggedIn, response);

  const request = {
    headers: {
      cookie: getCookieHeader(response),
    },
  };
  const resolved = await sessions.resolveUser(request);

  assert.equal(resolved.id, user.id);

  await profile.updateName(user, 'Joel Diaz');
  assert.equal(user.name, 'Joel Diaz');

  await profile.updateEmail(user, {
    email: 'new@example.com',
    emailConfirmation: 'new@example.com',
    password: 'Strong#123',
  });
  assert.equal(user.email, 'new@example.com');
  assert.ok(
    adapters.mailer
      .getOutbox()
      .some((message) => message.type === 'email-change'),
  );
});

test('password reset rotates credentials and clears token', async () => {
  const adapters = createMemoryAdapters();
  const auth = createAuthService(adapters.users, adapters.mailer);
  const user = await auth.register({
    name: 'Joel',
    email: 'joel@example.com',
    password: 'Strong#123',
  });

  const activationToken = adapters.mailer.getOutbox()[0].token;

  await auth.activate(activationToken);
  await auth.requestPasswordReset('joel@example.com');

  const resetMessage = adapters.mailer
    .getOutbox()
    .find((message) => message.type === 'reset');

  await auth.resetPassword(resetMessage.token, {
    password: 'Better#456',
    confirmation: 'Better#456',
  });

  assert.equal(user.resetTokenHash, null);
  assert.equal(user.resetTokenExpiresAt, null);
  assert.equal(await verifyPassword('Better#456', user.passwordHash), true);
  assert.equal(await verifyPassword('Strong#123', user.passwordHash), false);
});

test('email and password confirmations are mandatory', async () => {
  const adapters = createMemoryAdapters();
  const auth = createAuthService(adapters.users, adapters.mailer);
  const profile = createProfileService(
    adapters.users,
    adapters.sessions,
    adapters.mailer,
  );
  const user = await auth.register({
    name: 'Joel',
    email: 'joel@example.com',
    password: 'Strong#123',
  });

  await assert.rejects(
    profile.updateEmail(user, {
      email: 'new@example.com',
      emailConfirmation: 'different@example.com',
      password: 'Strong#123',
    }),
    (error) => error.statusCode === 400,
  );

  await assert.rejects(
    auth.resetPassword('invalid', {
      password: 'Better#456',
      confirmation: 'different',
    }),
    (error) => error.statusCode === 400,
  );
});

test('activation and reset tokens are single-use', async () => {
  const adapters = createMemoryAdapters();
  const auth = createAuthService(adapters.users, adapters.mailer);

  await auth.register({
    name: 'Joel',
    email: 'joel@example.com',
    password: 'Strong#123',
  });

  const activation = adapters.mailer.getOutbox()[0];

  await auth.activate(activation.token);
  await assert.rejects(
    auth.activate(activation.token),
    (error) => error.statusCode === 400,
  );

  await auth.requestPasswordReset('joel@example.com');
  const reset = adapters.mailer
    .getOutbox()
    .find((message) => message.type === 'reset');

  await auth.resetPassword(reset.token, {
    password: 'Better#456',
    confirmation: 'Better#456',
  });
  await assert.rejects(
    auth.resetPassword(reset.token, {
      password: 'Another#789',
      confirmation: 'Another#789',
    }),
    (error) => error.statusCode === 400,
  );
});

test('forgot password does not reveal whether account exists', async () => {
  const adapters = createMemoryAdapters();
  const auth = createAuthService(adapters.users, adapters.mailer);

  const result = await auth.requestPasswordReset('missing@example.com');

  assert.equal(result, undefined);
  assert.equal(adapters.mailer.getOutbox().length, 0);
});

test('changing password revokes existing sessions', async () => {
  const adapters = createMemoryAdapters();
  const auth = createAuthService(adapters.users, adapters.mailer);
  const sessions = createSessionService(adapters.sessions);
  const profile = createProfileService(
    adapters.users,
    adapters.sessions,
    adapters.mailer,
  );
  const user = await auth.register({
    name: 'Joel',
    email: 'joel@example.com',
    password: 'Strong#123',
  });
  const activation = adapters.mailer.getOutbox()[0];

  await auth.activate(activation.token);

  const response = createResponse();

  await sessions.createSession(user, response);
  const request = {
    headers: { cookie: getCookieHeader(response) },
  };

  assert.equal((await sessions.resolveUser(request)).id, user.id);

  await profile.updatePassword(user, {
    oldPassword: 'Strong#123',
    newPassword: 'Better#456',
    confirmation: 'Better#456',
  });

  assert.equal(await sessions.resolveUser(request), null);
  await assert.rejects(
    auth.login({
      email: 'joel@example.com',
      password: 'Strong#123',
    }),
    (error) => error.statusCode === 401,
  );

  const loggedIn = await auth.login({
    email: 'joel@example.com',
    password: 'Better#456',
  });

  assert.equal(loggedIn.id, user.id);
});
