'use strict';

const { AuthService } = require('./auth.service.js');
const { SignupService } = require('./signup.service.js');
const { ResetService } = require('./reset.service.js');

const { userService } = require('../user/user.js');
const { tokenService } = require('../token/token.js');
const { emailService } = require('../email/email.js');

const authService = new AuthService(
  userService,
  tokenService,
);

const signupService = new SignupService(
  userService,
  authService,
  tokenService,
  emailService,
);

const resetService = new ResetService(
  userService,
  tokenService,
  emailService,
);

module.exports = {
  authService,
  signupService,
  resetService,
};
