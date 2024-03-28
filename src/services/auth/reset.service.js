'use strict';

const { ApiError } = require('../../libs/exceptions/api-error.js');
const { EmailSubjects, ErrorMessages } = require('../../libs/enums/enums.js');
const {
  getPasswordResetTemplate,
} = require('../../libs/email-templates/email-templates.js');
const { sequelize } = require('../../libs/db/database.js');

class ResetService {
  constructor(userService, tokenService, emailService) {
    this.userService = userService;
    this.tokenService = tokenService;
    this.emailService = emailService;
  }

  async requestReset({ email }) {
    const user = await this.userService.getWithToken(email);

    if (!user || user.token.activationToken) {
      throw ApiError.BadRequest(ErrorMessages.VALIDATION, {
        email: ErrorMessages.USER_NO_EXIST,
      });
    }

    const token = await this.tokenService.generateResetToken(user.id);

    if (!token) {
      throw ApiError.NotFound();
    }

    const subject = EmailSubjects.PASSWORD_RESET;
    const html = getPasswordResetTemplate(token.resetToken);

    this.emailService.send({
      email, subject, html,
    });
  }

  async verifyResetToken(resetToken) {
    const isTokenExist = await this.tokenService.isResetTokenExist(resetToken);

    if (!isTokenExist) {
      throw ApiError.BadRequest(ErrorMessages.INVALID_TOKEN);
    }
  }

  async reset(resetToken, { password }) {
    await sequelize.transaction(async(transaction) => {
      const token = await this.tokenService.removeResetToken(
        resetToken,
        { transaction },
      );

      if (!token) {
        throw ApiError.BadRequest(ErrorMessages.INVALID_TOKEN);
      }

      await this.userService.update(
        token.userId,
        { password },
        { transaction },
      );
    });
  }
}

module.exports = {
  ResetService,
};
