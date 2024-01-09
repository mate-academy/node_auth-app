'use strict';

const { User } = require('../models/user.js');

function getAllActivated() {
  return User.findAll({
    where: {
      activationToken: null,
    },
  });
};

function normalize({ id, email, name }) {
  return {
    id, email, name,
  };
};

module.exports = {
  getAllActivated,
  normalize,
};
