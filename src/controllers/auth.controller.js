import { User } from '../models/user.model.js';
import { userService } from '../services/user.service.js';
import { jwtService } from '../services/jwt.service.js';
import { ApiError } from '../exeptions/api.error.js';
import bcrypt from 'bcrypt';
import { tokenService } from '../services/token.service.js';
import { emailService } from '../services/email.service.js';

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return typeof email === 'string' && emailRegex.test(email);
}

function isValidPassword(password) {
  // мінімум 8 символів, хоча б одна літера і хоча б одна цифра
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d\W_]{8,}$/;

  return typeof password === 'string' && passwordRegex.test(password);
}

const register = async (req, res, next) => {
  const { name, email, password } = req.body;

  const errors = {
    email: !isValidEmail(email),
    password: !isValidPassword(password),
  };

  if (errors.email || errors.password || !name) {
    throw ApiError.badRequest('Bad request', errors);
  }

  const hashedPass = await bcrypt.hash(password, 10);

  await userService.register(name, email, { password: hashedPass });
  res.send({ message: 'Ok' });
};

const activate = async (req, res) => {
  const { activationToken } = req.params;
  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    res.sendStatus(404);

    return;
  }

  user.isActivated = true;
  user.activationToken = null;
  await user.save();

  return res.send(user);
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  if (!user.isActivated) {
    throw ApiError.BadRequest('User email is not activated');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  generateTokens(res, user);
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  const user = jwtService.verifyRefresh(refreshToken);
  const token = await tokenService.getByToken(refreshToken);

  if (!user || !token) {
    throw ApiError.unauthorized();
  }

  generateTokens(res, user);
};

const generateTokens = async (res, user) => {
  const normalizedUser = userService.normalize(user);
  const accessToken = jwtService.sign(normalizedUser);
  const refreshToken = jwtService.signRefresh(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 1000,
    HttpOnly: true,
  });

  res.send({
    user: normalizedUser,
    accessToken,
  });
};

const passwordReset = async (req, res) => {
  const { email } = req.body;

  const user = await userService.findByEmail(email);

  if (!user) {
    res.sendStatus(200);

    return;
  }

  const resetToken = jwtService.signReset({ id: user.id });

  await tokenService.saveResetToken(user.id, resetToken);

  await emailService.sendResetPasswordEmail(user.email, resetToken);

  res.sendStatus(200);
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;

  const user = jwtService.verifyRefresh(refreshToken);

  if (!user || !refreshToken) {
    throw ApiError.unauthorized();
  }

  await tokenService.remove(user.id);

  res.sendStatus(204);
};

const passwordResetConfirm = async (req, res) => {
  const { token, password } = req.body;

  const data = jwtService.verifyReset(token);

  if (!data) {
    throw ApiError.badRequest('Invalid or expired token');
  }

  const savedToken = await tokenService.getResetToken(data.id);

  if (!savedToken || savedToken.resetToken !== token) {
    throw ApiError.BadRequest('Invalid or expired token');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await userService.updatePassword(data.id, hashedPassword);
  await tokenService.removeResetToken(data.id);

  res.sendStatus(200);
};

export const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
  passwordReset,
  passwordResetConfirm,
};
