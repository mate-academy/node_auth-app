const { User } = require('../models/user.js');
const { userService } = require('../services/user.service.js');
const { jwtService } = require('../services/jwt.service.js');
const { ApiError } = require('../exception/api.error.js');
const { tokenService } = require('../services/token.service.js');
const { emailService } = require('../services/email.service.js');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

const EMAIL_PATTERN = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

function validateEmail(value) {
  if (!value) {
    return 'Email is required';
  }

  if (!EMAIL_PATTERN.test(value)) {
    return 'Email is not valid';
  }
}

function validatePassword(value) {
  if (!value) {
    return 'Password is required';
  }

  if (value.length < 6) {
    return 'At least 6 characters';
  }
}

const register = async (req, res, next) => {
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

  const user = await User.findOne({
    where: { activationToken },
  });

  // || user.activationToken !== activationToken
  if (!user) {
    throw ApiError.notFound('No such user');
  }

  user.activationToken = null;
  await user.save();

  res.send({
    redirectTo: '/profile',
    user: userService.normalize(user),
  });
};

async function generateTokens(res, user) {
  const normalizedUser = userService.normalize(user);

  const accessToken = jwtService.sign(normalizedUser);
  const refreshAccessToken = jwtService.signRefresh(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshAccessToken);

  res.cookie('refreshToken', refreshAccessToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    HttpOnly: true,
  });

  res.send({
    user: normalizedUser,
    accessToken,
  });
}

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.notFound('No such user');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  if (user.activationToken) {
    throw ApiError.badRequest('User is not active');
  }

  await generateTokens(res, user);
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  const userData = await jwtService.verifyRefresh(refreshToken);
  const token = await tokenService.getByToken(refreshToken);

  if (!userData || !token) {
    throw ApiError.unauthorized();
  }

  const user = await userService.findByEmail(userData.email);

  await generateTokens(res, user);
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

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const forgotToken = uuidv4();

  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  user.resetPasswordToken = forgotToken;
  await user.save();
  await emailService.sendResetPassword(email, forgotToken);
  res.sendStatus(204);
};

const resetPassword = async (req, res) => {
  const { password, confirmPassword } = req.body;
  const { token } = req.params;

  const user = await User.findOne({
    where: { resetPasswordToken: token },
  });

  const errors = {
    password: validatePassword(password),
  };

  if (errors.password) {
    throw ApiError.badRequest('Bad request', errors);
  }

  if (!user) {
    throw ApiError.badRequest('User no token');
  }

  if (password !== confirmPassword) {
    throw ApiError.badRequest('Password not match');
  }

  const hashedPass = await bcrypt.hash(password, 10);

  user.resetPasswordToken = null;
  user.password = hashedPass;
  await user.save();

  res.send({ message: 'OK' });
};

const checkResetToken = async (req, res) => {
  const { token } = req.params;

  const user = await User.findOne({
    where: { resetPasswordToken: token },
  });

  if (!user) {
    throw ApiError.badRequest('User no token');
  }

  res.send({ message: 'Token is valid' });
};

module.exports = {
  register,
  activate,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  checkResetToken,
  validateEmail,
  validatePassword,
};
