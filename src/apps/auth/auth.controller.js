const bcrypt = require('bcrypt');

const { sendActivationLink } = require('../../config/mailer');
const { validateRefreshToken } = require('../../config/jwt');

const User = require('../../models/user.model');
const Token = require('../../models/token.model');

const { validateEmail, validatePassword, normalizeUser } = require('../users/user.service');

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const errors = {
    email: [...validateEmail(email)],
    password: [...validatePassword(password)],
  };

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    errors.email.push('Email already in use');
  }

  if (Object.values(errors).flat().some(error => error)) {
    return res.status(400).json({
      errors,
      message: 'Validation error',
    });
  }

  const activationToken = bcrypt.genSaltSync(10);
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    activationToken,
  });

  await sendActivationLink(email, activationToken);

  res.status(201).json({ user: normalizeUser(user) });
};

const activate = async (req, res) => {
  const { email, activationToken } = req.params;

  const user = await User.findOne({ where: { email } });

  if (!user) {
    return res.status(400).json({ message: 'User not found' });
  }

  if (activationToken === null) {
    return res.status(400).json({ message: 'User is already activated' });
  }

  if (activationToken !== user.activationToken) {
    return res.status(400).json({ message: 'Invalid activation token' });
  }

  user.activationToken = null;
  await user.save();

  res.status(200).json({ user: normalizeUser(user) });
};

const refresh = async (req, res) => {
  const { refreshToken = '' } = req.cookies;

  const userData = validateRefreshToken(refreshToken);
  const user = await User.findOne({ where: { email: userData.email } });
  const token = await Token.findOne({ where: { token: refreshToken } });

  if (!user || !userData || !token || token.userId !== user.id) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  await sendAuthentication(user, res);
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });
  const isPasswordValid = await bcrypt.compare(password, user?.password || '');

  if (!user || !isPasswordValid) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  await sendAuthentication(user, res);
};

const logout = async (req, res) => {
  const { refreshToken = '' } = req.cookies;

  const userData = validateRefreshToken(refreshToken);

  if (userData) {
    await Token.destroy({ where: { userId: userData.id } });
  }

  res.clearCookie('refreshToken');
  res.sendStatus(204);
};

const passwordReset = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res.status(400).json({ message: 'User not found' });
  }

  const passwordResetToken = bcrypt.genSaltSync(10);
  await sendPasswordResetLink(email, passwordResetToken);

  user.passwordResetToken = passwordResetToken;
  await user.save();

  res.sendStatus(204);
};

const sendAuthentication = async (user, res) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Remove all existing tokens for the user
  await Token.destroy({ where: { userId: user.id } });

  // Create a new token for the user
  await Token.create({ userId: user.id, token: refreshToken });

  res.cookie('refreshToken', refreshToken, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  });

  res.status(200).json({ user, accessToken });
};

module.exports = { register, login };
