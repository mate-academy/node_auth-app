'use strict';

const router = require('express').Router();

const { db, byEmail, byId, removeTokens, addMail } = require('../../db');

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

const { flushMail, issueToken, findToken } = require('../../mail');

const { userOnly, verifyCsrf, startSession } = require('../../middleware');

const {
  page,
  form,
  link,
  loginLink,
  profilePage,
  invalidLink,
} = require('../../pages');

const profileMessages = new Map([
  ['name', 'Name updated.'],
  ['password', 'Password updated.'],
  [
    'email-sent',
    'Open the link sent to your new email address to confirm the change.',
  ],
  ['email', 'Email address updated.'],
]);

router.get('/profile', userOnly, (req, res) => {
  return profilePage(req, res, {
    message: profileMessages.get(req.query.updated),
  });
});

router.post('/profile/name', userOnly, verifyCsrf, (req, res) => {
  const name = text(req.body.name).trim();

  if (!validName(name)) {
    return profilePage(req, res, {
      status: 400,
      error: 'Enter a name of up to 100 characters.',
    });
  }

  db.prepare(
    `
      UPDATE users
      SET name = ?
      WHERE id = ?
    `,
  ).run(name, req.user.id);

  res.redirect(303, '/profile?updated=name');
});

router.post('/profile/password', userOnly, verifyCsrf, async (req, res) => {
  const { oldPassword, password, confirmation: repeated } = req.body;

  const reject = (error) =>
    profilePage(req, res, {
      status: 400,
      error,
    });

  const oldPasswordMatches = await matchesPassword(
    text(oldPassword),
    req.user.password_hash,
  );

  if (!oldPasswordMatches) {
    return reject('Incorrect old password.');
  }

  if (!validPassword(password)) {
    return reject(passwordRule);
  }

  if (password !== repeated) {
    return reject('Passwords must match.');
  }

  const passwordHash = await hashPassword(password);

  const user = db.transaction(() => {
    const updated = db
      .prepare(
        `
        UPDATE users
        SET
          password_hash = ?,
          version = version + 1
        WHERE id = ? AND version = ?
        RETURNING *
      `,
      )
      .get(passwordHash, req.user.id, req.user.version);

    if (updated) {
      removeTokens.run(updated.id);
    }

    return updated;
  })();

  if (!user) {
    return res.redirect(303, '/login');
  }

  await startSession(req, user);

  res.redirect(303, '/profile?updated=password');
});

router.post('/profile/email', userOnly, verifyCsrf, async (req, res) => {
  const email = emailAddress(req.body.email);

  const reject = (error) =>
    profilePage(req, res, {
      status: 400,
      error,
    });

  if (!validEmail(email)) {
    return reject('Enter a valid email address.');
  }

  const passwordMatches = await matchesPassword(
    text(req.body.password),
    req.user.password_hash,
  );

  if (!passwordMatches) {
    return reject('Incorrect password.');
  }

  if (byId.get(req.user.id)?.version !== req.user.version) {
    return res.redirect(303, '/login');
  }

  if (email === req.user.email) {
    return reject('Enter an email different from your current email.');
  }

  if (byEmail.get(email)) {
    return reject('This email address is unavailable.');
  }

  db.transaction(() => {
    issueToken(req.user.id, {
      purpose: 'email',
      route: '/confirm-email',
      recipient: email,
      email,
      subject: 'Confirm your new email address',
      minutes: 60,
    });
  })();

  flushMail();

  res.redirect(303, '/profile?updated=email-sent');
});

router.get('/confirm-email', (req, res) => {
  if (!findToken(req.query.token, 'email')) {
    return invalidLink(req, res);
  }

  return page(req, res, 'Confirm email change', {
    forms: [
      form('/confirm-email', 'Confirm email change', [], req.query.token),
    ],
  });
});

router.post('/confirm-email', verifyCsrf, async (req, res) => {
  const result = db.transaction(() => {
    const token = findToken(req.body.token, 'email');

    if (!token) {
      return null;
    }

    if (byEmail.get(token.email)) {
      return {
        taken: true,
      };
    }

    const oldUser = byId.get(token.user_id);

    const user = db
      .prepare(
        `
        UPDATE users
        SET
          email = ?,
          version = version + 1
        WHERE id = ?
        RETURNING *
      `,
      )
      .get(token.email, token.user_id);

    removeTokens.run(user.id);

    addMail.run(
      oldUser.email,
      'Your email address changed',
      'The email for your account was changed.',
      null,
    );

    return {
      user,
    };
  })();

  if (!result) {
    return invalidLink(req, res);
  }

  if (result.taken) {
    return page(req, res, 'Email unavailable', {
      status: 409,
      error: 'This address is already in use.',
      links: [link('/profile', 'Profile')],
    });
  }

  flushMail();

  if (req.user?.id === result.user.id) {
    await startSession(req, result.user);

    return res.redirect(303, '/profile?updated=email');
  }

  return page(req, res, 'Email updated', {
    message: 'Log in with your new address.',
    links: [loginLink],
  });
});

module.exports = router;
