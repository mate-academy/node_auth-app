'use strict';

const { Tokens } = require('../libs/enums/enums.js');
const { ApiError } = require('../libs/exceptions/api-error.js');
const { sendAuthentication } = require('./helpers/helpers.js');

class AuthController {
  constructor(authService, signupService, resetService) {
    this.authService = authService;
    this.signupService = signupService;
    this.resetService = resetService;
  }

  async signup(req, res) {
    const { body } = req;

    await this.signupService.signup(body);

    res.send({ message: 'OK' });
  }

  async activate(req, res) {
    const { activationToken } = req.params;

    const authData = await this.signupService.activate(activationToken);

    sendAuthentication(res, authData);
  }

  async login(req, res) {
    const { body } = req;

    const authData = await this.authService.login(body);

    sendAuthentication(res, authData);
  }

  async logout(req, res) {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      throw ApiError.Unauthorized();
    }

    await this.authService.logout(refreshToken);

    res.clearCookie(Tokens.REFRESH_TOKEN);

    res.sendStatus(204);
  }

  async refresh(req, res) {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      throw ApiError.Unauthorized();
    }

    const authData = await this.authService.refresh(refreshToken);

    if (!authData) {
      throw ApiError.Unauthorized();
    }

    sendAuthentication(res, authData);
  }

  async requestReset(req, res) {
    const { body } = req;

    await this.resetService.requestReset(body);

    res.send({ message: 'OK' });
  }

  async verifyResetToken(req, res) {
    const { resetToken } = req.params;

    await this.resetService.verifyResetToken(resetToken);

    res.send({ message: 'OK' });
  }

  async reset(req, res) {
    const { body } = req;
    const { resetToken } = req.params;

    await this.resetService.reset(resetToken, body);

    res.send({ message: 'OK' });
  }
}

module.exports = {
  AuthController,
};
