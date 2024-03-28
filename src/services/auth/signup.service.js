'use strict';

const { sequelize } = require('../../libs/db/database.js');
const { EmailSubjects, ErrorMessages } = require('../../libs/enums/enums.js');
const {
  getActivationTemplate,
} = require('../../libs/email-templates/email-templates.js');
const { ApiError } = require('../../libs/exceptions/api-error.js');

class SignupService {
  constructor(userService, authService, tokenService, emailService) {
    this.userService = userService;
    this.authService = authService;
    this.tokenService = tokenService;
    this.emailService = emailService;
  }

  async signup({ username, email, password }) {
    await this.authService.verifyEmailExistance(email);

    await sequelize.transaction(async(transaction) => {
      const createdUser = await this.userService.create({
        username,
        email,
        password,
      }, { transaction });

      const activationToken = await this.tokenService.createWithActivationToken(
        createdUser.id,
        { transaction }
      );

      const subject = EmailSubjects.ACTIVATION;
      const html = getActivationTemplate(activationToken);

      await this.emailService.send({
        email, subject, html,
      });
    });
  }

  async activate(activationToken) {
    const token = await this.tokenService.removeActivationToken(
      activationToken
    );

    if (!token) {
      throw ApiError.BadRequest(ErrorMessages.INVALID_TOKEN);
    }

    const user = await this.userService.getById(token.userId);

    return this.authService.authenticate(user);
  }
}

module.exports = {
  SignupService,
};
