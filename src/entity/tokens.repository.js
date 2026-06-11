'use strict';

const { db } = require('../utils/db.js');

function create(userId, token) {
  return db.token.create({
    data: { userId, token },
  });
}

function getByToken(token) {
  return db.token.findFirst({
    where: { token },
  });
}

function deleteByUserId(userId) {
  return db.token.delete({
    where: { userId },
  });
}

const tokensRepository = { create, getByToken, deleteByUserId };

module.exports = { tokensRepository };
