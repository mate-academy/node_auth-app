'use strict';

const express = require('express');
const { User } = require('../models/User');
const { sendPasswordResetEmail } = require('../services/email');
const { guest } = require('../middleware/guest');
const { validatePassword } = require('./auth');

const router = express.Router();

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

router.get('/reset', guest, (req, res) => {
  res.render('password/reset-request', {
    title: 'Reset Password',
    errors: [],
    old: {},
  });
});

router.post('/reset', guest, async (req, res) => {
  const { email } = req.body;
  const errors = [];

  if (!email || !isValidEmail(email)) {
    errors.push('Valid email is required');
  }

  if (errors.length > 0) {
    return res.render('password/reset-request', {
      title: 'Reset Password',
      errors,
      old: { email },
    });
  }

  const token = User.createResetToken(email);

  if (token) {
    try {
      await sendPasswordResetEmail(email, token);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to send reset email:', err.message);
    }
  }

  res.render('password/reset-sent', {
    title: 'Email Sent',
    email,
  });
});

router.get('/reset/:token', guest, (req, res) => {
  const { token } = req.params;

  res.render('password/reset-confirm', {
    title: 'Reset Password',
    token,
    errors: [],
  });
});

router.post('/reset/:token', guest, (req, res) => {
  const { password, confirmation } = req.body;
  const { token } = req.params;
  const errors = [];

  if (!password) {
    errors.push('Password is required');
  }

  if (password && confirmation && password !== confirmation) {
    errors.push('Passwords do not match');
  }

  if (password) {
    errors.push(...validatePassword(password));
  }

  if (errors.length > 0) {
    return res.render('password/reset-confirm', {
      title: 'Reset Password',
      token,
      errors,
    });
  }

  const user = User.resetPassword(token, password);

  if (!user) {
    return res.render('password/reset-confirm', {
      title: 'Reset Password',
      token,
      errors: ['Invalid or expired reset token'],
    });
  }

  res.render('password/reset-success', {
    title: 'Password Reset Successful',
  });
});

module.exports = { router };
