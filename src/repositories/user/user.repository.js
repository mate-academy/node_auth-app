'use strict';

const { AbstractRepository } = require('../../libs/db/abstract.repository.js');
const { Token } = require('../../models/token.model.js');

class UserRepository extends AbstractRepository {
  async getAll() {
    return this.model.findAll({
      order: ['id'],
      include: [{
        model: Token,
        where: {
          activationToken: null,
        },
      },
      ],
    });
  }

  async getWithToken(email) {
    return this.model.findOne({
      where: { email },
      include: [{ model: Token }],
    });
  }
}

module.exports = {
  UserRepository,
};
