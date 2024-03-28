'use strict';

const { ApiError } = require('../../libs/exceptions/api-error.js');
const { ErrorMessages } = require('../../libs/enums/enums.js');
const { verifyHash } = require('../../libs/helpers/helpers.js');

class AuthService {
  constructor(userService, tokenService) {
    this.userService = userService;
    this.tokenService = tokenService;
  }

  async authenticate(user) {
    const userData = this.userService.getNormalizedUser(user);

    const accessToken = this.tokenService.generateAccessToken(userData);
    const token = await this.tokenService.generateRefreshToken(userData);

    if (!token) {
      throw ApiError.NotFound();
    }

    return {
      user: userData,
      accessToken,
      refreshToken: token.refreshToken,
    };
  }

  async login({ email, password }) {
    const user = await this.verifyLoginCredentials(email, password);

    return this.authenticate(user);
  }

  async logout(refreshToken) {
    const userData = await this.tokenService.getRefreshTokenPayload(
      refreshToken
    );

    if (userData) {
      const userId = userData.id;

      await this.tokenService.removeRefreshToken(userId);
    }
  }

  async refresh(refreshToken) {
    const userData = await this.tokenService.getRefreshTokenPayload(
      refreshToken
    );

    if (!userData) {
      return null;
    }

    const user = await this.userService.getById(userData.id);

    if (!user) {
      return null;
    }

    return this.authenticate(user);
  }

  async verifyLoginCredentials(email, password) {
    const user = await this.userService.getWithToken(email);

    if (!user) {
      throw ApiError.BadRequest(ErrorMessages.USER_NO_EXIST);
    }

    if (user.token.activationToken) {
      throw ApiError.BadRequest(ErrorMessages.USER_NO_ACTIVE);
    }

    await this.verifyPassword(password, user.password);

    return user;
  }

  async verifyPassword(password, passwordHash) {
    const isPasswordValid = await verifyHash(password, passwordHash);

    if (!isPasswordValid) {
      throw ApiError.BadRequest(ErrorMessages.VALIDATION, {
        password: ErrorMessages.WRONG_PASSWORD,
      });
    }
  }

  async verifyEmailExistance(email) {
    const user = await this.userService.getWithToken(email);

    if (user) {
      throw ApiError.BadRequest(ErrorMessages.VALIDATION, {
        email: ErrorMessages.EMAIL_TAKEN,
      });
    }
  }
}

module.exports = {
  AuthService,
};
