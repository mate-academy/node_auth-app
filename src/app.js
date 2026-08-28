'use strict';

const nodeCrypto = require('node:crypto');
const path = require('node:path');
const bcrypt = require('bcryptjs');
const express = require('express');
const session = require('express-session');
const { createEmailService } = require('./email');
const { UserStore } = require('./store');
const {
  alert,
  authPage,
  escapeHtml,
  field,
  layout,
  messagePage,
} = require('./views');

const TOKEN_LIFETIME = 60 * 60 * 1000;
const PASSWORD_MESSAGE =
  'Use at least 8 characters, including uppercase, lowercase and a number.';
const normalizeEmail = (email = '') => email.trim().toLowerCase();
const validEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validPassword = (password = '') =>
  password.length >= 8 &&
  /[a-z]/.test(password) &&
  /[A-Z]/.test(password) &&
  /\d/.test(password);
const tokenHash = (token) =>
  nodeCrypto.createHash('sha256').update(token).digest('hex');

function createToken() {
  const token = nodeCrypto.randomBytes(32).toString('hex');

  return {
    token,
    hash: tokenHash(token),
    expiresAt: Date.now() + TOKEN_LIFETIME,
  };
}

function createApp(options = {}) {
  const app = express();
  const store =
    options.store ||
    new UserStore(
      options.dataFile === undefined
        ? path.join(__dirname, '..', 'data', 'users.json')
        : options.dataFile,
    );
  const email = options.email || createEmailService();
  const sessionSecret =
    options.sessionSecret ||
    process.env.SESSION_SECRET ||
    'development-only-change-me';

  app.disable('x-powered-by');
  app.use(express.urlencoded({ extended: false }));
  app.use(express.static(path.join(__dirname, 'public')));

  app.use(
    session({
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000,
      },
    }),
  );

  app.locals.store = store;
  app.locals.email = email;

  const userFor = (req) =>
    req.session.userId && store.findById(req.session.userId);
  const guestOnly = (req, res, next) =>
    userFor(req) ? res.redirect('/profile') : next();
  const authOnly = (req, res, next) =>
    userFor(req) ? next() : res.redirect('/login');
  const baseUrl = (req) =>
    process.env.APP_URL || `${req.protocol}://${req.get('host')}`;

  app.get('/', (req, res) => {
    res.redirect(userFor(req) ? '/profile' : '/login');
  });

  app.get('/register', guestOnly, (req, res) => {
    res.send(authPage({ mode: 'register' }));
  });

  app.post('/register', guestOnly, async (req, res, next) => {
    try {
      const name = (req.body.name || '').trim();
      const emailAddress = normalizeEmail(req.body.email);
      const password = req.body.password || '';
      let error;

      if (name.length < 2) {
        error = 'Please enter your name.';
      } else if (!validEmail(emailAddress)) {
        error = 'Enter a valid email address.';
      } else if (!validPassword(password)) {
        error = PASSWORD_MESSAGE;
      } else if (store.findByEmail(emailAddress)) {
        error = 'An account with that email already exists.';
      }

      if (error) {
        return res.status(422).send(
          authPage({
            mode: 'register',
            error,
            values: { name, email: emailAddress },
          }),
        );
      }

      const activation = createToken();

      store.insert({
        id: nodeCrypto.randomUUID(),
        name,
        email: emailAddress,
        passwordHash: await bcrypt.hash(password, 12),
        active: false,
        activationHash: activation.hash,
        activationExpiresAt: activation.expiresAt,
        resetHash: null,
        resetExpiresAt: null,
        createdAt: new Date().toISOString(),
      });

      const activationUrl = `${baseUrl(req)}/activate?token=${activation.token}`;

      await email.send({
        to: emailAddress,
        subject: 'Activate your Gatehouse account',
        text: `Welcome, ${name}. Activate your account: ${activationUrl}`,
        html: `<p>Welcome, ${escapeHtml(name)}.</p><p><a href="${activationUrl}">Activate your account</a></p>`,
      });

      return res.status(201).send(
        messagePage({
          title: 'Check your inbox',
          message: `We sent an activation link to ${emailAddress}.`,
          detail: 'The link expires in one hour.',
          type: 'success',
        }),
      );
    } catch (error) {
      return next(error);
    }
  });

  app.get('/activate', guestOnly, (req, res) => {
    const hash = req.query.token && tokenHash(req.query.token);
    const user =
      hash && store.all().find((item) => item.activationHash === hash);

    if (!user || user.activationExpiresAt < Date.now()) {
      return res.status(400).send(
        messagePage({
          title: 'Link unavailable',
          message: 'This activation link is invalid or has expired.',
          actionHref: '/register',
          actionLabel: 'Create an account',
          type: 'error',
        }),
      );
    }

    store.update(user.id, {
      active: true,
      activationHash: null,
      activationExpiresAt: null,
    });
    req.session.userId = user.id;

    return req.session.save(() => res.redirect('/profile'));
  });

  app.get('/login', guestOnly, (req, res) => {
    res.send(authPage({ mode: 'login' }));
  });

  app.post('/login', guestOnly, async (req, res, next) => {
    try {
      const emailAddress = normalizeEmail(req.body.email);
      const user = store.findByEmail(emailAddress);

      if (
        !user ||
        !(await bcrypt.compare(req.body.password || '', user.passwordHash))
      ) {
        return res.status(401).send(
          authPage({
            mode: 'login',
            error: 'Email or password is incorrect.',
            values: { email: emailAddress },
          }),
        );
      }

      if (!user.active) {
        return res.status(403).send(
          authPage({
            mode: 'login',
            error: 'Please activate your email before signing in.',
            values: { email: emailAddress },
          }),
        );
      }
      req.session.userId = user.id;

      return req.session.save(() => res.redirect('/profile'));
    } catch (error) {
      return next(error);
    }
  });

  app.post('/logout', authOnly, (req, res) => {
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.redirect('/login');
    });
  });

  app.get('/logout', authOnly, (req, res) => {
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.redirect('/login');
    });
  });

  app.get('/forgot-password', guestOnly, (req, res) => {
    const emailField = field({
      label: 'Email address',
      name: 'email',
      type: 'email',
      autocomplete: 'email',
    });

    res.send(
      layout({
        title: 'Reset password',
        body: `<h1>Reset your password</h1><p class="lede">Enter the email associated with your account.</p><form method="post" action="/forgot-password">${emailField}<button>Send reset link <span>→</span></button></form><div class="links"><a href="/login">← Back to sign in</a></div>`,
      }),
    );
  });

  app.post('/forgot-password', guestOnly, async (req, res, next) => {
    try {
      const emailAddress = normalizeEmail(req.body.email);
      const user = store.findByEmail(emailAddress);

      if (user && user.active) {
        const reset = createToken();

        store.update(user.id, {
          resetHash: reset.hash,
          resetExpiresAt: reset.expiresAt,
        });

        const resetUrl = `${baseUrl(req)}/reset-password?token=${reset.token}`;

        await email.send({
          to: user.email,
          subject: 'Reset your Gatehouse password',
          text: `Reset your password: ${resetUrl}`,
          html: `<p><a href="${resetUrl}">Reset your password</a></p>`,
        });
      }

      return res.send(
        messagePage({
          title: 'Email sent',
          message:
            'If an active account exists for that email, ' +
            'a reset link is on its way.',
          detail: 'The link expires in one hour.',
          type: 'success',
        }),
      );
    } catch (error) {
      return next(error);
    }
  });

  function resetUser(req) {
    if (!req.query.token && !req.body.token) {
      return null;
    }

    const hash = tokenHash(req.query.token || req.body.token);

    return store
      .all()
      .find(
        (user) => user.resetHash === hash && user.resetExpiresAt >= Date.now(),
      );
  }

  app.get('/reset-password', guestOnly, (req, res) => {
    if (!resetUser(req)) {
      return res.status(400).send(
        messagePage({
          title: 'Link unavailable',
          message: 'This reset link is invalid or has expired.',
          actionHref: '/forgot-password',
          actionLabel: 'Request a new link',
          type: 'error',
        }),
      );
    }

    return res.send(
      layout({
        title: 'Choose a password',
        body: `<h1>Choose a new password</h1><p class="lede">Make it strong and unique.</p><form method="post" action="/reset-password"><input type="hidden" name="token" value="${escapeHtml(req.query.token)}">${field(
          {
            label: 'New password',
            name: 'password',
            type: 'password',
            autocomplete: 'new-password',
            hint: PASSWORD_MESSAGE,
          },
        )}${field({
          label: 'Confirm password',
          name: 'confirmation',
          type: 'password',
          autocomplete: 'new-password',
        })}<button>Update password <span>→</span></button></form>`,
      }),
    );
  });

  app.post('/reset-password', guestOnly, async (req, res, next) => {
    try {
      const user = resetUser(req);
      let error;

      if (!user) {
        error = 'This reset link is invalid or has expired.';
      } else if (!validPassword(req.body.password || '')) {
        error = PASSWORD_MESSAGE;
      } else if (req.body.password !== req.body.confirmation) {
        error = 'Passwords must match.';
      }

      if (error) {
        return res.status(422).send(
          messagePage({
            title: 'Password not changed',
            message: error,
            actionHref: req.body.token
              ? `/reset-password?token=${encodeURIComponent(req.body.token)}`
              : '/forgot-password',
            actionLabel: 'Try again',
            type: 'error',
          }),
        );
      }

      store.update(user.id, {
        passwordHash: await bcrypt.hash(req.body.password, 12),
        resetHash: null,
        resetExpiresAt: null,
      });

      return res.send(
        messagePage({
          title: 'Password updated',
          message: 'Your new password is ready to use.',
          actionHref: '/login',
          actionLabel: 'Sign in',
          type: 'success',
        }),
      );
    } catch (error) {
      return next(error);
    }
  });

  app.get('/profile', authOnly, (req, res) => {
    const user = userFor(req);
    const notice = req.session.notice;
    const nameField = field({
      label: 'Full name',
      name: 'name',
      value: user.name,
      autocomplete: 'name',
    });
    const emailField = field({
      label: 'New email',
      name: 'email',
      type: 'email',
      autocomplete: 'email',
    });
    const emailPasswordField = field({
      label: 'Current password',
      name: 'password',
      type: 'password',
      autocomplete: 'current-password',
    });
    const oldPasswordField = field({
      label: 'Current password',
      name: 'oldPassword',
      type: 'password',
      autocomplete: 'current-password',
    });
    const newPasswordField = field({
      label: 'New password',
      name: 'newPassword',
      type: 'password',
      autocomplete: 'new-password',
      hint: PASSWORD_MESSAGE,
    });
    const confirmationField = field({
      label: 'Confirm new password',
      name: 'confirmation',
      type: 'password',
      autocomplete: 'new-password',
    });

    delete req.session.notice;

    res.send(
      layout({
        title: 'Your profile',
        eyebrow: 'Account settings',
        wide: true,
        body: `<div class="profile-head"><div><h1>Hello, ${escapeHtml(user.name)}</h1><p class="lede">Manage your personal details and sign-in security.</p></div><form method="post" action="/logout"><button class="secondary">Sign out</button></form></div>${alert(notice, 'success')}
<div class="profile-grid"><section><h2>Personal details</h2><form method="post" action="/profile/name">${nameField}<button>Save name</button></form></section>
<section><h2>Email address</h2><p class="muted">Current: ${escapeHtml(user.email)}</p><form method="post" action="/profile/email">${emailField}${emailPasswordField}<button>Change email</button></form></section>
<section><h2>Change password</h2><form method="post" action="/profile/password">${oldPasswordField}${newPasswordField}${confirmationField}<button>Update password</button></form></section></div>`,
      }),
    );
  });

  const profileResult = (req, res, message, status = 303) => {
    req.session.notice = message;
    res.redirect(status, '/profile');
  };

  app.post('/profile/name', authOnly, (req, res) => {
    const name = (req.body.name || '').trim();

    if (name.length < 2) {
      return profileResult(req, res, 'Name must be at least 2 characters.');
    }
    store.update(req.session.userId, { name });

    return profileResult(req, res, 'Name updated.');
  });

  app.post('/profile/password', authOnly, async (req, res, next) => {
    try {
      const user = userFor(req);

      if (
        !(await bcrypt.compare(req.body.oldPassword || '', user.passwordHash))
      ) {
        return profileResult(req, res, 'Current password is incorrect.');
      }

      if (!validPassword(req.body.newPassword || '')) {
        return profileResult(req, res, PASSWORD_MESSAGE);
      }

      if (req.body.newPassword !== req.body.confirmation) {
        return profileResult(req, res, 'New passwords must match.');
      }

      store.update(user.id, {
        passwordHash: await bcrypt.hash(req.body.newPassword, 12),
      });

      return profileResult(req, res, 'Password updated.');
    } catch (error) {
      return next(error);
    }
  });

  app.post('/profile/email', authOnly, async (req, res, next) => {
    try {
      const user = userFor(req);
      const nextEmail = normalizeEmail(req.body.email);

      if (!validEmail(nextEmail)) {
        return profileResult(req, res, 'Enter a valid email address.');
      }

      if (store.findByEmail(nextEmail)) {
        return profileResult(req, res, 'That email is already in use.');
      }

      if (!(await bcrypt.compare(req.body.password || '', user.passwordHash))) {
        return profileResult(req, res, 'Current password is incorrect.');
      }

      const oldEmail = user.email;

      store.update(user.id, { email: nextEmail });

      await email.send({
        to: oldEmail,
        subject: 'Your Gatehouse email was changed',
        text: `Your account email was changed from ${oldEmail} to ${nextEmail}. If this was not you, contact support immediately.`,
      });

      return profileResult(
        req,
        res,
        'Email updated. A security notice was sent to your previous address.',
      );
    } catch (error) {
      return next(error);
    }
  });

  app.use((req, res) => {
    res.status(404).send(
      messagePage({
        title: 'Page not found',
        message: 'The page you are looking for does not exist.',
        actionHref: userFor(req) ? '/profile' : '/login',
        actionLabel: 'Go back',
        type: 'error',
      }),
    );
  });

  app.use((error, req, res, next) => {
    // eslint-disable-line no-unused-vars
    if (process.env.NODE_ENV !== 'test') {
      process.stderr.write(`${error.stack || error.message}\n`);
    }

    res.status(500).send(
      messagePage({
        title: 'Something went wrong',
        message: 'Please try again in a moment.',
        actionHref: '/',
        actionLabel: 'Return home',
        type: 'error',
      }),
    );
  });

  return app;
}

module.exports = { createApp, validPassword };
