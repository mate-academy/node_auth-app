import { User } from '../models/user.model.js';
import bcrypt from 'bcrypt';
import { emailService } from '../services/email.service.js';
import { userService } from '../services/user.service.js';
import { ApiError } from '../exceptions/api.error.js';
import { validators } from '../utils/validators.js';
import { jwtService } from '../services/jwt.service.js';
import { tokenService } from '../services/token.service.js';

async function generateTokens(res, user) {
  const normalizedUser = userService.normalize(user);
  const accessToken = jwtService.signAccess(normalizedUser);
  const refreshToken = jwtService.signRefresh(normalizedUser);

  await tokenService.save(user.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  });
  res.send({ user: normalizedUser, accessToken });
}

async function register(req, res) {
  const { name, email, password } = req.body;

  const errors = {
    name: !name ? 'Name is required' : undefined,
    email: validators.validateEmail(email),
    password: validators.validatePassword(password),
  };

  if (errors.name || errors.email || errors.password) {
    throw ApiError.badRequest('Validation error', errors);
  }

  if (await User.findOne({ where: { email } })) {
    throw ApiError.conflict('this email is already used');
  }

  const securedPassword = await bcrypt.hash(password, 10);
  const activationToken = crypto.randomUUID();

  await User.create({
    name,
    email,
    password: securedPassword,
    activationToken,
  });

  await emailService.sendActivationEmail(email, activationToken);

  res.status(201).send({ message: 'Check your email' });
}

async function activate(req, res) {
  const { activationToken } = req.params;

  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    throw ApiError.notFound('Activation link is invalid or already used');
  }

  user.activationToken = null;
  await user.save();

  await generateTokens(res, user);
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    throw ApiError.badRequest('Email and password are required');
  }

  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw ApiError.unauthorized('Wrong email or password');
  }

  if (!(await bcrypt.compare(password, user.password))) {
    throw ApiError.unauthorized('Wrong email or password');
  }

  if (user.activationToken) {
    throw ApiError.forbidden('Please activate your email');
  }

  await generateTokens(res, user);
}

async function refresh(req, res) {
  const refreshToken = req.cookies.refreshToken;
  const userData = jwtService.verifyRefresh(refreshToken);

  if (!userData || !(await tokenService.getByToken(refreshToken))) {
    throw ApiError.unauthorized('refresh token not found');
  }

  const user = await User.findByPk(userData.id);

  if (!user) {
    throw ApiError.unauthorized('User not found');
  }

  await generateTokens(res, user);
}

async function logout(req, res) {
  // authMiddleware has already checked the access token
  // and put the user data into req.user
  await tokenService.remove(req.user.id);

  res.clearCookie('refreshToken');
  res.sendStatus(204);
}

async function requestPasswordReset(req, res) {
  const { email } = req.body;

  if (validators.validateEmail(email)) {
    throw ApiError.badRequest('Validation error');
  }

  const user = await User.findOne({ where: { email } });

  if (user) {
    user.resetToken = crypto.randomUUID();
    user.resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();
    await emailService.sendResetEmail(email, user.resetToken);
  }

  res.send({
    message: 'If this email is registered, we have sent a reset link',
  });
}

async function resetPassword(req, res) {
  const { resetToken } = req.params;
  const { password, confirmation } = req.body;

  const errors = {
    confirmation:
      password !== confirmation ? 'Passwords do not match' : undefined,
    password: validators.validatePassword(password),
  };

  if (errors.confirmation || errors.password) {
    throw ApiError.badRequest('Validation error', errors);
  }

  const user = await User.findOne({ where: { resetToken } });

  if (!user || user.resetTokenExpires < new Date()) {
    throw ApiError.badRequest('Reset link is invalid or expired');
  }

  const securedPassword = await bcrypt.hash(password, 10);

  user.password = securedPassword;
  user.resetToken = null;
  user.resetTokenExpires = null;
  await user.save();
  await tokenService.remove(user.id);
  res.send({ message: 'Password has been changed' });
}

export const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
  requestPasswordReset,
  resetPassword,
};
