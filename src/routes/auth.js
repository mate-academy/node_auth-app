/* eslint-disable no-console */
'use strict';

const express = require('express');
const bcrypt = require('bcryptjs');
const cryptoModule = require('crypto');
const User = require('../models/User');
const {
  sendActivationEmail,
  sendPasswordResetEmail,
  sendEmailChangeNotification,
} = require('../utils/email');
const { requireAuth, requireNoAuth } = require('../middleware/auth');

const router = express.Router();

// Regras de senha
function validatePassword(password) {
  const errors = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return errors;
}

// GET /register
router.get('/register', requireNoAuth, (req, res) => {
  res.render('register', { errors: [] });
});

// POST /register
router.post('/register', requireNoAuth, async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  const errors = [];

  if (!name || !email || !password || !confirmPassword) {
    errors.push('All fields are required');
  }

  if (password !== confirmPassword) {
    errors.push('Passwords do not match');
  }

  const passwordErrors = validatePassword(password);

  errors.push(...passwordErrors);

  if (errors.length > 0) {
    return res.render('register', { errors });
  }

  try {
    const existingUser = await User.findByEmail(email);

    if (existingUser) {
      errors.push('Email already registered');

      return res.render('register', { errors });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const activationToken = cryptoModule.randomBytes(32).toString('hex');

    await User.create({
      name,
      email,
      passwordHash,
      activationToken,
    });
    sendActivationEmail(email, activationToken);

    res.render('register-success');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// GET /activate/:token
router.get('/activate/:token', requireNoAuth, async (req, res) => {
  const { token } = req.params;

  try {
    const user = await User.findByActivationToken(token);

    if (!user) {
      return res.render('activate', { error: 'Invalid activation token' });
    }

    await User.update(user.id, { is_active: 1, activation_token: null });
    req.session.userId = user.id;
    res.redirect('/profile');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// GET /login
router.get('/login', requireNoAuth, (req, res) => {
  res.render('login', { error: null });
});

// POST /login
router.post('/login', requireNoAuth, async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findByEmail(email);

    if (!user) {
      return res.render('login', { error: 'Invalid credentials' });
    }

    if (!user.is_active) {
      return res.render('login', {
        error: 'Please activate your account first',
      });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return res.render('login', { error: 'Invalid credentials' });
    }

    req.session.userId = user.id;
    res.redirect('/profile');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// POST /logout
router.post('/logout', requireAuth, (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

// GET /forgot-password
router.get('/forgot-password', requireNoAuth, (req, res) => {
  res.render('forgot-password', { message: null });
});

// POST /forgot-password
router.post('/forgot-password', requireNoAuth, async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findByEmail(email);

    if (user) {
      const resetToken = cryptoModule.randomBytes(32).toString('hex');
      const resetExpires = new Date(Date.now() + 3600000)
        .toISOString()
        .replace('T', ' ')
        .slice(0, 19);
      // 1 hour

      await User.update(user.id, {
        reset_token: resetToken,
        reset_expires: resetExpires,
      });
      sendPasswordResetEmail(email, resetToken);
    }

    res.render('forgot-password', {
      message:
        'If an account with that email exists, a reset link has been sent.',
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// GET /reset/:token
router.get('/reset/:token', requireNoAuth, async (req, res) => {
  const { token } = req.params;

  try {
    const user = await User.findByResetToken(token);

    if (!user) {
      return res.render('reset', {
        error: 'Invalid or expired reset token',
        token: null,
      });
    }
    res.render('reset', { error: null, token });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// POST /reset/:token
router.post('/reset/:token', requireNoAuth, async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  try {
    const user = await User.findByResetToken(token);

    if (!user) {
      return res.render('reset', {
        error: 'Invalid or expired reset token',
        token,
      });
    }

    if (password !== confirmPassword) {
      return res.render('reset', { error: 'Passwords do not match', token });
    }

    const passwordErrors = validatePassword(password);

    if (passwordErrors.length > 0) {
      return res.render('reset', { error: passwordErrors.join(', '), token });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await User.update(user.id, {
      password_hash: passwordHash,
      reset_token: null,
      reset_expires: null,
    });
    res.render('reset-success');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// GET /profile
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);

    res.render('profile', { user, errors: [] });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// POST /profile/name
router.post('/profile/name', requireAuth, async (req, res) => {
  const { name } = req.body;

  try {
    await User.update(req.session.userId, { name });
    res.redirect('/profile');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// POST /profile/password
router.post('/profile/password', requireAuth, async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  const errors = [];

  try {
    const user = await User.findById(req.session.userId);
    const isValid = await bcrypt.compare(oldPassword, user.password_hash);

    if (!isValid) {
      errors.push('Old password is incorrect');
    }

    if (newPassword !== confirmPassword) {
      errors.push('New passwords do not match');
    }

    const passwordErrors = validatePassword(newPassword);

    errors.push(...passwordErrors);

    if (errors.length > 0) {
      return res.render('profile', { user, errors });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await User.update(user.id, { password_hash: passwordHash });
    res.redirect('/profile');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// POST /profile/email
router.post('/profile/email', requireAuth, async (req, res) => {
  const { password, newEmail, confirmEmail } = req.body;
  const errors = [];

  try {
    const user = await User.findById(req.session.userId);
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      errors.push('Password is incorrect');
    }

    if (newEmail !== confirmEmail) {
      errors.push('Emails do not match');
    }

    const existingUser = await User.findByEmail(newEmail);

    if (existingUser) {
      errors.push('Email already in use');
    }

    if (errors.length > 0) {
      return res.render('profile', { user, errors });
    }

    await User.update(user.id, { email: newEmail });
    sendEmailChangeNotification(user.email, newEmail);
    res.redirect('/profile');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
