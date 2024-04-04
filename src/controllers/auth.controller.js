const { User } = require('../models/user.model.js');
const { ApiError } = require('../exeptions/apiError.js');
const userService = require('../services/user.service.js');
const validators = require('../helpers/validators.js');
const jwtService = require('../services/jwt.service.js');
const resetTokenService = require('../services/resetToken.service.js');
const bcrypt = require('bcrypt');
const { sendResetPasswordLink } = require('../services/email.service.js');

const normalizeBody = ({ name, email, password }) => {
  return { name: name.trim(), email: email.trim(), password: password.trim() };
};

const register = async (req, res) => {
  const { name, email, password } = normalizeBody(req.body);

  const error = {
    name: validators.validateName(name),
    email: validators.validateEmail(email),
    password: validators.validatePassword(password),
  };

  if (error.email || error.password || error.name) {
    throw ApiError.badRequest('Validation error', error);
  }

  const newUser = await userService.create({ name, email, password });

  res.send(newUser);
};

const activate = async (req, res) => {
  const { token } = req.params;
  const user = await User.findOne({ where: { activation_token: token } });

  if (!user) {
    throw ApiError.notFound();
  }

  user.activation_token = null;
  await user.save();
  res.sendStatus(204);
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const error = {
    email: validators.validateEmail(email),
    password: validators.validatePassword(password),
  };

  if (error.email || error.password) {
    throw ApiError.badRequest('Credentials error', {
      message: 'Email or password is wrong',
    });
  }

  const user = await userService.findByEmail(email);
  const isPasswordValid = await bcrypt.compare(password, user.password || null);

  if (!user || !isPasswordValid) {
    throw ApiError.badRequest('Login error', {
      error: 'Email or password is wrong',
    });
  }

  const normalizedUser = userService.normalize(user);
  const accessToken = jwtService.createAccessToken(normalizedUser);
  const refreshToken = jwtService.createRefreshToken(normalizedUser);

  await tokenService.save({ refreshToken, userId: user.id });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    maxAge: 3600 * 24,
    secure: true,
  });
  res.send({ user: normalizedUser, accessToken });
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;
  const user = jwtService.verifyRefreshToken(refreshToken);

  if (!user) {
    throw ApiError.unauthorized();
  }

  await tokenService.remove(user.id);
  res.sendStatus(204);
};

const resetPassword = async (req, res) => {
  const { email } = req.body;

  const error = {
    email: validators.validateEmail(email),
  };

  if (error.email) {
    throw ApiError.badRequest('Invalid Email', { email: 'Invalid email' });
  }

  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.notFound();
  }

  const normalizedUser = userService.normalize(user);
  const resetToken = jwtService.createRefreshToken(normalizedUser);

  await sendResetPasswordLink(email, resetToken);
  await resetTokenService.save({ resetToken, userId: user.id });
  res.sendStatus(204);
};

const changePassword = async (req, res) => {
  const { password, password2, resetToken } = req.body;

  const error = {
    password: validators.validatePassword(password),
    password2: validators.validatePassword(password2),
  };

  if (error.password || error.password2) {
    throw ApiError.badRequest('Error password', error);
  }

  const user = jwtService.verifyRefreshToken(resetToken);

  if (!user) {
    await resetTokenService.remove(user.id);
    throw ApiError.unauthorized();
  }

  await userService.changePassword({ password, userId: user.id });
  await resetTokenService.remove(user.id);
  res.sendStatus(204);
};

module.exports = {
  register,
  activate,
  login,
  logout,
  resetPassword,
  changePassword,
};
