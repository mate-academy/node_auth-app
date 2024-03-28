'use strict';

const { UserAccessService } = require('./user-access.service.js');
const { userService } = require('../user/user.js');
const { emailService } = require('../email/email.js');
const { tokenService } = require('../token/token.js');
const { authService } = require('../auth/auth.js');

const userAccessService = new UserAccessService(
  userService,
  authService,
  tokenService,
  emailService,
);

module.exports = {
  userAccessService,
};
