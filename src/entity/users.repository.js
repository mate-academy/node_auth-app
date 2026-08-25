'use strict';

const { db } = require('../utils/db.js');

function create(data) {
  return db.user.create({ data });
}

function getById(id) {
  return db.user.findUnique({ where: { id } });
}

function getByEmail(email) {
  return db.user.findUnique({ where: { email } });
}

function getByResetToken(resetToken) {
  return db.user.findFirst({ where: { resetToken } });
}

function getByEmailChangeToken(emailChangeToken) {
  return db.user.findFirst({ where: { emailChangeToken } });
}

function getAllActive() {
  return db.user.findMany({ where: { activationToken: null } });
}

function update(id, data) {
  return db.user.update({ where: { id }, data });
}

module.exports = {
  usersRepository: {
    create,
    getById,
    getByEmail,
    getByResetToken,
    getByEmailChangeToken,
    getAllActive,
    update,
  },
};
