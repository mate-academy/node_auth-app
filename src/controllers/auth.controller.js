const userServices = require('../services/user.service.js');
const jwtService = require('../services/jwt.service.js');
const { ApiError } = require('../exeptions/api.error.js');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const tokenServices = require('../services/token.service.js');
const validate = require('../utils/validation.js');

const registr = async (req, res) => {
  const { email, password } = req.body;

  const errors = {
    email: validate.email(email),
    password: validate.password(password),
  };

  if (errors.email || errors.password) {
    throw ApiError.BadRequest('Validation failed', errors);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await userServices.register(email, hashedPassword);

  res.sendStatus(201);
};

const activate = async (req, res) => {
  const { activationToken } = req.params;

  const user = await userServices.findByToken(activationToken);

  if (!user) {
    throw ApiError.NotFound('User not found');
  }

  user.activationToken = null;
  await user.save();

  await generateTokens(res, user);
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await userServices.findByEmail(email);

  if (!user) {
    throw ApiError.NotFound('User not found');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.BadRequest('Wrong password');
  }

  await generateTokens(res, user);
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  const userData = jwtService.verifyRefreshToken(refreshToken);
  const token = await tokenServices.findByToken('refreshToken', refreshToken);

  if (!userData || !token) {
    throw ApiError.Unauthorized();
  }

  const user = await userServices.findByEmail(userData.email);

  await generateTokens(res, user);
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;
  const userData = jwtService.verifyRefreshToken(refreshToken);

  res.clearCookie('refreshToken');

  if (userData) {
    await tokenServices.removeToken(userData.id);
  }

  res.sendStatus(204);
};

const requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  const user = await userServices.findByEmail(email);

  if (!user) {
    throw ApiError.NotFound('User not found');
  }

  const resetPasswordToken = uuidv4();

  await tokenServices.save(user.id, resetPasswordToken, 'resetPasswordToken');
  await userServices.requestPasswordReset(email, resetPasswordToken);

  res.sendStatus(204);
};

const resetPassword = async (req, res) => {
  const { password, confirmPassword } = req.body;
  const { resetPasswordToken } = req.params;

  if (password !== confirmPassword) {
    throw ApiError.BadRequest('Passwords do not match');
  }

  const errors = {
    password: validate.password(password),
  };

  if (errors.password) {
    throw ApiError.BadRequest('Validation failed', errors);
  }

  const userData = await tokenServices.findByToken(
    'resetPasswordToken',
    resetPasswordToken,
  );

  if (!userData) {
    throw ApiError.NotFound('User not found');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await userServices.resetPassword(hashedPassword, userData.userId);

  userData.resetPasswordToken = null;
  await userData.save();

  res.sendStatus(204);
};

const generateTokens = async (res, user) => {
  const userData = userServices.normalize(user);

  const accessToken = jwtService.generateAccessToken(userData);
  const refreshToken = jwtService.generateRefreshToken(userData);

  await tokenServices.save(user.id, refreshToken, 'refreshToken');

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  });

  res.send({
    user: userData,
    accessToken,
  });
};

module.exports = {
  registr,
  activate,
  login,
  logout,
  refresh,
  requestPasswordReset,
  resetPassword,
};
