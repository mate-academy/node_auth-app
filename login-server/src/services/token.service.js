'use strict';

const { Token } = require('../models/token');

async function save(userId, newToken) {
  const token = await Token.findOne({ where: { userId } });

  if (!token) {
    await Token.create({
      userId, refreshToken: newToken,
    });

    return;
  }

  token.refreshToken = newToken;

  await token.save();
}

function getByToken(refreshToken) {
  return Token.findOne({ where: { refreshToken } });
}

function remove(userId) {
  Token.destroy({ where: { userId } });
}

module.exports = {
  save,
  getByToken,
  remove,
};
