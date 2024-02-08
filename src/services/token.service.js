'use strict';

const { Token } = require('../models/Token.js');

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
};

async function getByToken(refreshToken) {
  const foundToken = await Token.findOne({ where: { refreshToken } });

  return foundToken;
}

function remove(userId) {
  return Token.destroy({ where: { userId } });
}

const tokenService = {
  save,
  getByToken,
  remove,
};

module.exports = { tokenService };
