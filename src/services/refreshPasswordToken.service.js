'use strict';

const { RefreshPasswordToken }
= require('../models/refreshPasswordToken.model.js');

async function save(userId, refreshToken) {
  const token = await RefreshPasswordToken.findOne({
    where: { userId },
  });

  if (token) {
    token.refreshPasswordToken = refreshToken;
    token.save();

    return token;
  }

  const newToken = await RefreshPasswordToken.create({
    userId,
    refreshPasswordToken: refreshToken,
  });

  return newToken;
}

function getByToken(refreshToken) {
  return RefreshPasswordToken.findOne({
    where: { refreshPasswordToken: refreshToken },
  });
}

module.exports = {
  save,
  getByToken,
};
