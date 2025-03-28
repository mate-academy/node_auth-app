const User = require('../models/user.js');
const userService = require('../services/userService.js');
const tokenService = require('../services/tokenService.js');
const emailService = require('../services/emailService.js');
const jwtService = require('../services/jwtService.js');
const ApiError = require('../exeptions/apiError.js');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

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

const generateTokens = async (res, user) => {
  const normalizedUser = userService.normalize(user);
  const accessToken = jwtService.sign(normalizedUser);
  const refreshToken = jwtService.signRefresh(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    HttpOnly: true,
  });

  res.send({
    user: normalizedUser,
    accessToken,
  });
};

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.email || errors.password) {
    throw ApiError.badRequest('Bad request', errors);
  }

  const hashedPass = await bcrypt.hash(password, 10);

  await userService.register(name, email, hashedPass);

  res.send({ message: 'OK' });
};

const activate = async (req, res) => {
  const { activationToken } = req.params;

  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    res.sendStatus(404);
  }

  user.activationToken = null;
  user.save();

  res.send(user);
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  generateTokens(res, user);
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  const userData = await jwtService.verifyRefresh(refreshToken);
  const token = await tokenService.getByToken(refreshToken);

  if (!userData || !token) {
    throw ApiError.unauthorized();
  }

  const user = await userService.findByEmail(userData.email);

  generateTokens(res, user);
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;
  const userData = await jwtService.verifyRefresh(refreshToken);

  if (!userData || !refreshToken) {
    throw ApiError.unauthorized();
  }

  await tokenService.remove(userData.id);
  res.sendStatus(204);
};

const sendResetPassword = async (req, res) => {
  const { email } = req.body;
  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  const resetToken = uuidv4();

  user.resetToken = resetToken;
  await user.save();

  await emailService.sendResetPasswordEmail(email, resetToken);

  res.sendStatus(200);
};

const resetPassword = async (req, res) => {
  const { resetToken } = req.params;
  const { password, email } = req.body;
  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  if (user.resetToken !== resetToken) {
    throw ApiError.badRequest('Invalid or expired reset token');
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (isMatch) {
    throw ApiError.badRequest(
      'The new password must be different from the current one',
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await userService.updatePassword(user.id, hashedPassword);

  user.resetToken = null;
  await user.save();

  res.sendStatus(200);
};

module.exports = {
  register,
  activate,
  login,
  validateEmail,
  validatePassword,
  refresh,
  logout,
  sendResetPassword,
  resetPassword,
};
