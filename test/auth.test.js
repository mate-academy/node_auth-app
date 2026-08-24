'use strict';

const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const { createApp } = require('../src/app');

const csrfFrom = (html) =>
  html.match(/name="_csrf" value="([^"]+)"/)?.[1] || '';
const tokenFrom = (html) =>
  decodeURIComponent(html.match(/token=([^"&]+)/)?.[1] || '');

const createClient = (baseUrl) => {
  const cookies = new Map();

  const saveCookies = (headers) => {
    const values = headers.getSetCookie
      ? headers.getSetCookie()
      : [headers.get('set-cookie')].filter(Boolean);

    values.forEach((value) => {
      const [pair] = value.split(';');
      const separator = pair.indexOf('=');

      cookies.set(pair.slice(0, separator), pair.slice(separator + 1));
    });
  };

  const request = async (route, options = {}) => {
    const cookieHeader = [...cookies]
      .map(([key, value]) => `${key}=${value}`)
      .join('; ');
    const response = await fetch(`${baseUrl}${route}`, {
      redirect: 'manual',
      ...options,
      headers: {
        ...(cookies.size ? { Cookie: cookieHeader } : {}),
        ...options.headers,
      },
    });

    saveCookies(response.headers);

    return response;
  };

  return { request };
};

describe('authentication application', () => {
  let server;
  let store;
  let client;
  let temporaryDirectory;

  beforeEach(async () => {
    temporaryDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'northstar-'));

    const created = createApp({
      config: {
        appUrl: 'http://localhost:3000',
        dataFile: path.join(temporaryDirectory, 'auth.json'),
        isProduction: false,
        sessionSecret: 'test-secret-that-is-long-enough-for-auth',
      },
    });

    store = created.store;
    await store.ready;
    server = created.app.listen(0);

    await new Promise((resolve) => server.once('listening', resolve));

    const { port } = server.address();

    client = createClient(`http://127.0.0.1:${port}`);
  });

  afterEach(async () => {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
    await fs.rm(temporaryDirectory, { recursive: true, force: true });
  });

  test('requires activation before profile access', async () => {
    const registerPage = await client.request('/register');
    const csrf = csrfFrom(await registerPage.text());
    const registration = await client.request('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        _csrf: csrf,
        name: 'Maya Chen',
        email: 'Maya@Example.com',
        password: 'Compass!42',
      }),
    });

    expect(registration.status).toBe(303);
    expect(registration.headers.get('location')).toContain('/activation-sent');

    const loginPage = await client.request('/login');
    const loginCsrf = csrfFrom(await loginPage.text());
    const inactiveLogin = await client.request('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        _csrf: loginCsrf,
        email: 'maya@example.com',
        password: 'Compass!42',
      }),
    });

    expect(inactiveLogin.status).toBe(403);
    expect(await inactiveLogin.text()).toContain('Activate your email');

    const [activationEmail] = await store.listEmails();
    const activation = await client.request(
      `/activate?token=${encodeURIComponent(tokenFrom(activationEmail.html))}`,
    );

    expect(activation.status).toBe(303);

    expect(activation.headers.get('location')).toBe(
      '/profile?notice=activated',
    );

    const profile = await client.request('/profile');

    expect(profile.status).toBe(200);
    expect(await profile.text()).toContain('Maya Chen');
  });

  test('validates passwords and rejects forged form submissions', async () => {
    const missingCsrf = await client.request('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ name: 'Maya Chen' }),
    });

    expect(missingCsrf.status).toBe(403);

    const page = await client.request('/register');
    const csrf = csrfFrom(await page.text());
    const weakPassword = await client.request('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        _csrf: csrf,
        name: 'Maya Chen',
        email: 'maya@example.com',
        password: 'weak',
      }),
    });

    expect(weakPassword.status).toBe(422);
    expect(await weakPassword.text()).toContain('password still needs');
  });

  test('keeps protected and guest-only pages separated', async () => {
    const profile = await client.request('/profile');

    expect(profile.status).toBe(303);
    expect(profile.headers.get('location')).toBe('/login');

    const missing = await client.request('/somewhere-else');

    expect(missing.status).toBe(404);
    expect(await missing.text()).toContain('This page is off the map');
  });

  test('resets an active user password with confirmation', async () => {
    const user = await store.createUser({
      name: 'Jon Bell',
      email: 'jon@example.com',
      passwordHash:
        await require('../src/security').hashPassword('Original!42'),
    });

    await store.updateUser(user.id, { active: true });

    const forgotPage = await client.request('/forgot-password');
    const csrf = csrfFrom(await forgotPage.text());
    const requested = await client.request('/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        _csrf: csrf,
        email: 'jon@example.com',
      }),
    });

    expect(requested.status).toBe(303);

    const [resetEmail] = await store.listEmails();
    const token = tokenFrom(resetEmail.html);
    const resetPage = await client.request(
      `/reset-password?token=${encodeURIComponent(token)}`,
    );
    const resetCsrf = csrfFrom(await resetPage.text());
    const reset = await client.request('/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        _csrf: resetCsrf,
        token,
        password: 'FreshStart!7',
        confirmation: 'FreshStart!7',
      }),
    });

    expect(reset.status).toBe(200);
    expect(await reset.text()).toContain('You’re all set');
  });

  test('updates profile details and confirms an email change', async () => {
    const { hashPassword } = require('../src/security');
    const user = await store.createUser({
      name: 'Jon Bell',
      email: 'jon@example.com',
      passwordHash: await hashPassword('Original!42'),
    });

    await store.updateUser(user.id, { active: true });

    const loginPage = await client.request('/login');
    const loginCsrf = csrfFrom(await loginPage.text());
    const login = await client.request('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        _csrf: loginCsrf,
        email: 'jon@example.com',
        password: 'Original!42',
      }),
    });

    expect(login.status).toBe(303);

    const profilePage = await client.request('/profile');
    const profileCsrf = csrfFrom(await profilePage.text());
    const renamed = await client.request('/profile/name', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        _csrf: profileCsrf,
        name: 'Jonathan Bell',
      }),
    });

    expect(renamed.status).toBe(303);

    const emailChange = await client.request('/profile/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        _csrf: profileCsrf,
        email: 'jonathan@example.com',
        password: 'Original!42',
      }),
    });

    expect(emailChange.status).toBe(303);

    const emails = await store.listEmails();
    const confirmationEmail = emails.find(
      (email) => email.to === 'jonathan@example.com',
    );
    const emailToken = tokenFrom(confirmationEmail.html);
    const confirmed = await client.request(
      `/confirm-email?token=${encodeURIComponent(emailToken)}`,
    );

    expect(confirmed.status).toBe(303);

    expect((await store.findUserById(user.id)).email).toBe(
      'jonathan@example.com',
    );

    expect(
      (await store.listEmails()).some(
        (email) => email.to === 'jon@example.com',
      ),
    ).toBe(true);

    const passwordChange = await client.request('/profile/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        _csrf: profileCsrf,
        oldPassword: 'Original!42',
        password: 'Replacement!84',
        confirmation: 'Replacement!84',
      }),
    });

    expect(passwordChange.status).toBe(303);

    expect(passwordChange.headers.get('location')).toBe(
      '/profile?notice=password',
    );

    const freshProfile = await client.request('/profile');
    const logoutCsrf = csrfFrom(await freshProfile.text());
    const logout = await client.request('/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ _csrf: logoutCsrf }),
    });

    expect(logout.status).toBe(303);
    expect(logout.headers.get('location')).toBe('/login');
  });
});
