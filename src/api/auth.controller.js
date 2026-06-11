'use strict';

const { randomBytes } = require('crypto');
const bcrypt = require('bcrypt');
const { usersRepository } = require('../entity/users.repository.js');
const { mailer } = require('../utils/mailer.js');
const { userService } = require('../services/user.service.js');
const { jwt } = require('../utils/jwt.js');
const { tokensRepository } = require('../entity/tokens.repository.js');

const SALT_ROUNDS = 10;

async function sendAuthentication(res, user) {
  const userData = userService.normalize(user);
  const accessToken = jwt.generateAccessToken(userData);
  const refreshToken = jwt.generateRefreshToken(userData);

  await tokensRepository.deleteByUserId(user.id).catch(() => {});
  await tokensRepository.create(user.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  });

  res.json({ accessToken, user: userData });
}

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const errors = {
    name: userService.validateName(name),
    email: userService.validateEmail(email),
    password: userService.validatePassword(password),
  };

  if (Object.values(errors).some(Boolean)) {
    res.status(400).json({ errors, message: 'Validation error' });

    return;
  }

  const [existingUser, hashedPassword] = await Promise.all([
    usersRepository.getByEmail(email),
    bcrypt.hash(password, SALT_ROUNDS),
  ]);

  if (existingUser) {
    res.status(400).json({
      errors: { email: 'Email is already taken' },
      message: 'Validation error',
    });

    return;
  }

  const activationToken = randomBytes(32).toString('hex');

  const user = await usersRepository.create({
    email,
    password: hashedPassword,
    activationToken,
    name,
  });

  await mailer.sendActivationLink(email, activationToken);

  res.json({ user: userService.normalize(user) });
};

const activate = async (req, res) => {
  const { email, token } = req.params;

  const user = await usersRepository.getByEmail(email);

  if (!user || user.activationToken !== token) {
    res.sendStatus(404);

    return;
  }

  const activatedUser = await usersRepository.activate(email);

  sendAuthentication(res, activatedUser);
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await usersRepository.getByEmail(email);
  const isPasswordValid = await bcrypt.compare(password, user?.password || '');

  if (!user || !isPasswordValid) {
    res.status(401).json({ message: 'Invalid credentials' });

    return;
  }

  if (user.activationToken !== null) {
    res.status(401).json({ message: 'Please activate your email first' });

    return;
  }

  sendAuthentication(res, user);
};

const refresh = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || '';
  const userData = jwt.validateRefreshToken(refreshToken);
  const user = await usersRepository.getByEmail(userData?.email || '');
  const token = await tokensRepository.getByToken(refreshToken);

  if (!user || !userData || !token || token.userId !== user.id) {
    res.clearCookie('refreshToken', { sameSite: 'none', secure: true });
    res.status(401).json({ message: 'Invalid token' });

    return;
  }

  sendAuthentication(res, user);
};

const logout = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || '';
  const userData = jwt.validateRefreshToken(refreshToken);

  if (userData) {
    await tokensRepository.deleteByUserId(userData.id);
  }

  res.clearCookie('refreshToken', {
    sameSite: 'none',
    secure: true,
  });

  res.sendStatus(204);
};

const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  const user = await usersRepository.getByEmail(email);

  if (!user) {
    res.sendStatus(204);

    return;
  }

  const resetToken = randomBytes(32).toString('hex');
  const resetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await Promise.all([
    usersRepository.setResetToken(email, resetToken, resetTokenExpiresAt),
    mailer.sendPasswordResetLink(email, resetToken),
  ]);

  res.sendStatus(204);
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password, confirmation } = req.body;

  if (password !== confirmation) {
    res.status(400).json({ message: 'Passwords do not match' });

    return;
  }

  const passwordError = userService.validatePassword(password);

  if (passwordError) {
    res.status(400).json({ message: passwordError });

    return;
  }

  const user = await usersRepository.getByResetToken(token);

  if (!user || user.resetTokenExpiresAt < new Date()) {
    res.status(400).json({ message: 'Token is invalid or expired' });

    return;
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  await usersRepository.updatePassword(user.email, hashedPassword);
  await tokensRepository.deleteByUserId(user.id);

  res.sendStatus(204);
};

const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
  requestPasswordReset,
  resetPassword,
  confirmEmail: activate,
};

module.exports = { authController };
