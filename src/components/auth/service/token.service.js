'use strict';

const AuthRepository = require('../auth.repository');
const { Token } = require('../schema/token');

async function save(userId, refreshToken) {
  const token = await AuthRepository.findOne(userId);

  if (token) {
    token.refreshToken = refreshToken;

    await token.save();

    return;
  }

  await Token.create({
    userId,
    refreshToken,
  });
}

function getByToken(refreshToken) {
  return AuthRepository.getByToken(refreshToken);
}

function remove(userId) {
  return AuthRepository.remove(userId);
}

module.exports = {
  save,
  getByToken,
  remove,
};
