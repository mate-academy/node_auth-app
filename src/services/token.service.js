'use strict';

const { Token } = require('../models/Token.model');

async function save(userID, newToken) {
  const token = await Token.findOne({ where: { UserId: userID } });

  if (!token) {
    await Token.create({ UserId: userID, refreshToken: newToken });

    return;
  }

  token.refreshToken = newToken;
  await token.save();
}

function getByToken(refreshToken) {
  return Token.findOne({ where: { refreshToken } });
}

function remove(userID) {
  return Token.destroy({ where: { UserId: userID } });
}

module.exports = {
  save,
  getByToken,
  remove,
};
