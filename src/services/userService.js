'use strict';

const { User } = require('../models/user');

const getAllActive = () => {
  return User.findAll({
    where: { activationToken: null },
  });
};

const getByEmail = (email) => {
  return User.findOne({
    where: { email },
  });
};

const normalize = ({ id, email }) => {
  return {
    id, email,
  };
};

module.exports = {
  getAllActive, normalize, getByEmail,
};
