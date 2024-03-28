'use strict';

const { EmailSubjects, ErrorMessages } = require('../../libs/enums/enums.js');
const { ApiError } = require('../../libs/exceptions/api-error.js');
const {
  getEditEmailRequestTemplate,
  getEmailEditedTemplate,
} = require('../../libs/email-templates/email-templates.js');
const { sequelize } = require('../../libs/db/database.js');

class ProfileService {
  constructor(
    userService,
    tokenService,
    authService,
    emailService,
  ) {
    this.userService = userService;
    this.tokenService = tokenService;
    this.authService = authService;
    this.emailService = emailService;
  }

  async editUsername(id, username) {
    const user = await this.userService.getById(id);

    if (!user) {
      throw ApiError.NotFound();
    }

    user.username = username;
    await user.save();

    return this.authService.authenticate(user);
  }

  async editPassword(id, newPassword, oldPassword) {
    const user = await this.userService.getById(id);

    if (!user) {
      throw ApiError.NotFound();
    }

    await this.authService.verifyPassword(oldPassword, user.password);

    user.password = newPassword;
    await user.save();

    return this.authService.authenticate(user);
  }

  async editEmailRequest(id, email, password) {
    const user = await this.userService.getById(id);

    if (!user) {
      throw ApiError.NotFound();
    }

    await this.authService.verifyEmailExistance(email);
    await this.authService.verifyPassword(password, user.password);

    const emailPayload = {
      id,
      newEmail: email,
      oldEmail: user.email,
    };

    const token = await this.tokenService.generateNewEmailToken(emailPayload);

    if (!token) {
      throw ApiError.NotFound();
    }

    await this.emailService.send({
      email,
      subject: EmailSubjects.EDIT_EMAIL_REQUEST,
      html: getEditEmailRequestTemplate(token.newEmailToken),
    });
  }

  async editEmail(newEmailToken, refreshToken) {
    const emailData = await this.tokenService.getNewEmailTokenPayload(
      newEmailToken
    );

    if (!emailData) {
      throw ApiError.BadRequest(ErrorMessages.INVALID_TOKEN);
    }

    const { id, newEmail, oldEmail } = emailData;

    await sequelize.transaction(async(transaction) => {
      await this.userService.update(id, { email: newEmail }, { transaction });
      await this.tokenService.removeNewEmailToken(id, { transaction });

      await this.emailService.send({
        email: oldEmail,
        subject: EmailSubjects.EMAIL_EDITED,
        html: getEmailEditedTemplate(newEmail),
      });
    });

    if (refreshToken) {
      return this.authService.refresh(refreshToken);
    }

    return null;
  }
}

module.exports = {
  ProfileService,
};
