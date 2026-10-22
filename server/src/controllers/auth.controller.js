const { userService } = require('../services/user.service.js');
const { ApiError } = require('../exeptions/api.error.js');
const { jwtService } = require('../services/jwt.service.js');
const { tokenService } = require('../services/token.service.js');
const { refreshCookieOptions } = require('../config/auth.config.js');
const {
  EMAIL_REGEX,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MIN_LENGTH_MESSAGE,
} = require('../constants/auth.constants.js');

const setRefreshTokenCookie = (res, refreshToken) => {
  res.cookie('refreshToken', refreshToken, {
    ...refreshCookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const errors = {};

  if (typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
    errors.email = 'Email is not valid';
  }

  if (typeof password !== 'string' || password.length < PASSWORD_MIN_LENGTH) {
    errors.password = PASSWORD_MIN_LENGTH_MESSAGE;
  }

  if (Object.keys(errors).length > 0) {
    throw ApiError.BadRequest('Validation errors', errors);
  }

  const user = await userService.createUser(name, email, password);

  res.status(201).json(user);
};

const activate = async (req, res) => {
  const { activationToken } = req.params;

  const user = await userService.getUserByActivationToken(activationToken);

  if (!user) {
    throw ApiError.NotFound({ activationToken: 'Invalid activation link' });
  }

  user.activationToken = null;
  await user.save();

  const activatedUser = await userService.findUserById(user.id);
  const accessToken = jwtService.generateToken(activatedUser);
  const refreshToken = jwtService.signRefreshToken(activatedUser);

  await tokenService.saveRefreshToken(user.id, refreshToken);
  setRefreshTokenCookie(res, refreshToken);

  res.status(200).json({ user: activatedUser, accessToken });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await userService.getUserByEmail(email);

  if (!user) {
    throw ApiError.BadRequest('User with this email does not exist', {
      email: 'User with this email does not exist',
    });
  }

  if (!(await userService.isUserActivated(user.id))) {
    throw ApiError.BadRequest('User account is not activated', {
      email: 'User account is not activated',
    });
  }

  if (!(await userService.checkPassword(user.id, password))) {
    throw ApiError.BadRequest('Wrong password', {
      password: 'Wrong password',
    });
  }

  const accessToken = jwtService.generateToken(user);
  const refreshToken = jwtService.signRefreshToken(user);

  await tokenService.saveRefreshToken(user.id, refreshToken);
  setRefreshTokenCookie(res, refreshToken);

  res.status(200).json({ user, accessToken });
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw ApiError.UnauthorizedError();
  }

  const decoded = jwtService.verifyRefreshToken(refreshToken);
  const token = await tokenService.getRefreshToken(refreshToken);

  if (!decoded || !token) {
    throw ApiError.UnauthorizedError();
  }

  const user = await userService.findUserById(decoded.id);

  if (!user) {
    throw ApiError.UnauthorizedError();
  }

  const newAccessToken = jwtService.generateToken(user);
  const newRefreshToken = jwtService.signRefreshToken(user);

  await tokenService.saveRefreshToken(user.id, newRefreshToken);
  setRefreshTokenCookie(res, newRefreshToken);

  res.status(200).json({ accessToken: newAccessToken, user });
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw ApiError.UnauthorizedError();
  }

  const decoded = jwtService.verifyRefreshToken(refreshToken);
  const token = await tokenService.getRefreshToken(refreshToken);

  if (!decoded || !token) {
    throw ApiError.UnauthorizedError();
  }

  await tokenService.removeRefreshToken(decoded.id);

  res.clearCookie('refreshToken', refreshCookieOptions);
  res.sendStatus(204);
};

const forgotPassword = async (req, res) => {
  await userService.requestPasswordReset(req.body?.email);

  res.status(200).json({
    message: 'If an account exists, a password reset link has been sent',
  });
};

const resetPassword = async (req, res) => {
  await userService.resetPassword(req.params.token, req.body);

  res.status(200).json({ message: 'Password has been reset' });
};

const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
};

module.exports = { authController };
