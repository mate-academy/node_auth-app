'use strict';

const bcrypt = require('bcrypt');

const { User } = require('../models');
const { emailService } = require('./email.service');
const { tokenService, TOKEN_TYPES } = require('./token.service');
const { validatePassword } = require('../utils/validatePassword');
const { validateEmail } = require('../utils/validateEmail');
const { normalizeUser } = require('../utils/normalizeUser');
const { ApiError } = require('../utils/ApiError');
const { jwtService } = require('./jwt.service');

class AuthService {
  async register({ name, email, password }) {
    if (!name || typeof name !== 'string' || !name.trim()) {
      throw ApiError.badRequest('Name is required');
    }

    if (!validateEmail(email)) {
      throw ApiError.badRequest('Email is not valid');
    }

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    const passwordErrors = validatePassword(password);

    if (passwordErrors.length > 0) {
      throw ApiError.badRequest(
        'Password does not meet the requirements',
        passwordErrors,
      );
    }

    const existingUser = await User.findOne({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingUser) {
      throw ApiError.conflict('Email is already in use');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password: passwordHash,
    });

    try {
      const activationToken = await tokenService.createActivationToken(user.id);

      await emailService.sendActivationEmail(user.email, activationToken.token);
    } catch (error) {
      await user.destroy();

      throw new ApiError(500, 'Failed to send activation email');
    }

    return normalizeUser(user);
  }

  async activate(tokenValue) {
    if (!tokenValue) {
      throw ApiError.badRequest('Activation token is required');
    }

    const activationToken = await tokenService.findValid(
      tokenValue,
      TOKEN_TYPES.ACTIVATION,
    );

    if (!activationToken) {
      throw ApiError.badRequest('Activation token is invalid or has expired');
    }

    const user = await User.findByPk(activationToken.userId);

    if (!user) {
      await activationToken.destroy();

      throw ApiError.notFound('User not found');
    }

    user.isActive = true;

    await user.save();
    await activationToken.destroy();

    return this.createSession(user);
  }

  async login({ email, password }) {
    if (!email || typeof email !== 'string') {
      throw ApiError.badRequest('Email is required');
    }

    if (!password || typeof password !== 'string') {
      throw ApiError.badRequest('Password is required');
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      where: {
        email: normalizedEmail,
      },
    });

    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('Please activate your email');
    }

    return this.createSession(user);
  }

  async refresh(refreshTokenValue) {
    if (!refreshTokenValue) {
      throw ApiError.unauthorized('Refresh token is required');
    }

    const refreshToken = await tokenService.findValid(
      refreshTokenValue,
      TOKEN_TYPES.REFRESH,
    );

    if (!refreshToken) {
      throw ApiError.unauthorized('Refresh token is invalid or has expired');
    }

    const user = await User.findByPk(refreshToken.userId);

    if (!user) {
      await refreshToken.destroy();

      throw ApiError.unauthorized('User not found');
    }

    await refreshToken.destroy();

    return this.createSession(user);
  }

  async logout(refreshTokenValue) {
    const refreshToken = await tokenService.find(
      refreshTokenValue,
      TOKEN_TYPES.REFRESH,
    );

    if (refreshToken) {
      await refreshToken.destroy();
    }
  }

  async requestPasswordReset(email) {
    if (!validateEmail(email)) {
      throw ApiError.badRequest('Email is not valid');
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      where: {
        email: normalizedEmail,
      },
    });

    if (!user) {
      return;
    }

    const resetToken = await tokenService.createResetPasswordToken(user.id);

    await emailService.sendResetPasswordEmail(user.email, resetToken.token);
  }

  async resetPassword(tokenValue, password, confirmation) {
    if (!tokenValue) {
      throw ApiError.badRequest('Reset token is required');
    }

    if (password !== confirmation) {
      throw ApiError.badRequest('Passwords do not match');
    }

    const passwordErrors = validatePassword(password);

    if (passwordErrors.length > 0) {
      throw ApiError.badRequest(
        'Password does not meet the requirements',
        passwordErrors,
      );
    }

    const resetToken = await tokenService.findValid(
      tokenValue,
      TOKEN_TYPES.RESET_PASSWORD,
    );

    if (!resetToken) {
      throw ApiError.badRequest('Reset token is invalid or has expired');
    }

    const user = await User.findByPk(resetToken.userId);

    if (!user) {
      await resetToken.destroy();

      throw ApiError.notFound('User not found');
    }

    user.password = await bcrypt.hash(password, 10);

    await user.save();
    await resetToken.destroy();
    await tokenService.removeAllOfType(user.id, TOKEN_TYPES.REFRESH);

    await emailService.sendPasswordChangeNotification(user.email);
  }

  async createSession(user) {
    const refreshToken = await tokenService.createRefreshToken(user.id);

    return {
      user: normalizeUser(user),
      accessToken: jwtService.generate(user.id),
      refreshToken: refreshToken.token,
    };
  }
}

const authService = new AuthService();

module.exports = {
  authService,
};
