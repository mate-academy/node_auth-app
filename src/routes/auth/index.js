'use strict';

const router = require('express').Router();

const { db, byEmail, byId, removeTokens } = require('../../db');

const {
  text,
  emailAddress,
  validName,
  validEmail,
  validPassword,
  passwordRule,
  hashPassword,
  matchesPassword,
} = require('../../security');

const {
  flushMail,
  issueToken,
  findToken,
  queueActivation,
} = require('../../mail');

const {
  guestOnly,
  userOnly,
  verifyCsrf,
  startSession,
} = require('../../middleware');

const {
  page,
  form,
  emailField,
  newPassword,
  confirmation,
  loginLink,
  registerPage,
  loginPage,
  invalidLink,
} = require('../../pages');

router.get('/register', guestOnly, (req, res) => {
  return registerPage(req, res);
});

router.post('/register', guestOnly, verifyCsrf, async (req, res) => {
  const name = text(req.body.name).trim();
  const email = emailAddress(req.body.email);
  const password = text(req.body.password);

  const reject = (error) =>
    registerPage(req, res, {
      name,
      email,
      error,
      status: 400,
    });

  if (!validName(name)) {
    return reject('Enter a name of up to 100 characters.');
  }

  if (!validEmail(email)) {
    return reject('Enter a valid email address.');
  }

  if (!validPassword(password)) {
    return reject(passwordRule);
  }

  const passwordHash = await hashPassword(password);

  db.transaction(() => {
    const result = db
      .prepare(
        `
        INSERT INTO users
          (name, email, password_hash)
        VALUES (?, ?, ?)
        ON CONFLICT (email) DO NOTHING
      `,
      )
      .run(name, email, passwordHash);

    if (result.changes) {
      queueActivation(result.lastInsertRowid, email);
    }
  })();

  flushMail();

  res.redirect(303, '/activation-sent');
});

router.get('/activation-sent', guestOnly, (req, res) => {
  return page(req, res, 'Check your email', {
    message:
      // eslint-disable-next-line max-len
      'If your address was available, an activation link was sent. You can request a new link by trying to log in.',
    links: [loginLink],
  });
});

router.get('/activate', guestOnly, (req, res) => {
  if (!findToken(req.query.token, 'activation')) {
    return invalidLink(req, res);
  }

  return page(req, res, 'Activate account', {
    forms: [form('/activate', 'Activate account', [], req.query.token)],
  });
});

router.post('/activate', guestOnly, verifyCsrf, async (req, res) => {
  const user = db.transaction(() => {
    const token = findToken(req.body.token, 'activation');

    if (!token) {
      return undefined;
    }

    const updated = db
      .prepare(
        `
        UPDATE users
        SET active = 1
        WHERE id = ? AND active = 0
        RETURNING *
      `,
      )
      .get(token.user_id);

    removeTokens.run(token.user_id);

    return updated;
  })();

  if (!user) {
    return invalidLink(req, res);
  }

  await startSession(req, user);

  res.redirect(303, '/profile');
});

router.get('/login', guestOnly, (req, res) => {
  return loginPage(req, res);
});

router.post('/login', guestOnly, verifyCsrf, async (req, res) => {
  const email = emailAddress(req.body.email);

  const user = byEmail.get(email);

  const matches = await matchesPassword(
    text(req.body.password),
    user?.password_hash,
  );

  if (!user || !matches || byId.get(user.id)?.version !== user.version) {
    return loginPage(req, res, {
      email,
      status: 401,
      error: 'Incorrect email or password.',
    });
  }

  if (!user.active) {
    const current = byId.get(user.id);

    if (!current.active) {
      db.transaction(() => {
        queueActivation(user.id, email);
      })();
    }

    flushMail();

    return loginPage(req, res, {
      email,
      status: 403,
      error: 'Activate your account using the link sent to your email.',
    });
  }

  await startSession(req, user);

  res.redirect(303, '/profile');
});

router.post('/logout', userOnly, verifyCsrf, (req, res, next) => {
  req.session.destroy((error) => {
    if (error) {
      return next(error);
    }

    res.clearCookie('auth.sid', {
      path: '/',
    });

    res.redirect(303, '/login');
  });
});

router.get('/forgot-password', guestOnly, (req, res) => {
  return page(req, res, 'Forgot password', {
    forms: [form('/forgot-password', 'Send reset link', [emailField()])],
    links: [loginLink],
  });
});

router.post('/forgot-password', guestOnly, verifyCsrf, (req, res) => {
  const email = emailAddress(req.body.email);

  if (!validEmail(email)) {
    return page(req, res, 'Forgot password', {
      status: 400,
      error: 'Enter a valid email address.',
      forms: [form('/forgot-password', 'Send reset link', [emailField(email)])],
      links: [loginLink],
    });
  }

  const user = byEmail.get(email);

  if (user?.active) {
    db.transaction(() => {
      issueToken(user.id, {
        purpose: 'reset',
        route: '/reset-password',
        recipient: email,
        subject: 'Reset your password',
        minutes: 30,
      });
    })();

    flushMail();
  }

  res.redirect(303, '/reset-sent');
});

router.get('/reset-sent', guestOnly, (req, res) => {
  return page(req, res, 'Email sent', {
    message:
      'If the address belongs to an active account, a reset link was sent.',
    links: [loginLink],
  });
});

function resetPage(req, res, token, error = '') {
  return page(req, res, 'Reset password', {
    status: error ? 400 : 200,
    error,
    forms: [
      form(
        '/reset-password',
        'Reset password',
        [newPassword(), confirmation()],
        token,
      ),
    ],
  });
}

router.get('/reset-password', guestOnly, (req, res) => {
  if (!findToken(req.query.token, 'reset')) {
    return invalidLink(req, res);
  }

  return resetPage(req, res, req.query.token);
});

router.post('/reset-password', guestOnly, verifyCsrf, async (req, res) => {
  const { token, password, confirmation: repeated } = req.body;

  if (!findToken(token, 'reset')) {
    return invalidLink(req, res);
  }

  if (!validPassword(password)) {
    return resetPage(req, res, token, passwordRule);
  }

  if (password !== repeated) {
    return resetPage(req, res, token, 'Passwords must match.');
  }

  const passwordHash = await hashPassword(password);

  const changed = db.transaction(() => {
    const current = findToken(token, 'reset');

    if (!current) {
      return false;
    }

    db.prepare(
      `
        UPDATE users
        SET
          password_hash = ?,
          version = version + 1
        WHERE id = ?
      `,
    ).run(passwordHash, current.user_id);

    removeTokens.run(current.user_id);

    return true;
  })();

  if (!changed) {
    return invalidLink(req, res);
  }

  res.redirect(303, '/reset-success');
});

router.get('/reset-success', guestOnly, (req, res) => {
  return page(req, res, 'Password reset', {
    message: 'You can now log in with your new password.',
    links: [loginLink],
  });
});

module.exports = router;
