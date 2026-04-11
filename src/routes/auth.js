'use strict';

const express = require('express');
const { User } = require('../models/User');
const { generateToken } = require('../services/token');
const { sendActivationEmail } = require('../services/email');
const { guest } = require('../middleware/guest');
const { authenticate } = require('../middleware/authenticate');

const router = express.Router();

const PASSWORD_RULES = [
  'At least 8 characters long',
  'Contains at least one uppercase letter',
  'Contains at least one lowercase letter',
  'Contains at least one number',
  'Contains at least one special character (!@#$%^&*)',
];

function validatePassword(password) {
  if (!password) {
    return ['Password is required'];
  }

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

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*]/.test(password)) {
    errors.push(
      'Password must contain at least one special character (!@#$%^&*)',
    );
  }

  return errors;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

router.get('/register', guest, (req, res) => {
  res.render('auth/register', {
    title: 'Register',
    errors: [],
    old: {},
    passwordRules: PASSWORD_RULES,
  });
});

router.post('/register', guest, async (req, res) => {
  const { name, email, password, confirmation } = req.body;
  const errors = [];

  if (!name || !name.trim()) {
    errors.push('Name is required');
  }

  if (!email || !isValidEmail(email)) {
    errors.push('Valid email is required');
  }

  if (!password) {
    errors.push('Password is required');
  }

  if (password && confirmation && password !== confirmation) {
    errors.push('Passwords do not match');
  }

  if (password) {
    errors.push(...validatePassword(password));
  }

  if (errors.length === 0) {
    const existingUser = User.findByEmail(email);

    if (existingUser) {
      errors.push('Email is already registered');
    }
  }

  if (errors.length > 0) {
    return res.render('auth/register', {
      title: 'Register',
      errors,
      old: { name, email },
      passwordRules: PASSWORD_RULES,
    });
  }

  const { user, activationToken } = User.create({
    name: name.trim(),
    email,
    password,
  });

  try {
    await sendActivationEmail(user.email, activationToken);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to send activation email:', err.message);
  }

  res.render('auth/register-success', {
    title: 'Registration Successful',
    email: user.email,
  });
});

router.get('/login', guest, (req, res) => {
  res.render('auth/login', {
    title: 'Login',
    errors: [],
    old: {},
  });
});

router.post('/login', guest, (req, res) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !isValidEmail(email)) {
    errors.push('Valid email is required');
  }

  if (!password) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.render('auth/login', {
      title: 'Login',
      errors,
      old: { email },
    });
  }

  const user = User.findByEmail(email);

  if (!user || !User.verifyPassword(user, password)) {
    return res.render('auth/login', {
      title: 'Login',
      errors: ['Invalid email or password'],
      old: { email },
    });
  }

  if (!user.isActive) {
    return res.render('auth/login', {
      title: 'Login',
      errors: [
        'Please activate your account. ' +
          'Check your email for the activation link.',
      ],
      old: { email },
    });
  }

  const token = generateToken(user.id);

  res.cookie('token', token, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.redirect('/profile');
});

router.post('/logout', authenticate, (req, res) => {
  res.clearCookie('token');
  res.redirect('/auth/login');
});

router.get('/activate/:token', guest, (req, res) => {
  const { token } = req.params;
  const user = User.activate(token);

  if (!user) {
    return res.render('auth/activate', {
      title: 'Activation Failed',
      success: false,
    });
  }

  const jwtToken = generateToken(user.id);

  res.cookie('token', jwtToken, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.redirect('/profile');
});

module.exports = { router, validatePassword, PASSWORD_RULES };
