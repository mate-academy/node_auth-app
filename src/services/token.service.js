'use strict';

const { Token } = require('../models/token');

async function save(userId, refreshToken) {
  const token = await Token.findOne({
    where: { userId },
  });

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
  return Token.findOne({ where: { refreshToken } });
}

function remove(userId) {
  return Token.destroy({ where: { userId } });
}

const tokenService = {
  save,
  getByToken,
  remove,
};

module.exports = {
  tokenService,
};
