'use strict';

const bcrypt = require('bcrypt');

const { User } = require('../models');
const { emailService } = require('./email.service');
const { tokenService, TOKEN_TYPES } = require('./token.service');
const { validatePassword } = require('../utils/validatePassword');
const { validateEmail } = require('../utils/validateEmail');
const { normalizeUser } = require('../utils/normalizeUser');
const { ApiError } = require('../utils/ApiError');

class ProfileService {
  async changeName(user, name) {
    if (!name || typeof name !== 'string' || !name.trim()) {
      throw ApiError.badRequest('Name is required');
    }

    user.name = name.trim();

    await user.save();

    return normalizeUser(user);
  }

  async changePassword(user, { oldPassword, newPassword, confirmation }) {
    if (!oldPassword || typeof oldPassword !== 'string') {
      throw ApiError.badRequest('Old password is required');
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordValid) {
      throw ApiError.unauthorized('Old password is wrong');
    }

    if (newPassword !== confirmation) {
      throw ApiError.badRequest('Passwords do not match');
    }

    const passwordErrors = validatePassword(newPassword);

    if (passwordErrors.length > 0) {
      throw ApiError.badRequest(
        'Password does not meet the requirements',
        passwordErrors,
      );
    }

    user.password = await bcrypt.hash(newPassword, 10);

    await user.save();

    await emailService.sendPasswordChangeNotification(user.email);

    return normalizeUser(user);
  }

  async requestEmailChange(user, { email, password }) {
    if (!password || typeof password !== 'string') {
      throw ApiError.badRequest('Password is required');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw ApiError.unauthorized('Password is wrong');
    }

    if (!validateEmail(email)) {
      throw ApiError.badRequest('Email is not valid');
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedEmail === user.email) {
      throw ApiError.badRequest('New email is the same as the current one');
    }

    const existingUser = await User.findOne({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingUser) {
      throw ApiError.conflict('Email is already in use');
    }

    const emailToken = await tokenService.createEmailChangeToken(
      user.id,
      normalizedEmail,
    );

    await emailService.sendEmailChangeConfirmation(
      normalizedEmail,
      emailToken.token,
    );
  }

  async confirmEmailChange(tokenValue) {
    if (!tokenValue) {
      throw ApiError.badRequest('Confirmation token is required');
    }

    const emailToken = await tokenService.findValid(
      tokenValue,
      TOKEN_TYPES.EMAIL_CHANGE,
    );

    if (!emailToken) {
      throw ApiError.badRequest('Confirmation token is invalid or has expired');
    }

    const user = await User.findByPk(emailToken.userId);

    if (!user) {
      await emailToken.destroy();

      throw ApiError.notFound('User not found');
    }

    const existingUser = await User.findOne({
      where: {
        email: emailToken.newEmail,
      },
    });

    if (existingUser) {
      await emailToken.destroy();

      throw ApiError.conflict('Email is already in use');
    }

    const oldEmail = user.email;

    user.email = emailToken.newEmail;

    await user.save();
    await emailToken.destroy();

    await emailService.sendEmailChangeNotification(oldEmail, user.email);

    return normalizeUser(user);
  }
}

const profileService = new ProfileService();

module.exports = {
  profileService,
};
