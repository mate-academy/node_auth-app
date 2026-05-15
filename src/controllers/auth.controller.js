import { ApiError } from '../exeptions/api.error.js';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { userService } from '../services/user.service.js';
import { User } from '../models/user.js';
import { jwtService } from '../services/jwt.service.js';
import { tokenService } from '../services/token.service.js';
import { emailService } from '../services/email.service.js';

function validateEmail(value) {
  if (!value) {
    return 'Email is required';
  }

  const emailPattern = /^[\w+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!emailPattern.test(value)) {
    return 'Email is not valid';
  }
}

function validatePassword(value) {
  if (!value) {
    return 'Password is required';
  }

  if (value.length < 6) {
    return 'Password must be at least 6 characters long';
  }

  return null;
}

async function generateTokens(res, user) {
  const normalizedUser = userService.normalize(user);
  const accessToken = jwtService.sign(normalizedUser);
  const refreshToken = jwtService.signRefresh(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    secure: true,
  });

  return { user: normalizedUser, accessToken };
}

const register = async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name) {
    throw ApiError.badRequest('Name is required');
  }

  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.email || errors.password) {
    throw ApiError.badRequest('Validation failed', errors);
  }

  const hashedPass = await bcrypt.hash(password, 10);

  await userService.register(name, email, hashedPass);
  res.send({ message: 'Registration successful. Please check your email.' });
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
  res.redirect(`${process.env.CLIENT_HOST}/profile`);
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  if (user.activationToken) {
    throw ApiError.badRequest('Please activate your email first');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  const data = await generateTokens(res, user);

  res.send(data);
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;
  const userData = await jwtService.verifyRefresh(refreshToken);
  const token = await tokenService.getByToken(refreshToken);

  if (!userData || !token) {
    throw ApiError.unauthorized();
  }

  const user = await userService.findByEmail(userData.email);
  const data = await generateTokens(res, user);

  res.send(data);
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw ApiError.unauthorized();
  }

  const userData = await jwtService.verifyRefresh(refreshToken);

  if (userData) {
    await tokenService.remove(userData.id);
  }
  res.clearCookie('refreshToken');
  res.sendStatus(204);
};

const requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  const user = await userService.findByEmail(email);

  if (user) {
    const resetToken = randomUUID();

    user.resetToken = resetToken;
    await user.save();
    await emailService.sendResetPasswordEmail(email, resetToken);
  }

  res.send({ message: 'Reset link sent if email exists' });
};

const resetPasswordConfirm = async (req, res) => {
  const { resetToken, password, passwordConfirmation } = req.body;

  if (password !== passwordConfirmation) {
    throw ApiError.badRequest('Passwords do not match');
  }

  const user = await User.findOne({ where: { resetToken } });

  if (!user) {
    throw ApiError.badRequest('Invalid or expired reset token');
  }

  user.password = await bcrypt.hash(password, 10);
  user.resetToken = null;
  await user.save();

  res.send({ message: 'Password updated successfully' });
};

export const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
  requestPasswordReset,
  resetPasswordConfirm,
};
