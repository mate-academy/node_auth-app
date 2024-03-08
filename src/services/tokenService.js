'use strict';

const { Token } = require('../models/Token.js');

async function save(userId, refreshToken) {
  const foundToken = await Token.findOne({ where: { userId } });

  if (foundToken) {
    foundToken.refreshToken = refreshToken;

    await foundToken.save();

    return;
  }

  await Token.create({
    refreshToken, userId,
  });
}

async function removeByUserId(userId) {
  return Token.destroy({ where: { userId } });
}

function getByToken(refreshToken) {
  return Token.findOne({ where: { refreshToken } });
}

module.exports = {
  tokenService: {
    save, removeByUserId, getByToken,
  },
};
