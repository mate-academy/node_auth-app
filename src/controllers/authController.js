import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { User } from '../models/user.js';
import { userService } from '../services/userService.js';
import { jwtService } from '../services/jwtServices.js';
import { ApiError } from '../exceptions/apiError.js';
import { tokenService } from '../services/tokenService.js';
import { emailService } from '../services/emailService.js';
import { validators } from '../utils/validators.js';

async function register(req, res, next) {
  const { name, email, password } = req.body;

  const errors = {
    email: validators.validateEmail(email),
    password: validators.validatePassword(password),
  };

  if (!name) {
    throw ApiError.badRequest('Name is required', errors);
  }

  if (errors.email || errors.password) {
    throw ApiError.badRequest('Validation error', errors);
  }

  const hashedPass = await bcrypt.hash(password, 10);

  await userService.register(name, email, hashedPass);
  res.send({ message: 'User has been registered' });
}

async function activate(req, res) {
  const { activationToken } = req.params;
  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    res.sendStatus(404);
    return;
  }

  user.activationToken = null;
  user.save();

  res.send(user);
}

async function generateToken(res, user) {
  const normalizedUser = userService.normalize(user);

  const accessToken = jwtService.sign(normalizedUser);
  const refreshToken = jwtService.signRefresh(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  });

  res.send({
    user: normalizedUser,
    accessToken,
  });
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email) {
    throw ApiError.badRequest('Email is required', {
      email: 'Email is required',
    });
  }

  if (!password) {
    throw ApiError.badRequest('Password is required', {
      password: 'Password is required',
    });
  }

  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  await generateToken(res, user);
}

async function refresh(req, res) {
  const { refreshToken } = req.cookies;

  const userData = jwtService.verifyRefresh(refreshToken);

  if (!userData) {
    throw ApiError.unauthorized();
  }

  const token = await tokenService.getByToken(refreshToken);

  if (!token) {
    throw ApiError.unauthorized();
  }

  const user = await userService.findByEmail(userData.email);

  await generateToken(res, user);
}

async function logout(req, res) {
  const { refreshToken } = req.cookies;
  const userData = jwtService.verifyRefresh(refreshToken);

  res.clearCookie('refreshToken');

  if (userData) {
    await tokenService.remove(userData.id);
  }

  res.sendStatus(204);
}

async function resetRequest(req, res) {
  const { email } = req.body;
  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.notFound();
  }

  const resetToken = uuidv4();

  user.resetToken = resetToken;
  user.resetTokenExpiry = new Date(Date.now() + 3600000);
  await user.save();

  await emailService.sendResetPasswordEmail(email, resetToken);
  res.send({ message: 'Email sent for password reset' });
}

async function resetConfirm(req, res) {
  const { resetToken } = req.params;
  const { password, confirmation } = req.body;

  const user = await User.findOne({ where: { resetToken }});

  const errors = {
    password: validators.validatePassword(password),
  };

  if (!user || !user.resetTokenExpiry) {
    throw ApiError.badRequest('Invalid or expired reset token');
  }

  if (errors.password) {
    throw ApiError.badRequest('Validation error', errors.password);
  }

  if (password !== confirmation) {
    throw ApiError.badRequest('Passwords do not match');
  }

  const hashedPass = await bcrypt.hash(password, 10);

  user.password = hashedPass;
  user.resetToken = null;
  user.resetTokenExpiry = null;
  await user.save();

  res.send({ message: 'Password reset successful' });
}

export const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
  resetRequest,
  resetConfirm,
};
