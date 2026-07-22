'use strict';

const { AuthToken, User } = require('../models');
const {
  consumeEmailToken,
  createEmailToken,
} = require('../services/emailToken.service');
const { sendMail } = require('../services/mail.service');
const {
  comparePassword,
  hashPassword,
} = require('../services/password.service');
const { ApiError } = require('../utils/ApiError');
const { asyncHandler } = require('../utils/asyncHandler');
const { clearAuthCookies } = require('../utils/cookies');
const { daysFromNow } = require('../utils/time');
const {
  isValidEmail,
  requireFields,
  validatePasswordPair,
} = require('../utils/validators');

function getConfirmEmailLink(token) {
  return `${process.env.CLIENT_URL || 'http://localhost:5173'}/confirm-email/${token}`;
}

const profileController = {
  getProfile: asyncHandler(async (req, res) => {
    res.json({
      user: req.user.toPublicJSON(),
    });
  }),

  updateName: asyncHandler(async (req, res) => {
    const { name } = req.body;

    if (!name || name.trim().length < 2) {
      throw ApiError.badRequest('Name must contain at least 2 characters');
    }

    req.user.name = name.trim();
    await req.user.save();

    res.json({
      user: req.user.toPublicJSON(),
    });
  }),

  updatePassword: asyncHandler(async (req, res) => {
    const { oldPassword, password, confirmation } = req.body;
    const missingFields = requireFields(req.body, [
      'oldPassword',
      'password',
      'confirmation',
    ]);

    if (missingFields.length > 0) {
      throw ApiError.badRequest(`Missing fields: ${missingFields.join(', ')}`);
    }

    if (!(await comparePassword(oldPassword, req.user.passwordHash))) {
      throw ApiError.badRequest('Old password is incorrect');
    }

    const passwordError = validatePasswordPair(password, confirmation);

    if (passwordError) {
      throw ApiError.badRequest(passwordError);
    }

    req.user.passwordHash = await hashPassword(password);
    await req.user.save();
    await AuthToken.destroy({ where: { userId: req.user.id } });
    clearAuthCookies(res);

    res.json({
      message: 'Password has been changed. Please login again.',
    });
  }),

  requestEmailChange: asyncHandler(async (req, res) => {
    const { password, newEmail } = req.body;
    const missingFields = requireFields(req.body, ['password', 'newEmail']);

    if (missingFields.length > 0) {
      throw ApiError.badRequest(`Missing fields: ${missingFields.join(', ')}`);
    }

    if (!isValidEmail(newEmail)) {
      throw ApiError.badRequest('New email is invalid');
    }

    if (!(await comparePassword(password, req.user.passwordHash))) {
      throw ApiError.badRequest('Password is incorrect');
    }

    const normalizedEmail = newEmail.toLowerCase();

    if (normalizedEmail === req.user.email) {
      throw ApiError.badRequest('New email must be different');
    }

    const existingUser = await User.findOne({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingUser) {
      throw ApiError.badRequest('Email is already used');
    }

    const token = await createEmailToken({
      userId: req.user.id,
      type: 'email_change',
      newEmail: normalizedEmail,
      expiresAt: daysFromNow(1),
    });

    await sendMail({
      to: normalizedEmail,
      subject: 'Confirm your new email',
      html: `<p>Confirm this email for your account: <a href="${getConfirmEmailLink(
        token,
      )}">confirm email</a></p>`,
    });

    await sendMail({
      to: req.user.email,
      subject: 'Email change requested',
      html: '<p>A request to change your account email was created. If it was not you, change your password.</p>',
    });

    res.json({
      message: 'Confirmation email has been sent to your new address.',
    });
  }),

  confirmEmailChange: asyncHandler(async (req, res) => {
    const emailToken = await consumeEmailToken({
      token: req.params.token,
      type: 'email_change',
    });

    if (!emailToken || !emailToken.newEmail) {
      throw ApiError.badRequest(
        'Email confirmation link is invalid or expired',
      );
    }

    const user = await User.findByPk(emailToken.userId);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const existingUser = await User.findOne({
      where: {
        email: emailToken.newEmail,
      },
    });

    if (existingUser) {
      throw ApiError.badRequest('Email is already used');
    }

    user.email = emailToken.newEmail;
    await user.save();
    await AuthToken.destroy({ where: { userId: user.id } });
    clearAuthCookies(res);

    res.json({
      message: 'Email has been changed. Please login again.',
    });
  }),
};

module.exports = { profileController };
