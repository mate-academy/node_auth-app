import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { User } from '../models/user.js';
import { userService } from '../services/user.service.js';
import { jwtService } from '../services/jwt.service.js';
import { tokenService } from '../services/token.service.js';
import { emailService } from '../services/email.service.js';
import { ApiError } from '../exeptions/api.error.js';

import {
  normalizeEmail,
  validateEmail,
  validateName,
  validatePassword,
} from '../utils/validation.js';

function getRefreshCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };
}

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const errors = {
    name: validateName(name),
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.name || errors.email || errors.password) {
    throw ApiError.badRequest('Bad request', errors);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await userService.register(
    name.trim(),
    normalizeEmail(email),
    hashedPassword,
  );

  res.status(201).send({
    message:
      'Registration successful. Check your email to activate the account.',
  });
};

const activate = async (req, res) => {
  const { activationToken } = req.params;

  const user = await User.findOne({
    where: { activationToken },
  });

  if (!user) {
    throw ApiError.badRequest(
      'Activation link is invalid or has already been used',
    );
  }

  user.activationToken = null;

  await user.save();

  await generateTokens(res, user, '/profile');
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const emailError = validateEmail(email);
  const passwordError = !password ? 'Password is required' : undefined;

  if (emailError || passwordError) {
    throw ApiError.badRequest('Bad request', {
      email: emailError,
      password: passwordError,
    });
  }

  const user = await userService.findByEmail(normalizeEmail(email));

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  if (user.activationToken) {
    throw ApiError.badRequest('Account is not activated', {
      email: 'Please activate your account using the link sent to your email',
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  await generateTokens(res, user);
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const emailError = validateEmail(email);

  if (emailError) {
    throw ApiError.badRequest('Bad request', {
      email: emailError,
    });
  }

  const normalizedEmail = normalizeEmail(email);
  const user = await userService.findByEmail(normalizedEmail);

  if (user) {
    const resetPasswordToken = uuidv4();

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await user.save();

    try {
      await emailService.sendResetPasswordEmail(user.email, resetPasswordToken);
    } catch (error) {
      user.resetPasswordToken = null;
      user.resetPasswordTokenExpiresAt = null;

      await user.save();

      throw error;
    }
  }

  res.send({
    message: 'If this email exists, a password reset link has been sent.',
  });
};

const resetPassword = async (req, res) => {
  const { token } = req.params;

  const { password, passwordConfirmation } = req.body;

  const errors = {
    password: validatePassword(password),
    passwordConfirmation: !passwordConfirmation
      ? 'Password confirmation is required'
      : undefined,
  };

  if (errors.password || errors.passwordConfirmation) {
    throw ApiError.badRequest('Bad request', errors);
  }

  if (password !== passwordConfirmation) {
    throw ApiError.badRequest('Bad request', {
      passwordConfirmation: 'Passwords do not match',
    });
  }

  const user = await userService.findByResetPasswordToken(token);

  if (!user || !user.resetPasswordTokenExpiresAt) {
    throw ApiError.badRequest(
      'Password reset link is invalid or has already been used',
    );
  }

  const tokenExpiresAt = new Date(user.resetPasswordTokenExpiresAt).getTime();

  if (tokenExpiresAt < Date.now()) {
    user.resetPasswordToken = null;
    user.resetPasswordTokenExpiresAt = null;

    await user.save();

    throw ApiError.badRequest('Password reset link has expired');
  }

  const isSamePassword = await bcrypt.compare(password, user.password);

  if (isSamePassword) {
    throw ApiError.badRequest('Bad request', {
      password: 'New password must be different from the current password',
    });
  }

  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordToken = null;
  user.resetPasswordTokenExpiresAt = null;

  await user.save();
  await tokenService.remove(user.id);

  res.clearCookie('refreshToken', getRefreshCookieOptions());

  res.send({
    message: 'Password was reset successfully.',
    loginUrl: `${process.env.CLIENT_HOST}/login`,
    redirectUrl: '/login',
  });
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw ApiError.unauthorized();
  }

  const userData = jwtService.verifyRefresh(refreshToken);

  if (!userData) {
    res.clearCookie('refreshToken', getRefreshCookieOptions());

    throw ApiError.unauthorized();
  }

  const savedToken = await tokenService.getByToken(refreshToken);

  if (!savedToken) {
    res.clearCookie('refreshToken', getRefreshCookieOptions());

    throw ApiError.unauthorized();
  }

  const user = await userService.findById(userData.id);

  if (!user) {
    await tokenService.remove(userData.id);

    res.clearCookie('refreshToken', getRefreshCookieOptions());

    throw ApiError.unauthorized();
  }

  if (user.activationToken) {
    await tokenService.remove(user.id);

    res.clearCookie('refreshToken', getRefreshCookieOptions());

    throw ApiError.unauthorized();
  }

  await generateTokens(res, user);
};

const generateTokens = async (res, user, redirectUrl = '/profile') => {
  const normalizedUser = userService.normalize(user);

  const accessToken = jwtService.sign(normalizedUser);

  const refreshToken = jwtService.signRefresh(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    ...getRefreshCookieOptions(),
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.send({
    user: normalizedUser,
    accessToken,
    redirectUrl,
  });
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (refreshToken) {
    const savedToken = await tokenService.getByToken(refreshToken);

    if (savedToken) {
      await tokenService.remove(req.user.id);
    }
  }

  res.clearCookie('refreshToken', getRefreshCookieOptions());

  res.send({
    message: 'Logout successful',
    redirectUrl: '/login',
  });
};

export const authController = {
  register,
  activate,
  login,
  forgotPassword,
  resetPassword,
  refresh,
  logout,
};
