const bcrypt = require('bcrypt');
const { User } = require('../models/user.js');
const { ApiError } = require('../exceptions/api.error.js');
const { userService } = require('../services/user.service.js');
const { jwtService } = require('../services/jwt.service.js');
const { tokenService } = require('../services/token.service.js');
const { authService } = require('../services/auth.service.js');

const registrate = async (req, res) => {
  const { name, email, password } = req.body;
  const errors = {
    email: authService.validateEmail(email),
    password: authService.validatePassword(password),
  };

  if (Object.values(errors).some((error) => error)) {
    throw ApiError.badRequest('Validation error', errors);
  }

  const hashedPassword = await authService.hashPassword(password);

  await userService.registrate(name, email, hashedPassword);
  res.send({ message: 'Ok' });
};

const activate = async (req, res) => {
  const { activationToken } = req.params;
  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    res.sendStatus(404);

    return;
  }

  user.activationToken = null;
  await user.save();

  const normalizedUser = userService.normalize(user);

  res.send(normalizedUser);
};

const generateTokens = async (res, user) => {
  const normalizedUser = userService.normalize(user);
  const accessToken = jwtService.sign(normalizedUser);
  const refreshToken = jwtService.signRefresh(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  });

  res.send({ user: normalizedUser, accessToken });
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

  await generateTokens(res, user);
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

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;
  const userData = jwtService.verifyRefresh(refreshToken);

  if (!userData || !refreshToken) {
    throw ApiError.unauthorized();
  }

  await tokenService.remove(userData.id);

  res.sendStatus(204);
};

const resetPassword = async (req, res) => {
  const { email } = req.body;
  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  await authService.resetPassword(email);
};

const confirmPassword = async (req, res) => {
  const { resetToken } = req.params;
  const { password, confirmation } = req.body;

  const user = await User.findOne({ where: { resetToken } });

  if (!user) {
    res.sendStatus(404);

    return;
  }

  const error = authService.validatePassword(password);

  if (error) {
    throw ApiError.badRequest('Validation error', { error });
  }

  if (password !== confirmation) {
    throw ApiError.badRequest('Wrong confirmation');
  }

  const hashedPassword = await authService.hashPassword(password);

  user.resetToken = null;
  user.password = hashedPassword;
  await user.save();
  res.send({ message: 'Password successfully changed' });
};

exports.authController = {
  registrate,
  activate,
  login,
  refresh,
  logout,
  resetPassword,
  confirmPassword,
};
