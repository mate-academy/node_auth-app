'use strict';

const nodeCrypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const { sendActivationEmail } = require('../services/emailService');

async function register(req, res) {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ where: { email } });

  if (existingUser) {
    res.status(409).json({ message: 'User with this email already exists' });

    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const activationToken = nodeCrypto.randomUUID();

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    activationToken,
  });

  await sendActivationEmail(user.email, activationToken);

  res.status(201).json({
    message:
      'Registration successful. Please check your email to activate ' +
      'your account',
  });
}

async function activate(req, res) {
  const { token } = req.params;

  const user = await User.findOne({ where: { activationToken: token } });

  if (!user) {
    res.status(404).json({ message: 'Activation token is invalid' });

    return;
  }

  user.isActive = true;
  user.activationToken = null;
  await user.save();

  res.json({ message: 'Account activated successfully' });
}

async function login(req, res) {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });

  if (!user) {
    res.status(401).json({ message: 'Invalid email or password' });

    return;
  }

  if (!user.isActive) {
    res.status(403).json({ message: 'Please activate your account first' });

    return;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    res.status(401).json({ message: 'Invalid email or password' });

    return;
  }

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

  res.cookie('token', token, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
  });
}

function logout(req, res) {
  res.clearCookie('token');
  res.sendStatus(204);
}

module.exports = {
  register,
  activate,
  login,
  logout,
};
