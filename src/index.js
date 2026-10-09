'use strict';

const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const nodeCrypto = require('node:crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Temporary in-memory storage for this assignment.
const users = [];

app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'development-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    },
  }),
);

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };

    return entities[character];
  });
}

function page(title, content) {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,
          initial-scale=1">
        <title>${escapeHtml(title)}</title>
      </head>
      <body>
        <main>
          <h1>${escapeHtml(title)}</h1>
          ${content}
        </main>
      </body>
    </html>
  `;
}

function message(title, text, link = '/') {
  return page(
    title,
    `<p>${escapeHtml(text)}</p>
     <p><a href="${escapeHtml(link)}">Continue</a></p>`,
  );
}

function passwordRules() {
  return [
    'Password must be at least 8 characters.',
    'Include an uppercase letter and a lowercase letter.',
    'Include a number and a special character.',
  ].join(' ');
}

function validPassword(password) {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

function createToken() {
  return nodeCrypto.randomBytes(32).toString('hex');
}

function findUserByEmail(email) {
  return users.find((user) => user.email === email.toLowerCase());
}

function findUserByToken(token, field) {
  return users.find((user) => user[field] === token);
}

function currentUser(req) {
  if (!req.session.userId) {
    return null;
  }

  return users.find((user) => user.id === req.session.userId) || null;
}

function requireGuest(req, res, next) {
  if (currentUser(req)) {
    return res.redirect('/profile');
  }

  return next();
}

function requireAuth(req, res, next) {
  if (!currentUser(req)) {
    return res.redirect('/login');
  }

  return next();
}

function emailLink(type, token) {
  const link = `http://localhost:${PORT}/${type}?token=${token}`;

  process.stdout.write(`[Development email link] ${link}\n`);
}

function emailNotice(text) {
  process.stdout.write(`[Development email notification] ${text}\n`);
}

// Home page.
app.get('/', (req, res) => {
  const user = currentUser(req);

  if (user) {
    return res.redirect('/profile');
  }

  return res.send(
    page(
      'Auth application',
      `
        <p><a href="/register">Register</a></p>
        <p><a href="/login">Login</a></p>
        <p><a href="/password-reset">Forgot password?</a></p>
      `,
    ),
  );
});

// Registration.
app.get('/register', requireGuest, (req, res) => {
  res.send(
    page(
      'Register',
      `
        <p>${escapeHtml(passwordRules())}</p>
        <form method="post" action="/register">
          <label>
            Name
            <input name="name" required>
          </label>
          <label>
            Email
            <input name="email" type="email" required>
          </label>
          <label>
            Password
            <input name="password" type="password" required>
          </label>
          <button type="submit">Register</button>
        </form>
        <p><a href="/login">Already registered?</a></p>
      `,
    ),
  );
});

app.post('/register', requireGuest, async (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '')
    .trim()
    .toLowerCase();
  const password = String(req.body.password || '');

  if (!name || !email || !password) {
    return res
      .status(400)
      .send(message('Registration error', 'All fields are required.'));
  }

  if (findUserByEmail(email)) {
    return res
      .status(400)
      .send(message('Registration error', 'Email is already registered.'));
  }

  if (!validPassword(password)) {
    return res
      .status(400)
      .send(message('Registration error', passwordRules(), '/register'));
  }

  const user = {
    id: nodeCrypto.randomUUID(),
    name,
    email,
    passwordHash: await bcrypt.hash(password, 12),
    active: false,
    activationToken: createToken(),
    resetToken: null,
    emailChangeToken: null,
    pendingEmail: null,
  };

  users.push(user);
  emailLink('activate', user.activationToken);

  return res.send(
    message(
      'Check your email',
      'Your account was created. Activate it using the link',
      '/login',
    ),
  );
});

// Account activation.
app.get('/activate', requireGuest, (req, res) => {
  const token = String(req.query.token || '');
  const user = findUserByToken(token, 'activationToken');

  if (!user) {
    return res
      .status(400)
      .send(message('Activation error', 'The activation link is invalid.'));
  }

  user.active = true;
  user.activationToken = null;
  req.session.userId = user.id;

  return res.redirect('/profile');
});

// Login.
app.get('/login', requireGuest, (req, res) => {
  res.send(
    page(
      'Login',
      `
        <form method="post" action="/login">
          <label>
            Email
            <input name="email" type="email" required>
          </label>
          <label>
            Password
            <input name="password" type="password" required>
          </label>
          <button type="submit">Login</button>
        </form>
        <p><a href="/register">Register</a></p>
        <p><a href="/password-reset">Forgot password?</a></p>
      `,
    ),
  );
});

app.post('/login', requireGuest, async (req, res) => {
  const email = String(req.body.email || '')
    .trim()
    .toLowerCase();
  const password = String(req.body.password || '');
  const user = findUserByEmail(email);

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res
      .status(401)
      .send(message('Login error', 'Incorrect email or password.', '/login'));
  }

  if (!user.active) {
    return res
      .status(403)
      .send(
        message(
          'Account not activated',
          'Please activate your account using your activation link.',
          '/login',
        ),
      );
  }

  req.session.userId = user.id;

  return res.redirect('/profile');
});

// Logout.
app.post('/logout', requireAuth, (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

// Password reset request.
app.get('/password-reset', requireGuest, (req, res) => {
  res.send(
    page(
      'Reset password',
      `
        <form method="post" action="/password-reset">
          <label>
            Email
            <input name="email" type="email" required>
          </label>
          <button type="submit">Send reset link</button>
        </form>
        <p><a href="/login">Back to login</a></p>
      `,
    ),
  );
});

app.post('/password-reset', requireGuest, (req, res) => {
  const email = String(req.body.email || '')
    .trim()
    .toLowerCase();
  const user = findUserByEmail(email);

  if (user && user.active) {
    user.resetToken = createToken();
    emailLink('password-reset/confirm', user.resetToken);
  }

  return res.send(
    message(
      'Check your email',
      'If the account exists, a reset link has been generated.',
      '/login',
    ),
  );
});

// Confirm password reset.
app.get('/password-reset/confirm', requireGuest, (req, res) => {
  const token = String(req.query.token || '');
  const user = findUserByToken(token, 'resetToken');

  if (!user || !user.active) {
    return res
      .status(400)
      .send(message('Reset error', 'The reset link is invalid or expired.'));
  }

  res.send(
    page(
      'Choose a new password',
      `
        <form method="post" action="/password-reset/confirm">
          <input type="hidden" name="token"
            value="${escapeHtml(token)}">
          <label>
            New password
            <input name="password" type="password" required>
          </label>
          <label>
            Confirm password
            <input name="confirmation" type="password" required>
          </label>
          <button type="submit">Change password</button>
        </form>
        <p>${escapeHtml(passwordRules())}</p>
      `,
    ),
  );
});

app.post('/password-reset/confirm', requireGuest, async (req, res) => {
  const token = String(req.body.token || '');
  const password = String(req.body.password || '');
  const confirmation = String(req.body.confirmation || '');
  const user = findUserByToken(token, 'resetToken');

  if (!user || !user.active) {
    return res
      .status(400)
      .send(message('Reset error', 'The reset link is invalid or expired.'));
  }

  if (password !== confirmation) {
    return res
      .status(400)
      .send(message('Reset error', 'Passwords do not match.'));
  }

  if (!validPassword(password)) {
    return res.status(400).send(message('Reset error', passwordRules()));
  }

  user.passwordHash = await bcrypt.hash(password, 12);
  user.resetToken = null;

  return res.send(
    message(
      'Password changed',
      'Your password has been changed successfully.',
      '/login',
    ),
  );
});

// Profile page.
app.get('/profile', requireAuth, (req, res) => {
  const user = currentUser(req);

  res.send(
    page(
      'Profile',
      `
        <p>Name: ${escapeHtml(user.name)}</p>
        <p>Email: ${escapeHtml(user.email)}</p>

        <h2>Change name</h2>
        <form method="post" action="/profile/name">
          <label>
            New name
            <input name="name" required>
          </label>
          <button type="submit">Update name</button>
        </form>

        <h2>Change password</h2>
        <form method="post" action="/profile/password">
          <label>
            Current password
            <input name="oldPassword" type="password" required>
          </label>
          <label>
            New password
            <input name="password" type="password" required>
          </label>
          <label>
            Confirm new password
            <input name="confirmation" type="password" required>
          </label>
          <button type="submit">Change password</button>
        </form>

        <h2>Change email</h2>
        <form method="post" action="/profile/email">
          <label>
            Current password
            <input name="password" type="password" required>
          </label>
          <label>
            New email
            <input name="email" type="email" required>
          </label>
          <label>
            Confirm new email
            <input name="confirmation" type="email" required>
          </label>
          <button type="submit">Change email</button>
        </form>

        <form method="post" action="/logout">
          <button type="submit">Logout</button>
        </form>
      `,
    ),
  );
});

// Change profile name.
app.post('/profile/name', requireAuth, (req, res) => {
  const user = currentUser(req);
  const name = String(req.body.name || '').trim();

  if (!name) {
    return res
      .status(400)
      .send(message('Profile error', 'Name cannot be empty.', '/profile'));
  }

  user.name = name;

  return res.redirect('/profile');
});

// Change password.
app.post('/profile/password', requireAuth, async (req, res) => {
  const user = currentUser(req);
  const oldPassword = String(req.body.oldPassword || '');
  const password = String(req.body.password || '');
  const confirmation = String(req.body.confirmation || '');

  if (!(await bcrypt.compare(oldPassword, user.passwordHash))) {
    return res
      .status(400)
      .send(message('Password error', 'Current password is incorrect.'));
  }

  if (password !== confirmation) {
    return res
      .status(400)
      .send(message('Password error', 'New passwords do not match.'));
  }

  if (!validPassword(password)) {
    return res.status(400).send(message('Password error', passwordRules()));
  }

  user.passwordHash = await bcrypt.hash(password, 12);

  return res.send(
    message('Password changed', 'Your password has been updated.'),
  );
});

// Request email change.
app.post('/profile/email', requireAuth, async (req, res) => {
  const user = currentUser(req);
  const password = String(req.body.password || '');
  const email = String(req.body.email || '')
    .trim()
    .toLowerCase();
  const confirmation = String(req.body.confirmation || '')
    .trim()
    .toLowerCase();

  if (!(await bcrypt.compare(password, user.passwordHash))) {
    return res
      .status(400)
      .send(message('Email error', 'Current password is incorrect.'));
  }

  if (email !== confirmation) {
    return res
      .status(400)
      .send(message('Email error', 'Email addresses do not match.'));
  }

  if (findUserByEmail(email)) {
    return res
      .status(400)
      .send(message('Email error', 'This email is already registered.'));
  }

  user.pendingEmail = email;
  user.emailChangeToken = createToken();

  emailLink('profile/email/confirm', user.emailChangeToken);

  emailNotice(`Email change requested for ${user.email}`);

  return res.send(
    message(
      'Confirm your new email',
      'A confirmation link was generated in the development console.',
      '/profile',
    ),
  );
});

// Confirm new email.
app.get('/profile/email/confirm', requireAuth, (req, res) => {
  const user = currentUser(req);
  const token = String(req.query.token || '');

  if (
    !user.emailChangeToken ||
    user.emailChangeToken !== token ||
    !user.pendingEmail
  ) {
    return res
      .status(400)
      .send(message('Email error', 'The confirmation link is invalid.'));
  }

  const oldEmail = user.email;

  user.email = user.pendingEmail;
  user.pendingEmail = null;
  user.emailChangeToken = null;

  emailNotice(`Email changed from ${oldEmail} to ${user.email}`);

  return res.send(message('Email changed', 'Your email has been updated.'));
});

// 404 page for all other routes.
app.use((req, res) => {
  res
    .status(404)
    .send(
      page(
        '404 - Page not found',
        '<p>The page you requested does not exist.</p>',
      ),
    );
});

app.listen(PORT, () => {
  process.stdout.write(
    `Auth application running at http://localhost:${PORT}\n`,
  );
});
