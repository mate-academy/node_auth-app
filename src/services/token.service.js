'use strict';

const nodeCrypto = require('crypto');

const { Token } = require('../models');

const TOKEN_TYPES = {
  ACTIVATION: 'activation',
  RESET_PASSWORD: 'resetPassword',
  EMAIL_CHANGE: 'emailChange',
  REFRESH: 'refresh',
};

const TOKEN_LIFETIME_HOURS = {
  [TOKEN_TYPES.ACTIVATION]: 24,
  [TOKEN_TYPES.RESET_PASSWORD]: 1,
  [TOKEN_TYPES.EMAIL_CHANGE]: 1,
  [TOKEN_TYPES.REFRESH]: 24 * 30,
};

class TokenService {
  generateValue() {
    return nodeCrypto.randomBytes(32).toString('hex');
  }

  getExpirationDate(type) {
    const expiresAt = new Date();

    expiresAt.setHours(expiresAt.getHours() + TOKEN_LIFETIME_HOURS[type]);

    return expiresAt;
  }

  async create(userId, type, newEmail = null) {
    return Token.create({
      token: this.generateValue(),
      type,
      newEmail,
      userId,
      expiresAt: this.getExpirationDate(type),
    });
  }

  async createUnique(userId, type, newEmail = null) {
    await this.removeAllOfType(userId, type);

    return this.create(userId, type, newEmail);
  }

  async find(tokenValue, type) {
    if (!tokenValue) {
      return null;
    }

    return Token.findOne({
      where: {
        token: tokenValue,
        type,
      },
    });
  }

  async findValid(tokenValue, type) {
    const token = await this.find(tokenValue, type);

    if (!token) {
      return null;
    }

    if (token.expiresAt < new Date()) {
      await token.destroy();

      return null;
    }

    return token;
  }

  async removeAllOfType(userId, type) {
    await Token.destroy({
      where: {
        userId,
        type,
      },
    });
  }

  async createActivationToken(userId) {
    return this.createUnique(userId, TOKEN_TYPES.ACTIVATION);
  }

  async createResetPasswordToken(userId) {
    return this.createUnique(userId, TOKEN_TYPES.RESET_PASSWORD);
  }

  async createEmailChangeToken(userId, newEmail) {
    return this.createUnique(userId, TOKEN_TYPES.EMAIL_CHANGE, newEmail);
  }

  async createRefreshToken(userId) {
    return this.create(userId, TOKEN_TYPES.REFRESH);
  }
}

const tokenService = new TokenService();

module.exports = {
  TOKEN_TYPES,
  tokenService,
};
