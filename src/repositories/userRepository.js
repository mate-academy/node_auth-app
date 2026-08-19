'use strict';

const { Op } = require('sequelize');

const { User } = require('../models');

function createUserRepository() {
  return {
    create(data) {
      return User.create(data);
    },

    findById(id) {
      return User.findByPk(id);
    },

    findByEmail(email) {
      return User.findOne({ where: { email } });
    },

    findByActivationTokenHash(tokenHash, now = new Date()) {
      return User.findOne({
        where: {
          activationTokenHash: tokenHash,
          activationTokenExpiresAt: { [Op.gt]: now },
        },
      });
    },

    findByResetTokenHash(tokenHash, now = new Date()) {
      return User.findOne({
        where: {
          resetTokenHash: tokenHash,
          resetTokenExpiresAt: { [Op.gt]: now },
        },
      });
    },

    async emailExistsForOtherUser(email, userId) {
      const user = await User.findOne({ where: { email } });

      return Boolean(user && user.id !== userId);
    },

    save(user) {
      return user.save();
    },
  };
}

module.exports = createUserRepository;
