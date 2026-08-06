const express = require('express');
const nodeCrypto = require('crypto');
const { getUsers } = require('../utils/db');
const { renderLayout } = require('../views/layout');

const router = express.Router();

const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
};

const hashPassword = (password) => {
  return nodeCrypto.createHash('sha256').update(password).digest('hex');
};

const renderPage = (req, res, title, body) => {
  const html = renderLayout(
    title,
    body,
    req.session.user,
    req.session.error,
    req.session.message,
  );

  delete req.session.error;
  delete req.session.message;
  res.send(html);
};

router.use(requireAuth);

router.get('/', (req, res) => {
  const user = getUsers().find((u) => u.id === req.session.user.id);

  const body = `
    <h1>Profile</h1>
    <p>Hello, ${user.name} (${user.email})</p>

    <h3>Change Name</h3>
    <form action="/profile/name" method="POST">
        <label>New Name</label>
        <input type="text" name="name" value="${user.name}" required>
        <button type="submit">Update Name</button>
    </form>

    <h3>Change Password</h3>
    <form action="/profile/password" method="POST">
        <label>Old Password</label>
        <input type="password" name="oldPassword" required>
        <label>New Password</label>
        <input type="password" name="newPassword" required minlength="8">
        <label>Confirm New Password</label>
        <input type="password" name="confirmation" required minlength="8">
        <button type="submit">Update Password</button>
    </form>

    <h3>Change Email</h3>
    <form action="/profile/email" method="POST">
        <label>Password</label>
        <input type="password" name="password" required>
        <label>New Email</label>
        <input type="email" name="newEmail" required>
        <button type="submit">Update Email</button>
    </form>
  `;

  renderPage(req, res, 'Profile', body);
});

router.post('/name', (req, res) => {
  const { name } = req.body;

  if (!name || name.trim() === '') {
    req.session.error = 'Name cannot be empty.';

    return res.redirect('/profile');
  }

  const user = getUsers().find((u) => u.id === req.session.user.id);

  user.name = name;
  req.session.user.name = name;
  req.session.message = 'Name updated successfully.';
  res.redirect('/profile');
});

router.post('/password', (req, res) => {
  const { oldPassword, newPassword, confirmation } = req.body;

  if (newPassword !== confirmation) {
    req.session.error = 'New passwords do not match.';

    return res.redirect('/profile');
  }

  if (!newPassword || newPassword.length < 8) {
    req.session.error = 'New password must be at least 8 characters.';

    return res.redirect('/profile');
  }

  const user = getUsers().find((u) => u.id === req.session.user.id);

  if (user.passwordHash !== hashPassword(oldPassword)) {
    req.session.error = 'Incorrect old password.';

    return res.redirect('/profile');
  }

  user.passwordHash = hashPassword(newPassword);

  req.session.message = 'Password updated successfully.';
  res.redirect('/profile');
});

router.post('/email', (req, res) => {
  const { password, newEmail } = req.body;

  const user = getUsers().find((u) => u.id === req.session.user.id);

  if (user.passwordHash !== hashPassword(password)) {
    req.session.error = 'Incorrect password.';

    return res.redirect('/profile');
  }

  if (!newEmail || newEmail === user.email) {
    req.session.error = 'Invalid or same email.';

    return res.redirect('/profile');
  }

  const existingUser = getUsers().find((u) => u.email === newEmail);

  if (existingUser) {
    req.session.error = 'Email already in use.';

    return res.redirect('/profile');
  }

  const changeEmailToken = nodeCrypto.randomBytes(32).toString('hex');

  user.changeEmailToken = changeEmailToken;
  user.newEmailPending = newEmail;

  req.session.message = `Notice sent to ${user.email}. Confirmation email sent to the new address. <a href="/profile/confirm-email/${changeEmailToken}">[Simulate click]</a>`;
  res.redirect('/profile');
});

router.get('/confirm-email/:token', (req, res) => {
  const user = getUsers().find((u) => u.id === req.session.user.id);

  if (!user || user.changeEmailToken !== req.params.token) {
    req.session.error = 'Invalid or expired token.';

    return res.redirect('/profile');
  }

  const oldEmail = user.email;

  user.email = user.newEmailPending;
  user.changeEmailToken = null;
  user.newEmailPending = null;

  // Simulated notification to the old email
  // eslint-disable-next-line no-console
  console.log(
    `Email changed from ${oldEmail} to ${user.email}; notification sent to ${oldEmail}`,
  );

  req.session.user.email = user.email;
  req.session.message = 'Email successfully changed.';
  res.redirect('/profile');
});

module.exports = router;
