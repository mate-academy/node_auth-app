'use strict';

const { randomUUID } = require('crypto');
const bcrypt = require('bcrypt');
const userService = require('../services/user.service');
const mailer = require('../utils/mailer');
const jwt = require('../utils/jwt');
const tokenService = require('../services/token.service');

async function register(req, res) {
  const { name, email, password } = req.body;

  const errors = {
    email: userService.validateEmail(email),
    password: userService.validatePassword(password),
  };

  if (errors.email || errors.password) {
    res.status(400).json({ errors, message: 'Validation error' });

    return;
  }

  const existingUser = await userService.findByEmail(email);

  if (existingUser) {
    res.status(400).json({
      errors: { email: 'Email is already taken' },
      message: 'Validation error',
    });

    return;
  }

  const activationToken = randomUUID();
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await userService.create(
    name,
    email,
    hashedPassword,
    activationToken,
  );

  await mailer.sendActivationLink(email, activationToken);

  res.json({ user: userService.normalize(user) });
}

async function activation(req, res) {
  const { email, token } = req.params;

  const user = await userService.findByEmail(email);

  if (!user || user.activationToken !== token) {
    res.sendStatus(404);

    return;
  }

  user.activationToken = null;
  await user.save();

  await sendAuthentication(res, user);
}

async function sendAuthentication(res, user) {
  const normalizedUser = userService.normalize(user);
  const accessToken = jwt.generateAccessToken(normalizedUser);
  const refreshToken = jwt.generateRefreshToken(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  });
  res.json({ user: normalizedUser, accessToken });
}

async function login(req, res) {
  const { email, password } = req.body;
  const user = await userService.findByEmail(email);
  const isPasswordValid = await bcrypt.compare(password, user?.password || '');

  if (!user || !isPasswordValid) {
    res.status(401).json({ message: 'Invalid credentials' });

    return;
  }

  if (user.activationToken !== null) {
    res.status(403).json({ message: 'Please activate your email' });

    return;
  }

  await sendAuthentication(res, user);
}

async function refresh(req, res) {
  const refreshToken = req.cookies.refreshToken || '';
  const userData = jwt.validateRefreshToken(refreshToken);

  if (!userData) {
    res.status(401).json({ message: 'Invalid token' });

    return;
  }

  const token = await tokenService.findByToken(refreshToken);

  if (!token) {
    res.status(401).json({ message: 'Invalid Token' });

    return;
  }

  const user = await userService.findByEmail(userData.email);

  if (!user) {
    res.status(401).json({ message: 'Invalid token' });

    return;
  }

  await sendAuthentication(res, user);
}

async function logout(req, res) {
  const refreshToken = req.cookies.refreshToken || '';
  const userData = jwt.validateRefreshToken(refreshToken);

  if (userData) {
    await tokenService.remove(userData.id);
  }

  res.clearCookie('refreshToken');
  res.sendStatus(204);
}

module.exports = {
  authController: {
    register,
    activation,
    login,
    refresh,
    logout,
  },
};
