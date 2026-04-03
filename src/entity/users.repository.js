'use strict';

const { db } = require('../utils/db');

function create(name, email, password, activationToken = null) {
  return db.user.create({
    data: {
      name,
      email,
      password,
      activationToken,
    },
  });
}

function getByEmail(email) {
  return db.user.findUnique({
    where: { email },
  });
}

function activate(email) {
  return db.user.update({
    where: { email },
    data: {
      activationToken: null,
    },
  });
}

function getById(id) {
  return db.user.findUnique({
    where: { id },
  });
}

function saveResetToken(email, resetToken) {
  return db.user.update({
    where: { email },
    data: {
      resetToken,
    },
  });
}

function getByResetToken(resetToken) {
  return db.user.findFirst({
    where: { resetToken },
  });
}

function updatePassword(id, password) {
  return db.user.update({
    where: { id },
    data: {
      password,
      resetToken: null,
    },
  });
}

function updateName(id, name) {
  return db.user.update({
    where: { id },
    data: {
      name,
    },
  });
}

function updateEmail(id, email) {
  return db.user.update({
    where: { id },
    data: {
      email,
    },
  });
}

module.exports = {
  usersRepository: {
    create,
    getByEmail,
    getById,
    activate,
    saveResetToken,
    getByResetToken,
    updatePassword,
    updateName,
    updateEmail,
  },
};
