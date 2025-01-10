'use strict';

const { Token } = require('./schema/token');

function findOne(userId) {
  return Token.findOne({ where: { userId } });
}

function getByToken(refreshToken) {
  return Token.findOne({ where: { refreshToken } });
}

function remove(userId) {
  return Token.destroy({ where: { userId } });
}

module.exports = {
  findOne,
  getByToken,
  remove,
};
