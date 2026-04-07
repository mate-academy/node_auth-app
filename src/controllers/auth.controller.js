const bcrypt = require('bcrypt');
const nodeCrypto = require('crypto');

const { User } = require('../models/user');
const { userService } = require('../services/user.service');
const { jwtService } = require('../services/jwt.service');
const { ApiError } = require('../exeptions/api.error');
const { tokenService } = require('../services/token.service');
const { emailService } = require('../services/email.service');

const validateName = (value) => {
  if (!value.trim()) {
    return 'Name is required';
  }

  if (value.length < 4) {
    return 'At least 4 characters';
  }
};

const validateEmail = (value) => {
  if (!value) {
    return 'Email is required';
  }

  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!emailPattern.test(value)) {
    return 'Email is not valid';
  }
};

const validatePassword = (value) => {
  if (!value) {
    return 'Password is required';
  }

  if (value.length < 6) {
    return 'At least 6 characters';
  }
};

const registration = async (req, res) => {
  const { name, email, password } = req.body;

  const errors = {
    name: validateName(name),
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.name || errors.email || errors.password) {
    throw ApiError.badRequest('Bad request', errors);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await userService.register(name, email, hashedPassword);

  res.send({ message: 'OK' });
};

const activate = async (req, res) => {
  const { activationToken } = req.params;
  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    res.status(404);

    return;
  }

  user.activationToken = null;
  await user.save();

  res.send(user);
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  if (user.activationToken) {
    throw ApiError.badRequest('Please activate your email');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  await generateTokens(res, user);
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('User with this email does not exist');
  }

  const resetToken = nodeCrypto.randomBytes(32).toString('hex');

  await userService.updateResetToken(user.id, resetToken);

  await emailService.sendResetPasswordMail(email, resetToken);

  res.send({ message: 'Reset link sent to your email' });
};

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  const user = await userService.findByResetToken(token);

  if (!user) {
    throw ApiError.badRequest('Invalid or expired reset token');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await userService.updatePassword(user.id, hashedPassword);

  res.send({ message: 'Password has been reset' });
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  const userData = jwtService.verifyRefresh(refreshToken);

  const token = await tokenService.getByToken(refreshToken);

  if (!userData || !token) {
    throw ApiError.unauthorized();
  }

  const user = await userService.findByEmail(userData.email);

  await generateTokens(res, user);
};

const generateTokens = async (res, user) => {
  const normalizedUser = userService.normalize(user);
  const accessToken = jwtService.sing(normalizedUser);
  const refreshAccessToken = jwtService.singRefresh(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshAccessToken);

  res.cookie('refreshToken', refreshAccessToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  });

  res.send({
    user: normalizedUser,
    accessToken,
  });
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;

  const userData = jwtService.verifyRefresh(refreshToken);

  if (!userData) {
    throw ApiError.unauthorized();
  }

  const user = await userService.findByEmail(userData.email);

  await tokenService.remove(user.id);

  res.sendStatus(204);
};

module.exports = {
  registration,
  activate,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
};
