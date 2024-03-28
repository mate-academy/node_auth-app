'use strict';

const { ProfileService } = require('./profile.service.js');

const { userService } = require('../user/user.js');
const { tokenService } = require('../token/token.js');
const { authService } = require('../auth/auth.js');
const { emailService } = require('../email/email.js');

const profileService = new ProfileService(
  userService,
  tokenService,
  authService,
  emailService,
);

module.exports = {
  profileService,
};
