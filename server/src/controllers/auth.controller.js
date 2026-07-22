'use strict';

const { AuthToken, User } = require('../models');
const {
  loginUser,
  logoutUser,
  refreshUserSession,
  createUser,
} = require('../services/auth.service');
const {
  consumeEmailToken,
  createEmailToken,
} = require('../services/emailToken.service');
const { sendMail } = require('../services/mail.service');
const { hashPassword } = require('../services/password.service');
const { createAuthTokens } = require('../services/token.service');
const { ApiError } = require('../utils/ApiError');
const { asyncHandler } = require('../utils/asyncHandler');
const { clearAuthCookies, setAuthCookies } = require('../utils/cookies');
const { daysFromNow, minutesFromNow } = require('../utils/time');
const {
  isValidEmail,
  requireFields,
  validatePasswordPair,
} = require('../utils/validators');

function getActivationLink(token) {
  return `${process.env.CLIENT_URL || 'http://localhost:5173'}/activate/${token}`;
}

function getResetPasswordLink(token) {
  return `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${token}`;
}

const authController = {
  register: asyncHandler(async (req, res) => {
    const { name, email, password, confirmation } = req.body;
    const missingFields = requireFields(req.body, [
      'name',
      'email',
      'password',
      'confirmation',
    ]);

    if (missingFields.length > 0) {
      throw ApiError.badRequest(`Missing fields: ${missingFields.join(', ')}`);
    }

    if (!isValidEmail(email)) {
      throw ApiError.badRequest('Email is invalid');
    }

    const passwordError = validatePasswordPair(password, confirmation);

    if (passwordError) {
      throw ApiError.badRequest(passwordError);
    }

    const user = await createUser({ name, email, password });
    const activationToken = await createEmailToken({
      userId: user.id,
      type: 'activation',
      expiresAt: daysFromNow(1),
    });

    await sendMail({
      to: user.email,
      subject: 'Activate your account',
      html: `<p>Hello, ${user.name}.</p><p>Activate your account: <a href="${getActivationLink(
        activationToken,
      )}">activate account</a></p>`,
    });

    res.status(201).json({
      message:
        'Registration successful. Check your email to activate the account.',
      user: user.toPublicJSON(),
    });
  }),

  login: asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const missingFields = requireFields(req.body, ['email', 'password']);

    if (missingFields.length > 0) {
      throw ApiError.badRequest(`Missing fields: ${missingFields.join(', ')}`);
    }

    const { user, tokens } = await loginUser({ email, password });

    setAuthCookies(res, tokens);

    res.json({
      user: user.toPublicJSON(),
    });
  }),

  logout: asyncHandler(async (req, res) => {
    await logoutUser(req.cookies.refreshToken);
    clearAuthCookies(res);

    res.status(204).send();
  }),

  refresh: asyncHandler(async (req, res) => {
    const { user, tokens } = await refreshUserSession(req.cookies.refreshToken);

    setAuthCookies(res, tokens);

    res.json({
      user: user.toPublicJSON(),
    });
  }),

  me: asyncHandler(async (req, res) => {
    const { user, tokens } = await refreshUserSession(req.cookies.refreshToken);

    setAuthCookies(res, tokens);

    res.json({
      user: user.toPublicJSON(),
    });
  }),

  activate: asyncHandler(async (req, res) => {
    const emailToken = await consumeEmailToken({
      token: req.params.token,
      type: 'activation',
    });

    if (!emailToken) {
      throw ApiError.badRequest('Activation link is invalid or expired');
    }

    const user = await User.findByPk(emailToken.userId);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    user.isActivated = true;
    await user.save();

    const tokens = await createAuthTokens(user);

    setAuthCookies(res, tokens);

    res.json({
      message: 'Account activated',
      user: user.toPublicJSON(),
    });
  }),

  forgotPassword: asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email || !isValidEmail(email)) {
      throw ApiError.badRequest('Valid email is required');
    }

    const user = await User.findOne({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (user) {
      const resetToken = await createEmailToken({
        userId: user.id,
        type: 'password_reset',
        expiresAt: minutesFromNow(30),
      });

      await sendMail({
        to: user.email,
        subject: 'Reset your password',
        html: `<p>Reset your password: <a href="${getResetPasswordLink(
          resetToken,
        )}">choose a new password</a></p>`,
      });
    }

    res.json({
      message: 'If this email exists, a reset link has been sent.',
    });
  }),

  resetPassword: asyncHandler(async (req, res) => {
    const { password, confirmation } = req.body;
    const passwordError = validatePasswordPair(password, confirmation);

    if (passwordError) {
      throw ApiError.badRequest(passwordError);
    }

    const emailToken = await consumeEmailToken({
      token: req.params.token,
      type: 'password_reset',
    });

    if (!emailToken) {
      throw ApiError.badRequest('Reset link is invalid or expired');
    }

    const user = await User.findByPk(emailToken.userId);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    user.passwordHash = await hashPassword(password);
    await user.save();
    await AuthToken.destroy({ where: { userId: user.id } });
    clearAuthCookies(res);

    res.json({
      message: 'Password has been changed',
    });
  }),
};

module.exports = { authController };
