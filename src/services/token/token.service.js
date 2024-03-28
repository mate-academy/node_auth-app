'use strict';

const uuidv4 = require('uuid').v4;

const { Tokens } = require('../../libs/enums/tokens.enum.js');
const { JwtService } = require('./jwt.service.js');

class TokenService extends JwtService {
  constructor(tokenRepository) {
    super();

    this.tokenRepository = tokenRepository;
  }

  async create(userId, options = {}) {
    return this.tokenRepository.create({ userId }, options);
  }

  async createWithActivationToken(userId, options = {}) {
    const activationToken = uuidv4();

    await this.tokenRepository.create({
      userId,
      activationToken,
    }, options);

    return activationToken;
  }

  async removeActivationToken(tokenValue) {
    return this.removeToken(
      Tokens.ACTIVATION_TOKEN,
      { tokenValue },
    );
  }

  async generateResetToken(userId) {
    const resetToken = uuidv4();

    return this.saveToken(Tokens.RESET_TOKEN, userId, resetToken);
  }

  async removeResetToken(tokenValue, options) {
    return this.removeToken(
      Tokens.RESET_TOKEN,
      { tokenValue },
      options
    );
  }

  async isResetTokenExist(tokenValue) {
    return this.isTokenExist(Tokens.RESET_TOKEN, tokenValue);
  }

  generateAccessToken(payload) {
    return this.generateJwtToken(Tokens.ACCESS_TOKEN, payload);
  }

  getAccessTokenPayload(tokenValue) {
    return this.validateJwtToken(Tokens.ACCESS_TOKEN, tokenValue);
  }

  async generateRefreshToken(payload) {
    const refreshToken = this.generateJwtToken(Tokens.REFRESH_TOKEN, payload);

    const userId = payload.id;

    return this.saveToken(Tokens.REFRESH_TOKEN, userId, refreshToken);
  }

  async getRefreshTokenPayload(tokenValue) {
    const userData = this.validateJwtToken(Tokens.REFRESH_TOKEN, tokenValue);

    const isTokenExist = await this.isTokenExist(
      Tokens.REFRESH_TOKEN,
      tokenValue
    );

    if (!isTokenExist) {
      return null;
    }

    return userData;
  }

  async removeRefreshToken(userId) {
    return this.removeToken(
      Tokens.REFRESH_TOKEN,
      { userId },
    );
  }

  async generateNewEmailToken(payload) {
    const newEmailToken = this.generateJwtToken(
      Tokens.NEW_EMAIL_TOKEN,
      payload
    );

    const userId = payload.id;

    return this.saveToken(Tokens.NEW_EMAIL_TOKEN, userId, newEmailToken);
  }

  async getNewEmailTokenPayload(tokenValue) {
    const userData = this.validateJwtToken(Tokens.NEW_EMAIL_TOKEN, tokenValue);

    const isTokenExist = await this.isTokenExist(
      Tokens.NEW_EMAIL_TOKEN,
      tokenValue
    );

    if (!isTokenExist) {
      return null;
    }

    return userData;
  }

  async removeNewEmailToken(userId, options) {
    return this.removeToken(
      Tokens.NEW_EMAIL_TOKEN,
      { userId },
      options
    );
  }

  async saveToken(tokenType, userId, tokenValue) {
    const token = await this.tokenRepository.getByUserId(userId);

    if (!token) {
      return null;
    }

    token[tokenType] = tokenValue;
    await token.save();

    return token;
  }

  async removeToken(tokenType, selector, options = {}) {
    const { tokenValue, userId } = selector;

    const token = tokenValue
      ? await this.tokenRepository.getByTokenValue(tokenValue)
      : await this.tokenRepository.getByUserId(userId);

    if (!token) {
      return null;
    }

    token[tokenType] = null;
    await token.save(options);

    return token;
  }

  async isTokenExist(tokenType, tokenValue) {
    const token = await this.tokenRepository.getByTokenValue(tokenValue);

    return Boolean(token) && Boolean(token[tokenType]);
  }
}

module.exports = {
  TokenService,
};
