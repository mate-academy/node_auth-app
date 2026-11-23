import { User } from '../models/user.js';
import { userService } from '../services/user.service.js';
import { jwtService } from '../services/jwt.service.js';
import { ApiError } from '../exceptions/api.error.js';
import bcrypt from 'bcrypt';
import { tokenService } from '../services/token.service.js';
import { emailService } from '../services/email.service.js';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return !emailRegex.test(email);
}

const generateTokens = async (res, user) => {
  const normalizedUser = userService.normalize(user);

  const accessToken = jwtService.sign(normalizedUser);
  const refreshAccessToken = jwtService.signRefresh(normalizedUser);

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

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const errors = {
    email: validateEmail(email) ? 'Invalid email' : null,
    password: userService.getPasswordError(password),
  };

  if (errors.email || errors.password) {
    throw ApiError.badRequest('Bad request', errors);
  }

  await userService.register(name, email, password);

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

  await generateTokens(res, user);
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('Wrong email or password');
  }

  if (user.activationToken) {
    throw ApiError.badRequest('Activate your account via email');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong email or password');
  }

  await generateTokens(res, user);
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw ApiError.unathorized();
  }

  const userData = await jwtService.verifyRefresh(refreshToken);
  const token = await tokenService.getByToken(refreshToken);

  if (!userData || !token) {
    throw ApiError.unathorized();
  }

  const user = await userService.findByEmail(userData.email);

  await generateTokens(res, user);
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;
  const userData = await jwtService.verifyRefresh(refreshToken);

  if (!userData || !refreshToken) {
    throw ApiError.unathorized();
  }

  await tokenService.remove(userData.id);

  res.sendStatus(204);
};

const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  if (validateEmail(email)) {
    throw ApiError.badRequest('Invalid email');
  }

  const user = await userService.findByEmail(email);

  if (user && !user.activationToken) {
    user.resetToken = uuidv4();
    user.resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    await emailService.sendPasswordResetEmail(email, user.resetToken);
  }

  res.send({ message: 'OK' });
};

const resetPassword = async (req, res) => {
  const { resetToken } = req.params;
  const { password, confirmation } = req.body;

  const passwordError = userService.getPasswordError(password);

  if (passwordError) {
    throw ApiError.badRequest(passwordError);
  }

  if (password !== confirmation) {
    throw ApiError.badRequest('Passwords do not match');
  }

  const user = await User.findOne({
    where: {
      resetToken,
      resetTokenExpires: { [Op.gt]: new Date() },
    },
  });

  if (!user) {
    throw ApiError.badRequest('This link is invalid or has expired');
  }

  user.password = await bcrypt.hash(password, 10);
  user.resetToken = null;
  user.resetTokenExpires = null;
  await user.save();

  await tokenService.remove(user.id);

  res.send({ message: 'OK' });
};

export const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
  resetPassword,
  requestPasswordReset,
};
