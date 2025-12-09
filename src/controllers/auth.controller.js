import { User } from '../models/user.js';

import { userService } from '../services/user.services.js';
import { tokenService } from '../services/token.service.js';
import { jwtService } from '../services/jwt.service.js';
import { ApiError } from '../exeptions/api.error.js';
import bcrypt from 'bcrypt';

function validateEmail(value) {
  const EMAIL_PATTERN = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!value) {
    return 'Email is required';
  }

  if (!EMAIL_PATTERN.test(value)) {
    return 'Email is not valid';
  }
}

const validatePassword = (value) => {
  if (!value) {
    return 'Password is required';
  }

  if (value.length < 6) {
    return 'At least 6 characters';
  }
};
const validateName = (value) => {
  if (!value) {
    return 'Name is last';
  }

  if (value.length < 2) {
    return 'At least 2 characters';
  }
};

const register = async (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = {
    name: validateName(name),
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.email || errors.password || errors.name) {
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

  if (user.activationToken !== null) {
    throw ApiError.badRequest('you must activated your email check your box');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }
  await generateTokens(res, user);
};
const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw ApiError.unauthorized();
  }

  const payload = await jwtService.verifyRefresh(refreshToken);

  if (!payload) {
    throw ApiError.unauthorized();
  }

  const tokenRecord = await tokenService.getByToken(refreshToken);

  if (!tokenRecord) {
    throw ApiError.unauthorized();
  }

  const { user: payloadUser } = payload;

  const user = await userService.findByEmail(payloadUser.email);

  if (!user) {
    throw ApiError.unauthorized();
  }

  generateTokens(res, user);
};

const generateTokens = async (res, user) => {
  const normalizeUser = userService.normalize(user);
  const accessToken = jwtService.sign(normalizeUser);
  const refreshAccessToken = jwtService.signRefresh(normalizeUser);

  await tokenService.save(normalizeUser.id, refreshAccessToken);

  res.cookie('refreshToken', refreshAccessToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  });

  res.send({
    user: normalizeUser,
    accessToken,
  });
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;
  const payload = await jwtService.verifyRefresh(refreshToken);

  if (!refreshToken || !payload) {
    throw ApiError.unauthorized();
  }

  await tokenService.remove(payload.user.id);
  res.clearCookie('refreshToken', { httpOnly: true });
  res.sendStatus(204);
};

const resetPassword = async (req, res) => {
  const { email } = req.body;
  const errors = {
    email: validateEmail(email),
  };

  if (errors.email) {
    throw ApiError.badRequest('Bad request', errors);
  }

  await userService.resetPassword(email);
  res.send({ message: 'email send' });
};

const confirm = async (req, res) => {
  const { password, reppassword, token } = req.body;

  await userService.confirmReset(password, reppassword, token);
  res.sendStatus(204);
};

export const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
  resetPassword,
  confirm,
  validateEmail,
};
