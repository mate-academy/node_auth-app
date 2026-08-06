const express = require('express');
const nodeCrypto = require('crypto');
const { getUsers, addUser } = require('../utils/db');
const { renderLayout } = require('../views/layout');

const router = express.Router();

const requireGuest = (req, res, next) => {
  if (req.session.user) {
    return res.redirect('/profile');
  }
  next();
};

const hashPassword = (password) => {
  return nodeCrypto.createHash('sha256').update(password).digest('hex');
};

const validatePassword = (password) => {
  return password && password.length >= 8;
};

// Error clearing helper
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

router.get('/register', requireGuest, (req, res) => {
  const body = `
    <h1>Register</h1>
    <form action="/register" method="POST">
        <label>Name</label>
        <input type="text" name="name" required>
        <label>Email</label>
        <input type="email" name="email" required>
        <label>Password (min 8 characters)</label>
        <input type="password" name="password" required minlength="8">
        <button type="submit">Register</button>
    </form>
  `;

  renderPage(req, res, 'Register', body);
});

router.post('/register', requireGuest, (req, res) => {
  const { name, email, password } = req.body;

  if (!validatePassword(password)) {
    req.session.error = 'Password must be at least 8 characters long.';

    return res.redirect('/register');
  }

  const existingUser = getUsers().find((u) => u.email === email);

  if (existingUser) {
    req.session.error = 'Email already in use.';

    return res.redirect('/register');
  }

  const passwordHash = hashPassword(password);
  const activationToken = nodeCrypto.randomBytes(32).toString('hex');

  const user = {
    id: Date.now().toString(),
    name,
    email,
    passwordHash,
    isActive: false,
    activationToken,
    resetPasswordToken: null,
    changeEmailToken: null,
    newEmailPending: null,
  };

  addUser(user);

  const body = `
    <h1>Activation Email Sent</h1>
    <p>An activation email has been sent to ${email}. Please check your inbox and click the link to activate your account.</p>
    <p><a href="/activate/${activationToken}">[Simulate clicking activation link]</a></p>
  `;

  renderPage(req, res, 'Activation Sent', body);
});

router.get('/activate/:token', requireGuest, (req, res) => {
  const user = getUsers().find((u) => u.activationToken === req.params.token);

  if (!user) {
    const body = `<h1>Activation Error</h1><p>Invalid or expired activation link.</p>`;

    return renderPage(req, res, 'Activation Error', body);
  }

  user.isActive = true;
  user.activationToken = null;

  req.session.user = { id: user.id, name: user.name, email: user.email };
  res.redirect('/profile');
});

router.get('/login', requireGuest, (req, res) => {
  const body = `
    <h1>Login</h1>
    <form action="/login" method="POST">
        <label>Email</label>
        <input type="email" name="email" required>
        <label>Password</label>
        <input type="password" name="password" required>
        <button type="submit">Login</button>
    </form>
    <a href="/forgot-password">Forgot password?</a>
  `;

  renderPage(req, res, 'Login', body);
});

router.post('/login', requireGuest, (req, res) => {
  const { email, password } = req.body;
  const user = getUsers().find((u) => u.email === email);

  if (!user || user.passwordHash !== hashPassword(password)) {
    req.session.error = 'Invalid email or password.';

    return res.redirect('/login');
  }

  if (!user.isActive) {
    req.session.error = 'Please activate your email first. Check your inbox.';

    return res.redirect('/login');
  }

  req.session.user = { id: user.id, name: user.name, email: user.email };
  res.redirect('/profile');
});

router.get('/logout', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  req.session.destroy(() => {
    res.redirect('/login');
  });
});

router.post('/logout', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  req.session.destroy(() => {
    res.redirect('/login');
  });
});

router.get('/forgot-password', requireGuest, (req, res) => {
  const body = `
    <h1>Forgot Password</h1>
    <form action="/forgot-password" method="POST">
        <label>Email</label>
        <input type="email" name="email" required>
        <button type="submit">Reset Password</button>
    </form>
  `;

  renderPage(req, res, 'Forgot Password', body);
});

router.post('/forgot-password', requireGuest, (req, res) => {
  const { email } = req.body;
  const user = getUsers().find((u) => u.email === email);

  let resetToken = '';

  if (user) {
    resetToken = nodeCrypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
  }

  const linkHtml = user
    ? `<p><a href="/reset-password/${resetToken}">[Simulate clicking reset link]</a></p>`
    : '';

  const body = `
    <h1>Email Sent</h1>
    <p>If that email is registered, we have sent a reset link to it. Please check your inbox.</p>
    ${linkHtml}
  `;

  renderPage(req, res, 'Email Sent', body);
});

router.get('/reset-password/:token', requireGuest, (req, res) => {
  const user = getUsers().find(
    (u) => u.resetPasswordToken === req.params.token,
  );

  if (!user) {
    const errorBody = `<h1>Reset Error</h1><p>Invalid or expired reset link.</p>`;

    return renderPage(req, res, 'Reset Error', errorBody);
  }

  const body = `
    <h1>Reset Password</h1>
    <form action="/reset-password/${req.params.token}" method="POST">
        <label>New Password (min 8 characters)</label>
        <input type="password" name="password" required minlength="8">
        <label>Confirm Password</label>
        <input type="password" name="confirmation" required minlength="8">
        <button type="submit">Update Password</button>
    </form>
  `;

  renderPage(req, res, 'Reset Password', body);
});

router.post('/reset-password/:token', requireGuest, (req, res) => {
  const { password, confirmation } = req.body;

  if (password !== confirmation) {
    req.session.error = 'Passwords do not match.';

    return res.redirect(`/reset-password/${req.params.token}`);
  }

  if (!validatePassword(password)) {
    req.session.error = 'Password must be at least 8 characters long.';

    return res.redirect(`/reset-password/${req.params.token}`);
  }

  const user = getUsers().find(
    (u) => u.resetPasswordToken === req.params.token,
  );

  if (!user) {
    const errorBody = `<h1>Reset Error</h1><p>Invalid or expired reset link.</p>`;

    return renderPage(req, res, 'Reset Error', errorBody);
  }

  user.passwordHash = hashPassword(password);
  user.resetPasswordToken = null;

  const body = `
    <h1>Password Reset Successfully</h1>
    <p>Your password has been changed.</p>
    <a href="/login">Go to Login</a>
  `;

  renderPage(req, res, 'Reset Success', body);
});

module.exports = router;
