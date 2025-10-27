'use strict';

const bcrypt = require('bcrypt');

const { PW_RULES_TEXT, validatePassword } = require('../utils/password');
const { sendMail } = require('../utils/mailer');
const { db, now } = require('../models/db');
const { page } = require('../app');

exports.getProfile = (req, res) => {
  const u = req.user;

  res.send(
    page(
      'Your Profile',
      `
    <h1>Profile</h1>
    <p><strong>Email:</strong> ${u.email}</p>
    <p><strong>Name:</strong> ${u.name}</p>

    <h2>Change name</h2>
    <form method="post" action="/profile/name?_method=PATCH">
      <div><label>New name<br><input name="name" required value="${u.name}" /></label></div>
      <button>Save</button>
    </form>

    <h2>Change password</h2>
    <form method="post" action="/profile/password?_method=PATCH">
      <div><label>Old password<br><input type="password" name="oldPassword" required /></label></div>
      <div><label>New password<br><input type="password" name="newPassword" required /></label></div>
      <div><label>Confirmation<br><input type="password" name="confirmation" required /></label></div>
      <p class="hint">${PW_RULES_TEXT}</p>
      <button>Change password</button>
    </form>

    <h2>Change email</h2>
    <form method="post" action="/profile/email?_method=PATCH">
      <div><label>Password<br><input type="password" name="password" required /></label></div>
      <div><label>New email<br><input type="email" name="newEmail" required /></label></div>
      <div><label>Confirm new email<br><input type="email" name="confirmation" required /></label></div>
      <button>Change email</button>
    </form>

    <form method="post" action="/logout" style="margin-top:24px"><button>Logout</button></form>
  `,
    ),
  );
};

exports.patchName = (req, res) => {
  const { name = '' } = req.body || {};

  if (!name.trim()) {
    res.status(400).send(page('Profile - error', '<h1>Name is required</h1>'));

    return;
  }

  req.user.name = name.trim();
  req.user.updatedAt = now();

  res.redirect('/profile');
};

exports.patchPassword = (req, res) => {
  const {
    oldPassword = '',
    newPassword = '',
    confirmation = '',
  } = req.body || {};

  if (!bcrypt.compareSync(oldPassword, req.user.passwordHash)) {
    res
      .status(400)
      .send(page('Profile - error', '<h1>Old password is incorrect</h1>'));

    return;
  }

  if (newPassword !== confirmation) {
    res
      .status(400)
      .send(page('Profile - error', '<h1>Passwords must match</h1>'));

    return;
  }

  const errs = validatePassword(newPassword);

  if (errs.length) {
    res
      .status(400)
      .send(page('Profile - error', `<h1>${errs.join('<br>')}</h1>`));

    return;
  }

  req.user.passwordHash = bcrypt.hashSync(newPassword, 10);
  req.user.updatedAt = now();

  res.redirect('/profile');
};

exports.patchEmail = (req, res) => {
  const { password = '', newEmail = '', confirmation = '' } = req.body || {};

  if (!bcrypt.compareSync(password, req.user.passwordHash)) {
    res
      .status(400)
      .send(page('Profile - error', '<h1>Password is incorrect</h1>'));

    return;
  }

  if (
    !newEmail ||
    newEmail.toLowerCase() !== (confirmation || '').toLowerCase()
  ) {
    res.status(400).send(page('Profile - error', '<h1>Emails must match</h1>'));

    return;
  }

  if (db.usersByEmail.has(newEmail.toLowerCase())) {
    res
      .status(400)
      .send(page('Profile - error', '<h1>Email already in use</h1>'));

    return;
  }

  const oldEmail = req.user.email;

  db.usersByEmail.delete(oldEmail.toLowerCase());

  req.user.email = newEmail.trim();
  req.user.updatedAt = now();

  db.usersByEmail.set(req.user.email.toLowerCase(), req.user);

  sendMail({
    to: oldEmail,
    subject: 'Email changed on your account',
    html: `<p>Your account email was changed to <strong>${req.user.email}</strong> at ${now()}.</p>`,
  });

  res.redirect('/profile');
};

exports.postLogout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
};
