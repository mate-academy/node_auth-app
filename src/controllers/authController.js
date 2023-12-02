import { validate } from 'uuid';
import bcrypt from 'bcrypt';
import { ApiError } from '../exceptions/ApiError.js';
import { userService } from '../services/userService.js';
import { User } from '../models/User.js';
import { jwtService } from '../services/jwtService.js';
import { tokenService } from '../services/tokenService.js';
import { validation } from '../utils/validation.js';

async function registration(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw ApiError.BadRequest('Must be 3 params: name, email, password');
  }

  if (!validation.password(password) || !validation.email(email)) {
    throw ApiError.BadRequest('Email or password is not correct');
  }

  await userService.registration({
    name,
    email,
    password,
  });

  res.send({ message: 'Success, confirm email' });
}

async function activate(req, res) {
  const { confirmEmailToken } = req.params;

  if (!validate(confirmEmailToken)) {
    throw ApiError.BadRequest('Not a correct link');
  }

  const user = await User.findOne({ where: { confirmEmailToken } });

  if (!user) {
    throw ApiError.BadRequest('User is not found');
  }

  user.confirmEmailToken = null;
  await user.save();

  await sendAuthentication(res, user);
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    throw ApiError.BadRequest('No email or password');
  }

  const user = await userService.getByEmail(email);

  if (!user) {
    throw ApiError.NotFound();
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.BadRequest('Password wrong');
  }

  await sendAuthentication(res, user);
}

async function logout(req, res) {
  const { refreshToken } = req.cookies;

  const userData = jwtService.validateRefreshToken(refreshToken);

  if (userData) {
    await tokenService.remove(userData.id);
  }

  res.clearCookie('refreshToken');

  res.sendStatus(204);
}

async function resetPassword(req, res) {
  const { email } = req.body;

  if (!email) {
    throw ApiError.BadRequest('No email in params');
  }

  await userService.sendResetPasswordMail(email);

  res.send({ message: 'Check your email for reset password link' });
}

async function confirmPassword(req, res) {
  const { confirmEmailToken } = req.params;
  const { password } = req.body;

  if (!password || !validation.password(password)) {
    throw ApiError.BadRequest('No password or not correct');
  }

  if (!validate(confirmEmailToken)) {
    throw ApiError.BadRequest('Not a correct reset link');
  }

  await userService.resetPassword(password, confirmEmailToken);

  res.send({ message: 'Success, login please' });
}

async function refresh(req, res) {
  const { refreshToken } = req.cookies;
  const userData = jwtService.validateRefreshToken(refreshToken);

  if (!userData) {
    throw ApiError.Unauthorized();
  }

  const token = await tokenService.getByToken(refreshToken);

  if (!token) {
    throw ApiError.Unauthorized();
  }

  const user = await userService.getByEmail(userData.email);

  await sendAuthentication(res, user);
}

async function sendAuthentication(res, user) {
  const userData = userService.normalize(user);
  const accessToken = jwtService.generateAccessToken(userData);
  const refreshToken = jwtService.generateRefreshToken(userData);

  await tokenService.save(user.id, refreshToken);

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
}

export const authController = {
  registration,
  activate,
  login,
  logout,
  resetPassword,
  confirmPassword,
  refresh,
};
