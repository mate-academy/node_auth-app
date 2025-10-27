'use strict';

const bcrypt = require('bcrypt');

const { db, createUser, now } = require('../models/db');
const { validatePassword, PW_RULES_TEXT } = require('../utils/password');
const { issueActivation, issueReset } = require('../utils/tokens');
const { absoluteUrl } = require('../utils/url');
const { sendMail } = require('../utils/mailer');
const { page } = require('../app');

function renderRegister() {
  return page(
    'Register',
    `
    <h1>Register</h1>
    <form method="post" action="/register">
      <div><label>Name<br><input name="name" required /></label></div>
      <div><label>Email<br><input type="email" name="email" required /></label></div>
      <div><label>Password<br><input type="password" name="password" required /></label></div>
      <p class="hint">${PW_RULES_TEXT}</p>
      <button>Sign up</button>
    </form>
    <p>Have an account? <a href="/login">Login</a></p>
  `,
  );
}

exports.getRegister = (_req, res) => {
  res.send(renderRegister());
};

exports.postRegister = (req, res) => {
  const { name = '', email = '', password = '' } = req.body || {};

  const errors = [];

  if (!name.trim()) {
    errors.push('Name is required.');
  }

  if (!email.trim()) {
    errors.push('Email is required.');
  }

  const pwErrors = validatePassword(password);

  if (pwErrors.length) {
    errors.push(...pwErrors);
  }

  if (db.usersByEmail.has(email.toLowerCase())) {
    errors.push('Email already registered.');
  }

  if (errors.length) {
    res
      .status(400)
      .send(
        page(
          'Register - Errors',
          `<h1>Register</h1><p class="err">${errors.join('<br>')}</p><p><a href="/register">Back</a></p>`,
        ),
      );

    return;
  }

  const user = createUser({
    name: name.trim(),
    email: email.trim(),
    password,
  });

  const token = issueActivation(user.email);
  const link = absoluteUrl(req, `/activate?token=${token}`);

  sendMail({
    to: user.email,
    subject: 'Activate your account',
    html: `<p>Hi ${user.name},</p><p>Please activate: <a href="${link}">${link}</a></p>`,
  });

  res.send(
    page(
      'Check your email',
      `
      <h1>Activation email sent</h1>
      <p>We sent an activation link to <strong>${user.email}</strong>.</p>
      <p class="hint">Open the link to activate and you will be redirected to your Profile.</p>
      <p><a href="/">Home</a></p>
    `,
    ),
  );
};

exports.getActivate = (req, res) => {
  const { token } = req.query || {};
  const rec = db.activationTokens.get(token);

  if (!rec || rec.exp < Date.now()) {
    res
      .status(400)
      .send(
        page(
          'Activation error',
          `<h1>Activation link invalid or expired</h1><p><a href="/login">Login</a></p>`,
        ),
      );

    return;
  }

  const user = db.usersByEmail.get(rec.email);

  db.activationTokens.delete(token);

  if (!user) {
    res.status(400).send(page('Activation error', '<h1>User not found</h1>'));

    return;
  }

  user.active = true;
  user.updatedAt = now();
  req.session.userId = user.id;

  res.redirect('/profile');
};

function renderLogin() {
  return page(
    'Login',
    `
    <h1>Login</h1>
    <form method="post" action="/login">
      <div><label>Email<br><input type="email" name="email" required /></label></div>
      <div><label>Password<br><input type="password" name="password" required /></label></div>
      <button>Login</button>
    </form>
    <p><a href="/password/forgot">Forgot your password?</a></p>
    <p>No account? <a href="/register">Register</a></p>
  `,
  );
}

exports.getLogin = (_req, res) => {
  res.send(renderLogin());
};

exports.postLogin = (req, res) => {
  const { email = '', password = '' } = req.body || {};
  const user = db.usersByEmail.get((email || '').toLowerCase());

  const fail = () => {
    res
      .status(400)
      .send(
        page(
          'Login failed',
          '<h1>Invalid credentials</h1><p><a href="/login">Back</a></p>',
        ),
      );
  };

  if (!user) {
    fail();

    return;
  }

  if (!bcrypt.compareSync(password, user.passwordHash)) {
    fail();

    return;
  }

  if (!user.active) {
    res
      .status(403)
      .send(
        page(
          'Activate your email',
          `<h1>Your account is not active</h1><p>Please activate via the link we sent to <strong>${user.email}</strong>.</p>`,
        ),
      );

    return;
  }

  req.session.userId = user.id;
  res.redirect('/profile');
};

exports.getForgot = (_req, res) => {
  res.send(
    page(
      'Reset password',
      `
    <h1>Reset password</h1>
    <form method="post" action="/password/forgot">
      <div><label>Email<br><input type="email" name="email" required /></label></div>
      <button>Send reset link</button>
    </form>
    <p><a href="/login">Back to login</a></p>
  `,
    ),
  );
};

exports.postForgot = (req, res) => {
  const { email = '' } = req.body || {};
  const user = db.usersByEmail.get((email || '').toLowerCase());

  if (user) {
    const token = issueReset(user.email);
    const link = absoluteUrl(req, `/password/reset?token=${token}`);

    sendMail({
      to: user.email,
      subject: 'Reset your password',
      html: `<p>Hi ${user.name},</p><p>Reset password link: <a href="${link}">${link}</a></p>`,
    });
  }

  res.send(
    page(
      'Email sent',
      `
    <h1>Check your email</h1>
    <p>If an account exists for that email, we sent a reset link.</p>
    <p><a href="/login">Back to login</a></p>
  `,
    ),
  );
};

exports.getReset = (req, res) => {
  const { token } = req.query || {};

  res.send(
    page(
      'Choose new password',
      `
    <h1>Choose a new password</h1>
    <form method="post" action="/password/reset">
      <input type="hidden" name="token" value="${token || ''}" />
      <div><label>New password<br><input type="password" name="password" required /></label></div>
      <div><label>Confirmation<br><input type="password" name="confirmation" required /></label></div>
      <p class="hint">${PW_RULES_TEXT}</p>
      <button>Change password</button>
    </form>
  `,
    ),
  );
};

exports.postReset = (req, res) => {
  const { token, password = '', confirmation = '' } = req.body || {};
  const rec = db.resetTokens.get(token);

  if (!rec || rec.exp < Date.now()) {
    res.status(400).send(
      page(
        'Reset error',
        // eslint-disable-next-line max-len
        '<h1>Reset link invalid or expired</h1><p><a href="/password/forgot">Request again</a></p>',
      ),
    );

    return;
  }

  if (password !== confirmation) {
    res.status(400).send(page('Reset error', '<h1>Passwords must match</h1>'));

    return;
  }

  const errs = validatePassword(password);

  if (errs.length) {
    res.status(400).send(page('Reset error', `<h1>${errs.join('<br>')}</h1>`));

    return;
  }

  const user = db.usersByEmail.get(rec.email);

  db.resetTokens.delete(token);

  if (!user) {
    res.status(400).send(page('Reset error', '<h1>User not found</h1>'));

    return;
  }

  user.passwordHash = require('bcrypt').hashSync(password, 10);
  user.updatedAt = now();

  res.send(
    page(
      'Password changed',
      `
    <h1>Password changed successfully</h1>
    <p><a href="/login">Go to login</a></p>
  `,
    ),
  );
};
