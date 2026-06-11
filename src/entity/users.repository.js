'use strict';

const { db } = require('../utils/db.js');

function getByEmail(email) {
  return db.user.findUnique({
    where: { email },
  });
}

function create(data) {
  return db.user.create({ data });
}

function activate(email) {
  return db.user.update({
    where: { email },
    data: { activationToken: null },
  });
}

function getAllActive() {
  return db.user.findMany({
    where: { activationToken: null },
  });
}

function getByResetToken(resetToken) {
  return db.user.findFirst({
    where: { resetToken },
  });
}

function setResetToken(email, resetToken, resetTokenExpiresAt) {
  return db.user.update({
    where: { email },
    data: { resetToken, resetTokenExpiresAt },
  });
}

function updatePassword(email, password) {
  return db.user.update({
    where: { email },
    data: { password, resetToken: null, resetTokenExpiresAt: null },
  });
}

function updateName(id, name) {
  return db.user.update({
    where: { id },
    data: { name },
  });
}

function updateEmail(id, email, activationToken) {
  return db.user.update({
    where: { id },
    data: { email, activationToken },
  });
}

const usersRepository = {
  getByEmail,
  create,
  activate,
  getAllActive,
  getByResetToken,
  setResetToken,
  updatePassword,
  updateName,
  updateEmail,
};

module.exports = { usersRepository };
