'use strict';

const { Session, User } = require('../models');

function createSessionRepository() {
  return {
    create(data) {
      return Session.create(data);
    },

    findByTokenHash(tokenHash) {
      return Session.findOne({
        where: { tokenHash },
        include: [
          {
            model: User,
            as: 'user',
          },
        ],
      });
    },

    deleteByTokenHash(tokenHash) {
      return Session.destroy({ where: { tokenHash } });
    },

    deleteAllForUser(userId) {
      return Session.destroy({ where: { userId } });
    },
  };
}

module.exports = createSessionRepository;
