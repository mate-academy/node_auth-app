/* eslint-disable no-shadow */
'use strict';

/* eslint-disable no-console */

require('dotenv').config();

const path = require('path');
const crypto = require('crypto');
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const Database = require('better-sqlite3');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const HOUR = 60 * 60 * 1000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PASSWORD_RULES = [
  { test: /.{8,}/, message: 'At least 8 characters' },
  { test: /[a-z]/, message: 'A lowercase letter' },
  { test: /[A-Z]/, message: 'An uppercase letter' },
  { test: /\d/, message: 'A digit' },
  { test: /[^A-Za-z0-9]/, message: 'A special character' },
];

// ---------- database ----------
const db = new Database(process.env.DB_FILE || 'app.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS tokens (
    token_hash TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    expires_at INTEGER NOT NULL
  );
`);

function getUser(id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

function getUserByEmail(email) {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
}

// ---------- helpers ----------
const mailer = nodemailer.createTransport(
  process.env.SMTP_URL || { jsonTransport: true },
);

async function sendMail(to, subject, text) {
  if (!process.env.SMTP_URL) {
    console.log(`\n[email] to: ${to}\n${subject}\n${text}\n`);

    return;
  }

  await mailer.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject,
    text,
  });
}

function passwordErrors(password) {
  return PASSWORD_RULES.filter((rule) => !rule.test.test(password || '')).map(
    (rule) => `Password: ${rule.message.toLowerCase()} required`,
  );
}

function cleanEmail(value) {
  return String(value || '')
    .trim()
    .toLowerCase();
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function createToken(userId, type, ttl) {
  const token = crypto.randomBytes(32).toString('hex');

  db.prepare('DELETE FROM tokens WHERE user_id = ? AND type = ?').run(
    userId,
    type,
  );

  db.prepare('INSERT INTO tokens VALUES (?, ?, ?, ?)').run(
    hashToken(token),
    userId,
    type,
    Date.now() + ttl,
  );

  return token;
}

function readToken(token, type, consume) {
  const row = db
    .prepare(
      'SELECT * FROM tokens ' +
        'WHERE token_hash = ? AND type = ? AND expires_at > ?',
    )
    .get(hashToken(token), type, Date.now());

  if (row && consume) {
    db.prepare('DELETE FROM tokens WHERE token_hash = ?').run(row.token_hash);
  }

  return row;
}

function logIn(req, userId, done) {
  req.session.regenerate((err) => {
    if (!err) {
      req.session.userId = userId;
    }

    done(err);
  });
}

const wrap = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

function showMessage(res, title, text, link, status = 200) {
  res.status(status).render('message', { title, text, link });
}

// ---------- app setup ----------
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * HOUR },
  }),
);

app.use((req, res, next) => {
  res.locals.user = req.session.userId ? getUser(req.session.userId) : null;
  res.locals.errors = [];
  res.locals.ok = null;
  res.locals.values = {};
  res.locals.rules = PASSWORD_RULES.map((rule) => rule.message);
  next();
});

function onlyGuest(req, res, next) {
  if (res.locals.user) {
    res.redirect('/profile');

    return;
  }

  next();
}

function onlyAuthed(req, res, next) {
  if (!res.locals.user) {
    res.redirect('/login');

    return;
  }

  next();
}

app.get('/', (req, res) => {
  res.redirect(res.locals.user ? '/profile' : '/login');
});

// ---------- registration and activation ----------
app.get('/register', onlyGuest, (req, res) => {
  res.render('register');
});

app.post(
  '/register',
  onlyGuest,
  wrap(async (req, res) => {
    const name = String(req.body.name || '').trim();
    const email = cleanEmail(req.body.email);
    const password = req.body.password || '';
    const errors = [];

    if (!name) {
      errors.push('Name is required');
    }

    if (!EMAIL_RE.test(email)) {
      errors.push('Valid email is required');
    }

    errors.push(...passwordErrors(password));

    if (!errors.length && getUserByEmail(email)) {
      errors.push('This email is already registered');
    }

    if (errors.length) {
      res.status(400).render('register', { errors, values: { name, email } });

      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const result = db
      .prepare(
        'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      )
      .run(name, email, passwordHash);
    const token = createToken(result.lastInsertRowid, 'activate', 24 * HOUR);

    await sendMail(
      email,
      'Activate your account',
      `Hi ${name},\n\nConfirm your email: ${BASE_URL}/activate/${token}\n\n` +
        'The link is valid for 24 hours.',
    );

    showMessage(
      res,
      'Check your email',
      `We sent an activation link to ${email}.`,
    );
  }),
);

app.get('/activate/:token', onlyGuest, (req, res, next) => {
  const row = readToken(req.params.token, 'activate', true);

  if (!row) {
    showMessage(
      res,
      'Activation failed',
      'The link is invalid or expired.',
      { href: '/login', text: 'Go to login' },
      400,
    );

    return;
  }

  db.prepare('UPDATE users SET active = 1 WHERE id = ?').run(row.user_id);

  logIn(req, row.user_id, (err) => {
    if (err) {
      next(err);

      return;
    }

    res.redirect('/profile');
  });
});

// ---------- login and logout ----------
app.get('/login', onlyGuest, (req, res) => {
  res.render('login');
});

app.post(
  '/login',
  onlyGuest,
  wrap(async (req, res, next) => {
    const email = cleanEmail(req.body.email);
    const user = getUserByEmail(email);
    const valid =
      user &&
      (await bcrypt.compare(req.body.password || '', user.password_hash));

    if (!valid) {
      res.status(401).render('login', {
        errors: ['Invalid email or password'],
        values: { email },
      });

      return;
    }

    if (!user.active) {
      res.status(403).render('login', {
        errors: ['Please activate your account using the emailed link.'],
        values: { email },
      });

      return;
    }

    logIn(req, user.id, (err) => {
      if (err) {
        next(err);

        return;
      }

      res.redirect('/profile');
    });
  }),
);

app.post('/logout', onlyAuthed, (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

// ---------- password reset ----------
app.get('/forgot', onlyGuest, (req, res) => {
  res.render('forgot');
});

app.post(
  '/forgot',
  onlyGuest,
  wrap(async (req, res) => {
    const email = cleanEmail(req.body.email);
    const user = getUserByEmail(email);

    if (user) {
      const token = createToken(user.id, 'reset', HOUR);

      await sendMail(
        email,
        'Reset your password',
        `Reset link (valid for 1 hour): ${BASE_URL}/reset/${token}`,
      );
    }

    showMessage(
      res,
      'Email sent',
      'If that address is registered, a reset link is on its way.',
    );
  }),
);

function showExpired(res) {
  showMessage(
    res,
    'Link expired',
    'This reset link is invalid or expired.',
    { href: '/forgot', text: 'Request a new one' },
    400,
  );
}

app.get('/reset/:token', onlyGuest, (req, res) => {
  if (!readToken(req.params.token, 'reset', false)) {
    showExpired(res);

    return;
  }

  res.render('reset');
});

app.post(
  '/reset/:token',
  onlyGuest,
  wrap(async (req, res) => {
    const { password, confirmation } = req.body;
    const errors = passwordErrors(password);

    if (!readToken(req.params.token, 'reset', false)) {
      showExpired(res);

      return;
    }

    if (password !== confirmation) {
      errors.push('Password and confirmation must match');
    }

    if (errors.length) {
      res.status(400).render('reset', { errors });

      return;
    }

    const row = readToken(req.params.token, 'reset', true);
    const passwordHash = await bcrypt.hash(password, 12);

    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(
      passwordHash,
      row.user_id,
    );

    showMessage(
      res,
      'Password changed',
      'You can now log in with your new password.',
      { href: '/login', text: 'Login' },
    );
  }),
);

// ---------- profile ----------
app.get('/profile', onlyAuthed, (req, res) => {
  res.render('profile');
});

app.post('/profile/name', onlyAuthed, (req, res) => {
  const name = String(req.body.name || '').trim();
  const { id } = res.locals.user;

  if (!name) {
    res.status(400).render('profile', { errors: ['Name is required'] });

    return;
  }

  db.prepare('UPDATE users SET name = ? WHERE id = ?').run(name, id);
  res.render('profile', { user: getUser(id), ok: 'Name updated' });
});

app.post(
  '/profile/password',
  onlyAuthed,
  wrap(async (req, res) => {
    const { user } = res.locals;
    const { old, password, confirmation } = req.body;
    const errors = [];
    const oldValid = await bcrypt.compare(old || '', user.password_hash);

    if (!oldValid) {
      errors.push('Current password is incorrect');
    }

    errors.push(...passwordErrors(password));

    if (password !== confirmation) {
      errors.push('New password and confirmation must match');
    }

    if (errors.length) {
      res.status(400).render('profile', { errors });

      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(
      passwordHash,
      user.id,
    );

    res.render('profile', { ok: 'Password changed' });
  }),
);

app.post(
  '/profile/email',
  onlyAuthed,
  wrap(async (req, res) => {
    const { user } = res.locals;
    const email = cleanEmail(req.body.email);
    const confirmation = cleanEmail(req.body.email_confirmation);
    const errors = [];
    const passwordValid = await bcrypt.compare(
      req.body.password || '',
      user.password_hash,
    );

    if (!passwordValid) {
      errors.push('Password is incorrect');
    }

    if (!EMAIL_RE.test(email)) {
      errors.push('Valid email is required');
    }

    if (email !== confirmation) {
      errors.push('Email and confirmation must match');
    }

    if (!errors.length && email !== user.email && getUserByEmail(email)) {
      errors.push('This email is already in use');
    }

    if (errors.length) {
      res.status(400).render('profile', { errors });

      return;
    }

    db.prepare('UPDATE users SET email = ? WHERE id = ?').run(email, user.id);

    await sendMail(
      user.email,
      'Your email was changed',
      `The email of your account was changed to ${email}. ` +
        "If this wasn't you, contact support immediately.",
    );

    res.render('profile', {
      user: getUser(user.id),
      ok: 'Email updated; the old address was notified',
    });
  }),
);

// ---------- 404 and errors ----------
app.use((req, res) => {
  showMessage(res, '404', 'Page not found.', { href: '/', text: 'Home' }, 404);
});

// Express recognizes error handlers by their 4 arguments
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);

  showMessage(
    res,
    'Error',
    'Something went wrong.',
    { href: '/', text: 'Home' },
    500,
  );
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Listening on ${BASE_URL}`);
});
