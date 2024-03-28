'use strict';

const { userRepository } = require('../../repositories/user/user.js');
const { UserService } = require('./user.service.js');

const userService = new UserService(userRepository);

module.exports = {
  userService,
};
