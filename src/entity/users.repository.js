'use strict';

const { User } = require('../models/User.model');

const create = ({ name, email, password, activationToken }) => {
  return User.create({
    name,
    email,
    password,
    activationToken,
  });
};

const getById = (id) => {
  return User.findOne({ where: { id } });
};

const getByEmail = (email) => {
  return User.findOne({ where: { email } });
};

const getByActivationToken = (activationToken) => {
  return User.findOne({ where: { activationToken } });
};

const getByToken = (token) => {
  return User.findOne({
    where: { activationToken: token },
  });
};

const update = (id, data) => {
  return User.update(data, {
    where: { id },
    returning: true, // Повертає оновлений об'єкт (працює в PostgreSQL)
  });
};

module.exports = {
  create,
  getById,
  getByEmail,
  getByActivationToken,
  getByToken,
  update,
};
