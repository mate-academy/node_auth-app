require('dotenv/config');

const bcrypt = require('bcrypt');
const { User } = require('../models/user.model.js');
const { ApiError } = require('../exeptions/apiError.js');
const { sendResetPasswordLink } = require('../services/email.service.js');
const userService = require('../services/user.service.js');
const jwtService = require('../services/jwt.service.js');
const resetTokenService = require('../services/resetToken.service.js');
const tokenService = require('../services/token.service.js');
const validators = require('../helpers/validators.js');

const register = async (req, res) => {
  const { name, email, password } = req.body;
  const { validateName, validateEmail, validatePassword } = validators;

  const error = {
    name: validateName(name),
    email: validateEmail(email),
    password: validatePassword(password),
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
  const { validateEmail, validatePassword } = validators;

  const error = {
    email: validateEmail(email),
    password: validatePassword(password),
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

  jwtService.generateTokens(res, normalizedUser);
};

const logout = async (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to log out' });
    }
  });

  const { refreshToken } = req.cookies;
  const user = jwtService.verifyRefreshToken(refreshToken);

  if (!user) {
    throw ApiError.unauthorized();
  }

  await tokenService.remove(user.id);
  res.sendStatus(204);
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;
  const userData = jwtService.verifyRefreshToken(refreshToken);
  const token = await tokenService.getByToken(refreshToken);

  if (!userData || !token) {
    throw ApiError.unauthorized();
  }

  jwtService.generateTokens(res, userService.normalize(userData));
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

const restorePassword = async (req, res) => {
  const { password, password2, resetToken } = req.body;

  validators.comparePassword(password, password2);

  const user = jwtService.verifyRefreshToken(resetToken);

  if (!user) {
    await resetTokenService.remove(user.id);
    throw ApiError.unauthorized();
  }

  await userService.restorePassword({ password, userId: user.id });
  await resetTokenService.remove(user.id);
  res.sendStatus(204);
};

module.exports = {
  login,
  logout,
  refresh,
  register,
  activate,
  resetPassword,
  restorePassword,
};
