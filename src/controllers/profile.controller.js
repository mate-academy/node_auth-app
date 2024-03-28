'use strict';

const { ErrorMessages } = require('../libs/enums/enums.js');
const { ApiError } = require('../libs/exceptions/api-error.js');
const { sendAuthentication } = require('./helpers/helpers.js');

class ProfileController {
  constructor(profileService) {
    this.profileService = profileService;
  }

  async editUsername(req, res) {
    const { id } = req.tokenUserData;
    const { username } = req.body;

    const authData = await this.profileService.editUsername(id, username);

    sendAuthentication(res, authData);
  }

  async editPassword(req, res) {
    const { id } = req.tokenUserData;
    const { password, oldPassword } = req.body;

    const authData = await this.profileService.editPassword(
      id,
      password,
      oldPassword
    );

    sendAuthentication(res, authData);
  }

  async editEmailRequest(req, res) {
    const { id } = req.tokenUserData;

    const { password, email } = req.body;

    await this.profileService.editEmailRequest(id, email, password);

    res.send({ message: 'OK' });
  }

  async editEmail(req, res) {
    const { newEmailToken } = req.body;
    const { refreshToken } = req.cookies;

    if (!newEmailToken) {
      throw ApiError.BadRequest(ErrorMessages.INVALID_TOKEN);
    }

    const authData = await this.profileService.editEmail(
      newEmailToken,
      refreshToken,
    );

    if (authData) {
      sendAuthentication(res, authData);

      return;
    }

    res.send({ message: 'OK' });
  }
}

module.exports = {
  ProfileController,
};
