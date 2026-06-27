/* eslint-disable prettier/prettier */
/* eslint-disable indent */
'use strict';

const nodeCrypto = require('node:crypto');
const http = require('node:http');
const { URL: NodeURL } = require('node:url');

function createServer() {
  const users = [];
  const sessions = new Map();
  let nextId = 1;

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function parseBody(req) {
    return new Promise((resolve, reject) => {
      let body = '';

      req.on('data', (chunk) => {
        body += chunk;
      });

      req.on('end', () => {
        const params = new URLSearchParams(body);
        const data = {};

        for (const [key, value] of params.entries()) {
          data[key] = value;
        }

        resolve(data);
      });

      req.on('error', reject);
    });
  }

  function renderPage(title, content, user) {
    const welcome = user ? `<p>Hello, ${escapeHtml(user.name)}.</p>` : '';

    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>${escapeHtml(title)}</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 2rem; line-height: 1.5; }
      form { display: grid; gap: 0.5rem; max-width: 320px; }
      input { padding: 0.5rem; }
      .nav { display: flex; gap: 1rem; margin-bottom: 1rem; }
      .message { padding: 0.75rem; background: #f4f4f4; border-radius: 4px; }
    </style>
  </head>
  <body>
    <nav class="nav">
      <a href="/login">Login</a>
      <a href="/register">Register</a>
      <a href="/forgot-password">Forgot password</a>
      ${user ? '<a href="/profile">Profile</a>' : ''}
      ${user ? '<a href="/logout">Logout</a>' : ''}
    </nav>
    ${welcome}
    <h1>${escapeHtml(title)}</h1>
    ${content}
  </body>
</html>`;
  }

  function sendHtml(res, statusCode, body, headers = {}) {
    res.writeHead(statusCode, {
      'content-type': 'text/html; charset=utf-8',
      ...headers,
    });
    res.end(body);
  }

  function createSession(user) {
    const sessionId = nodeCrypto.randomBytes(16).toString('hex');

    sessions.set(sessionId, user.email);

    return sessionId;
  }

  function getAuthenticatedUser(req) {
    const cookies = req.headers.cookie || '';
    const sessionCookie = cookies
      .split(';')
      .map((entry) => entry.trim())
      .find((entry) => entry.startsWith('sessionId='));

    if (!sessionCookie) {
      return null;
    }

    const sessionId = sessionCookie.split('=')[1];
    const email = sessions.get(sessionId);

    if (!email) {
      return null;
    }

    return users.find((user) => user.email === email) || null;
  }

  function validatePassword(password) {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[^A-Za-z0-9]/.test(password)
    );
  }

  function isAuthenticated(req) {
    return Boolean(getAuthenticatedUser(req));
  }

  function getUserByEmail(email) {
    return users.find((user) => user.email === email);
  }

  function getUserByActivationToken(token) {
    return users.find((user) => user.activationToken === token);
  }

  function getUserByResetToken(token) {
    return users.find((user) => user.resetToken === token);
  }

  return http.createServer(async (req, res) => {
    const url = new NodeURL(req.url, 'http://127.0.0.1');
    const { pathname } = url;

    if (req.method === 'GET' && pathname === '/') {
      res.writeHead(302, { location: '/login' });
      res.end();

      return;
    }

    if (req.method === 'GET' && pathname === '/login') {
      if (isAuthenticated(req)) {
        res.writeHead(302, { location: '/profile' });
        res.end();

        return;
      }

      const content = `
        <form action="/login" method="post">
          <label>Email</label>
          <input name="email" type="email" required>
          <label>Password</label>
          <input name="password" type="password" required>
          <button type="submit">Login</button>
        </form>
      `;

      sendHtml(res, 200, renderPage('Login', content));

      return;
    }

    if (req.method === 'POST' && pathname === '/login') {
      const body = await parseBody(req);
      const user = getUserByEmail(body.email);

      if (!user || user.password !== body.password) {
        sendHtml(
          res,
          200,
          renderPage(
            'Login',
            '<p class="message">Invalid email or password.</p>' +
              '<a href="/login">Try again</a>',
          ),
        );

        return;
      }

      if (!user.active) {
        sendHtml(
          res,
          200,
          renderPage(
            'Login',
            // eslint-disable-next-line max-len
            '<p class="message">Please activate your email before signing in.</p>' +
              '<p><a href="/register">Resend activation</a></p>',
          ),
        );

        return;
      }

      const sessionId = createSession(user);

      res.writeHead(302, {
        location: '/profile',
        'set-cookie': [`sessionId=${sessionId}; HttpOnly; Path=/`],
      });
      res.end();

      return;
    }

    if (req.method === 'GET' && pathname === '/register') {
      if (isAuthenticated(req)) {
        res.writeHead(302, { location: '/profile' });
        res.end();

        return;
      }

      const content = `
        <p>Password rules: at least 8 characters, one uppercase, one lowercase,
        one number, one special character.</p>
        <form action="/register" method="post">
          <label>Name</label>
          <input name="name" required>
          <label>Email</label>
          <input name="email" type="email" required>
          <label>Password</label>
          <input name="password" type="password" required>
          <button type="submit">Register</button>
        </form>
      `;

      sendHtml(res, 200, renderPage('Register', content));

      return;
    }

    if (req.method === 'POST' && pathname === '/register') {
      const body = await parseBody(req);

      if (!body.name || !body.email || !body.password) {
        sendHtml(
          res,
          200,
          renderPage(
            'Register',
            '<p class="message">All fields are required.</p>',
          ),
        );

        return;
      }

      if (!validatePassword(body.password)) {
        sendHtml(
          res,
          200,
          renderPage(
            'Register',
            '<p class="message">Password must follow the required rules.</p>',
          ),
        );

        return;
      }

      if (getUserByEmail(body.email)) {
        sendHtml(
          res,
          200,
          renderPage(
            'Register',
            '<p class="message">An account with that email already exists.</p>',
          ),
        );

        return;
      }

      const activationToken = nodeCrypto.randomBytes(16).toString('hex');
      const user = {
        id: nextId++,
        name: body.name,
        email: body.email,
        password: body.password,
        active: false,
        activationToken,
        resetToken: null,
      };

      users.push(user);

      const content = `
        <p class="message">Account created. An activation email was sent to ${escapeHtml(
          user.email,
        )}.</p>
        <p><a href="/activate?token=${activationToken}">Activate account</a></p>
      `;

      sendHtml(res, 200, renderPage('Register', content));

      return;
    }

    if (req.method === 'GET' && pathname === '/activate') {
      if (isAuthenticated(req)) {
        res.writeHead(302, { location: '/profile' });
        res.end();

        return;
      }

      const token = url.searchParams.get('token');
      const user = getUserByActivationToken(token);

      if (!user) {
        sendHtml(
          res,
          200,
          renderPage(
            'Activation',
            '<p class="message">Invalid activation token.</p>',
          ),
        );

        return;
      }

      user.active = true;
      user.activationToken = null;

      const sessionId = createSession(user);

      res.writeHead(302, {
        location: '/profile',
        'set-cookie': [`sessionId=${sessionId}; HttpOnly; Path=/`],
      });
      res.end();

      return;
    }

    if (req.method === 'GET' && pathname === '/forgot-password') {
      if (isAuthenticated(req)) {
        res.writeHead(302, { location: '/profile' });
        res.end();

        return;
      }

      const content = `
        <form action="/forgot-password" method="post">
          <label>Email</label>
          <input name="email" type="email" required>
          <button type="submit">Send reset link</button>
        </form>
      `;

      sendHtml(res, 200, renderPage('Forgot password', content));

      return;
    }

    if (req.method === 'POST' && pathname === '/forgot-password') {
      const body = await parseBody(req);
      const user = getUserByEmail(body.email);

      if (user) {
        user.resetToken = nodeCrypto.randomBytes(16).toString('hex');
      }

      const resetLink = user
        ? `<p><a href="/reset-password?token=${user.resetToken}">Reset password</a></p>`
        : '';

      const content = `
        <p class="message">If the email exists, a reset email was sent to
        ${escapeHtml(body.email || '')}.</p>
        ${resetLink}
      `;

      sendHtml(res, 200, renderPage('Forgot password', content));

      return;
    }

    if (req.method === 'GET' && pathname === '/reset-password') {
      if (isAuthenticated(req)) {
        res.writeHead(302, { location: '/profile' });
        res.end();

        return;
      }

      const token = url.searchParams.get('token');
      const user = getUserByResetToken(token);

      if (!user) {
        sendHtml(
          res,
          200,
          renderPage(
            'Reset password',
            '<p class="message">Invalid reset token.</p>',
          ),
        );

        return;
      }

      const content = `
        <form action="/reset-password?token=${token}" method="post">
          <label>New password</label>
          <input name="password" type="password" required>
          <label>Confirmation</label>
          <input name="confirmation" type="password" required>
          <button type="submit">Update password</button>
        </form>
      `;

      sendHtml(res, 200, renderPage('Reset password', content));

      return;
    }

    if (req.method === 'POST' && pathname === '/reset-password') {
      const token = url.searchParams.get('token');
      const body = await parseBody(req);
      const user = getUserByResetToken(token);

      if (!user) {
        sendHtml(
          res,
          200,
          renderPage(
            'Reset password',
            '<p class="message">Invalid reset token.</p>',
          ),
        );

        return;
      }

      if (body.password !== body.confirmation) {
        sendHtml(
          res,
          200,
          renderPage(
            'Reset password',
            '<p class="message">Passwords must match.</p>',
          ),
        );

        return;
      }

      if (!validatePassword(body.password)) {
        sendHtml(
          res,
          200,
          renderPage(
            'Reset password',
            '<p class="message">Password must follow the required rules.</p>',
          ),
        );

        return;
      }

      user.password = body.password;
      user.resetToken = null;

      const content = `
        <p class="message">Password updated. <a href="/login">Sign in</a></p>
      `;

      sendHtml(res, 200, renderPage('Reset password', content));

      return;
    }

    if (req.method === 'GET' && pathname === '/profile') {
      const user = getAuthenticatedUser(req);

      if (!user) {
        res.writeHead(302, { location: '/login' });
        res.end();

        return;
      }

      const content = `
        <p>Welcome, ${escapeHtml(user.name)}!</p>
        <form action="/profile" method="post">
          <label>Name</label>
          <input name="name" value="${escapeHtml(user.name)}">
          <button type="submit">Update name</button>
        </form>
        <form action="/profile" method="post">
          <label>Current password</label>
          <input name="password" type="password" required>
          <label>New email</label>
          <input name="newEmail" type="email" required>
          <label>Confirm new email</label>
          <input name="confirmationEmail" type="email" required>
          <button type="submit">Update email</button>
        </form>
        <form action="/profile" method="post">
          <label>Current password</label>
          <input name="oldPassword" type="password" required>
          <label>New password</label>
          <input name="newPassword" type="password" required>
          <label>Confirmation</label>
          <input name="confirmation" type="password" required>
          <button type="submit">Update password</button>
        </form>
        <p><a href="/logout">Logout</a></p>
      `;

      sendHtml(res, 200, renderPage('Profile', content, user));

      return;
    }

    if (req.method === 'POST' && pathname === '/profile') {
      const user = getAuthenticatedUser(req);

      if (!user) {
        res.writeHead(302, { location: '/login' });
        res.end();

        return;
      }

      const body = await parseBody(req);
      let message = 'Profile updated.';

      if (body.name) {
        user.name = body.name;
      }

      if (
        body.newEmail !== undefined ||
        body.confirmationEmail !== undefined ||
        body.password !== undefined
      ) {
        if (!body.password || !body.newEmail || !body.confirmationEmail) {
          message =
            'Please provide your current password and both email fields.';
        } else if (user.password !== body.password) {
          message = 'Current password is incorrect.';
        } else if (body.newEmail !== body.confirmationEmail) {
          message = 'New emails must match.';
        } else {
          const previousEmail = user.email;

          user.email = body.newEmail;
          message = `Email updated. A notification was sent to ${escapeHtml(previousEmail)}.`;
        }
      }

      if (
        body.oldPassword !== undefined ||
        body.newPassword !== undefined ||
        body.confirmation !== undefined
      ) {
        if (
          !body.oldPassword ||
          !body.newPassword ||
          !body.confirmation ||
          user.password !== body.oldPassword
        ) {
          message = 'Current password is incorrect.';
        } else if (body.newPassword !== body.confirmation) {
          message = 'New passwords must match.';
        } else if (!validatePassword(body.newPassword)) {
          message = 'Password must follow the required rules.';
        } else {
          user.password = body.newPassword;
          message = 'Password updated.';
        }
      }

      const content = `
        <p class="message">${escapeHtml(message)}</p>
        <p>Welcome, ${escapeHtml(user.name)}!</p>
      `;

      sendHtml(res, 200, renderPage('Profile', content, user));

      return;
    }

    if (req.method === 'GET' && pathname === '/logout') {
      const cookies = req.headers.cookie || '';
      const sessionCookie = cookies
        .split(';')
        .map((entry) => entry.trim())
        .find((entry) => entry.startsWith('sessionId='));

      if (sessionCookie) {
        const sessionId = sessionCookie.split('=')[1];

        sessions.delete(sessionId);
      }

      res.writeHead(302, {
        location: '/login',
        'set-cookie': ['sessionId=; Max-Age=0; Path=/'],
      });
      res.end();

      return;
    }

    sendHtml(
      res,
      404,
      renderPage('Not found', '<p class="message">Page not found.</p>'),
    );
  });
}

module.exports = {
  createServer,
};
