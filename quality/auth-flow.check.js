'use strict';

const assert = require('node:assert/strict');
const http = require('node:http');
const test = require('node:test');

const { createApp } = require('../src/app');
const { createMemoryAdapters } = require('./helpers');

function extractCookie(response) {
  const cookies = response.headers.getSetCookie?.() || [];
  const raw = cookies[0] || response.headers.get('set-cookie') || '';

  return raw.split(';')[0];
}

async function withServer(run) {
  const adapters = createMemoryAdapters();
  const app = createApp(adapters);
  const server = http.createServer(app);

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));

  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    await run({ adapters, baseUrl });
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

async function jsonRequest(baseUrl, path, options = {}) {
  const response = await global.fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const body = response.status === 204 ? null : await response.json();

  return { body, response };
}

test('registration, activation, login and profile flow', async () => {
  await withServer(async ({ adapters, baseUrl }) => {
    const registration = await jsonRequest(baseUrl, '/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Joel',
        email: 'joel@example.com',
        password: 'Strong#123',
      }),
    });

    assert.equal(registration.response.status, 201);
    assert.equal(adapters.mailer.getOutbox().length, 1);

    const token = adapters.mailer.getOutbox()[0].token;
    const activation = await jsonRequest(
      baseUrl,
      `/api/auth/activate/${token}`,
    );

    assert.equal(activation.response.status, 200);
    assert.equal(activation.body.redirectTo, '/profile');

    const activationCookie = extractCookie(activation.response);
    const profile = await jsonRequest(baseUrl, '/api/profile', {
      headers: { Cookie: activationCookie },
    });

    assert.equal(profile.response.status, 200);
    assert.equal(profile.body.user.email, 'joel@example.com');

    const loginWhileAuthenticated = await jsonRequest(
      baseUrl,
      '/api/auth/login',
      {
        method: 'POST',
        headers: { Cookie: activationCookie },
        body: JSON.stringify({
          email: 'joel@example.com',
          password: 'Strong#123',
        }),
      },
    );

    assert.equal(loginWhileAuthenticated.response.status, 403);
  });
});

test('inactive users cannot log in', async () => {
  await withServer(async ({ baseUrl }) => {
    await jsonRequest(baseUrl, '/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Joel',
        email: 'joel@example.com',
        password: 'Strong#123',
      }),
    });

    const login = await jsonRequest(baseUrl, '/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'joel@example.com',
        password: 'Strong#123',
      }),
    });

    assert.equal(login.response.status, 403);
    assert.match(login.body.message, /activate/i);
  });
});

test('password reset requires matching confirmation', async () => {
  await withServer(async ({ adapters, baseUrl }) => {
    await jsonRequest(baseUrl, '/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Joel',
        email: 'joel@example.com',
        password: 'Strong#123',
      }),
    });

    await jsonRequest(baseUrl, '/api/password/forgot', {
      method: 'POST',
      body: JSON.stringify({ email: 'joel@example.com' }),
    });

    const resetMessage = adapters.mailer
      .getOutbox()
      .find((message) => message.type === 'reset');
    const reset = await jsonRequest(
      baseUrl,
      `/api/password/reset/${resetMessage.token}`,
      {
        method: 'POST',
        body: JSON.stringify({
          password: 'NewStrong#123',
          confirmation: 'different',
        }),
      },
    );

    assert.equal(reset.response.status, 400);
  });
});

test('email change requires confirmation and notifies old email', async () => {
  await withServer(async ({ adapters, baseUrl }) => {
    await jsonRequest(baseUrl, '/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Joel',
        email: 'old@example.com',
        password: 'Strong#123',
      }),
    });

    const activationToken = adapters.mailer.getOutbox()[0].token;
    const activation = await jsonRequest(
      baseUrl,
      `/api/auth/activate/${activationToken}`,
    );
    const cookie = extractCookie(activation.response);

    const mismatch = await jsonRequest(baseUrl, '/api/profile/email', {
      method: 'PATCH',
      headers: { Cookie: cookie },
      body: JSON.stringify({
        email: 'new@example.com',
        emailConfirmation: 'other@example.com',
        password: 'Strong#123',
      }),
    });

    assert.equal(mismatch.response.status, 400);

    const changed = await jsonRequest(baseUrl, '/api/profile/email', {
      method: 'PATCH',
      headers: { Cookie: cookie },
      body: JSON.stringify({
        email: 'new@example.com',
        emailConfirmation: 'new@example.com',
        password: 'Strong#123',
      }),
    });

    assert.equal(changed.response.status, 200);
    assert.ok(
      adapters.mailer
        .getOutbox()
        .some((message) => message.type === 'email-change'),
    );
  });
});

test('unknown API and page routes return 404', async () => {
  await withServer(async ({ baseUrl }) => {
    const api = await global.fetch(`${baseUrl}/api/does-not-exist`);
    const page = await global.fetch(`${baseUrl}/does-not-exist`);

    assert.equal(api.status, 404);
    assert.equal(page.status, 404);
  });
});
