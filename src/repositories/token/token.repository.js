'use strict';

const { Op } = require('sequelize');
const { AbstractRepository } = require('../../libs/db/abstract.repository.js');

class TokenRepository extends AbstractRepository {
  async getByUserId(userId) {
    return this.model.findOne({
      where: { userId },
    });
  }

  async getByTokenValue(tokenValue) {
    return this.model.findOne({
      where: {
        [Op.or]: [
          { activationToken: tokenValue },
          { refreshToken: tokenValue },
          { resetToken: tokenValue },
          { newEmailToken: tokenValue },
        ],
      },
    });
  }
}

module.exports = {
  TokenRepository,
};
