'use strict';

const express = require('express');
const { User } = require('../models/User');
const { authenticate } = require('../middleware/authenticate');
const {
  sendEmailChangeNotification,
  sendNewEmailConfirmation,
} = require('../services/email');
const { validatePassword } = require('./auth');

const router = express.Router();

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

router.get('/', authenticate, (req, res) => {
  const user = User.findById(req.userId);

  if (!user) {
    res.clearCookie('token');

    return res.redirect('/auth/login');
  }

  res.render('profile/index', {
    title: 'Profile',
    user: user.toJSON(),
    errors: [],
    success: null,
    activeTab: 'profile',
  });
});

router.post('/name', authenticate, (req, res) => {
  const { name } = req.body;
  const user = User.findById(req.userId);
  const errors = [];

  if (!user) {
    res.clearCookie('token');

    return res.redirect('/auth/login');
  }

  if (!name || !name.trim()) {
    errors.push('Name is required');
  }

  if (errors.length > 0) {
    return res.render('profile/index', {
      title: 'Profile',
      user: user.toJSON(),
      errors,
      success: null,
      activeTab: 'name',
    });
  }

  User.updateName(req.userId, name.trim());

  const updatedUser = User.findById(req.userId);

  res.render('profile/index', {
    title: 'Profile',
    user: updatedUser.toJSON(),
    errors: [],
    success: 'Name updated successfully',
    activeTab: 'name',
  });
});

router.post('/password', authenticate, (req, res) => {
  const { oldPassword, newPassword, confirmation } = req.body;
  const user = User.findById(req.userId);
  const errors = [];

  if (!user) {
    res.clearCookie('token');

    return res.redirect('/auth/login');
  }

  if (!oldPassword) {
    errors.push('Current password is required');
  }

  if (!newPassword) {
    errors.push('New password is required');
  }

  if (newPassword && confirmation && newPassword !== confirmation) {
    errors.push('Passwords do not match');
  }

  if (newPassword) {
    errors.push(...validatePassword(newPassword));
  }

  if (errors.length > 0) {
    return res.render('profile/index', {
      title: 'Profile',
      user: user.toJSON(),
      errors,
      success: null,
      activeTab: 'password',
    });
  }

  const updated = User.updatePassword(req.userId, oldPassword, newPassword);

  if (!updated) {
    return res.render('profile/index', {
      title: 'Profile',
      user: user.toJSON(),
      errors: ['Current password is incorrect'],
      success: null,
      activeTab: 'password',
    });
  }

  const updatedUser = User.findById(req.userId);

  res.render('profile/index', {
    title: 'Profile',
    user: updatedUser.toJSON(),
    errors: [],
    success: 'Password updated successfully',
    activeTab: 'password',
  });
});

router.post('/email', authenticate, async (req, res) => {
  const { password, newEmail } = req.body;
  const user = User.findById(req.userId);
  const errors = [];

  if (!user) {
    res.clearCookie('token');

    return res.redirect('/auth/login');
  }

  if (!password) {
    errors.push('Password is required');
  }

  if (!newEmail || !isValidEmail(newEmail)) {
    errors.push('Valid email is required');
  }

  if (errors.length > 0) {
    return res.render('profile/index', {
      title: 'Profile',
      user: user.toJSON(),
      errors,
      success: null,
      activeTab: 'email',
    });
  }

  const result = User.updateEmail(req.userId, password, newEmail);

  if (!result) {
    return res.render('profile/index', {
      title: 'Profile',
      user: user.toJSON(),
      errors: ['Password is incorrect'],
      success: null,
      activeTab: 'email',
    });
  }

  try {
    await sendEmailChangeNotification(result.oldEmail, result.user.email);
    await sendNewEmailConfirmation(result.user.email);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to send email notifications:', err.message);
  }

  res.render('profile/index', {
    title: 'Profile',
    user: result.user.toJSON(),
    errors: [],
    success: 'Email updated successfully',
    activeTab: 'email',
  });
});

module.exports = { router };
