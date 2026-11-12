'use strict';

const { Token } = require('../models/Token');

async function save(userId, refreshToken) {
  await Token.destroy({ where: { userId } });

  await Token.create({ userId, refreshToken });
}

function findByToken(refreshToken) {
  return Token.findOne({ where: { refreshToken } });
}

function remove(userId) {
  return Token.destroy({ where: { userId } });
}

module.exports = {
  save,
  findByToken,
  remove,
};
