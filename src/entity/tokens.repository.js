'use strict';

const { db } = require('../utils/db.js');

function save(userId, token) {
  return db.token.upsert({
    where: { userId },
    update: { token },
    create: { userId, token },
  });
}

function getByToken(token) {
  return db.token.findFirst({ where: { token } });
}

function remove(userId) {
  return db.token.deleteMany({ where: { userId } });
}

module.exports = {
  tokensRepository: {
    save,
    getByToken,
    remove,
  },
};
