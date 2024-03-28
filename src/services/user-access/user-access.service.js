'use strict';

const { sequelize } = require('../../libs/db/database.js');
const {
  getActivationTemplate,
} = require('../../libs/email-templates/activation.template.js');
const { UserRoles, EmailSubjects } = require('../../libs/enums/enums.js');
const { ApiError } = require('../../libs/exceptions/api-error.js');

class UserAccessService {
  constructor(userService, authService, tokenService, emailService) {
    this.userService = userService;
    this.authService = authService;
    this.tokenService = tokenService;
    this.emailService = emailService;
  }

  async getAll() {
    const users = await this.userService.getAll();

    return users.map(user => this.userService.getNormalizedUser(user));
  }

  async getById(id) {
    const user = await this.userService.getById(id);

    if (!user) {
      throw ApiError.NotFound();
    }

    return this.userService.getNormalizedUser(user);
  }

  async create({ username, email, password, role }) {
    await this.authService.verifyEmailExistance(email);

    const user = await sequelize.transaction(async(transaction) => {
      const createdUser = await this.userService.create({
        username,
        email,
        password,
      }, { transaction });

      const userId = createdUser.id;

      if (role === UserRoles.ADMIN) {
        await this.tokenService.create(userId, { transaction });

        return createdUser;
      }

      const activationToken = await this.tokenService.createWithActivationToken(
        createdUser.id,
        { transaction }
      );

      const subject = EmailSubjects.ACTIVATION;
      const html = getActivationTemplate(activationToken);

      await this.emailService.send({
        email, subject, html,
      });

      return createdUser;
    });

    return this.userService.getNormalizedUser(user);
  }

  async remove(id) {
    const count = await this.userService.remove(id);

    if (!count) {
      throw ApiError.NotFound();
    }
  }

  async update(id, data) {
    if (data.email) {
      await this.authService.verifyEmailExistance(data.email);
    }

    const [count] = await this.userService.update(id, data);

    if (!count) {
      throw ApiError.NotFound();
    }

    const user = await this.userService.getById(id);

    return this.userService.getNormalizedUser(user);
  }
}

module.exports = {
  UserAccessService,
};
