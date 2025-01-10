'use strict';

const { User } = require('./schema/users.schema');

function create(email, password, activationToken) {
  return User.create({
    email,
    password,
    activationToken,
  });
}

function findAll() {
  return User.findAll();
}

function findOne(id) {
  return User.findOne({ where: { id } });
}

function findOneByActivationToken(activationToken) {
  return User.findOne({ where: { activationToken } });
}

function findOneByEmail(email) {
  return User.findOne({ where: { email } });
}

function updatePassword(password, id) {
  return User.update({ password }, { where: { id } });
}

module.exports = {
  create,
  findAll,
  findOne,
  findOneByActivationToken,
  findOneByEmail,
  updatePassword,
};
