'use strict';

const nodeCrypto = require('crypto');
const http = require('http');

const PORT = process.env.PORT || 3000;
const SESSION_COOKIE = 'auth_session';
const TOKEN_BYTES = 24;
const PASSWORD_RULES = [
  'At least 8 characters',
  'At least one lowercase letter',
  'At least one uppercase letter',
  'At least one number',
  'At least one special character',
];

function createAuthApp() {
  const state = {
    users: [],
    sessions: new Map(),
    activationTokens: new Map(),
    passwordResetTokens: new Map(),
    emails: [],
  };

  const server = http.createServer((req, res) => {
    handleRequest(req, res, state);
  });

  server.state = state;

  return server;
}

async function handleRequest(req, res, state) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const user = getCurrentUser(req, state);
  const route = `${req.method} ${url.pathname}`;

  try {
    if (url.pathname === '/') {
      return redirect(res, user ? '/profile' : '/login');
    }

    if (route === 'GET /register') {
      return requireGuest(res, user, () => renderRegister(res));
    }

    if (route === 'POST /register') {
      return requireGuest(res, user, async () => register(req, res, state));
    }

    if (route === 'GET /activate') {
      return requireGuest(res, user, () => activate(url, res, state));
    }

    if (route === 'GET /login') {
      return requireGuest(res, user, () => renderLogin(res));
    }

    if (route === 'POST /login') {
      return requireGuest(res, user, async () => login(req, res, state));
    }

    if (route === 'GET /logout' || route === 'POST /logout') {
      return requireAuth(req, res, user, () => logout(req, res, state));
    }

    if (route === 'GET /password-reset') {
      return requireGuest(res, user, () => renderPasswordReset(res));
    }

    if (route === 'POST /password-reset') {
      return requireGuest(res, user, async () => {
        return requestPasswordReset(req, res, state);
      });
    }

    if (route === 'GET /password-reset/sent') {
      return requireGuest(res, user, () => renderEmailSent(res));
    }

    if (route === 'GET /password-reset/confirm') {
      return requireGuest(res, user, () => {
        return renderResetConfirmation(url, res, state);
      });
    }

    if (route === 'POST /password-reset/confirm') {
      return requireGuest(res, user, async () => {
        return confirmPasswordReset(req, url, res, state);
      });
    }

    if (route === 'GET /password-reset/success') {
      return requireGuest(res, user, () => renderResetSuccess(res));
    }

    if (route === 'GET /profile') {
      return requireAuth(req, res, user, () => renderProfile(res, user));
    }

    if (route === 'POST /profile/name') {
      return requireAuth(req, res, user, async () => {
        return updateName(req, res, user);
      });
    }

    if (route === 'POST /profile/password') {
      return requireAuth(req, res, user, async () => {
        return updatePassword(req, res, user);
      });
    }

    if (route === 'POST /profile/email') {
      return requireAuth(req, res, user, async () => {
        return updateEmail(req, res, user, state);
      });
    }

    return render404(res);
  } catch (error) {
    return renderPage(res, {
      statusCode: 500,
      title: 'Server error',
      body: `<p>${escapeHtml(error.message)}</p>`,
    });
  }
}

function requireGuest(res, user, next) {
  if (user) {
    return redirect(res, '/profile');
  }

  return next();
}

function requireAuth(req, res, user, next) {
  if (!user) {
    return redirect(res, '/login');
  }

  return next();
}

async function register(req, res, state) {
  const body = await readBody(req);
  const name = normalizeText(body.name);
  const email = normalizeEmail(body.email);
  const password = body.password || '';
  const passwordErrors = validatePassword(password);

  if (!name || !email || !password) {
    return renderRegister(res, 'Name, email and password are required.', body);
  }

  if (!isEmail(email)) {
    return renderRegister(res, 'Enter a valid email address.', body);
  }

  if (findUserByEmail(state, email)) {
    return renderRegister(res, 'This email is already registered.', body);
  }

  if (passwordErrors.length > 0) {
    return renderRegister(
      res,
      `Password rule missing: ${passwordErrors[0]}.`,
      body,
    );
  }

  const user = {
    id: createToken(),
    name,
    email,
    passwordHash: hashPassword(password),
    isActive: false,
    createdAt: new Date(),
  };
  const token = createToken();

  state.users.push(user);
  state.activationTokens.set(token, user.id);

  sendEmail(state, {
    to: user.email,
    subject: 'Activate your account',
    text: `Open /activate?token=${token} to activate your account.`,
  });

  return renderPage(res, {
    title: 'Check your email',
    body: `
      <p>An activation email was sent to ${escapeHtml(user.email)}.</p>
      ${emailDebugLink('/activate', token)}
      <p><a href="/login">Back to login</a></p>
    `,
  });
}

function activate(url, res, state) {
  const token = url.searchParams.get('token');
  const userId = state.activationTokens.get(token);
  const user = state.users.find(({ id }) => id === userId);

  if (!token || !user) {
    return renderPage(res, {
      statusCode: 400,
      title: 'Activation failed',
      body: [
        '<p>The activation link is invalid or expired.</p>',
        '<p><a href="/login">Login</a></p>',
      ].join(''),
    });
  }

  user.isActive = true;
  state.activationTokens.delete(token);
  createSession(res, user, state);

  return redirect(res, '/profile');
}

async function login(req, res, state) {
  const body = await readBody(req);
  const email = normalizeEmail(body.email);
  const password = body.password || '';
  const user = findUserByEmail(state, email);

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return renderLogin(res, 'Invalid email or password.', body);
  }

  if (!user.isActive) {
    return renderLogin(
      res,
      'Please activate your email before logging in.',
      body,
    );
  }

  createSession(res, user, state);

  return redirect(res, '/profile');
}

function logout(req, res, state) {
  const sessionId = getCookie(req, SESSION_COOKIE);

  if (sessionId) {
    state.sessions.delete(sessionId);
  }

  setCookie(res, SESSION_COOKIE, '', { maxAge: 0 });

  return redirect(res, '/login');
}

async function requestPasswordReset(req, res, state) {
  const body = await readBody(req);
  const email = normalizeEmail(body.email);
  const user = findUserByEmail(state, email);

  if (user) {
    const token = createToken();

    state.passwordResetTokens.set(token, user.id);

    sendEmail(state, {
      to: user.email,
      subject: 'Reset your password',
      text: `Open /password-reset/confirm?token=${token} to reset your password.`,
    });
  }

  return redirect(res, '/password-reset/sent');
}

async function confirmPasswordReset(req, url, res, state) {
  const token = url.searchParams.get('token');
  const userId = state.passwordResetTokens.get(token);
  const user = state.users.find(({ id }) => id === userId);
  const body = await readBody(req);
  const password = body.password || '';
  const confirmation = body.confirmation || '';
  const passwordErrors = validatePassword(password);

  if (!token || !user) {
    return renderResetConfirmation(
      url,
      res,
      state,
      'The reset link is invalid or expired.',
    );
  }

  if (password !== confirmation) {
    return renderResetConfirmation(
      url,
      res,
      state,
      'Password and confirmation must be equal.',
    );
  }

  if (passwordErrors.length > 0) {
    return renderResetConfirmation(
      url,
      res,
      state,
      `Password rule missing: ${passwordErrors[0]}.`,
    );
  }

  user.passwordHash = hashPassword(password);
  state.passwordResetTokens.delete(token);

  return redirect(res, '/password-reset/success');
}

async function updateName(req, res, user) {
  const body = await readBody(req);
  const name = normalizeText(body.name);

  if (!name) {
    return renderProfile(res, user, 'Name is required.');
  }

  user.name = name;

  return renderProfile(res, user, 'Name updated.');
}

async function updatePassword(req, res, user) {
  const body = await readBody(req);
  const oldPassword = body.oldPassword || '';
  const newPassword = body.newPassword || '';
  const confirmation = body.confirmation || '';
  const passwordErrors = validatePassword(newPassword);

  if (!verifyPassword(oldPassword, user.passwordHash)) {
    return renderProfile(res, user, 'Current password is incorrect.');
  }

  if (newPassword !== confirmation) {
    return renderProfile(
      res,
      user,
      'New password and confirmation must be equal.',
    );
  }

  if (passwordErrors.length > 0) {
    return renderProfile(
      res,
      user,
      `Password rule missing: ${passwordErrors[0]}.`,
    );
  }

  user.passwordHash = hashPassword(newPassword);

  return renderProfile(res, user, 'Password updated.');
}

async function updateEmail(req, res, user, state) {
  const body = await readBody(req);
  const password = body.password || '';
  const newEmail = normalizeEmail(body.newEmail);
  const confirmation = normalizeEmail(body.confirmation);
  const oldEmail = user.email;

  if (!verifyPassword(password, user.passwordHash)) {
    return renderProfile(res, user, 'Password is incorrect.');
  }

  if (!isEmail(newEmail)) {
    return renderProfile(res, user, 'Enter a valid new email address.');
  }

  if (newEmail !== confirmation) {
    return renderProfile(
      res,
      user,
      'New email and confirmation must be equal.',
    );
  }

  if (findUserByEmail(state, newEmail)) {
    return renderProfile(res, user, 'This email is already registered.');
  }

  user.email = newEmail;

  sendEmail(state, {
    to: oldEmail,
    subject: 'Your email was changed',
    text: `Your account email was changed to ${newEmail}.`,
  });

  sendEmail(state, {
    to: newEmail,
    subject: 'Confirm your new email',
    text: 'Your new email address is now connected to your account.',
  });

  return renderProfile(
    res,
    user,
    'Email updated. A notification was sent to your old email.',
  );
}

function renderRegister(res, message = '', values = {}) {
  return renderPage(res, {
    title: 'Register',
    body: `
      ${notice(message)}
      <form method="post" action="/register">
        <label>Name <input name="name" value="${escapeHtml(values.name)}" required></label>
        <label>Email <input name="email" type="email" value="${escapeHtml(values.email)}" required></label>
        <label>Password <input name="password" type="password" required></label>
        ${passwordRules()}
        <button>Register</button>
      </form>
      <p><a href="/login">Login</a></p>
    `,
  });
}

function renderLogin(res, message = '', values = {}) {
  return renderPage(res, {
    title: 'Login',
    body: `
      ${notice(message)}
      <form method="post" action="/login">
        <label>Email <input name="email" type="email" value="${escapeHtml(values.email)}" required></label>
        <label>Password <input name="password" type="password" required></label>
        <button>Login</button>
      </form>
      <p><a href="/register">Create account</a> | <a href="/password-reset">Reset password</a></p>
    `,
  });
}

function renderPasswordReset(res) {
  return renderPage(res, {
    title: 'Reset password',
    body: `
      <form method="post" action="/password-reset">
        <label>Email <input name="email" type="email" required></label>
        <button>Send reset email</button>
      </form>
      <p><a href="/login">Back to login</a></p>
    `,
  });
}

function renderEmailSent(res) {
  return renderPage(res, {
    title: 'Email sent',
    body: [
      '<p>If an account exists for that email, a reset link has been sent.</p>',
      '<p><a href="/login">Back to login</a></p>',
    ].join(''),
  });
}

function renderResetConfirmation(url, res, state, message = '') {
  const token = url.searchParams.get('token');
  const hasToken = token && state.passwordResetTokens.has(token);
  const tokenMessage = hasToken ? '' : 'The reset link is invalid or expired.';
  const form = hasToken ? resetConfirmationForm(token) : '';

  return renderPage(res, {
    statusCode: hasToken ? 200 : 400,
    title: 'Choose a new password',
    body: `
      ${notice(message || tokenMessage)}
      ${form}
      <p><a href="/login">Back to login</a></p>
    `,
  });
}

function resetConfirmationForm(token) {
  return `
    <form method="post" action="/password-reset/confirm?token=${escapeHtml(token)}">
      <label>Password <input name="password" type="password" required></label>
      <label>Confirmation <input name="confirmation" type="password" required></label>
      ${passwordRules()}
      <button>Reset password</button>
    </form>
  `;
}

function renderResetSuccess(res) {
  return renderPage(res, {
    title: 'Password changed',
    body: '<p>Your password was updated.</p><p><a href="/login">Login</a></p>',
  });
}

function renderProfile(res, user, message = '') {
  return renderPage(res, {
    title: 'Profile',
    body: `
      ${notice(message)}
      <p>Signed in as ${escapeHtml(user.email)}.</p>
      <form method="post" action="/logout"><button>Logout</button></form>

      <section>
        <h2>Name</h2>
        <form method="post" action="/profile/name">
          <label>Name <input name="name" value="${escapeHtml(user.name)}" required></label>
          <button>Save name</button>
        </form>
      </section>

      <section>
        <h2>Password</h2>
        <form method="post" action="/profile/password">
          <label>Old password <input name="oldPassword" type="password" required></label>
          <label>New password <input name="newPassword" type="password" required></label>
          <label>Confirmation <input name="confirmation" type="password" required></label>
          ${passwordRules()}
          <button>Change password</button>
        </form>
      </section>

      <section>
        <h2>Email</h2>
        <form method="post" action="/profile/email">
          <label>Password <input name="password" type="password" required></label>
          <label>New email <input name="newEmail" type="email" required></label>
          <label>Confirm new email <input name="confirmation" type="email" required></label>
          <button>Change email</button>
        </form>
      </section>
    `,
  });
}

function render404(res) {
  return renderPage(res, {
    statusCode: 404,
    title: '404',
    body: '<p>Page not found.</p><p><a href="/login">Go to login</a></p>',
  });
}

function renderPage(res, { title, body, statusCode = 200 }) {
  const html = `<!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${escapeHtml(title)}</title>
        <style>
          body {
            color: #1f2937;
            font-family: Arial, sans-serif;
            line-height: 1.5;
            margin: 2rem auto;
            max-width: 48rem;
            padding: 0 1rem;
          }

          label {
            display: block;
            font-weight: 700;
            margin: 0 0 1rem;
          }

          input {
            box-sizing: border-box;
            display: block;
            font: inherit;
            margin-top: 0.25rem;
            padding: 0.55rem;
            width: 100%;
          }

          button {
            cursor: pointer;
            font: inherit;
            padding: 0.6rem 1rem;
          }

          section {
            border-top: 1px solid #d1d5db;
            margin-top: 2rem;
            padding-top: 1rem;
          }

          .notice {
            background: #fef3c7;
            margin: 1rem 0;
            padding: 0.75rem;
          }
        </style>
      </head>
      <body>
        <main>
          <h1>${escapeHtml(title)}</h1>
          ${body}
        </main>
      </body>
    </html>`;

  res.writeHead(statusCode, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}

function passwordRules() {
  return `<p>Password rules:</p><ul>${PASSWORD_RULES.map((rule) => `<li>${rule}</li>`).join('')}</ul>`;
}

function notice(message) {
  return message ? `<p class="notice">${escapeHtml(message)}</p>` : '';
}

function emailDebugLink(path, token) {
  if (process.env.NODE_ENV === 'production') {
    return '';
  }

  return `<p><a href="${path}?token=${escapeHtml(token)}">Development email link</a></p>`;
}

function validatePassword(password) {
  const errors = [];

  if (password.length < 8) {
    errors.push(PASSWORD_RULES[0]);
  }

  if (!/[a-z]/.test(password)) {
    errors.push(PASSWORD_RULES[1]);
  }

  if (!/[A-Z]/.test(password)) {
    errors.push(PASSWORD_RULES[2]);
  }

  if (!/\d/.test(password)) {
    errors.push(PASSWORD_RULES[3]);
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push(PASSWORD_RULES[4]);
  }

  return errors;
}

function createSession(res, user, state) {
  const sessionId = createToken();

  state.sessions.set(sessionId, user.id);

  setCookie(res, SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: 'Lax',
    maxAge: 60 * 60 * 24 * 7,
  });
}

function getCurrentUser(req, state) {
  const sessionId = getCookie(req, SESSION_COOKIE);
  const userId = state.sessions.get(sessionId);

  return state.users.find(({ id }) => id === userId) || null;
}

function setCookie(res, name, value, options = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`, 'Path=/'];

  if (options.httpOnly) {
    parts.push('HttpOnly');
  }

  if (options.sameSite) {
    parts.push(`SameSite=${options.sameSite}`);
  }

  if (Number.isInteger(options.maxAge)) {
    parts.push(`Max-Age=${options.maxAge}`);
  }

  res.setHeader('Set-Cookie', parts.join('; '));
}

function getCookie(req, name) {
  const cookieHeader = req.headers.cookie || '';
  const cookies = cookieHeader.split(';').map((cookie) => cookie.trim());
  const prefix = `${name}=`;
  const match = cookies.find((cookie) => cookie.startsWith(prefix));

  return match ? decodeURIComponent(match.slice(prefix.length)) : '';
}

function hashPassword(password) {
  const salt = nodeCrypto.randomBytes(16).toString('hex');
  const hash = nodeCrypto
    .pbkdf2Sync(password, salt, 100000, 32, 'sha256')
    .toString('hex');

  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  const [salt, originalHash] = String(storedHash).split(':');

  if (!salt || !originalHash) {
    return false;
  }

  const hash = nodeCrypto
    .pbkdf2Sync(password, salt, 100000, 32, 'sha256')
    .toString('hex');
  const original = Buffer.from(originalHash, 'hex');
  const current = Buffer.from(hash, 'hex');

  return (
    original.length === current.length &&
    nodeCrypto.timingSafeEqual(original, current)
  );
}

function sendEmail(state, email) {
  state.emails.push({
    ...email,
    sentAt: new Date(),
  });

  if (process.env.NODE_ENV !== 'test') {
    process.stdout.write(
      `[email] To: ${email.to} | ${email.subject} | ${email.text}\n`,
    );
  }
}

function findUserByEmail(state, email) {
  return state.users.find((user) => user.email === email) || null;
}

function createToken() {
  return nodeCrypto.randomBytes(TOKEN_BYTES).toString('hex');
}

function normalizeText(value) {
  return String(value || '').trim();
}

function normalizeEmail(value) {
  return normalizeText(value).toLowerCase();
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function redirect(res, location) {
  res.writeHead(302, { Location: location });
  res.end();
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    req.on('data', (chunk) => {
      chunks.push(chunk);
    });

    req.on('end', () => {
      const body = Buffer.concat(chunks).toString();
      const params = new URLSearchParams(body);
      const result = {};

      for (const [key, value] of params) {
        result[key] = value;
      }

      resolve(result);
    });

    req.on('error', reject);
  });
}

if (require.main === module) {
  createAuthApp().listen(PORT, () => {
    process.stdout.write(`Auth app is running on http://localhost:${PORT}\n`);
  });
}

module.exports = {
  PASSWORD_RULES,
  createAuthApp,
  validatePassword,
};
