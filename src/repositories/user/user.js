'use strict';

const { User } = require('../../models/user.model.js');
const { UserRepository } = require('./user.repository.js');

const userRepository = new UserRepository(User);

module.exports = {
  userRepository,
};
